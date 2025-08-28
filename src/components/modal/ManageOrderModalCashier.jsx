import React from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ManageOrderModalCashier = ({ order, token, onClose, onUpdated }) => {
    const handleStatusUpdate = async (newStatus) => {
        try {
            const orderId = order.id;

            await axios.put(
                `http://localhost:5000/api/cashier/orders/${orderId}/payment-status`,
                { status: newStatus }, // ✅ แก้ตรงนี้
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(`อัปเดตเป็น "${newStatus}" สำเร็จ`);
            onUpdated();
            onClose();
        } catch (error) {
            console.error("อัปเดตสถานะล้มเหลว", error);
            toast.error("อัปเดตสถานะไม่สำเร็จ");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-full max-w-xs shadow-xl">
                <h2 className="text-lg font-bold mb-4 text-center">จัดการออเดอร์ #{order.id}</h2>

                <div className="space-y-2">
                    <button onClick={() => handleStatusUpdate("ชำระเงินแล้ว")} className="w-full bg-green-600 text-white px-4 py-2 rounded">
                        ✅ ชำระเงินแล้ว
                    </button>
                    <button onClick={() => handleStatusUpdate("ยังไม่ชำระเงิน")} className="w-full bg-yellow-400 text-black px-4 py-2 rounded">
                        ⏳ ยังไม่ชำระเงิน
                    </button>
                    <button onClick={() => handleStatusUpdate("ยกเลิกออเดอร์")} className="w-full bg-red-500 text-white px-4 py-2 rounded">
                        ❌ ยกเลิกออเดอร์
                    </button>
                    <button onClick={onClose} className="w-full bg-gray-300 text-black px-4 py-2 rounded">
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageOrderModalCashier;
