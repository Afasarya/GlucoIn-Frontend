"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Types for data fetching
interface StatistikData {
  name: string;
  beratBadan: number;
  gulaDarah: number;
  taskCompletion: number;
}

interface DeteksiResult {
  status: "Normal" | "Prediabetes" | "Diabetes";
  findings: string[];
}

interface DailyTask {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  completed: boolean;
}

interface DoctorAppointment {
  doctorName: string;
  speciality: string;
  date: string;
  time: string;
  status: "Online" | "Offline";
  avatar: string;
}

// Dummy data - replace with API calls
const defaultStatistikData: StatistikData[] = [
  { name: "Jan", beratBadan: 22, gulaDarah: 18, taskCompletion: 20 },
  { name: "Feb", beratBadan: 25, gulaDarah: 20, taskCompletion: 22 },
  { name: "Mar", beratBadan: 23, gulaDarah: 28, taskCompletion: 25 },
  { name: "Apr", beratBadan: 30, gulaDarah: 22, taskCompletion: 28 },
  { name: "May", beratBadan: 28, gulaDarah: 35, taskCompletion: 32 },
  { name: "Jun", beratBadan: 35, gulaDarah: 25, taskCompletion: 30 },
  { name: "Jul", beratBadan: 32, gulaDarah: 30, taskCompletion: 28 },
  { name: "Aug", beratBadan: 38, gulaDarah: 28, taskCompletion: 35 },
  { name: "Sep", beratBadan: 35, gulaDarah: 32, taskCompletion: 38 },
  { name: "Oct", beratBadan: 40, gulaDarah: 35, taskCompletion: 42 },
  { name: "Nov", beratBadan: 38, gulaDarah: 40, taskCompletion: 45 },
  { name: "Dec", beratBadan: 45, gulaDarah: 38, taskCompletion: 48 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Calendar Component
function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 18)); // December 18, 2025
  const [selectedDate, setSelectedDate] = useState(18);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean }[] = [];

    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="rounded-2xl bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="py-1 text-center text-xs font-medium text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((item, index) => (
          <button
            key={index}
            onClick={() => item.isCurrentMonth && setSelectedDate(item.day)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
              item.isCurrentMonth
                ? item.day === selectedDate
                  ? "bg-[#1D7CF3] font-semibold text-white"
                  : "text-gray-700 hover:bg-gray-100"
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

// Statistik Chart Component
function StatistikChart({ data }: { data: StatistikData[] }) {
  return (
    <motion.div variants={itemVariants} className="rounded-2xl bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Statistik</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#22C55E]" />
            <span className="text-xs text-gray-500">Berat Badan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#EF4444]" />
            <span className="text-xs text-gray-500">Gula Darah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#3B82F6]" />
            <span className="text-xs text-gray-500">Task Completion</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              domain={[0, 50]}
              ticks={[0, 10, 20, 30, 40, 50]}
              tickFormatter={(value) => `${value}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="beratBadan"
              stroke="#22C55E"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#22C55E" }}
            />
            <Line
              type="monotone"
              dataKey="gulaDarah"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#EF4444" }}
            />
            <Line
              type="monotone"
              dataKey="taskCompletion"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [statistikData] = useState<StatistikData[]>(defaultStatistikData);
  const [deteksiResult] = useState<DeteksiResult>({
    status: "Normal",
    findings: [
      "Pola warna dan tekstur kuku kamu cenderung normal.",
      "Terdapat pola kekeringan yang bisa terkait metabolik.",
      "Beberapa area menunjukkan anomali ringan.",
    ],
  });
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: "1",
      title: "Berolahraga ringan",
      subtitle: "Jalan kaki 20 menit",
      icon: "/images/assets/run-green.svg",
      iconBg: "bg-[#DCFCE7]",
      completed: false,
    },
    {
      id: "2",
      title: "Minum cukup air putih",
      subtitle: "Konsumsi 8 gelas/1,6 liter",
      icon: "/images/assets/water-blue.svg",
      iconBg: "bg-[#DBEAFE]",
      completed: false,
    },
    {
      id: "3",
      title: "Makanan Sehat",
      subtitle: "Konsumsi buah dan sayur",
      icon: "/images/assets/food-orange.svg",
      iconBg: "bg-[#FED7AA]",
      completed: false,
    },
  ]);
  const [appointment] = useState<DoctorAppointment>({
    doctorName: "Dr. Teresa Chatur",
    speciality: "Endokrinolog",
    date: "18 Desember 2025",
    time: "10.00 - 11.00",
    status: "Online",
    avatar: "/images/assets/doctor-elipse.svg",
  });

  // Fetch data from backend (example implementation)
  // Uncomment this when backend is ready
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       const [statsRes, deteksiRes, tasksRes, appointmentRes] = await Promise.all([
  //         fetch('/api/dashboard/statistik'),
  //         fetch('/api/dashboard/deteksi'),
  //         fetch('/api/dashboard/tasks'),
  //         fetch('/api/dashboard/appointment'),
  //       ]);
  //       
  //       const stats = await statsRes.json();
  //       const deteksi = await deteksiRes.json();
  //       const tasks = await tasksRes.json();
  //       const appointmentData = await appointmentRes.json();
  //       
  //       setStatistikData(stats);
  //       setDeteksiResult(deteksi);
  //       setDailyTasks(tasks);
  //       setAppointment(appointmentData);
  //     } catch (error) {
  //       console.error("Failed to fetch dashboard data:", error);
  //     }
  //   };
  //   fetchDashboardData();
  // }, []);

  const handleCompleteTask = async (taskId: string) => {
    // Optimistic update
    setDailyTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    // API call to update task status
    // try {
    //   await fetch(`/api/dashboard/tasks/${taskId}`, {
    //     method: 'PATCH',
    //     body: JSON.stringify({ completed: true }),
    //   });
    // } catch (error) {
    //   // Revert on error
    //   setDailyTasks((prev) =>
    //     prev.map((task) =>
    //       task.id === taskId ? { ...task, completed: !task.completed } : task
    //     )
    //   );
    // }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Left Column - Main Content */}
      <div className="space-y-6 lg:col-span-2">
        {/* Welcome Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-white"
        >
          {/* Hexagon Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/assets/hexagon-bg.svg"
              alt=""
              fill
              className="object-cover opacity-50"
            />
          </div>
          <div className="relative z-10 flex items-center gap-6 p-8 py-10">
            <div className="relative h-28 w-28 flex-shrink-0">
              <Image
                src="/images/assets/hello-avatar.svg"
                alt="Avatar"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome Back<span className="ml-1">👋</span>
              </h1>
              <p className="mt-2 text-gray-500">
                Kamu sudah melakukan yang baik.
              </p>
              <p className="text-gray-500">Lihat perkembanganmu hari ini!</p>
            </div>
          </div>
        </motion.div>

        {/* Doctor Appointment Card */}
        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-2xl bg-white"
        >
          <div className="p-6 pb-4">
            <h3 className="text-base font-semibold text-gray-800">
              Ada jadwal temu dengan dokter, nih!
            </h3>
          </div>
          <div className="border-t border-gray-100" />
          <div className="bg-[#EEF8FF]/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white/80 p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                  <Image
                    src={appointment.avatar}
                    alt={appointment.doctorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{appointment.doctorName}</p>
                  <p className="text-sm text-gray-500">{appointment.speciality}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">{appointment.date}, {appointment.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">{appointment.status}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hasil Deteksi Terakhir */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-white p-6">
          <h3 className="mb-6 text-base font-semibold text-gray-800">
            Hasil Deteksi Terakhir
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tingkat Diabetes */}
            <div className="text-center">
              <p className="mb-4 text-sm font-medium text-gray-600">Tingkat Diabetes</p>
              <div className="flex items-center justify-center gap-3">
                <div className="relative h-12 w-12">
                  <Image
                    src="/images/assets/happy-emote.svg"
                    alt="Status"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-green-500">{deteksiResult.status}</span>
              </div>
            </div>

            {/* Yang Kami Temukan */}
            <div>
              <p className="mb-4 text-sm font-medium text-gray-600">Yang Kami Temukan</p>
              <ul className="space-y-2">
                {deteksiResult.findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      index === 0 ? "bg-green-500" : index === 1 ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <span className="text-sm text-gray-600">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Statistik Chart */}
        <StatistikChart data={statistikData} />
      </div>

      {/* Right Column - Sidebar Content */}
      <div className="space-y-6">
        {/* Quick Action Cards */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Deteksi Dini Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#1D7CF3] p-5">
            <div className="absolute inset-0">
              <Image
                src="/images/assets/blue-circlebg.svg"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <h3 className="mb-3 text-base font-semibold text-white">Mulai deteksi dini</h3>
              <Link
                href="/deteksi-dini"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                Deteksi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Analisis Lab Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22C55E] p-5">
            <div className="absolute inset-0">
              <Image
                src="/images/assets/green-bgcircle.svg"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <h3 className="mb-3 text-base font-semibold text-white">Analisis hasil lab</h3>
              <Link
                href="/dashboard/analisis-lab"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                Analisis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Konsultasi Dokter Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#F97316] p-5">
            <div className="absolute inset-0">
              <Image
                src="/images/assets/bg-circleoren.svg"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <h3 className="mb-3 text-base font-semibold text-white">Konsultasi dengan dokter</h3>
              <Link
                href="/booking-dokter"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                Konsultasi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div variants={itemVariants}>
          <Calendar />
        </motion.div>

        {/* Daily Tasks */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-white p-4">
          <p className="mb-4 text-sm font-medium text-gray-600">
            Jumat, 18 Desember 2025
          </p>
          <div className="space-y-3">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${task.iconBg}`}>
                    <Image
                      src={task.icon}
                      alt={task.title}
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    task.completed
                      ? "bg-green-500 text-white"
                      : "bg-[#1D7CF3] text-white hover:bg-[#1565D8]"
                  }`}
                >
                  {task.completed ? "Selesai" : "Selesai"}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
