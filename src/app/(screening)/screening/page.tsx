"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ChevronDown, Upload, X, Info } from "lucide-react";
import Navbar from "@/app/components/common/Navbar";
import Footer from "@/app/components/common/Footer";

// Types for questionnaire
type QuestionType = "text" | "dropdown" | "radio";

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  placeholder?: string;
  options?: Option[];
  unit?: string;
}

interface Step {
  id: number;
  title: string;
  questions: Question[];
}

interface UploadedFile {
  name: string;
  size: number;
  file: File;
  type: 'lidah' | 'kuku';
}

// Sample data - This would come from backend
const screeningSteps: Step[] = [
  {
    id: 1,
    title: "Data Diri",
    questions: [
      {
        id: "age",
        question: "Umur kamu saat ini? (tahun)",
        type: "text",
        placeholder: "19",
        unit: "tahun",
      },
      {
        id: "gender",
        question: "Jenis kelamin",
        type: "dropdown",
        options: [
          { value: "male", label: "Laki-laki" },
          { value: "female", label: "Perempuan" },
        ],
      },
      {
        id: "weight",
        question: "Berat badan kamu saat ini? (kg)",
        type: "text",
        placeholder: "49",
        unit: "kg",
      },
      {
        id: "height",
        question: "Tinggi badan kamu saat ini? (cm)",
        type: "text",
        placeholder: "165",
        unit: "cm",
      },
    ],
  },
  {
    id: 2,
    title: "Pola Makan & Gaya Hidup",
    questions: [
      {
        id: "physical_activity",
        question: "Seberapa sering kamu beraktivitas fisik?",
        type: "radio",
        options: [
          { value: "rarely", label: "Jarang / 1-2x seminggu" },
          { value: "moderate", label: "3-5x seminggu" },
          { value: "often", label: "setiap hari" },
        ],
      },
      {
        id: "exercise_duration",
        question: "Berapa lama biasanya kamu bergerak/olahraga dalam sehari?",
        type: "radio",
        options: [
          { value: "less_10", label: "< 10 menit" },
          { value: "10_20", label: "10-20 menit" },
          { value: "20_40", label: "20-40 menit" },
          { value: "more_40", label: "> 40 menit" },
        ],
      },
      {
        id: "sweet_consumption",
        question: "Seberapa sering kamu mengonsumsi makanan/minuman manis?",
        type: "radio",
        options: [
          { value: "rarely", label: "Jarang" },
          { value: "sometimes", label: "Kadang-kadang" },
          { value: "often", label: "Sering" },
          { value: "very_often", label: "Sangat sering" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Riwayat Keluarga",
    questions: [
      {
        id: "family_diabetes",
        question: "Apakah ada anggota keluarga yang memiliki diabetes?",
        type: "radio",
        options: [
          { value: "yes", label: "Ya" },
          { value: "no", label: "Tidak" },
          { value: "unknown", label: "Tidak tahu" },
        ],
      },
      {
        id: "family_relation",
        question: "Jika ya, siapa?",
        type: "dropdown",
        options: [
          { value: "parent", label: "Orang tua" },
          { value: "sibling", label: "Saudara kandung" },
          { value: "grandparent", label: "Kakek/Nenek" },
          { value: "other", label: "Lainnya" },
        ],
      },
      {
        id: "hypertension",
        question: "Apakah kamu memiliki riwayat tekanan darah tinggi?",
        type: "radio",
        options: [
          { value: "yes", label: "Ya" },
          { value: "no", label: "Tidak" },
          { value: "unknown", label: "Tidak tahu" },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Upload Citra",
    questions: [],
  },
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const questionVariants: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    }
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: {
      duration: 0.3,
    }
  },
};

export default function ScreeningPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lidahFile, setLidahFile] = useState<UploadedFile | null>(null);
  const [kukuFile, setKukuFile] = useState<UploadedFile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fun facts for loading screen
  const funFacts = [
    "Foto kuku ternyata bisa ngasih banyak info tentang kondisi tubuh, lho!",
    "Warna lidah bisa menunjukkan kondisi kesehatan kamu secara umum.",
    "Deteksi dini diabetes bisa mencegah komplikasi serius di kemudian hari.",
    "AI kami dilatih dengan ribuan data untuk akurasi yang lebih baik.",
    "Gaya hidup sehat bisa menurunkan risiko diabetes hingga 58%!",
  ];
  const [currentFunFact] = useState(() => funFacts[Math.floor(Math.random() * funFacts.length)]);

  const totalSteps = screeningSteps.length;
  const currentStepData = screeningSteps[currentStep];
  const currentQuestion = currentStepData.questions[currentQuestionIndex];
  const isLastStep = currentStep === totalSteps - 1;
  const isUploadStep = isLastStep;

  // Check if all questions in current step are answered
  const isCurrentStepComplete = useCallback(() => {
    if (isUploadStep) return lidahFile !== null && kukuFile !== null;
    return currentStepData.questions.every((q) => answers[q.id]);
  }, [currentStepData.questions, answers, isUploadStep, lidahFile, kukuFile]);

  // Check if current question is answered
  const isCurrentQuestionAnswered = useCallback(() => {
    if (!currentQuestion) return true;
    return !!answers[currentQuestion.id];
  }, [currentQuestion, answers]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (isUploadStep) {
      // Submit the form
      console.log("Submitting:", { answers, lidahFile, kukuFile });
      return;
    }

    if (currentQuestionIndex < currentStepData.questions.length - 1) {
      // Move to next question in current step
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Move to next step
      if (currentStep < totalSteps - 2) {
        setCurrentStep((prev) => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        // Show confirmation before upload step
        setShowConfirmation(true);
      }
    }
  };

  const handlePrev = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      const prevStepQuestions = screeningSteps[currentStep - 1].questions;
      setCurrentQuestionIndex(prevStepQuestions.length - 1);
    }
  };

  const handleContinueToUpload = () => {
    setShowConfirmation(false);
    setCurrentStep(totalSteps - 1);
    setCurrentQuestionIndex(0);
  };

  const handleSubmitAnalysis = () => {
    if (!lidahFile || !kukuFile) return;
    setIsProcessing(true);
    // Simulate API call - replace with actual API call later
    console.log("Submitting:", { answers, lidahFile, kukuFile });
    // After processing, redirect to results page
    // For now, we'll just show the loading screen
  };

  const handleLidahUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLidahFile({
        name: file.name,
        size: file.size,
        file,
        type: 'lidah',
      });
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleKukuUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKukuFile({
        name: file.name,
        size: file.size,
        file,
        type: 'kuku',
      });
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleRemoveLidah = () => {
    setLidahFile(null);
  };

  const handleRemoveKuku = () => {
    setKukuFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Render stepper
  const renderStepper = () => (
    <div className="mb-14 flex items-center justify-center">
      {screeningSteps.map((step, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold transition-all duration-300 ${
                  isPast || (isActive && isCurrentStepComplete())
                    ? "bg-[#1D7CF3] text-white"
                    : isActive
                    ? "bg-[#1D7CF3] text-white"
                    : "border-2 border-[#1D7CF3] bg-white text-[#1D7CF3]"
                }`}
                style={{ aspectRatio: '1 / 1' }}
              >
                {isPast ? (
                  <Check className="h-6 w-6" />
                ) : (
                  step.id
                )}
              </motion.div>
              <span
                className={`hidden whitespace-nowrap text-base font-medium sm:block ${
                  isActive ? "text-[#1E293B]" : "text-[#64748B]"
                }`}
              >
                {index === 0 ? "Profil Dasar" : step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div
                className={`mx-5 h-[2px] w-16 transition-all duration-300 sm:w-24 ${
                  isPast ? "bg-[#1D7CF3]" : "bg-[#E2E8F0]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Render text input question
  const renderTextInput = (question: Question) => (
    <motion.div
      key={question.id}
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-start"
    >
      <h2 className="mb-8 text-2xl font-bold text-[#1E293B] sm:text-3xl">
        {question.question}
      </h2>
      <input
        type="text"
        value={answers[question.id] || ""}
        onChange={(e) => handleAnswer(question.id, e.target.value)}
        placeholder={question.placeholder}
        className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 text-base text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#1D7CF3] focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]/20 transition-all duration-300"
      />
    </motion.div>
  );

  // Render dropdown question
  const renderDropdown = (question: Question) => (
    <motion.div
      key={question.id}
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-start"
    >
      <h2 className="mb-8 text-2xl font-bold text-[#1E293B] sm:text-3xl">
        {question.question}
      </h2>
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 text-left text-base text-[#1E293B] transition-all duration-300 focus:border-[#1D7CF3] focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]/20"
        >
          <span className={answers[question.id] ? "text-[#1E293B]" : "text-[#94A3B8]"}>
            {answers[question.id]
              ? question.options?.find((o) => o.value === answers[question.id])?.label
              : "Pilih jawaban"}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-[#64748B] transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-lg"
            >
              {question.options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleAnswer(question.id, option.value);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-5 py-4 text-left text-base transition-colors hover:bg-[#EEF8FF] ${
                    answers[question.id] === option.value
                      ? "bg-[#EEF8FF] text-[#1D7CF3]"
                      : "text-[#1E293B]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // Render radio/multiple choice question
  const renderRadio = (question: Question) => (
    <motion.div
      key={question.id}
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-start"
    >
      <h2 className="mb-8 text-2xl font-bold text-[#1E293B] sm:text-3xl">
        {question.question}
      </h2>
      <div className="flex w-full max-w-lg flex-col gap-4">
        {question.options?.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => handleAnswer(question.id, option.value)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left text-base transition-all duration-200 ${
              answers[question.id] === option.value
                ? "border-[#1D7CF3] bg-[#EEF8FF] text-[#1D7CF3]"
                : "border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B] hover:border-[#CBD5E1]"
            }`}
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                answers[question.id] === option.value
                  ? "border-[#1D7CF3] bg-[#1D7CF3]"
                  : "border-[#CBD5E1] bg-white"
              }`}
            >
              {answers[question.id] === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2.5 w-2.5 rounded-full bg-white"
                />
              )}
            </div>
            {option.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Render current question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "text":
        return renderTextInput(currentQuestion);
      case "dropdown":
        return renderDropdown(currentQuestion);
      case "radio":
        return renderRadio(currentQuestion);
      default:
        return null;
    }
  };

  // Render confirmation before upload
  const renderConfirmation = () => (
    <motion.div
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center text-center"
    >
      <h2 className="mb-8 text-2xl font-bold text-[#1E293B] sm:text-3xl">
        Apakah data sudah benar?
      </h2>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinueToUpload}
        className="rounded-xl bg-[#1D7CF3] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90"
      >
        Lanjutkan Upload Citra
      </motion.button>
    </motion.div>
  );

  // Render upload step
  const renderUploadStep = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="mx-auto flex w-full max-w-3xl flex-col items-center"
    >
      <motion.h2
        variants={itemVariants}
        className="mb-3 text-2xl font-bold text-[#1E293B] sm:text-3xl"
      >
        Upload gambar Lidah & Kuku
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="mb-10 max-w-xl text-center text-base text-[#64748B]"
      >
        Dengan upload foto lidah dan kuku Anda, AI kami bisa membantu menilai potensi risiko lebih awal, tanpa perlu alat khusus.
      </motion.p>

      {/* Two Upload Areas */}
      <motion.div
        variants={itemVariants}
        className="mb-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {/* Upload Lidah */}
        <div className="flex flex-col">
          <p className="mb-3 text-base font-semibold text-[#1E293B]">📸 Foto Lidah</p>
          {lidahFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col rounded-xl border border-[#1D7CF3] bg-[#EEF8FF] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-base font-medium text-[#1E293B]">{lidahFile.name}</p>
                  <p className="text-sm text-[#64748B]">{formatFileSize(lidahFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLidah}
                  className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#64748B] transition-colors hover:bg-red-50 hover:text-[#EF4444]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-[#22C55E]">
                <Check className="h-4 w-4" />
                <span>Berhasil diupload</span>
              </div>
            </motion.div>
          ) : (
            <label
              htmlFor="lidah-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2E8F0] bg-white px-6 py-10 transition-all hover:border-[#1D7CF3] hover:bg-[#EEF8FF]/30"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white">
                <Upload className="h-6 w-6 text-[#64748B]" />
              </div>
              <p className="text-center text-sm text-[#64748B]">
                <span className="font-medium text-[#1D7CF3]">Klik untuk upload</span>
                <br />foto lidah
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-[#94A3B8]">
                <Info className="h-3 w-3" />
                Max: 10MB
              </p>
            </label>
          )}
          <input
            id="lidah-upload"
            type="file"
            accept="image/*"
            onChange={handleLidahUpload}
            className="hidden"
          />
        </div>

        {/* Upload Kuku */}
        <div className="flex flex-col">
          <p className="mb-3 text-base font-semibold text-[#1E293B]">💅 Foto Kuku</p>
          {kukuFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col rounded-xl border border-[#1D7CF3] bg-[#EEF8FF] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-base font-medium text-[#1E293B]">{kukuFile.name}</p>
                  <p className="text-sm text-[#64748B]">{formatFileSize(kukuFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveKuku}
                  className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#64748B] transition-colors hover:bg-red-50 hover:text-[#EF4444]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-[#22C55E]">
                <Check className="h-4 w-4" />
                <span>Berhasil diupload</span>
              </div>
            </motion.div>
          ) : (
            <label
              htmlFor="kuku-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2E8F0] bg-white px-6 py-10 transition-all hover:border-[#1D7CF3] hover:bg-[#EEF8FF]/30"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white">
                <Upload className="h-6 w-6 text-[#64748B]" />
              </div>
              <p className="text-center text-sm text-[#64748B]">
                <span className="font-medium text-[#1D7CF3]">Klik untuk upload</span>
                <br />foto kuku
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-[#94A3B8]">
                <Info className="h-3 w-3" />
                Max: 10MB
              </p>
            </label>
          )}
          <input
            id="kuku-upload"
            type="file"
            accept="image/*"
            onChange={handleKukuUpload}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!lidahFile || !kukuFile}
        onClick={handleSubmitAnalysis}
        className="rounded-xl bg-[#1D7CF3] px-12 py-4 text-base font-semibold text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Lanjutkan Analisis
      </motion.button>

      {/* Helper text */}
      {(!lidahFile || !kukuFile) && (
        <motion.p
          variants={itemVariants}
          className="mt-4 text-sm text-[#94A3B8]"
        >
          Upload kedua foto untuk melanjutkan
        </motion.p>
      )}
    </motion.div>
  );

  // Render processing/loading screen
  const renderProcessingScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center"
    >
      <motion.h2
        variants={itemVariants}
        className="mb-4 text-2xl font-bold text-[#1E293B] sm:text-3xl"
      >
        AI sedang menganalisis... santai aja! 🥰
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="max-w-md text-base italic text-[#64748B]"
      >
        Fun fact: {currentFunFact}
      </motion.p>
      
      {/* Loading Animation */}
      <motion.div
        variants={itemVariants}
        className="mt-12 flex items-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-4 w-4 rounded-full bg-[#1D7CF3]"
            animate={{
              y: [0, -12, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );

  // Navigation buttons
  const renderNavigation = () => {
    if (isUploadStep || showConfirmation) return null;

    const isFirstQuestion = currentStep === 0 && currentQuestionIndex === 0;

    return (
      <motion.div
        variants={itemVariants}
        className="mt-10 flex items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          disabled={isFirstQuestion}
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
            isFirstQuestion
              ? "cursor-not-allowed bg-[#94A3B8] text-white"
              : "bg-[#64748B] text-white hover:bg-[#475569]"
          }`}
        >
          <ChevronLeft className="h-6 w-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={!isCurrentQuestionAnswered()}
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
            !isCurrentQuestionAnswered()
              ? "cursor-not-allowed bg-[#94A3B8] text-white"
              : "bg-[#1D7CF3] text-white hover:bg-[#1D7CF3]/90"
          }`}
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFCFF]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative flex-1 overflow-hidden">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#1D7CF3]/5" />
          <div className="absolute -right-20 top-40 h-60 w-60 rounded-full bg-[#1D7CF3]/5" />
          <div className="absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-[#1D7CF3]/5" />
          <div className="absolute -bottom-10 right-1/3 h-60 w-60 rounded-full bg-[#1D7CF3]/5" />
          <div className="absolute right-20 top-1/3 h-32 w-32 rounded-full bg-[#1D7CF3]/5" />
          <div className="absolute bottom-1/3 left-10 h-48 w-48 rounded-full bg-[#1D7CF3]/5" />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-4 py-12 lg:py-16">
          {/* Stepper - hide when processing */}
          {!isProcessing && renderStepper()}

          {/* Content */}
          <div className="flex min-h-[450px] flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <div key="processing">
                  {renderProcessingScreen()}
                </div>
              ) : showConfirmation ? (
                <div key="confirmation">
                  {renderConfirmation()}
                </div>
              ) : isUploadStep ? (
                <div key="upload-step" className="w-full">
                  {renderUploadStep()}
                </div>
              ) : (
                <div key={`question-${currentStep}-${currentQuestionIndex}`} className="flex flex-col items-start">
                  {renderQuestion()}
                  {renderNavigation()}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
