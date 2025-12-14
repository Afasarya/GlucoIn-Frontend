"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ChevronDown, Upload, X, Info, FileText, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import Navbar from "@/app/components/common/Navbar";
import Footer from "@/app/components/common/Footer";
import { 
  scanLabResult, 
  getStatusColor, 
  getStatusLabel, 
  getStatusBadgeClass,
  type LabResultData,
  type LabValue 
} from "@/lib/api/labResults";

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
  url?: string;
}

// Sample data - This would come from backend
const screeningSteps: Step[] = [
  {
    id: 1,
    title: "Profil Dasar",
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
        id: "diabetes_type",
        question: "Jenis diabetes yang kamu miliki?",
        type: "dropdown",
        options: [
          { value: "type1", label: "Diabetes Tipe 1" },
          { value: "type2", label: "Diabetes Tipe 2" },
          { value: "gestational", label: "Diabetes Gestasional" },
          { value: "unknown", label: "Tidak tahu" },
        ],
      },
      {
        id: "diabetes_duration",
        question: "Sudah berapa lama kamu terdiagnosis diabetes?",
        type: "radio",
        options: [
          { value: "less_1", label: "< 1 tahun" },
          { value: "1_3", label: "1-3 tahun" },
          { value: "3_5", label: "3-5 tahun" },
          { value: "more_5", label: "> 5 tahun" },
        ],
      },
      {
        id: "medication",
        question: "Apakah kamu sedang menjalani pengobatan diabetes?",
        type: "radio",
        options: [
          { value: "yes_oral", label: "Ya, obat oral" },
          { value: "yes_insulin", label: "Ya, insulin" },
          { value: "yes_both", label: "Ya, keduanya" },
          { value: "no", label: "Tidak" },
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

export default function UploadLabPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [labFile, setLabFile] = useState<UploadedFile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [labResult, setLabResult] = useState<LabResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fun facts for loading screen
  const funFacts = [
    "Hasil lab dapat memberikan gambaran akurat tentang kondisi gula darah kamu.",
    "HbA1c adalah indikator penting untuk mengevaluasi kontrol gula darah 2-3 bulan terakhir.",
    "Pemeriksaan rutin dapat mencegah komplikasi diabetes.",
    "AI kami dilatih dengan ribuan data hasil lab untuk memberikan rekomendasi yang tepat.",
    "Manajemen diabetes yang baik dapat meningkatkan kualitas hidup secara signifikan!",
  ];
  const [currentFunFact] = useState(() => funFacts[Math.floor(Math.random() * funFacts.length)]);

  const totalSteps = screeningSteps.length;
  const currentStepData = screeningSteps[currentStep];
  const currentQuestion = currentStepData.questions[currentQuestionIndex];
  const isLastStep = currentStep === totalSteps - 1;
  const isUploadStep = isLastStep;

  // Check if all questions in current step are answered
  const isCurrentStepComplete = useCallback(() => {
    if (isUploadStep) return labFile !== null;
    return currentStepData.questions.every((q) => answers[q.id]);
  }, [currentStepData.questions, answers, isUploadStep, labFile]);

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
      console.log("Submitting:", { answers, labFile });
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

  const handleSubmitAnalysis = async () => {
    if (!labFile) return;
    
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('glucoin_token') : null;
    if (!token) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent('/deteksi-dini/upload');
      window.location.href = `/login?redirect=${returnUrl}`;
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the lab results scan API
      const response = await scanLabResult(labFile.file);
      
      if (response.status === 'ok' && response.data) {
        setLabResult(response.data);
      } else {
        throw new Error(response.message || 'Gagal memproses hasil lab');
      }
    } catch (err) {
      console.error('Lab scan error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses hasil lab';
      
      // Check if it's an auth error
      if (errorMessage.includes('Authentication') || errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        const returnUrl = encodeURIComponent('/deteksi-dini/upload');
        window.location.href = `/login?redirect=${returnUrl}`;
        return;
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setLabResult(null);
    setError(null);
  };

  const handleStartOver = () => {
    setLabResult(null);
    setError(null);
    setLabFile(null);
    setAnswers({});
    setCurrentStep(0);
    setCurrentQuestionIndex(0);
    setShowConfirmation(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB");
        return;
      }
      setLabFile({
        name: file.name,
        size: file.size,
        file,
        url: URL.createObjectURL(file),
      });
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB");
        return;
      }
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert("Format file tidak didukung. Gunakan PDF, JPG, atau PNG.");
        return;
      }
      setLabFile({
        name: file.name,
        size: file.size,
        file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleRemoveFile = () => {
    if (labFile?.url) {
      URL.revokeObjectURL(labFile.url);
    }
    setLabFile(null);
  };

  const handleOpenFile = () => {
    if (labFile?.url) {
      window.open(labFile.url, '_blank');
    }
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
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold transition-all duration-300 sm:h-14 sm:w-14 sm:text-lg ${
                  isPast || (isActive && isCurrentStepComplete())
                    ? "bg-[#1D7CF3] text-white"
                    : isActive
                    ? "bg-[#1D7CF3] text-white"
                    : "border-2 border-[#1D7CF3] bg-white text-[#1D7CF3]"
                }`}
                style={{ aspectRatio: '1 / 1' }}
              >
                {isPast ? (
                  <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  step.id
                )}
              </motion.div>
              <span
                className={`hidden whitespace-nowrap text-sm font-medium sm:block sm:text-base ${
                  isActive ? "text-[#1E293B]" : "text-[#64748B]"
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div
                className={`mx-3 h-[2px] w-8 transition-all duration-300 sm:mx-5 sm:w-16 md:w-24 ${
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
      <label className="mb-4 text-lg font-semibold text-[#1E293B] sm:text-xl">
        {question.question}
      </label>
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder={question.placeholder}
          value={answers[question.id] || ""}
          onChange={(e) => handleAnswer(question.id, e.target.value)}
          className="w-full rounded-xl border-2 border-[#E2E8F0] bg-white px-4 py-4 text-base text-[#1E293B] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#1D7CF3] focus:ring-2 focus:ring-[#1D7CF3]/20"
        />
        {question.unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8]">
            {question.unit}
          </span>
        )}
      </div>
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
      <label className="mb-4 text-lg font-semibold text-[#1E293B] sm:text-xl">
        {question.question}
      </label>
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center justify-between rounded-xl border-2 border-[#E2E8F0] bg-white px-4 py-4 text-left text-base outline-none transition-all focus:border-[#1D7CF3] focus:ring-2 focus:ring-[#1D7CF3]/20"
        >
          <span className={answers[question.id] ? "text-[#1E293B]" : "text-[#94A3B8]"}>
            {answers[question.id]
              ? question.options?.find((o) => o.value === answers[question.id])?.label
              : "Pilih jawaban"}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-[#64748B] transition-transform ${
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
                  className={`block w-full px-4 py-3 text-left text-base transition-colors hover:bg-[#F1F5F9] ${
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

  // Render radio question
  const renderRadio = (question: Question) => (
    <motion.div
      key={question.id}
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-start"
    >
      <label className="mb-6 text-lg font-semibold text-[#1E293B] sm:text-xl">
        {question.question}
      </label>
      <div className="flex w-full max-w-lg flex-col gap-3">
        {question.options?.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => handleAnswer(question.id, option.value)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all ${
              answers[question.id] === option.value
                ? "border-[#1D7CF3] bg-[#EEF8FF]"
                : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                answers[question.id] === option.value
                  ? "border-[#1D7CF3] bg-[#1D7CF3]"
                  : "border-[#CBD5E1]"
              }`}
            >
              {answers[question.id] === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-white"
                />
              )}
            </div>
            <span
              className={`text-base ${
                answers[question.id] === option.value
                  ? "font-medium text-[#1D7CF3]"
                  : "text-[#1E293B]"
              }`}
            >
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Render question based on type
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "text":
        return renderTextInput(question);
      case "dropdown":
        return renderDropdown(question);
      case "radio":
        return renderRadio(question);
      default:
        return null;
    }
  };

  // Render lab file upload step
  const renderLabUploadStep = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center"
    >
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#1E293B] sm:text-3xl">
          Upload hasil laboratorium
        </h2>
        <p className="mt-3 text-base text-[#64748B]">
          Hasil lab akan membantu kami memberikan rekomendasi yang sesuai dengan kondisi kamu.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full max-w-xl">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-[#1D7CF3] bg-[#EEF8FF]"
              : "border-[#CBD5E1] bg-white hover:border-[#1D7CF3] hover:bg-[#F8FAFC]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#F1F5F9]">
              <Upload className="h-6 w-6 text-[#64748B]" />
            </div>
            <p className="text-base text-[#64748B]">
              Drag & drop or{" "}
              <span className="font-medium text-[#1D7CF3]">click to choose files</span>
            </p>
            <p className="mt-2 flex items-center gap-1 text-sm text-[#94A3B8]">
              <Info className="h-4 w-4" />
              Max file size: 10MB
            </p>
          </div>
        </div>

        {/* Uploaded File */}
        {labFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <p className="mb-3 text-sm text-[#64748B]">File terupload:</p>
            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1F5F9]">
                  <FileText className="h-5 w-5 text-[#64748B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">{labFile.name}</p>
                  <p className="text-xs text-[#94A3B8]">{formatFileSize(labFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenFile();
                  }}
                  className="text-sm font-medium text-[#1D7CF3] hover:underline"
                >
                  buka
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#EF4444]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitAnalysis}
            disabled={!labFile || isProcessing}
            className={`inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all ${
              labFile && !isProcessing
                ? "bg-[#1D7CF3] hover:bg-[#1565D8]"
                : "cursor-not-allowed bg-[#94A3B8]"
            }`}
          >
            {isProcessing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Memproses...
              </>
            ) : (
              <>
                Lanjutkan Analisis
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // Render confirmation modal
  const renderConfirmationModal = () => (
    <AnimatePresence>
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-xl font-bold text-[#1E293B]">
              Konfirmasi Data
            </h3>
            <p className="mb-6 text-base text-[#64748B]">
              Pastikan semua data yang kamu isi sudah benar sebelum melanjutkan ke tahap upload hasil lab.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 rounded-xl border-2 border-[#E2E8F0] py-3 text-base font-semibold text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
              >
                Kembali
              </button>
              <button
                onClick={handleContinueToUpload}
                className="flex-1 rounded-xl bg-[#1D7CF3] py-3 text-base font-semibold text-white transition-colors hover:bg-[#1565D8]"
              >
                Lanjutkan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render processing screen
  const renderProcessingScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#EEF8FF]"
    >
      <div className="flex flex-col items-center text-center">
        {/* Animated DNA/Analysis Icon */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="mb-8 h-24 w-24"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#1D7CF3"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="70 200"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#7EC8F8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="55 150"
            />
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="none"
              stroke="#C5E4FF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="40 100"
            />
          </svg>
        </motion.div>

        <h2 className="mb-4 text-2xl font-bold text-[#1E293B]">
          Sedang menganalisis hasil lab kamu...
        </h2>
        <p className="mb-8 max-w-md text-base text-[#64748B]">
          Tunggu sebentar ya, sistem kami sedang memproses data untuk memberikan rekomendasi terbaik.
        </p>

        {/* Fun fact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-white p-4 shadow-sm"
        >
          <p className="flex items-start gap-2 text-sm text-[#64748B]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1D7CF3]" />
            <span className="italic">&quot;{currentFunFact}&quot;</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  // Helper to render a lab value row
  const renderLabValueRow = (label: string, value: LabValue | null) => {
    if (!value) return null;
    return (
      <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
        <span className="text-sm text-[#64748B]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#1E293B]">
            {value.value} {value.unit}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(value.status)}`}>
            {getStatusLabel(value.status)}
          </span>
        </div>
      </div>
    );
  };

  // Render results screen
  const renderResultsScreen = () => {
    if (!labResult) return null;

    return (
      <div className="relative min-h-screen overflow-hidden bg-[#EEF8FF]">
        {/* Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-[#C5E4FF] opacity-60 blur-[100px]" />
          <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-[#C5E4FF] opacity-50 blur-[120px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="bg-white">
            <Navbar />
          </div>

          <div className="container mx-auto flex-1 px-4 py-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl"
            >
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-[#1E293B] sm:text-3xl">
                  Hasil Analisis Lab Selesai! ✨
                </h1>
                <p className="mt-2 text-base text-[#64748B]">
                  Berikut adalah hasil ekstraksi dari foto hasil lab kamu
                </p>
                {labResult.lab_name && (
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Lab: {labResult.lab_name} {labResult.test_date && `• ${new Date(labResult.test_date).toLocaleDateString('id-ID')}`}
                  </p>
                )}
              </div>

              {/* Results Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Gula Darah */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5"
                >
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1E293B]">
                    <span className="text-lg">🩸</span> Gula Darah
                  </h3>
                  <div className="space-y-1">
                    {renderLabValueRow('GDP (Puasa)', labResult.gula_darah.gdp)}
                    {renderLabValueRow('GD2PP', labResult.gula_darah.gd2pp)}
                    {renderLabValueRow('GDS (Sewaktu)', labResult.gula_darah.gds)}
                    {renderLabValueRow('HbA1c', labResult.gula_darah.hba1c)}
                    {!labResult.gula_darah.gdp && !labResult.gula_darah.gd2pp && 
                     !labResult.gula_darah.gds && !labResult.gula_darah.hba1c && (
                      <p className="text-sm text-[#94A3B8] italic">Data tidak tersedia</p>
                    )}
                  </div>
                </motion.div>

                {/* Profil Lipid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5"
                >
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1E293B]">
                    <span className="text-lg">💊</span> Profil Lipid
                  </h3>
                  <div className="space-y-1">
                    {renderLabValueRow('Kolesterol Total', labResult.profil_lipid.cholesterol_total)}
                    {renderLabValueRow('LDL', labResult.profil_lipid.ldl)}
                    {renderLabValueRow('HDL', labResult.profil_lipid.hdl)}
                    {renderLabValueRow('Trigliserida', labResult.profil_lipid.triglycerides)}
                    {!labResult.profil_lipid.cholesterol_total && !labResult.profil_lipid.ldl && 
                     !labResult.profil_lipid.hdl && !labResult.profil_lipid.triglycerides && (
                      <p className="text-sm text-[#94A3B8] italic">Data tidak tersedia</p>
                    )}
                  </div>
                </motion.div>

                {/* Fungsi Ginjal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5"
                >
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1E293B]">
                    <span className="text-lg">🫘</span> Fungsi Ginjal
                  </h3>
                  <div className="space-y-1">
                    {renderLabValueRow('Kreatinin', labResult.fungsi_ginjal.creatinine)}
                    {renderLabValueRow('Ureum', labResult.fungsi_ginjal.urea)}
                    {renderLabValueRow('Asam Urat', labResult.fungsi_ginjal.uric_acid)}
                    {!labResult.fungsi_ginjal.creatinine && !labResult.fungsi_ginjal.urea && 
                     !labResult.fungsi_ginjal.uric_acid && (
                      <p className="text-sm text-[#94A3B8] italic">Data tidak tersedia</p>
                    )}
                  </div>
                </motion.div>

                {/* Fungsi Hati */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5"
                >
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1E293B]">
                    <span className="text-lg">🫁</span> Fungsi Hati
                  </h3>
                  <div className="space-y-1">
                    {renderLabValueRow('SGOT', labResult.fungsi_hati.sgot)}
                    {renderLabValueRow('SGPT', labResult.fungsi_hati.sgpt)}
                    {!labResult.fungsi_hati.sgot && !labResult.fungsi_hati.sgpt && (
                      <p className="text-sm text-[#94A3B8] italic">Data tidak tersedia</p>
                    )}
                  </div>
                </motion.div>

                {/* Darah Lengkap */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:col-span-2"
                >
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1E293B]">
                    <span className="text-lg">🔬</span> Darah Lengkap
                  </h3>
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <div className="space-y-1">
                      {renderLabValueRow('Hemoglobin', labResult.darah_lengkap.hemoglobin)}
                      {renderLabValueRow('Hematokrit', labResult.darah_lengkap.hematocrit)}
                      {renderLabValueRow('Leukosit', labResult.darah_lengkap.leukocytes)}
                    </div>
                    <div className="space-y-1">
                      {renderLabValueRow('Trombosit', labResult.darah_lengkap.platelets)}
                      {renderLabValueRow('Eritrosit', labResult.darah_lengkap.erythrocytes)}
                    </div>
                  </div>
                  {!labResult.darah_lengkap.hemoglobin && !labResult.darah_lengkap.hematocrit && 
                   !labResult.darah_lengkap.leukocytes && !labResult.darah_lengkap.platelets &&
                   !labResult.darah_lengkap.erythrocytes && (
                    <p className="text-sm text-[#94A3B8] italic">Data tidak tersedia</p>
                  )}
                </motion.div>

                {/* Tekanan Darah */}
                {labResult.tekanan_darah && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:col-span-2"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#1E293B]">
                      <span className="text-lg">❤️</span> Tekanan Darah
                    </h3>
                    <p className="text-2xl font-bold text-[#1E293B]">
                      {labResult.tekanan_darah.display}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confidence Score */}
              {labResult.confidence_score && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 text-center text-sm text-[#94A3B8]"
                >
                  Tingkat kepercayaan AI: {Math.round(labResult.confidence_score * 100)}%
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartOver}
                  className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-base font-semibold text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                >
                  <RefreshCw className="h-5 w-5" />
                  Scan Ulang
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/booking-dokter'}
                  className="rounded-xl bg-[#1D7CF3] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90"
                >
                  Konsultasi dengan Dokter
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          <Footer />
        </div>
      </div>
    );
  };

  // Render error screen
  const renderErrorScreen = () => (
    <div className="relative min-h-screen overflow-hidden bg-[#EEF8FF]">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-[#C5E4FF] opacity-60 blur-[100px]" />
        <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-[#C5E4FF] opacity-50 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="bg-white">
          <Navbar />
        </div>

        <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FEE2E2]">
              <AlertTriangle className="h-10 w-10 text-[#EF4444]" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-[#1E293B] sm:text-3xl">
              Oops! Terjadi Kesalahan 😔
            </h2>
            <p className="mb-8 max-w-md text-base text-[#64748B]">
              {error || 'Terjadi kesalahan saat memproses hasil lab. Silakan coba lagi.'}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRetry}
                className="flex items-center gap-2 rounded-xl bg-[#1D7CF3] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90"
              >
                <RefreshCw className="h-5 w-5" />
                Coba Lagi
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartOver}
                className="rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-base font-semibold text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
              >
                Mulai Dari Awal
              </motion.button>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );

  // Main render
  if (error) {
    return renderErrorScreen();
  }

  if (labResult) {
    return renderResultsScreen();
  }

  if (isProcessing) {
    return renderProcessingScreen();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EEF8FF]">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-[#C5E4FF] opacity-60 blur-[100px]" />
        <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-[#C5E4FF] opacity-50 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#D4EDFF] opacity-40 blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
        <div className="bg-white">
          <Navbar />
        </div>

        {/* Main Content */}
        <div className="container mx-auto flex flex-1 flex-col px-4 py-8 sm:py-12">
          {/* Stepper */}
          {renderStepper()}

          {/* Question/Upload Content */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isUploadStep ? (
                renderLabUploadStep()
              ) : (
                <motion.div
                  key={`step-${currentStep}-q-${currentQuestionIndex}`}
                  className="w-full max-w-2xl"
                >
                  {currentQuestion && renderQuestion(currentQuestion)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          {!isUploadStep && (
            <div className="mt-8 flex items-center justify-between sm:mt-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrev}
                disabled={currentStep === 0 && currentQuestionIndex === 0}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all ${
                  currentStep === 0 && currentQuestionIndex === 0
                    ? "cursor-not-allowed text-[#CBD5E1]"
                    : "text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                Sebelumnya
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered()}
                className={`flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold text-white transition-all ${
                  isCurrentQuestionAnswered()
                    ? "bg-[#1D7CF3] hover:bg-[#1565D8]"
                    : "cursor-not-allowed bg-[#94A3B8]"
                }`}
              >
                Selanjutnya
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Confirmation Modal */}
      {renderConfirmationModal()}
    </div>
  );
}
