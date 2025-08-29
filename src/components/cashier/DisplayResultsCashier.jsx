import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import dayjs from "dayjs";
import useEcomStore from "../../store/ecom-store";
import "dayjs/locale/th";
dayjs.locale("th");

export const DisplayResultsCashier = () => {
    const token = useEcomStore((state) => state.token);
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [activeTab, setActiveTab] = useState("latest");
    const [filterDate, setFilterDate] = useState("");

    useEffect(() => {
        if (token) {
            axiosInstance
                .get("/cashier/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => setOrders(res.data.orders || []));

            axiosInstance
                .get("/cashier/reservations", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    const data = res.data;
                    if (Array.isArray(data)) {
                        setReservations(data);
                    } else if (Array.isArray(data.reservations)) {
                        // ในกรณี API ห่อไว้ใน res.data.reservations
                        setReservations(data.reservations);
                    } else {
                        console.warn("API /reservations ส่งข้อมูลไม่ใช่ array:", data);
                        setReservations([]);
                    }
                })
                .catch((err) => {
                    console.error("โหลดข้อมูล reservations ผิดพลาด:", err);
                    setReservations([]);
                });
        }
    }, [token]);

    const effectiveDate = dayjs(filterDate).isValid()
        ? dayjs(filterDate).format("YYYY-MM-DD")
        : null;

    const paidOrders = orders
        .filter((o) => o.paymentStatus === "ชำระเงินแล้ว")
        .filter((o) => {
            if (!effectiveDate) return true;
            return dayjs(o.createdAt).format("YYYY-MM-DD") === effectiveDate;
        });

    const unpaidOrders = orders.filter(
        (o) => o.paymentStatus === "ยังไม่ชำระเงิน"
    );

    const sortedTopTables = Object.entries(
        paidOrders.reduce((acc, o) => {
            const tableId = o.tableId ? o.tableId.toString() : "ไม่ระบุ";
            acc[tableId] = (acc[tableId] || 0) + Number(o.totalPrice || 0);
            return acc;
        }, {})
    )
        .sort(([, a], [, b]) => b - a)
        .map(([table, total]) => ({ table, total }));

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const totalPeopleToday = reservations
        .filter((r) => {
            if (!effectiveDate) return true;
            return dayjs(r.createdAt).format("YYYY-MM-DD") === effectiveDate;
        })
        .reduce((sum, r) => sum + (r.people || 0), 0);

    const totalSalesToday = paidOrders.reduce(
        (sum, o) => sum + Number(o.totalPrice || 0),
        0
    );

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* วันที่ + ปุ่มแสดงทั้งหมด */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <label htmlFor="filterDate" className="text-sm font-medium">
                        เลือกวันที่:
                    </label>
                    <input
                        id="filterDate"
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border px-3 py-2 rounded shadow-sm"
                    />
                    <button
                        onClick={() => setFilterDate("")}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        แสดงทั้งหมด
                    </button>
                </div>
            </div>

            {/* แถบเมนูแสดงข้อมูล */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: "latest", label: "ออเดอร์ล่าสุด" },
                    { key: "paid", label: "รายการออเดอร์ที่ชำระเงินแล้ว" },
                    { key: "unpaid", label: "ออเดอร์ที่ยังไม่ชำระเงิน" },
                    { key: "topTable", label: "ยอดขายแยกตามโต๊ะ" },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 rounded text-sm font-medium ${activeTab === key
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* เนื้อหาตาม tab */}
            {activeTab === "paid" && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">🧾 รายการออเดอร์ที่ชำระเงินแล้ว</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-left">โต๊ะ</th>
                                    <th className="px-4 py-2 text-left">ยอดรวม</th>
                                    <th className="px-4 py-2 text-left">วันที่ / เวลา</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paidOrders.map((order, index) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-2">{index + 1}</td>
                                        <td className="px-4 py-2">{order.tableId || "-"}</td>
                                        <td className="px-4 py-2">฿{Number(order.totalPrice).toLocaleString()}</td>
                                        <td className="px-4 py-2">{dayjs(order.createdAt).locale('th').format("D MMM YYYY / เวลา HH:mm")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "topTable" && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">📋 ยอดขายแยกตามโต๊ะ</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">โต๊ะ</th>
                                    <th className="px-4 py-2 text-left">ยอดขายรวม</th>
                                    <th className="px-4 py-2 text-left">วันที่</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedTopTables.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2">{item.table}</td>
                                        <td className="px-4 py-2">฿{item.total.toLocaleString()}</td>
                                        <td className="px-4 py-2">{dayjs(effectiveDate || new Date()).format("D MMM YYYY")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "unpaid" && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">🔴 ออเดอร์ที่ยังไม่ชำระเงิน</h2>
                    <div className="mb-3 text-red-600 font-medium">
                        🔴 ออเดอร์ค้างจ่าย: {unpaidOrders.length} รายการ
                        <br />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-left">โต๊ะ</th>
                                    <th className="px-4 py-2 text-left">ยอดรวม</th>
                                    <th className="px-4 py-2 text-left">วันที่ / เวลา</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {unpaidOrders.map((order, index) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-2">{index + 1}</td>
                                        <td className="px-4 py-2">{order.tableId || "-"}</td>
                                        <td className="px-4 py-2">฿{Number(order.totalPrice).toLocaleString()}</td>
                                        <td className="px-4 py-2">{dayjs(order.createdAt).locale('th').format("D MMM YYYY / เวลา HH:mm")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "latest" && (
                <div className="w-full">
                    <h2 className="text-xl font-semibold mb-4">
                        🕒 สรุปออเดอร์ล่าสุด
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">วันที่ / เวลา</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">โต๊ะ</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">สถานะ</th>
                                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">ยอดเงิน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {[...orders]
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .slice(0, 5)
                                    .map((order, index) => (
                                        <tr key={order.id}>
                                            <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {dayjs(order.createdAt).locale('th').format("D MMM YYYY / เวลา HH:mm")}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                โต๊ะ {order.table?.tableNumber || "-"}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {order.paymentStatus === "ชำระเงินแล้ว" ? (
                                                    <span className="text-green-600 font-medium">✅ ชำระเงินแล้ว</span>
                                                ) : (
                                                    <span className="text-yellow-600 font-medium">⌛ รอชำระเงิน</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700">
                                                ฿{Number(order.totalPrice || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DisplayResultsCashier;