import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import useEcomStore from "../../store/ecom-store";
import EditOrderModal from "../../components/modal/EditOrderModal";
import EditPaymentMethodModal from "../../components/modal/EditPaymentMethodModal";
import CancelOrderModal from "../../components/modal/ConfirmCancelModal";
import SlipModal from "../../components/modal/SlipModal";
import AddOrderModal from "../../components/modal/AddOrderModal";
import ManageOrderModal from "../../components/modal/ManageOrderModal";
import CombineOrdersModal from "../../components/modal/CombineOrdersModal";
import { ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Plus, List } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [editOrder, setEditOrder] = useState(null);
  const [editPaymentOrder, setEditPaymentOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [slipUrl, setSlipUrl] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchTable, setSearchTable] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [addOrderModal, setAddOrderModal] = useState(false);
  const [manageOrder, setManageOrder] = useState(null);
  const [combineTableId, setCombineTableId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const pageSize = 40;
  const token = useEcomStore((state) => state.token);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders([...res.data.orders]);
    } catch (err) {
      console.error("โหลดข้อมูลล้มเหลว", err);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

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
    const isValidDate = order.createdAt && !isNaN(new Date(order.createdAt));
    const createdDate = isValidDate ? new Date(order.createdAt).toISOString().slice(0, 10) : "";
    const selected = filterDate ? new Date(filterDate).toISOString().slice(0, 10) : "";

    const matchesDate = !filterDate || createdDate === selected;
    const matchesTable = order.tableId?.toString().includes(searchTable);
    const matchesUser = (order.user?.username || "guest").toLowerCase().includes(searchUser.toLowerCase());
    const matchesStatus = !searchStatus || order.paymentStatus === searchStatus;

    return matchesDate && matchesTable && matchesUser && matchesStatus;
  });

  // 📌 Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const totalToday = filteredOrders
    .filter(order => order.paymentStatus === "ชำระเงินแล้ว")
    .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const paidOrders = filteredOrders.filter(order => order.paymentStatus === "ชำระเงินแล้ว").length;
  const totalOrders = filteredOrders.length;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">รายการออเดอร์</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddOrderModal(true)}
            className="bg-green-600 text-white px-3 py-2 rounded text-sm font-medium shadow hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>เพิ่มออเดอร์</span>
          </button>
          <button
            onClick={() => navigate("/admin/order-history")}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium shadow hover:bg-blue-600 flex items-center gap-2"
          >
            <List size={18} />
            <span>ดูประวัติออเดอร์</span>
          </button>
        </div>
      </div>

      {/* ✅ ตรงนี้คือสรุปยอดรายวัน */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-yellow-800 mb-3 flex items-center gap-2">
          📊 สรุปยอดรายวัน
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 text-lg">🧾</span>
            <span><strong>ยอดขายรวม:</strong> {totalToday.toLocaleString()} ฿</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-600 text-lg">✅</span>
            <span><strong>จำนวนออเดอร์:</strong> {totalOrders} รายการ</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-700 text-lg">💵</span>
            <span><strong>ชำระเงินแล้ว:</strong> {paidOrders} รายการ</span>
          </div>

          {!showAll && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-lg">📅</span>
              <span><strong>วันที่:</strong> {new Date(effectiveDate).toLocaleDateString("th-TH")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <label className="text-sm mr-2">เลือกวันที่:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setShowAll(false);
              setCurrentPage(1);
            }}
            className="border p-1 rounded"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="ค้นหาโต๊ะ"
            value={searchTable}
            onChange={(e) => {
              setSearchTable(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-1 rounded"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="ค้นหาผู้สั่ง"
            value={searchUser}
            onChange={(e) => {
              setSearchUser(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-1 rounded"
          />
        </div>
        <div>
          <select
            value={searchStatus}
            onChange={(e) => {
              setSearchStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-1 rounded"
          >
            <option value="">สถานะทั้งหมด</option>
            <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
            <option value="ยังไม่ชำระเงิน">ยังไม่ชำระเงิน</option>
            <option value="ยกเลิกออเดอร์">ยกเลิกออเดอร์</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilterDate("");
              setSearchTable("");
              setSearchUser("");
              setSearchStatus("");
              setShowAll(true);
              setCurrentPage(1);
            }}
            className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium shadow"
          >
            แสดงทั้งหมด
          </button>

          <button
            onClick={() => {
              const today = new Date().toISOString().slice(0, 10);
              setFilterDate(today);
              setSearchTable("");
              setSearchUser("");
              setSearchStatus("");
              setCurrentPage(1);
              setShowAll(false);
            }}
            className="bg-purple-600 text-white px-4 py-1 rounded text-sm font-medium shadow"
          >
            🕒 ออเดอร์ล่าสุด
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-base text-center shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-indigo-100 text-gray-900 font-semibold text-sm">
            <tr>
              <th className="border px-4 py-3">#</th>
              <th className="border px-4 py-3">โต๊ะ</th>
              <th className="border px-4 py-3">ผู้สั่ง</th>
              <th className="border px-4 py-3 text-left">เมนู</th>
              <th className="border px-4 py-3">ยอดรวม</th>
              <th className="border px-4 py-3">สถานะชำระเงิน</th>
              <th className="border px-4 py-3">ช่องทาง</th>
              <th className="border px-4 py-3">สลิป</th>
              <th className="border px-4 py-3">เวลา</th>
              <th className="border px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedOrders.map((order, index) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border px-4 py-3">{startIndex + index + 1}</td>
                <td className="border px-4 py-3">{order.tableId || "-"}</td>
                <td className="border px-4 py-3">{order.user?.username || "guest"}</td>
                <td className="border px-4 py-3 text-left">
                  <div className="space-y-1">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx}>
                        • {item.menu?.name} × {item.quantity}{" "}
                        <span className="text-gray-500">({item.price}฿)</span>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditOrder(order)}
                      className="inline-flex items-center gap-1 text-yellow-700 text-xs bg-yellow-100 hover:bg-yellow-200 px-2 py-[2px] rounded shadow-sm"
                    >
                      ✎ แก้ไขเมนู
                    </button>
                  </div>
                </td>
                <td className="border px-4 py-3">{order.totalPrice} ฿</td>
                <td className="border px-4 py-3">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPaymentStatusStyle(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="border px-4 py-3">
                  <div className="flex flex-col items-center space-y-1">
                    {translatePaymentMethod(order.paymentMethod)}
                    <button
                      onClick={() => setEditPaymentOrder(order)}
                      className="text-yellow-700 text-xs bg-yellow-100 hover:bg-yellow-200 px-2 py-[2px] rounded shadow-sm"
                    >
                      ✎ แก้ไข
                    </button>
                  </div>
                </td>
                <td className="border px-4 py-3">
                  {order.slipUrl ? (
                    <button
                      onClick={() => setSlipUrl(order.slipUrl)}
                      className="text-blue-700 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-[2px] rounded shadow-sm"
                    >
                      ดูสลิป
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-4 py-3">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                    : "-"}
                </td>
                <td className="border px-4 py-3">
                  <button
                    onClick={() => setManageOrder(order)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded shadow-sm"
                  >
                    จัดการ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Control */}
      <div className="flex justify-center items-center gap-4 mt-4 text-sm">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          ก่อนหน้า
        </button>
        <span>หน้า {currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ถัดไป
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Modals */}
      {editOrder && (
        <EditOrderModal
          order={editOrder}
          token={token}
          onClose={() => {
            setEditOrder(null);
            fetchOrders();
          }}
        />
      )}
      {editPaymentOrder && (
        <EditPaymentMethodModal
          order={editPaymentOrder}
          token={token}
          onClose={() => {
            setEditPaymentOrder(null);
            fetchOrders();
          }}
        />
      )}
      {orderToCancel && (
        <CancelOrderModal
          onConfirm={async () => {
            try {
              await axios.put(
                `/admin/orders/${orderToCancel.id}`,
                { status: "CANCELLED" },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setOrderToCancel(null);
              fetchOrders();
            } catch (err) {
              console.error("ยกเลิกออเดอร์ไม่สำเร็จ", err);
            }
          }}
          onCancel={() => setOrderToCancel(null)}
        />
      )}
      {slipUrl && <SlipModal slipUrl={slipUrl} onClose={() => setSlipUrl("")} />}
      {addOrderModal && (
        <AddOrderModal
          token={token}
          onClose={() => setAddOrderModal(false)}
          onSuccess={() => {
            fetchOrders();
            setAddOrderModal(false);
          }}
        />
      )}
      {manageOrder && (
        <ManageOrderModal
          order={manageOrder}
          token={token}
          onClose={() => {
            setManageOrder(null);
            fetchOrders();
          }}
          onCombine={() => setCombineTableId(manageOrder.tableId)}
        />
      )}
      {combineTableId && (
        <CombineOrdersModal
          tableId={combineTableId}
          token={token}
          onClose={() => setCombineTableId(null)}
        />
      )}
    </div>
  );
};

export default Orders;
