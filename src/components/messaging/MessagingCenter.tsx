"use client";

import { useState } from "react";
import { X, Send, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";

interface Message {
  id: string;
  subject?: string;
  content: string;
  read: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

interface MessagingCenterProps {
  currentUserId: string;
  onClose: () => void;
}

export default function MessagingCenter({
  currentUserId,
  onClose,
}: MessagingCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState({
    receiverEmail: "",
    subject: "",
    content: "",
  });

  const handleSendMessage = async () => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        setIsComposing(false);
        setNewMessage({ receiverEmail: "", subject: "", content: "" });
        // Refresh messages list
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: "PATCH",
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-primary rounded-lg shadow-2xl w-full max-w-5xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-default">
          <h2 className="text-2xl font-bold text-primary">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages List */}
          <div className="w-1/3 border-r border-default flex flex-col">
            {/* Search and Compose */}
            <div className="p-4 space-y-3 border-b border-default">
              <Button
                onClick={() => setIsComposing(true)}
                className="w-full bg-accent hover:bg-accent-hover"
              >
                Compose New Message
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-default rounded-lg bg-secondary text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-4 text-center text-secondary">
                  No messages found
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.read) markAsRead(message.id);
                    }}
                    className={`w-full p-4 border-b border-default text-left hover:bg-secondary transition ${
                      selectedMessage?.id === message.id ? "bg-secondary" : ""
                    } ${!message.read ? "font-semibold" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-primary font-medium truncate">
                          {message.sender.name}
                        </p>
                        <p className="text-sm text-secondary truncate">
                          {message.subject || "No subject"}
                        </p>
                        <p className="text-xs text-secondary mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!message.read && (
                        <div className="w-2 h-2 bg-accent rounded-full" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Content / Compose */}
          <div className="flex-1 flex flex-col">
            {isComposing ? (
              <div className="flex-1 flex flex-col p-6">
                <h3 className="text-xl font-bold text-primary mb-4">
                  New Message
                </h3>
                <div className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      To (Email)
                    </label>
                    <input
                      type="email"
                      value={newMessage.receiverEmail}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, receiverEmail: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-default rounded-lg bg-secondary text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="recipient@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newMessage.subject}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, subject: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-default rounded-lg bg-secondary text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Message subject"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-primary mb-1">
                      Message
                    </label>
                    <textarea
                      value={newMessage.content}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, content: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-default rounded-lg bg-secondary text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSendMessage}
                      className="bg-accent hover:bg-accent-hover"
                      disabled={!newMessage.receiverEmail || !newMessage.content}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsComposing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : selectedMessage ? (
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-start gap-4 mb-6 pb-4 border-b border-default">
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-lg font-bold">
                    {selectedMessage.sender.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-primary">
                      {selectedMessage.sender.name}
                    </h3>
                    <p className="text-sm text-secondary">
                      {selectedMessage.sender.email}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedMessage.subject && (
                  <h4 className="text-xl font-semibold text-primary mb-4">
                    {selectedMessage.subject}
                  </h4>
                )}

                <div className="flex-1 overflow-y-auto">
                  <p className="text-primary whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-default">
                  <Button
                    onClick={() => {
                      setNewMessage({
                        receiverEmail: selectedMessage.sender.email,
                        subject: `Re: ${selectedMessage.subject || ""}`,
                        content: "",
                      });
                      setIsComposing(true);
                    }}
                    className="bg-accent hover:bg-accent-hover"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-secondary">
                <div className="text-center">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
