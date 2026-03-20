import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";

const Messages = ({ role }: { role: "learner" | "coach" | "creator" }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<{ id: string; name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BLOCKED_PATTERNS = [/\d{11}/, /@/, /http/i, /www\./i];

  // Fetch conversation partners with names
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("messages")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const partnerIds = new Set<string>();
      data?.forEach((m) => {
        if (m.sender_id !== user.id) partnerIds.add(m.sender_id);
        if (m.receiver_id !== user.id) partnerIds.add(m.receiver_id);
      });

      if (partnerIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", Array.from(partnerIds));
        
        setConversations(
          Array.from(partnerIds).map((id) => ({
            id,
            name: profiles?.find((p) => p.user_id === id)?.full_name || "User",
          }))
        );
      }
    };
    fetchConversations();
  }, [user]);

  // Fetch messages for selected user
  useEffect(() => {
    if (!user || !selectedUser) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    // Mark messages as read
    supabase.from("messages").update({ is_read: true })
      .eq("receiver_id", user.id).eq("sender_id", selectedUser).then(() => {});

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${selectedUser}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as any;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedUser) ||
          (msg.sender_id === selectedUser && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;

    const isBlocked = BLOCKED_PATTERNS.some((p) => p.test(newMessage));
    if (isBlocked) {
      toast.error("Contact sharing is restricted to protect your security.");
      // Log to admin
      await supabase.from("admin_logs").insert({
        action: "blocked_message",
        admin_id: null,
        target_id: user.id,
        target_type: "user",
        details: { message: newMessage, reason: "Contact sharing detected" },
      }).then(() => {});
      return;
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
  };

  return (
    <DashboardLayout role={role}>
      <h1 className="text-2xl font-bold text-foreground mb-6">Messages</h1>
      <div className="bg-card border border-border rounded-lg flex h-[500px]">
        {/* Conversations list */}
        <div className="w-64 border-r border-border overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedUser(conv.id)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-border hover:bg-secondary transition-colors ${
                  selectedUser === conv.id ? "bg-secondary" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {conv.name[0]?.toUpperCase() || "U"}
                  </div>
                  <p className="font-medium text-foreground truncate">{conv.name}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.sender_id === user?.id
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {msg.content}
                    <span className="block text-[10px] opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className={BLOCKED_PATTERNS.some((p) => p.test(newMessage)) ? "border-destructive" : ""}
                />
                <Button size="icon" onClick={sendMessage}>
                  <Send size={16} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export const LearnerMessages = () => <Messages role="learner" />;
export const CoachMessages = () => <Messages role="coach" />;
export const CreatorMessages = () => <Messages role="creator" />;
