"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Send } from "lucide-react";
import { useState } from "react";

// Types
interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  time: string;
  isDoctor: boolean;
}

// Default data
const defaultContacts: ChatContact[] = [
  {
    id: "1",
    name: "Helmie Sutrisno",
    lastMessage: "Dok, ini saya bisa langsung...",
    time: "10:10",
    unreadCount: 1,
    avatar: "/images/assets/patient-avatar.svg",
  },
  {
    id: "2",
    name: "Indah Diana",
    lastMessage: "Dok, ini saya bisa langsung...",
    time: "10:10",
    unreadCount: 1,
    avatar: "/images/assets/patient-avatar.svg",
  },
  {
    id: "3",
    name: "Zahira Aufa",
    lastMessage: "Dok, ini saya bisa langsung...",
    time: "10:10",
    unreadCount: 1,
    avatar: "/images/assets/patient-avatar.svg",
  },
  {
    id: "4",
    name: "Aris Suharto",
    lastMessage: "Dok, ini saya bisa langsung...",
    time: "10:10",
    unreadCount: 1,
    avatar: "/images/assets/patient-avatar.svg",
  },
  {
    id: "5",
    name: "Ayu Dewi",
    lastMessage: "Dok, ini saya bisa langsung...",
    time: "10:10",
    unreadCount: 1,
    avatar: "/images/assets/patient-avatar.svg",
  },
];

const defaultMessages: Message[] = [
  {
    id: "1",
    senderId: "doctor",
    senderName: "Dr. Hanifa",
    content: "Sekarang bisa langsung masuk di ruangan saya",
    time: "10.10",
    isDoctor: true,
  },
  {
    id: "2",
    senderId: "2",
    senderName: "Indah Diana",
    content: "Bentar ibu",
    time: "10.10",
    isDoctor: false,
  },
  {
    id: "3",
    senderId: "2",
    senderName: "Indah Diana",
    content: "Saya sedang dalam perjalanan",
    time: "10.10",
    isDoctor: false,
  },
  {
    id: "4",
    senderId: "doctor",
    senderName: "Dr. Hanifa",
    content: "Ya",
    time: "10.10",
    isDoctor: true,
  },
  {
    id: "5",
    senderId: "2",
    senderName: "Indah Diana",
    content: "Terima kasih ibu untuk hari ini",
    time: "10.10",
    isDoctor: false,
  },
  {
    id: "6",
    senderId: "2",
    senderName: "Indah Diana",
    content: "Apakah obatnya bisa diminum sekarang?",
    time: "10.10",
    isDoctor: false,
  },
];

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

// Chat Contact Item Component
function ChatContactItem({
  contact,
  isActive,
  onClick,
}: {
  contact: ChatContact;
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
  message: Message;
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

export default function PesanPage() {
  const [contacts] = useState<ChatContact[]>(defaultContacts);
  const [messages] = useState<Message[]>(defaultMessages);
  const [activeContact, setActiveContact] = useState<ChatContact>(contacts[1]); // Indah Diana
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle send message
      console.log("Sending:", newMessage);
      setNewMessage("");
    }
  };

  // Group messages by sender to show/hide sender info
  const getShowSender = (index: number) => {
    if (index === 0) return true;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    return currentMsg.senderId !== prevMsg.senderId;
  };

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
              isActive={activeContact.id === contact.id}
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
                src={activeContact.avatar}
                alt={activeContact.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-semibold text-gray-800">
              {activeContact.name}
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
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-[#1D7CF3] focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="flex h-12 w-12 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1D7CF3]"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
