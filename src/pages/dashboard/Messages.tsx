import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";

const Messages = ({ role }: { role: "learner" | "coach" | "creator" }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Anti-leak regex
  const BLOCKED_PATTERNS = [/\d{11}/, /@/, /http/i];

  useEffect(() => {
    if (!user) return;
    // Fetch unique conversation partners
    supabase
      .from("messages")
      .select("sender_id, receiver_id")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const partners = new Set<string>();
        data?.forEach((m) => {
          if (m.sender_id !== user.id) partners.add(m.sender_id);
          if (m.receiver_id !== user.id) partners.add(m.receiver_id);
        });
        setConversations(Array.from(partners));
      });
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) return;
    supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [user, selectedUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;

    // Check for blocked patterns
    const isBlocked = BLOCKED_PATTERNS.some((p) => p.test(newMessage));
    if (isBlocked) {
      toast.error("Contact sharing is restricted to protect your security.");
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
      // Refresh messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    }
  };

  const dashRole = role === "learner" ? "learner" : role;

  return (
    <DashboardLayout role={dashRole}>
      <h1 className="text-2xl font-bold text-foreground mb-6">Messages</h1>
      <div className="bg-card border border-border rounded-lg flex h-[500px]">
        {/* Conversations list */}
        <div className="w-64 border-r border-border overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet</p>
          ) : (
            conversations.map((userId) => (
              <button
                key={userId}
                onClick={() => setSelectedUser(userId)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-border hover:bg-secondary transition-colors ${
                  selectedUser === userId ? "bg-secondary" : ""
                }`}
              >
                <p className="font-medium text-foreground truncate font-mono text-xs">{userId.slice(0, 8)}...</p>
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
                  </div>
                ))}
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
