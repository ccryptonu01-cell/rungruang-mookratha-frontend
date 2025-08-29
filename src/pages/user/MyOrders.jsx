import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/user/my-orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดออเดอร์:", error);
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      await axios.put(
        `/user/orders/${selectedOrder.orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success(`ยกเลิกออเดอร์ #${selectedOrder.orderId} สำเร็จ!`);
      setOrders((prev) =>
        prev.filter((o) => o.orderId !== selectedOrder.orderId)
      );
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการยกเลิกออเดอร์:", error);
      toast.error(
        `❌ ยกเลิกออเดอร์ #${selectedOrder.orderId} ไม่สำเร็จ\n${error.response?.data?.message || ""
        }`
      );
    } finally {
      setShowCancelModal(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });

  const PaymentBadge = ({ paid }) =>
    paid ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
        ✅ ชำระแล้ว
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
        ❌ ยังไม่ชำระ
      </span>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 font-prompt">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">รายการออเดอร์ของฉัน</h1>

      {/* ===== มือถือ: แสดงเป็นการ์ด ===== */}
      <div className="text-black md:hidden space-y-3">
        {orders.map((order) => {
          const isPaid = order.paymentStatus === "ชำระเงินแล้ว";
          return (
            <div
              key={order.orderId}
              className="rounded-2xl border border-gray-200 bg-white shadow-md ring-1 ring-black/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-rose-50 to-white px-4 py-3">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-full bg-gray-900/90 px-3 text-sm font-bold text-white">
                    #{order.orderId}
                  </span>
                </div>
                <PaymentBadge paid={isPaid} />
              </div>

              {/* Body */}
              <div className="px-4 pb-4 pt-3">
                <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-[15px]">
                  <div className="col-span-1 text-gray-500">โต๊ะ</div>
                  <div className="col-span-2 font-medium">{order.tableNumber || "-"}</div>

                  <div className="col-span-1 text-gray-500">เวลา</div>
                  <div className="col-span-2 font-semibold">{formatDate(order.createdAt)}</div>
                </div>

                <div className="my-3 h-px bg-gray-100" />

                <div className="text-gray-500 mb-1">เมนู</div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <ul className="space-y-1 whitespace-pre-wrap break-words text-gray-900 text-[15px]">
                    {order.orderItems?.map((item, idx) => (
                      <li key={idx} className="leading-6">
                        {item.menuName} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-3 flex justify-end">
                  {!isPaid ? (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="rounded-xl bg-rose-500 px-4 py-2 text-white shadow hover:bg-rose-600 active:scale-[.98] transition"
                    >
                      ยกเลิก
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== เดสก์ท็อป: ตารางเดิม ===== */}
      <div className="hidden md:block">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full text-base text-left text-gray-700">
            <thead className="bg-red-500 text-white text-lg">
              <tr>
                <th className="p-4">หมายเลข</th>
                <th className="p-4">โต๊ะ</th>
                <th className="p-4">เวลา</th>
                <th className="p-4">เมนู</th>
                <th className="p-4">สถานะชำระเงิน</th>
                <th className="p-4">ยกเลิก</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isPaid = order.paymentStatus === "ชำระเงินแล้ว";
                return (
                  <tr
                    key={order.orderId}
                    className="hover:bg-red-50 border-b last:border-b-0 text-lg"
                  >
                    <td className="p-4 font-semibold text-gray-900">{order.orderId}</td>
                    <td className="p-4">{order.tableNumber || "-"}</td>
                    <td className="p-4 text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="p-4 text-gray-900">
                      <ul className="space-y-1 whitespace-pre-wrap break-words">
                        {order.orderItems?.map((item, idx) => (
                          <li key={idx}>
                            {item.menuName} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-bold">
                      <PaymentBadge paid={isPaid} />
                    </td>
                    <td className="p-4">
                      {!isPaid ? (
                        <button
                          onClick={() => openCancelModal(order)}
                          className="px-3 py-2 text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          ยกเลิก
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ยกเลิก */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-red-600 flex items-center gap-2">
              ⚠️ เงื่อนไขการยกเลิก
            </h2>
            <ul className="list-disc pl-6 text-lg text-gray-700 mb-6 space-y-2">
              <li>ออเดอร์ยังไม่ชำระเงินเท่านั้น</li>
              <li>ยกเลิกได้ภายใน 5 นาทีหลังสั่ง</li>
              <li>จำกัดการยกเลิกสูงสุด 3 ครั้ง/วัน</li>
              <li>ยกเลิกได้เฉพาะออเดอร์ของคุณ</li>
            </ul>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 text-lg font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-lg font-semibold"
              >
                ยืนยันยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
