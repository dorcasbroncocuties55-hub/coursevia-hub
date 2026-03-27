import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCheck,
  Menu,
  Paperclip,
  Search,
  Send,
  Smile,
  Star,
  Tag,
} from "lucide-react";
import ProfileAvatar from "@/components/shared/ProfileAvatar";

type DashboardRole = "learner" | "coach" | "creator" | "therapist";

type Conversation = {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  country: string | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
};

const formatMessageTime = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const Messages = ({ role }: { role: DashboardRole }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get("user");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(requestedUserId);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const blockedPatterns = useMemo(() => [/\d{11}/, /@/, /http/i, /www\./i], []);
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedUser) || null;

  useEffect(() => {
    if (requestedUserId) {
      setSelectedUser(requestedUserId);
      setMobileListOpen(false);
    }
  }, [requestedUserId]);

  const fetchConversations = async () => {
    if (!user) return;

    setLoadingConversations(true);

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, content, created_at, is_read")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Unable to load your conversations right now.");
      setLoadingConversations(false);
      return;
    }

    const grouped = new Map<string, { lastMessage: any; unreadCount: number }>();

    (data || []).forEach((row) => {
      const partnerId = row.sender_id === user.id ? row.receiver_id : row.sender_id;
      if (!partnerId || partnerId === user.id) return;

      const existing = grouped.get(partnerId);
      const unreadIncrement = row.receiver_id === user.id && !row.is_read ? 1 : 0;

      if (!existing) {
        grouped.set(partnerId, {
          lastMessage: row,
          unreadCount: unreadIncrement,
        });
        return;
      }

      grouped.set(partnerId, {
        lastMessage: existing.lastMessage,
        unreadCount: existing.unreadCount + unreadIncrement,
      });
    });

    if (requestedUserId && requestedUserId !== user.id && !grouped.has(requestedUserId)) {
      grouped.set(requestedUserId, {
        lastMessage: null,
        unreadCount: 0,
      });
    }

    const ids = Array.from(grouped.keys());
    if (ids.length === 0) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, role, bio, country")
      .in("user_id", ids);

    if (profilesError) {
      toast.error("We could not load contact details for your conversations.");
    }

    const nextConversations: Conversation[] = ids
      .map((id) => {
        const profile = profiles?.find((entry) => entry.user_id === id);
        const summary = grouped.get(id);
        const preview = summary?.lastMessage?.content || "Start a new conversation";

        return {
          id,
          name: profile?.full_name || "Coursevia member",
          avatar_url: profile?.avatar_url || null,
          role: profile?.role || null,
          bio: profile?.bio || null,
          country: profile?.country || null,
          lastMessage: preview,
          lastMessageAt: summary?.lastMessage?.created_at || null,
          unreadCount: summary?.unreadCount || 0,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

    setConversations(nextConversations);
    setLoadingConversations(false);

    if (!selectedUser && nextConversations[0]?.id) {
      setSelectedUser(nextConversations[0].id);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    setLoadingMessages(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Unable to load this conversation.");
      setLoadingMessages(false);
      return;
    }

    setMessages(data || []);

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", partnerId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === partnerId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );

    setLoadingMessages(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [user, requestedUserId]);

  useEffect(() => {
    if (!user || !selectedUser) return;
    fetchMessages(selectedUser);
    setMobileListOpen(false);

    const channel = supabase
      .channel(`messages-${user.id}-${selectedUser}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const message = payload.new as any;
          const belongsToConversation =
            (message.sender_id === user.id && message.receiver_id === selectedUser) ||
            (message.sender_id === selectedUser && message.receiver_id === user.id);

          if (!belongsToConversation) {
            fetchConversations();
            return;
          }

          setMessages((prev) => [...prev, message]);

          if (message.sender_id === selectedUser && message.receiver_id === user.id) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", message.id);
          }

          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !selectedUser || !newMessage.trim()) return;

    const cleanMessage = newMessage.trim();
    if (blockedPatterns.some((pattern) => pattern.test(cleanMessage))) {
      toast.error("For your safety, direct contact details cannot be shared in chat.");
      return;
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser,
      content: cleanMessage,
      is_read: false,
    });

    if (error) {
      toast.error("Message could not be sent.");
      return;
    }

    setNewMessage("");
    fetchConversations();
  };

  const startConversation = (partnerId: string) => {
    setSelectedUser(partnerId);
    setMobileListOpen(false);
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-sm text-muted-foreground">
              Stay in touch with learners, coaches, therapists, and creators in one secure workspace.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileListOpen((prev) => !prev)}
          >
            <Menu className="mr-2 h-4 w-4" />
            Conversations
          </Button>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
          <div className="grid min-h-[72vh] lg:grid-cols-[320px_minmax(0,1fr)_280px]">
            <aside
              className={`border-r border-border bg-white ${
                mobileListOpen ? "block" : "hidden"
              } lg:block`}
            >
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">All conversations</p>
                    <p className="text-xs text-muted-foreground">
                      {conversations.reduce((sum, item) => sum + item.unreadCount, 0)} unread messages
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Search will be available in a future update</span>
                </div>
              </div>

              <div className="max-h-[calc(72vh-112px)] overflow-y-auto">
                {loadingConversations ? (
                  <p className="p-4 text-sm text-muted-foreground">Loading conversations...</p>
                ) : conversations.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => startConversation(conversation.id)}
                      className={`flex w-full items-start gap-3 border-b border-border/70 px-4 py-4 text-left transition hover:bg-secondary/40 ${
                        selectedUser === conversation.id ? "bg-secondary/60" : ""
                      }`}
                    >
                      <ProfileAvatar
                        src={conversation.avatar_url}
                        name={conversation.name}
                        className="h-11 w-11 shrink-0 border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="truncate text-sm font-semibold text-foreground">{conversation.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {conversation.role || "member"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-muted-foreground">
                              {formatMessageTime(conversation.lastMessageAt)}
                            </p>
                            {conversation.unreadCount > 0 ? (
                              <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className={`${mobileListOpen ? "hidden" : "flex"} min-h-[72vh] flex-col bg-background lg:flex`}>
              {selectedConversation ? (
                <>
                  <div className="border-b border-border bg-white px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileListOpen(true)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <ProfileAvatar
                        src={selectedConversation.avatar_url}
                        name={selectedConversation.name}
                        className="h-11 w-11 border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-semibold text-foreground">{selectedConversation.name}</p>
                        <p className="truncate text-sm text-muted-foreground capitalize">
                          {selectedConversation.role || "member"}
                          {selectedConversation.country ? ` • ${selectedConversation.country}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-[#f8f8fb] px-4 py-5 sm:px-6">
                    <div className="mx-auto max-w-3xl space-y-4">
                      <div className="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-muted-foreground">
                        Keep payments and communication inside Coursevia for a more secure experience.
                      </div>

                      {loadingMessages ? (
                        <p className="text-sm text-muted-foreground">Loading messages...</p>
                      ) : messages.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
                          Start the conversation with a clear professional message.
                        </div>
                      ) : (
                        messages.map((message) => {
                          const mine = message.sender_id === user?.id;
                          return (
                            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[85%] rounded-[24px] px-4 py-3 shadow-sm sm:max-w-[70%] ${
                                  mine
                                    ? "rounded-br-md bg-primary text-primary-foreground"
                                    : "rounded-bl-md border border-border bg-white text-foreground"
                                }`}
                              >
                                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                                <div
                                  className={`mt-2 flex items-center gap-1 text-[11px] ${
                                    mine ? "justify-end text-primary-foreground/80" : "text-muted-foreground"
                                  }`}
                                >
                                  <span>{formatMessageTime(message.created_at)}</span>
                                  {mine ? <CheckCheck className="h-3.5 w-3.5" /> : null}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div className="border-t border-border bg-white px-4 py-4 sm:px-6">
                    <div className="mx-auto max-w-3xl">
                      <div className="rounded-[28px] border border-border bg-background px-3 py-3">
                        <div className="flex items-end gap-3">
                          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Input
                            value={newMessage}
                            onChange={(event) => setNewMessage(event.target.value)}
                            placeholder="Send message..."
                            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                sendMessage();
                              }
                            }}
                          />
                          <Button onClick={sendMessage} className="rounded-full px-5">
                            <Send className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Send</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-muted-foreground">
                  Select a conversation to begin.
                </div>
              )}
            </section>

            <aside className="hidden border-l border-border bg-white lg:block">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  About {selectedConversation?.name || "this member"}
                </h2>
                {selectedConversation ? (
                  <div className="mt-6 space-y-5 text-sm">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        src={selectedConversation.avatar_url}
                        name={selectedConversation.name}
                        className="h-14 w-14 border border-border"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{selectedConversation.name}</p>
                        <p className="capitalize text-muted-foreground">{selectedConversation.role || "Member"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium capitalize text-foreground">{selectedConversation.role || "Member"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium text-foreground">{selectedConversation.country || "Not shared"}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Professional summary</p>
                      <p className="mt-2 leading-6 text-foreground">
                        {selectedConversation.bio || "This member has not added a public summary yet."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-border p-4">
                        <Tag className="h-4 w-4 text-primary" />
                        <p className="mt-3 text-xs text-muted-foreground">Conversation status</p>
                        <p className="font-semibold text-foreground">Active</p>
                      </div>
                      <div className="rounded-2xl border border-border p-4">
                        <Star className="h-4 w-4 text-primary" />
                        <p className="mt-3 text-xs text-muted-foreground">Unread</p>
                        <p className="font-semibold text-foreground">{selectedConversation.unreadCount}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Choose a conversation to view contact details.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const LearnerMessages = () => <Messages role="learner" />;
export const CoachMessages = () => <Messages role="coach" />;
export const CreatorMessages = () => <Messages role="creator" />;
export const TherapistMessages = () => <Messages role="therapist" />;
