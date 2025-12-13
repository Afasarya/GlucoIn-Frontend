"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";

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

export default function AsistenAIPage() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle sending message to AI
      console.log("Sending message:", message);
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
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D7CF3] text-white transition-colors hover:bg-[#1565D8]"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </motion.button>
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
