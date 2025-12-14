"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, Send, Search } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  getChatRooms,
  getChatMessages,
  markMessagesAsRead,
  ChatRoom,
  ChatMessage,
} from "@/lib/api/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Demo chat data
const demoChatRooms: ChatRoom[] = [
  {
    id: "1",
    doctor: {
      id: "d1",
      name: "dr. Helmie Sutrisno",
      specialization: "Endokrinolog",
      avatar: "/images/avatars/doctor-1.png",
    },
    last_message: "Ya",
    last_message_at: "10:10",
    unread_count: 1,
  },
  {
    id: "2",
    doctor: {
      id: "d2",
      name: "dr. Indah Diana",
      specialization: "Endokrinolog",
      avatar: "/images/avatars/doctor-2.png",
    },
    last_message: "Sama sama",
    last_message_at: "10:10",
    unread_count: 0,
  },
  {
    id: "3",
    doctor: {
      id: "d3",
      name: "dr. Zahira Aufa",
      specialization: "Endokrinolog",
      avatar: "/images/avatars/doctor-3.png",
    },
    last_message: "bisa 3 kali seminggu ya",
    last_message_at: "10:10",
    unread_count: 1,
  },
  {
    id: "4",
    doctor: {
      id: "d4",
      name: "dr. Aris Suharto",
      specialization: "Endokrinolog",
      avatar: "/images/avatars/doctor-4.png",
    },
    last_message: "Oke",
    last_message_at: "10:10",
    unread_count: 1,
  },
  {
    id: "5",
    doctor: {
      id: "d5",
      name: "dr. Ayu Dewi",
      specialization: "Endokrinolog",
      avatar: "/images/avatars/doctor-5.png",
    },
    last_message: "Konsumsi rutin ya",
    last_message_at: "10:10",
    unread_count: 1,
  },
];

const demoMessages: ChatMessage[] = [
  {
    id: "m1",
    content: "Sekarang bisa langsung masuk di ruangan saya",
    sender_id: "doctor",
    is_read: true,
    created_at: "2025-12-14T10:10:00Z",
  },
  {
    id: "m2",
    content: "Sebentar ibu",
    sender_id: "user",
    is_read: true,
    created_at: "2025-12-14T10:10:00Z",
  },
  {
    id: "m3",
    content: "Saya sedang dalam perjalanan",
    sender_id: "user",
    is_read: true,
    created_at: "2025-12-14T10:10:00Z",
  },
  {
    id: "m4",
    content: "Ya",
    sender_id: "doctor",
    is_read: true,
    created_at: "2025-12-14T10:10:00Z",
  },
  {
    id: "m5",
    content: "Terima kasih ibu untuk hari ini",
    sender_id: "user",
    is_read: true,
    created_at: "2025-12-14T10:10:00Z",
  },
  {
    id: "m6",
    content: "Apakah obatnya bisa diminum sekarang?",
    sender_id: "user",
    is_read: true,
    created_at: "2025-12-14T10:10:00Z",
  },
];

export default function PesanPage() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _bookingId = searchParams.get("booking");
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(demoChatRooms);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(demoChatRooms[1]);
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      const rooms = await getChatRooms();
      if (rooms.length > 0) {
        setChatRooms(rooms);
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  const fetchMessages = async (roomId: string) => {
    setLoading(true);
    try {
      const data = await getChatMessages(roomId);
      if (data.messages.length > 0) {
        setMessages(data.messages);
      }
      await markMessagesAsRead(roomId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const newMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      sender_id: "user",
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const filteredRooms = chatRooms.filter((room) =>
    room.doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-160px)] rounded-xl bg-white shadow-sm overflow-hidden"
    >
      <div className="flex h-full">
        {/* Contact List */}
        <div className="w-[320px] border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesan</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari dokter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full flex items-center gap-3 p-4 border-l-4 transition-colors ${
                  selectedRoom?.id === room.id
                    ? "bg-blue-50 border-l-[#1D7CF3]"
                    : "border-l-transparent hover:bg-gray-50"
                }`}
              >
                <div className="relative h-12 w-12 flex-shrink-0">
                  <div className="h-full w-full overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/images/avatars/doctor-placeholder.svg"
                      alt={room.doctor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 truncate">{room.doctor.name}</p>
                    <span className="text-xs text-gray-400">{room.last_message_at}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{room.last_message}</p>
                </div>
                {room.unread_count > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D7CF3] text-xs text-white">
                    {room.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedRoom ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                  <Image
                    src="/images/avatars/doctor-placeholder.svg"
                    alt={selectedRoom.doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-medium text-gray-800">{selectedRoom.doctor.name}</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Phone className="h-4 w-4" />
                Call
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center">
                <span className="text-xs text-gray-400">Hari Ini</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">Memuat pesan...</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.sender_id === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[70%]">
                        {!isUser && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-200">
                              <Image
                                src="/images/avatars/doctor-placeholder.svg"
                                alt={selectedRoom.doctor.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {selectedRoom.doctor.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isUser
                              ? "bg-[#1D7CF3] text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        {isUser && (
                          <div className="text-right mt-1">
                            <span className="text-xs text-gray-400">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ketik Pesan"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Pilih percakapan untuk mulai chat</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
