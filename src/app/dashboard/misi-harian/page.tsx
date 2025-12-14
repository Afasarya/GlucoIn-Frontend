"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Droplet, Apple, Dumbbell } from "lucide-react";
import {
  getTodayTasks,
  getTasksByDate,
  completeTask,
  uncompleteTask,
  DailyTaskProgress,
} from "@/lib/api/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Calendar Component
function Calendar({
  currentDate,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (delta: number) => void;
}) {
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
    
    // Adjust for Monday start (0 = Monday in our display)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Previous month days
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="rounded-xl bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onChangeMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={() => onChangeMonth(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth().map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectDate(item.date)}
            className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors ${
              isSelected(item.date)
                ? "bg-[#1D7CF3] text-white"
                : isToday(item.date)
                ? "bg-blue-100 text-[#1D7CF3]"
                : item.isCurrentMonth
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-300"
            }`}
          >
            {item.day}
          </button>
        ))}
      </div>
    </div>
  );
}

// Task Icon Component
function TaskIcon({ type, color }: { type: string; color?: string }) {
  const iconClass = `h-5 w-5 ${color || "text-white"}`;
  
  switch (type?.toLowerCase()) {
    case "exercise":
    case "olahraga":
      return <Dumbbell className={iconClass} />;
    case "water":
    case "minum":
      return <Droplet className={iconClass} />;
    case "food":
    case "makan":
    case "makanan":
      return <Apple className={iconClass} />;
    default:
      return <Sparkles className={iconClass} />;
  }
}

export default function MisiHarianPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskData, setTaskData] = useState<DailyTaskProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDateParam = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const fetchTasks = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const data = isToday
        ? await getTodayTasks()
        : await getTasksByDate(formatDateParam(date));
      setTaskData(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Set dummy data for demo
      setTaskData({
        date: formatDateParam(date),
        progress: { total: 3, completed: 0, remaining: 3, percentage: 0 },
        tasks: [
          {
            id: "1",
            title: "Berolahraga ringan",
            description: "Lakukan olahraga ringan, seperti berjalan, yoga, peregangan otot, dan lainnya yang membuatmu berkeringat, tetapi juga masih menyenangkan",
            task_type: "exercise",
            is_completed: false,
            icon_color: "#4ADE80",
          },
          {
            id: "2",
            title: "Minum cukup air putih",
            description: "Konsumsi 8 gelas/1,6 liter",
            task_type: "water",
            is_completed: false,
            icon_color: "#3B82F6",
          },
          {
            id: "3",
            title: "Makanan Sehat",
            description: "Konsumsi buah dan sayur",
            task_type: "food",
            is_completed: false,
            icon_color: "#F97316",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate, fetchTasks]);

  const handleCompleteTask = async (taskId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteTask(taskId);
      } else {
        await completeTask(taskId);
      }
      fetchTasks(selectedDate);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleChangeMonth = (delta: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1)
    );
  };

  const formatDisplayDate = (date: Date) => {
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getTaskColorClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case "exercise":
      case "olahraga":
        return "bg-green-400";
      case "water":
      case "minum":
        return "bg-blue-500";
      case "food":
      case "makan":
      case "makanan":
        return "bg-orange-400";
      default:
        return "bg-purple-500";
    }
  };

  const getBorderColorClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case "exercise":
      case "olahraga":
        return "border-l-green-400";
      case "water":
      case "minum":
        return "border-l-blue-500";
      case "food":
      case "makan":
      case "makanan":
        return "border-l-orange-400";
      default:
        return "border-l-purple-500";
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Rencana Sehatmu Hari Ini <span className="text-2xl">🌿</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Rekomendasi harian berikut disesuaikan dari hasil analisis kesehatanmu. 
          Kamu bisa mengikuti satu per satu sesuai kenyamananmu.
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Task List */}
        <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Ini To Do Kamu</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              AI membuatkan rekomendasi kegiatan untukmu
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Memuat tugas...</div>
          ) : (
            <div className="space-y-3">
              {taskData?.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-lg border-l-4 bg-gray-50 p-4 ${getBorderColorClass(task.task_type)} ${
                    task.is_completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium text-gray-800 ${task.is_completed ? "line-through" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    </div>
                    <button
                      onClick={() => handleCompleteTask(task.id, task.is_completed)}
                      className={`ml-4 rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                        task.is_completed
                          ? "border-gray-300 text-gray-400"
                          : "border-[#1D7CF3] text-[#1D7CF3] hover:bg-blue-50"
                      }`}
                    >
                      {task.is_completed ? "Batalkan" : "Selesai"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Calendar and Selected Date Tasks */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Calendar */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <Calendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onChangeMonth={handleChangeMonth}
            />
          </div>

          {/* Selected Date Tasks */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              {formatDisplayDate(selectedDate)}
            </h3>
            
            {loading ? (
              <div className="py-4 text-center text-gray-500">Memuat...</div>
            ) : (
              <div className="space-y-3">
                {taskData?.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      task.task_type?.toLowerCase() === "exercise" || task.task_type?.toLowerCase() === "olahraga"
                        ? "bg-green-50 border border-green-200"
                        : task.task_type?.toLowerCase() === "water" || task.task_type?.toLowerCase() === "minum"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-orange-50 border border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getTaskColorClass(task.task_type)}`}>
                        <TaskIcon type={task.task_type} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteTask(task.id, task.is_completed)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                        task.is_completed
                          ? "bg-gray-200 text-gray-500"
                          : task.task_type?.toLowerCase() === "exercise" || task.task_type?.toLowerCase() === "olahraga"
                          ? "bg-green-500 text-white"
                          : task.task_type?.toLowerCase() === "water" || task.task_type?.toLowerCase() === "minum"
                          ? "bg-blue-500 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      Selesai
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
