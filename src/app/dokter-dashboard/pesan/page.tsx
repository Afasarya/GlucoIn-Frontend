"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Send, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getChatRooms,
  getChatMessages,
  sendChatMessage,
  ChatRoom,
  ChatMessage,
} from "@/lib/api/doctor";

// Types
interface FormattedContact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string;
  bookingId?: string;
}

interface FormattedMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  time: string;
  isDoctor: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// Format time for display
function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// Chat Contact Item Component
function ChatContactItem({
  contact,
  isActive,
  onClick,
}: {
  contact: FormattedContact;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-l-4 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        isActive
          ? "border-l-[#1D7CF3] bg-[#EEF8FF]"
          : "border-l-transparent"
      }`}
    >
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
        <Image
          src={contact.avatar}
          alt={contact.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-800">{contact.name}</p>
        <p className="truncate text-sm text-gray-500">{contact.lastMessage}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-400">{contact.time}</span>
        {contact.unreadCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D7CF3] text-xs font-medium text-white">
            {contact.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}

// Message Bubble Component
function MessageBubble({
  message,
  showSender,
}: {
  message: FormattedMessage;
  showSender: boolean;
}) {
  if (message.isDoctor) {
    return (
      <div className="flex flex-col items-end">
        <span className="mb-1 text-xs text-gray-400">{message.time}</span>
        <div className="max-w-[70%] rounded-2xl rounded-br-md bg-[#1D7CF3] px-4 py-3 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {showSender && (
        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
          <Image
            src="/images/assets/patient-avatar.svg"
            alt={message.senderName}
            fill
            className="object-cover"
          />
        </div>
      )}
      {!showSender && <div className="w-8" />}
      <div className="flex flex-col">
        {showSender && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">
              {message.senderName}
            </span>
            <span className="text-xs text-gray-400">{message.time}</span>
          </div>
        )}
        <div className="max-w-[70%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-800">
          {message.content}
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-white">
      <div className="w-full max-w-[320px] border-r border-gray-100 lg:max-w-[360px]">
        <div className="border-b border-gray-100 p-5">
          <div className="h-7 w-20 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-2 p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex-1 p-6">
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PesanPage() {
  const [contacts, setContacts] = useState<FormattedContact[]>([]);
  const [messages, setMessages] = useState<FormattedMessage[]>([]);
  const [activeContact, setActiveContact] = useState<FormattedContact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat rooms
  const fetchChatRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const rooms = await getChatRooms();
      
      // Transform rooms to contacts
      const formattedContacts: FormattedContact[] = rooms.map((room) => ({
        id: room.id,
        name: room.user?.full_name || 'Pasien',
        lastMessage: room.last_message || 'Belum ada pesan',
        time: room.last_message_at ? formatTime(room.last_message_at) : '',
        unreadCount: room.unread_count || 0,
        avatar: room.user?.profile_picture_url || '/images/assets/patient-avatar.svg',
        bookingId: room.booking_id,
      }));
      
      setContacts(formattedContacts);
      
      // Auto-select first contact if available
      if (formattedContacts.length > 0 && !activeContact) {
        setActiveContact(formattedContacts[0]);
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar chat');
    } finally {
      setIsLoading(false);
    }
  }, [activeContact]);

  // Fetch messages for active contact
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      setIsMessagesLoading(true);
      
      const response = await getChatMessages(roomId);
      const chatMessages = response.messages || [];
      
      // Transform messages
      const formattedMessages: FormattedMessage[] = chatMessages.map((msg) => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_type === 'DOCTOR' ? 'Dokter' : 'Pasien',
        content: msg.message,
        time: formatTime(msg.created_at),
        isDoctor: msg.sender_type === 'DOCTOR',
      }));
      
      setMessages(formattedMessages);
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Load messages when active contact changes
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
    }
  }, [activeContact, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeContact || isSending) return;
    
    try {
      setIsSending(true);
      
      await sendChatMessage(activeContact.id, newMessage.trim());
      
      // Add message to local state
      const newMsg: FormattedMessage = {
        id: `temp-${Date.now()}`,
        senderId: 'doctor',
        senderName: 'Dokter',
        content: newMessage.trim(),
        time: formatTime(new Date().toISOString()),
        isDoctor: true,
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
      
      // Refresh messages to get the actual message from server
      setTimeout(() => fetchMessages(activeContact.id), 500);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Group messages by sender to show/hide sender info
  const getShowSender = (index: number) => {
    if (index === 0) return true;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    return currentMsg.senderId !== prevMsg.senderId;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center rounded-2xl bg-white">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={fetchChatRooms}
            className="rounded-lg bg-[#1D7CF3] px-6 py-2 text-white hover:bg-[#1565D8]"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center rounded-2xl bg-white">
        <div className="text-center">
          <p className="text-gray-500">Belum ada percakapan</p>
          <p className="mt-1 text-sm text-gray-400">Percakapan akan muncul ketika ada pasien yang menghubungi</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-white"
    >
      {/* Left Side - Contact List */}
      <div className="w-full max-w-[320px] border-r border-gray-100 lg:max-w-[360px]">
        {/* Header */}
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-bold text-gray-800">Pesan</h1>
        </div>

        {/* Contact List */}
        <div className="h-[calc(100%-70px)] overflow-y-auto">
          {contacts.map((contact) => (
            <ChatContactItem
              key={contact.id}
              contact={contact}
              isActive={activeContact?.id === contact.id}
              onClick={() => setActiveContact(contact)}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between border-b border-gray-100 px-6 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                src={activeContact?.avatar || '/images/assets/patient-avatar.svg'}
                alt={activeContact?.name || 'Contact'}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-semibold text-gray-800">
              {activeContact?.name || 'Pilih kontak'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-[#1D7CF3] px-4 py-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]">
              <Phone className="h-4 w-4" />
              Call
            </button>
            <button className="rounded-lg bg-[#1D7CF3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1565D8]">
              Lihat Profil
            </button>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {isMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-400">Belum ada pesan</p>
            </div>
          ) : (
            <>
              {/* Date Separator */}
              <div className="mb-6 flex justify-center">
                <span className="rounded-full bg-gray-100 px-4 py-1 text-xs text-gray-500">
                  Hari Ini
                </span>
              </div>

              {/* Messages */}
              <motion.div
                variants={containerVariants}
                className="space-y-4"
              >
                {messages.map((message, index) => (
                  <motion.div key={message.id} variants={itemVariants}>
                    <MessageBubble
                      message={message}
                      showSender={getShowSender(index)}
                    />
                  </motion.div>
                ))}
              </motion.div>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <motion.div
          variants={itemVariants}
          className="border-t border-gray-100 p-4"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Ketik Pesan"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isSending && handleSendMessage()}
              disabled={isSending || !activeContact}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-[#1D7CF3] focus:outline-none disabled:bg-gray-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending || !activeContact || !newMessage.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1D7CF3] disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
