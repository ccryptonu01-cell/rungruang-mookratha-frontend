import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import useEcomStore from "../../../store/ecom-store";

const SalesSummaryTable = ({ startDate, endDate }) => {
    const token = useEcomStore((state) => state.token);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axiosInstance.get("/admin/orders/summary-7-days", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { start: startDate, end: endDate },
                });
                setSummary(res.data.summary || []);
            } catch (err) {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchSummary();
    }, [token, startDate, endDate]);

    if (loading) return <p>⏳ กำลังโหลด...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white shadow-md p-4 rounded">
            <h2 className="text-lg font-bold mb-3">📊 สรุปยอดขายย้อนหลัง 7 วัน</h2>
            <div className="overflow-x-auto">
                {summary.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">ไม่พบออเดอร์ในช่วงวันที่ที่เลือก</p>
                ) : (
                    <table className="table-auto w-full text-sm border text-center">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1">วันที่</th>
                                <th className="border px-2 py-1">ยอดขายรวม (฿)</th>
                                <th className="border px-2 py-1">จำนวนออเดอร์</th>
                                <th className="border px-2 py-1">จ่ายแล้ว</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((day, i) => (
                                <tr key={i}>
                                    <td className="border px-2 py-1">{day.date}</td>
                                    <td className="border px-2 py-1">{day.total.toLocaleString()} ฿</td>
                                    <td className="border px-2 py-1">{day.orders}</td>
                                    <td className="border px-2 py-1">{day.paid}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SalesSummaryTable;
