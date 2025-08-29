import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import useEcomStore from "../../store/ecom-store";
import EditOrderModalCashier from "../../components/modal/EditOrderModalCashier";
import EditPaymentMethodModalCashier from "../../components/modal/EditPaymentMethodModalCashier";
import CancelOrderModal from "../../components/modal/ConfirmCancelModal";
import SlipModal from "../../components/modal/SlipModal";
import AddOrderModalCashier from "../../components/modal/AddOrderModalCashier";
import ManageOrderModalCashier from "../../components/modal/ManageOrderModalCashier";
import CombineOrdersModal from "../../components/modal/CombineOrdersModal";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

const OrderCashier = () => {
    const token = useEcomStore((state) => state.token);
    const [orders, setOrders] = useState([]);
    const [editPaymentOrder, setEditPaymentOrder] = useState(null);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [slipUrl, setSlipUrl] = useState("");
    const [manageOrder, setManageOrder] = useState(null);
    const [combineTableId, setCombineTableId] = useState(null);
    const [addOrderModal, setAddOrderModal] = useState(false);
    const [editOrderCashier, setEditOrderCashier] = useState(null);
    const [filterDate, setFilterDate] = useState("");
    const [searchTable, setSearchTable] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAll, setShowAll] = useState(false);
    const pageSize = 40;

    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get("/cashier/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error("โหลดออเดอร์ล้มเหลว", err);
        }
    };

    const translatePaymentMethod = (method) => {
        switch (method) {
            case "PROMPTPAY": return "พร้อมเพย์";
            case "QR": return "QR Code";
            case "CASH": return "เงินสด";
            default: return "-";
        }
    };

    const getPaymentStatusStyle = (status) => {
        switch (status) {
            case "ชำระเงินแล้ว": return "bg-green-100 text-green-700 font-semibold";
            case "ยังไม่ชำระเงิน": return "bg-yellow-100 text-yellow-800 font-semibold";
            case "ยกเลิกออเดอร์": return "bg-red-100 text-red-700 font-semibold";
            default: return "bg-gray-100 text-gray-700 font-semibold";
        }
    };

    const effectiveDate = filterDate
        ? new Date(filterDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    const filteredOrders = orders.filter((order) => {
        const createdDate = order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : "";
        const selected = filterDate ? new Date(filterDate).toISOString().slice(0, 10) : "";

        const matchesDate = !filterDate || createdDate === selected;
        const matchesTable = order.tableId?.toString().includes(searchTable);

        const username = order.user && order.user.username ? order.user.username.toLowerCase() : "guest";
        const matchesUser = username.includes(searchUser.toLowerCase());

        const matchesStatus = !searchStatus || order.paymentStatus === searchStatus;

        return matchesDate && matchesTable && matchesUser && matchesStatus;
    });

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(filteredOrders.length / pageSize);

    const totalToday = filteredOrders
        .filter(order => order.paymentStatus === "ชำระเงินแล้ว")
        .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

    const paidOrders = filteredOrders.filter(order => order.paymentStatus === "ชำระเงินแล้ว").length;

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">รายการออเดอร์ (แคชเชียร์)</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setAddOrderModal(true)}
                        className="bg-green-600 text-white px-3 py-1 rounded shadow text-sm flex items-center gap-1"
                    >
                        <Plus size={16} />
                        เพิ่มออเดอร์
                    </button>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6 shadow-sm">
                <h2 className="text-base font-semibold text-yellow-800 mb-3">📊 สรุปยอดรายวัน</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div>🧾 ยอดขายรวม: <strong>{totalToday.toLocaleString()} ฿</strong></div>
                    <div>✅ ออเดอร์ชำระแล้ว: <strong>{paidOrders}</strong></div>
                    <div>📅 วันที่: <strong>{new Date(effectiveDate).toLocaleDateString("th-TH")}</strong></div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <input type="date" value={filterDate} onChange={(e) => {
                    setFilterDate(e.target.value); setShowAll(false); setCurrentPage(1);
                }} className="border p-1 rounded" />
                <input type="text" placeholder="โต๊ะ" value={searchTable} onChange={(e) => setSearchTable(e.target.value)} className="border p-1 rounded" />
                <input type="text" placeholder="ผู้สั่ง" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} className="border p-1 rounded" />
                <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} className="border p-1 rounded">
                    <option value="">ทั้งหมด</option>
                    <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                    <option value="ยังไม่ชำระเงิน">ยังไม่ชำระเงิน</option>
                    <option value="ยกเลิกออเดอร์">ยกเลิกออเดอร์</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm text-center shadow-md">
                    <thead className="bg-indigo-100">
                        <tr>
                            <th className="border p-2">#</th>
                            <th className="border p-2">โต๊ะ</th>
                            <th className="border p-2">ผู้สั่ง</th>
                            <th className="border p-2">เมนู</th>
                            <th className="border p-2">ยอดรวม</th>
                            <th className="border p-2">สถานะ</th>
                            <th className="border p-2">ช่องทาง</th>
                            <th className="border p-2">สลิป</th>
                            <th className="border p-2">เวลา</th>
                            <th className="border p-2">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order, index) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="border p-2">{startIndex + index + 1}</td>
                                <td className="border p-2">{order.tableId}</td>
                                <td className="border p-2">{order.user?.username || "guest"}</td>
                                <td className="border p-2 text-left whitespace-pre-line">
                                    {order.orderItems?.map((item, i) => (
                                        <div key={i}>• {item.menu?.name} × {item.quantity} ({item.price * item.quantity}฿)</div>
                                    ))}
                                    <button
                                        onClick={() => setEditOrderCashier(order)}
                                        className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mt-1"
                                    >
                                        🖊️ เพิ่ม / แก้ไขเมนู
                                    </button>
                                </td>
                                <td className="border p-2">{order.totalPrice} บาท</td>
                                <td className="border p-2">
                                    <span className={`px-2 py-1 rounded-full ${getPaymentStatusStyle(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td className="border p-2">
                                    {translatePaymentMethod(order.paymentMethod)} <br />
                                    <button onClick={() => setEditPaymentOrder(order)} className="text-xs text-yellow-700">แก้ไข</button>
                                </td>
                                <td className="border p-2">
                                    {order.slipUrl ? (
                                        <button onClick={() => setSlipUrl(order.slipUrl)} className="text-blue-700 text-xs underline">ดู</button>
                                    ) : "-"}
                                </td>
                                <td className="border p-2">
                                    {new Date(order.createdAt).toLocaleString("th-TH", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    }).replace(",", "")} น.
                                </td>
                                <td className="border p-2">
                                    <button onClick={() => setManageOrder(order)} className="bg-gray-200 px-2 py-1 rounded text-xs">จัดการ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                    <ArrowLeft size={16} /> ก่อนหน้า
                </button>
                <span>หน้า {currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                    ถัดไป <ArrowRight size={16} />
                </button>
            </div>

            {/* Modals */}
            {addOrderModal && (
                <AddOrderModalCashier
                    token={token}
                    onClose={() => setAddOrderModal(false)}
                    onOrderAdded={fetchOrders}
                    menus={orders.flatMap(order => order.items?.map(item => item.menu) || [])}
                />
            )}
            {editOrderCashier && (
                <EditOrderModalCashier
                    order={editOrderCashier}
                    token={token}
                    onClose={() => setEditOrderCashier(null)}
                    onRefresh={fetchOrders}
                />
            )}
            {editPaymentOrder && (
                <EditPaymentMethodModalCashier
                    order={editPaymentOrder}
                    token={token}
                    onClose={() => {
                        setEditPaymentOrder(null);
                        fetchOrders();
                    }}
                />
            )}
            {slipUrl && <SlipModal slipUrl={slipUrl} onClose={() => setSlipUrl("")} />}
            {manageOrder && (
                <ManageOrderModalCashier
                    order={manageOrder}
                    token={token}
                    onClose={() => setManageOrder(null)}
                    onUpdated={fetchOrders}
                />
            )}
            {combineTableId && <CombineOrdersModal tableId={combineTableId} token={token} onClose={() => setCombineTableId(null)} />}
            {orderToCancel && <CancelOrderModal onConfirm={() => setOrderToCancel(null)} onCancel={() => setOrderToCancel(null)} />}
        </div>
    );
};

export default OrderCashier;
