import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import useEcomStore from "../../store/ecom-store";
import * as XLSX from "xlsx";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const token = useEcomStore((state) => state.token);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [monthlySummary, setMonthlySummary] = useState(null);
  const navigate = useNavigate();

  const fetchSummary = async (start, end) => {
    try {
      setLoading(true);
      setError("");
      const url = start && end
        ? `/admin/orders/summary-7-days?start=${start}&end=${end}`
        : "/admin/orders/summary-7-days";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data.summary || []);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async () => {
    if (!year || !month) return;
    try {
      const res = await axios.get(
        `/admin/orders/summary-by-month?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMonthlySummary(res.data.summary);
    } catch (err) {
      setError("ไม่สามารถโหลดสรุปรายเดือนได้");
    }
  };

  useEffect(() => {
    if (token) fetchSummary();
  }, [token]);

  useEffect(() => {
    if (startDate && token) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];

      fetchSummary(startStr, endStr);
    }
  }, [startDate, token]);

  const handleExportDaily = () => {
    const exportData = summary.map((row) => ({
      วันที่: row.date,
      "ยอดขายรวม (฿)": row.total,
      "จำนวนออเดอร์": row.orders,
      "จ่ายแล้ว": row.paid,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ยอดขาย 7 วัน");
    XLSX.writeFile(workbook, "order-summary-7-days.xlsx");
  };

  const handleExportMonthly = () => {
    if (!monthlySummary) return;

    const exportData = [
      {
        เดือน: `${monthlySummary.month}/${monthlySummary.year}`,
        "ยอดขายรวม (฿)": monthlySummary.total,
        "จำนวนออเดอร์": monthlySummary.orders,
        "จ่ายแล้ว": monthlySummary.paid,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ยอดขายรายเดือน");
    XLSX.writeFile(workbook, "order-summary-month.xlsx");
  };

  const handleReset = () => {
    setStartDate("");
    fetchSummary();
    setMonthlySummary(null);
  };

  return (
    <div className="p-4">
      <button
        onClick={() => navigate("/admin/orders")}
        className="mb-3 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded shadow text-sm flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        ย้อนกลับ
      </button>
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span role="img">📅</span> ประวัติออเดอร์
      </h1>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <label className="text-sm">เลือกวันที่เริ่มต้น:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded p-1"
        />
        <label className="text-sm ml-4">เดือน:</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded p-1">
          <option value="">เลือกเดือน</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
              {i + 1}
            </option>
          ))}
        </select>
        <label className="text-sm">ปี:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="2025"
          className="border rounded p-1 w-24"
        />
        <button
          onClick={fetchMonthlySummary}
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm shadow"
        >
          📆 ดูยอดรายเดือน
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-600 text-white px-3 py-1 rounded text-sm shadow"
        >
          🕘 แสดง 7 วันล่าสุด
        </button>
        <button
          onClick={handleExportDaily}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm shadow flex items-center gap-1"
        >
          <Download size={16} /> Export รายวัน
        </button>
        {monthlySummary && (
          <button
            onClick={handleExportMonthly}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm shadow flex items-center gap-1"
          >
            <Download size={16} /> Export รายเดือน
          </button>
        )}
      </div>

      {/* ยอดขายรายเดือน */}
      {monthlySummary && (
        <div className="bg-white shadow-md p-4 rounded mb-6">
          <h2 className="text-lg font-bold mb-3">📆 สรุปยอดขายรายเดือน</h2>
          <ul className="text-base text-gray-800 space-y-1">
            <li>📅 เดือน: {monthlySummary.month} / {monthlySummary.year}</li>
            <li>🧾 ยอดขายรวม: {monthlySummary.total.toLocaleString()} ฿</li>
            <li>✅ ออเดอร์ทั้งหมด: {monthlySummary.orders} รายการ</li>
            <li>💰 ชำระเงินแล้ว: {monthlySummary.paid} รายการ</li>
          </ul>
        </div>
      )}

      <div className="bg-white shadow-md p-4 rounded">
        <h2 className="text-lg font-bold mb-3">
          <span role="img">📊</span> สรุปยอดขายย้อนหลัง 7 วัน
        </h2>

        {loading ? (
          <p>⏳ กำลังโหลด...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : summary.length === 0 ? (
          <p className="text-gray-500">ไม่พบออเดอร์ในช่วงเวลานี้</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-base text-center">
              <thead className="bg-blue-100 text-gray-800">
                <tr>
                  <th className="border px-4 py-3 font-semibold">วันที่</th>
                  <th className="border px-4 py-3 font-semibold">ยอดขายรวม (฿)</th>
                  <th className="border px-4 py-3 font-semibold">จำนวนออเดอร์</th>
                  <th className="border px-4 py-3 font-semibold">จ่ายแล้ว</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {summary.map((day, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-4 py-3">{day.date}</td>
                    <td className="border px-4 py-3">{day.total.toLocaleString()} ฿</td>
                    <td className="border px-4 py-3">{day.orders}</td>
                    <td className="border px-4 py-3">{day.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
