"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUpRight, Search, Edit3, MoreHorizontal, Send, Menu, X, Clock, Bot, Sparkles, Globe, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";

// API Configuration
const AI_API_URL = "https://glucoinai.mentorit.my.id/chatbot/chat";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    is_diabetes_related?: boolean;
    websearch_used?: boolean;
    sources?: string[];
    response_time_ms?: number;
    model?: string;
  };
}

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
}

interface AIResponse {
  success: boolean;
  response: string;
  is_diabetes_related: boolean;
  websearch_used: boolean;
  sources: string[];
  response_time_ms: number;
  model: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const inputVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const avatarVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Helper function to format AI response text
function formatAIResponse(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  paragraphs.forEach((paragraph, pIndex) => {
    if (!paragraph.trim()) return;
    
    // Check if it's a numbered list item (e.g., "1. Item" or "**1. Item**")
    const numberedListMatch = paragraph.match(/^\*?\*?(\d+)\.\s*\*?\*?(.*)/);
    
    if (numberedListMatch) {
      // Handle numbered list
      const lines = paragraph.split('\n');
      const listItems: React.ReactNode[] = [];
      
      lines.forEach((line, lIndex) => {
        const lineMatch = line.match(/^\*?\*?(\d+)\.\s*\*?\*?(.*)/);
        if (lineMatch) {
          listItems.push(
            <li key={`${pIndex}-${lIndex}`} className="mb-2">
              {formatInlineText(lineMatch[2])}
            </li>
          );
        } else if (line.trim()) {
          listItems.push(
            <li key={`${pIndex}-${lIndex}`} className="mb-2">
              {formatInlineText(line)}
            </li>
          );
        }
      });
      
      elements.push(
        <ol key={pIndex} className="list-decimal list-inside space-y-1 my-3">
          {listItems}
        </ol>
      );
    } else if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
      // Handle bullet list
      const lines = paragraph.split('\n');
      const listItems = lines
        .filter(line => line.trim())
        .map((line, lIndex) => (
          <li key={`${pIndex}-${lIndex}`} className="mb-2">
            {formatInlineText(line.replace(/^[-•]\s*/, ''))}
          </li>
        ));
      
      elements.push(
        <ul key={pIndex} className="list-disc list-inside space-y-1 my-3">
          {listItems}
        </ul>
      );
    } else {
      // Regular paragraph - handle line breaks within
      const lines = paragraph.split('\n');
      elements.push(
        <p key={pIndex} className="mb-3 last:mb-0">
          {lines.map((line, lIndex) => (
            <span key={`${pIndex}-${lIndex}`}>
              {formatInlineText(line)}
              {lIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    }
  });
  
  return elements;
}

// Helper function to format inline text (bold, italic, emoji)
function formatInlineText(text: string): React.ReactNode {
  // Handle bold text with ** or __
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Match **bold** or __bold__ patterns
  const boldRegex = /\*\*([^*]+)\*\*|__([^_]+)__/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the bold text
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1] || match[2]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

// Dummy chat history
const dummyChatHistory: ChatHistory[] = [
  { id: "1", title: "Kenapa kakiku sering kesemutan", preview: "Kenapa kakiku sering kesemutan" },
  { id: "2", title: "Kenapa kakiku sering kesemutan", preview: "Kenapa kakiku sering kesemutan" },
  { id: "3", title: "Makan apa ya hari ini biar ga maki...", preview: "Makan apa ya hari ini biar ga maki..." },
  { id: "4", title: "Makan apa ya hari ini biar ga maki...", preview: "Makan apa ya hari ini biar ga maki..." },
];

// Landing Page Component
function LandingView({ onSendMessage, useWebSearch, onToggleWebSearch }: { 
  onSendMessage: (message: string) => void;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/assets/bg-chatbot.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className="container mx-auto flex min-h-[calc(100vh-100px)] flex-col items-center justify-center px-4 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-3xl flex-col items-center"
          >
            {/* Title */}
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Lagi cari info?
              </h1>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Tanyain ke{" "}
                <span className="text-[#1D7CF3]">Glucare</span> aja
              </h2>
            </motion.div>

            {/* Input Area */}
            <motion.form
              variants={inputVariants}
              onSubmit={handleSubmit}
              className="w-full max-w-xl"
            >
              <div className="relative rounded-2xl bg-white p-4 shadow-lg">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Aku sering buang air kecil, gimana ya?"
                  rows={4}
                  className="w-full resize-none border-0 bg-transparent pr-14 text-base text-gray-700 placeholder-gray-400 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D7CF3] text-white transition-colors hover:bg-[#1565D8]"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </motion.button>
                
                {/* Web Search Toggle */}
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={onToggleWebSearch}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      useWebSearch 
                        ? 'bg-[#EEF8FF] text-[#1D7CF3]' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Web Search</span>
                    <div className={`h-4 w-7 rounded-full transition-colors ${
                      useWebSearch ? 'bg-[#1D7CF3]' : 'bg-gray-300'
                    }`}>
                      <div className={`h-3 w-3 rounded-full bg-white transition-transform mt-0.5 ${
                        useWebSearch ? 'translate-x-3.5 ml-0' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </button>
                  <span className="text-xs text-gray-400">
                    {useWebSearch ? 'Mencari dari internet' : 'Mode offline'}
                  </span>
                </div>
              </div>
            </motion.form>

            {/* AI Avatar */}
            <motion.div
              variants={avatarVariants}
              className="mt-12"
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative h-20 w-20"
              >
                <Image
                  src="/images/assets/glucare.svg"
                  alt="Glucare AI"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Chat Sidebar Component
function ChatSidebar({ 
  chatHistory, 
  onNewChat,
  currentChatId,
  onSelectChat,
  isOpen,
  onClose
}: { 
  chatHistory: ChatHistory[];
  onNewChat: () => void;
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible on lg+ */}
      <aside className="hidden h-full w-[280px] flex-shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <Link href="/">
            <Image
              src="/images/assets/logo.svg"
              alt="Glucoin Logo"
              width={100}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-[#1D7CF3]"
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D7CF3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
          >
            <Edit3 className="h-4 w-4" />
            New Chat
          </motion.button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-3 text-sm font-semibold text-gray-800">Riwayat Chat</p>
          <div className="space-y-1">
            {filteredHistory.map((chat) => (
              <motion.button
                key={chat.id}
                whileHover={{ backgroundColor: "#F8FAFC" }}
                onClick={() => onSelectChat(chat.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                  currentChatId === chat.id ? "bg-[#EEF8FF]" : ""
                }`}
              >
                <span className="truncate text-sm text-gray-600">{chat.title}</span>
                <MoreHorizontal className="h-4 w-4 flex-shrink-0 text-gray-400" />
              </motion.button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Slide in/out */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-gray-100 bg-white lg:hidden"
          >
            {/* Header with Close Button */}
            <div className="flex h-16 items-center justify-between px-6">
              <Link href="/">
                <Image
                  src="/images/assets/logo.svg"
                  alt="Glucoin Logo"
                  width={100}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-[#1D7CF3]"
                />
              </div>
            </div>

            {/* New Chat Button */}
            <div className="px-4 pb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D7CF3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
              >
                <Edit3 className="h-4 w-4" />
                New Chat
              </motion.button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-4">
              <p className="mb-3 text-sm font-semibold text-gray-800">Riwayat Chat</p>
              <div className="space-y-1">
                {filteredHistory.map((chat) => (
                  <motion.button
                    key={chat.id}
                    whileHover={{ backgroundColor: "#F8FAFC" }}
                    onClick={() => {
                      onSelectChat(chat.id);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      currentChatId === chat.id ? "bg-[#EEF8FF]" : ""
                    }`}
                  >
                    <span className="truncate text-sm text-gray-600">{chat.title}</span>
                    <MoreHorizontal className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// Chat View Component
function ChatView({ 
  messages, 
  onSendMessage,
  isLoading,
  onOpenSidebar,
  useWebSearch,
  onToggleWebSearch
}: { 
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onOpenSidebar: () => void;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
}) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="relative flex h-full flex-1 flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/assets/bg-chatbot.svg"
          alt="Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex h-12 items-center justify-between border-b border-gray-100/50 bg-white/80 px-4 backdrop-blur-sm lg:justify-end lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-xs text-gray-400">&lt;/&gt;</span>
      </div>

      {/* Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="mr-3 flex-shrink-0">
                    <div className="relative h-10 w-10">
                      <Image
                        src="/images/assets/glucare.svg"
                        alt="Glucare"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                    message.role === "user"
                      ? "bg-[#1D7CF3] text-white"
                      : "bg-white shadow-sm"
                  }`}
                >
                  <div className={`text-sm leading-relaxed ${
                    message.role === "user" ? "text-white" : "text-gray-700"
                  }`}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none">
                        {formatAIResponse(message.content)}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  
                  {/* Metadata for AI responses */}
                  {message.role === "assistant" && message.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        {message.metadata.model && (
                          <div className="flex items-center gap-1">
                            <Bot className="h-3 w-3" />
                            <span>{message.metadata.model}</span>
                          </div>
                        )}
                        {message.metadata.response_time_ms && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{(message.metadata.response_time_ms / 1000).toFixed(2)}s</span>
                          </div>
                        )}
                        {message.metadata.is_diabetes_related && (
                          <div className="flex items-center gap-1 text-green-500">
                            <Sparkles className="h-3 w-3" />
                            <span>Diabetes Related</span>
                          </div>
                        )}
                        {message.metadata.websearch_used && (
                          <div className="flex items-center gap-1 text-blue-500">
                            <Globe className="h-3 w-3" />
                            <span>Web Search</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Sources from web search */}
                      {message.metadata.websearch_used && message.metadata.sources && message.metadata.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Sumber:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.metadata.sources.map((source, idx) => (
                              <a
                                key={idx}
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-[#1D7CF3] hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span className="max-w-[200px] truncate">{new URL(source).hostname}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="mr-3 flex-shrink-0">
                <div className="relative h-10 w-10">
                  <Image
                    src="/images/assets/glucare.svg"
                    alt="Glucare"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-gray-400"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="h-2 w-2 rounded-full bg-gray-400"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="h-2 w-2 rounded-full bg-gray-400"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-gray-100/50 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="relative flex items-center px-4 py-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanya Sesuatu"
                className="flex-1 border-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!inputMessage.trim() || isLoading}
                className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF] disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
            
            {/* Web Search Toggle */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                onClick={onToggleWebSearch}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  useWebSearch 
                    ? 'bg-[#EEF8FF] text-[#1D7CF3]' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Web Search</span>
                <div className={`h-4 w-7 rounded-full transition-colors ${
                  useWebSearch ? 'bg-[#1D7CF3]' : 'bg-gray-300'
                }`}>
                  <div className={`h-3 w-3 rounded-full bg-white transition-transform mt-0.5 ${
                    useWebSearch ? 'translate-x-3.5 ml-0' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
              <span className="text-xs text-gray-400">
                {useWebSearch ? 'Mencari dari internet' : 'Mode offline'}
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Page Component
export default function AsistenAIPage() {
  const [isInChat, setIsInChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(dummyChatHistory);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  // Handle window resize to auto-show sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle web search
  const toggleWebSearch = useCallback(() => {
    setUseWebSearch(prev => !prev);
  }, []);

  // Call AI API
  const callAIAPI = useCallback(async (userMessage: string): Promise<AIResponse | null> => {
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          use_websearch: useWebSearch,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      return data;
    } catch (error) {
      console.error('AI API Error:', error);
      return null;
    }
  }, [sessionId, useWebSearch]);

  // Handle AI response
  const handleAIResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    
    const apiResponse = await callAIAPI(userMessage);
    
    if (apiResponse && apiResponse.success) {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: apiResponse.response,
        metadata: {
          is_diabetes_related: apiResponse.is_diabetes_related,
          websearch_used: apiResponse.websearch_used,
          sources: apiResponse.sources,
          response_time_ms: apiResponse.response_time_ms,
          model: apiResponse.model,
        },
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } else {
      // Error fallback message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi dalam beberapa saat. 🙏",
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  }, [callAIAPI]);

  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // If not in chat view, transition to it
    if (!isInChat) {
      setIsInChat(true);
      // Create new chat in history
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
      setChatHistory(prev => [
        { id: newChatId, title: message.slice(0, 30) + (message.length > 30 ? "..." : ""), preview: message },
        ...prev
      ]);
    }
    
    // Call AI API
    handleAIResponse(message);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // In real app, fetch messages for this chat
    // For demo, we'll just keep current messages
  };

  // Render landing page or chat view
  if (!isInChat) {
    return (
      <LandingView 
        onSendMessage={handleSendMessage} 
        useWebSearch={useWebSearch}
        onToggleWebSearch={toggleWebSearch}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen overflow-hidden"
    >
      {/* Sidebar */}
      <ChatSidebar 
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Chat Area */}
      <ChatView 
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        useWebSearch={useWebSearch}
        onToggleWebSearch={toggleWebSearch}
      />
    </motion.div>
  );
}
