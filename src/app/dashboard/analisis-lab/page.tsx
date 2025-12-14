"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getLabHistory,
  getLabSummary,
  LabResult,
  LabSummary,
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

// Demo data for chart
const demoChartData = [
  { name: "Jan", gulaDarah: 95, hba1c: 5.2, hemoglobin: 12.5, kolesterol: 180 },
  { name: "Feb", gulaDarah: 100, hba1c: 5.3, hemoglobin: 12.3, kolesterol: 185 },
  { name: "Mar", gulaDarah: 110, hba1c: 5.5, hemoglobin: 12.0, kolesterol: 190 },
  { name: "Apr", gulaDarah: 105, hba1c: 5.4, hemoglobin: 11.8, kolesterol: 195 },
  { name: "May", gulaDarah: 115, hba1c: 5.6, hemoglobin: 11.5, kolesterol: 200 },
  { name: "Jun", gulaDarah: 90, hba1c: 5.1, hemoglobin: 11.8, kolesterol: 195 },
  { name: "Jul", gulaDarah: 85, hba1c: 5.0, hemoglobin: 12.0, kolesterol: 190 },
  { name: "Aug", gulaDarah: 80, hba1c: 4.9, hemoglobin: 12.2, kolesterol: 185 },
  { name: "Sep", gulaDarah: 88, hba1c: 5.1, hemoglobin: 11.9, kolesterol: 188 },
  { name: "Oct", gulaDarah: 92, hba1c: 5.3, hemoglobin: 11.7, kolesterol: 192 },
  { name: "Nov", gulaDarah: 78, hba1c: 5.4, hemoglobin: 11.5, kolesterol: 198 },
  { name: "Dec", gulaDarah: 80, hba1c: 5.5, hemoglobin: 11.8, kolesterol: 200 },
];

// Demo lab results history
const demoLabHistory = [
  {
    id: "1",
    date: "21 Desember 2025",
    image_url: "/images/lab/lab-result-1.png",
    filename: "Hasil lab 21-12-2025.pdf",
    metrics: [
      { name: "Gula Darah Puasa", value: 168, unit: "mg/dL", status: "Diabetes tidak terkontrol" },
      { name: "Gula Darah 2 Jam", value: 260, unit: "mg/dL", status: "Kadar gula darah naik sangat tinggi setelah makan." },
      { name: "HbA1c", value: 8.7, unit: "%", status: "tinggi risiko komplikasi" },
      { name: "Hemoglobin", value: 11.8, unit: "g/dL", status: "Anemia ringan akibat nefropati" },
    ],
  },
  {
    id: "2",
    date: "1 Desember 2025",
    image_url: "/images/lab/lab-result-2.png",
    filename: "Hasil lab 1-12-2025.pdf",
    metrics: [
      { name: "Gula Darah Puasa", value: 168, unit: "mg/dL", status: "Diabetes tidak terkontrol" },
      { name: "Gula Darah 2 Jam", value: 260, unit: "mg/dL", status: "Kadar gula darah naik sangat tinggi setelah makan." },
      { name: "HbA1c", value: 8.7, unit: "%", status: "tinggi risiko komplikasi" },
      { name: "Hemoglobin", value: 11.8, unit: "g/dL", status: "Anemia ringan akibat nefropati" },
    ],
  },
];

// Stat Card Component
function StatCard({
  icon,
  iconBg,
  label,
  value,
  unit,
  trend,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  unit: string;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-800">{value}</span>
          <span className="text-sm text-gray-500">{unit}</span>
          {trend && (
            <span>
              {trend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
              {trend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
              {trend === "stable" && <Minus className="h-4 w-4 text-gray-400" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalisisLabPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [labSummary, setLabSummary] = useState<LabSummary | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chartData, _setChartData] = useState(demoChartData);
  const [visibleLines, setVisibleLines] = useState({
    gulaDarah: true,
    hba1c: true,
    hemoglobin: true,
    kolesterol: true,
  });

  useEffect(() => {
    fetchLabData();
  }, []);

  const fetchLabData = async () => {
    setLoading(true);
    try {
      const [historyData, summaryData] = await Promise.all([
        getLabHistory(1, 10),
        getLabSummary(),
      ]);
      setLabResults(historyData.data || []);
      setLabSummary(summaryData);
      
      // Transform summary trends to chart data if available
      if (summaryData?.trends) {
        // Use real data if available
      }
    } catch (error) {
      console.error("Error fetching lab data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // AI Insight text
  const aiInsight = `Kadar gula darah puasa dan HbA1c berada dalam rentang normal, menandakan kontrol gula darah yang cukup baik saat ini. Namun, kadar hemoglobin dan kolesterol berada sedikit di batas atas, sehingga disarankan mulai memperhatikan asupan nutrisi, aktivitas fisik, dan melakukan pemantauan lanjutan secara berkala.`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Latest Analysis Stats */}
      <motion.div variants={itemVariants}>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Analisis Terakhir</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<span className="text-xl">🩸</span>}
            iconBg="bg-red-100"
            label="Gula Darah Puasa"
            value={labSummary?.latest_metrics?.gula_darah_puasa || 80}
            unit="mg/dL"
            trend="stable"
          />
          <StatCard
            icon={<span className="text-xl">🍬</span>}
            iconBg="bg-orange-100"
            label="HbA1c"
            value={labSummary?.latest_metrics?.hba1c || 5.5}
            unit="%"
            trend="stable"
          />
          <StatCard
            icon={<span className="text-xl">💉</span>}
            iconBg="bg-green-100"
            label="Hemoglobin"
            value={labSummary?.latest_metrics?.hemoglobin || 11.8}
            unit="g/dL"
            trend="down"
          />
          <StatCard
            icon={<span className="text-xl">🫀</span>}
            iconBg="bg-purple-100"
            label="Kolestrol"
            value={labSummary?.latest_metrics?.kolesterol || 200}
            unit="mg/dL"
            trend="up"
          />
        </div>
      </motion.div>

      {/* AI Insight */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-6 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-gray-800">AI Insight</h3>
            <p className="text-sm leading-relaxed text-gray-600">{aiInsight}</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Chart */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Statistik</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { key: "gulaDarah", label: "Gula Darah", color: "#EF4444" },
              { key: "hba1c", label: "HbA1c", color: "#F97316" },
              { key: "hemoglobin", label: "Hemoglobin", color: "#22C55E" },
              { key: "kolesterol", label: "Kolestrol", color: "#3B82F6" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => toggleLine(item.key as keyof typeof visibleLines)}
                className={`flex items-center gap-2 text-sm ${
                  visibleLines[item.key as keyof typeof visibleLines]
                    ? "text-gray-800"
                    : "text-gray-400"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: visibleLines[item.key as keyof typeof visibleLines]
                      ? item.color
                      : "#D1D5DB",
                  }}
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              {visibleLines.gulaDarah && (
                <Line
                  type="monotone"
                  dataKey="gulaDarah"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  name="Gula Darah"
                />
              )}
              {visibleLines.hba1c && (
                <Line
                  type="monotone"
                  dataKey="hba1c"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={false}
                  name="HbA1c"
                />
              )}
              {visibleLines.hemoglobin && (
                <Line
                  type="monotone"
                  dataKey="hemoglobin"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  name="Hemoglobin"
                />
              )}
              {visibleLines.kolesterol && (
                <Line
                  type="monotone"
                  dataKey="kolesterol"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  name="Kolestrol"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Lab Results History */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Hasil Lab</h2>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Memuat data...</div>
        ) : (
          <div className="space-y-6">
            {demoLabHistory.map((result) => (
              <div key={result.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <p className="mb-4 font-medium text-gray-800">{result.date}</p>
                <div className="flex gap-6">
                  {/* Lab Image/PDF Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative h-24 w-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                      <div className="flex h-full w-full items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#1D7CF3]">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[80px]">{result.filename}</span>
                    </div>
                  </div>

                  {/* Lab Results Table */}
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-2 text-left font-medium text-gray-500">
                            Jenis Pemeriksaan
                          </th>
                          <th className="pb-2 text-left font-medium text-gray-500">Hasil</th>
                          <th className="pb-2 text-left font-medium text-gray-500">
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {result.metrics.map((metric, index) => (
                          <tr key={index}>
                            <td className="py-2 text-gray-800">{metric.name}</td>
                            <td className="py-2 text-gray-800">
                              {metric.value} {metric.unit}
                            </td>
                            <td className="py-2 text-gray-500">{metric.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
