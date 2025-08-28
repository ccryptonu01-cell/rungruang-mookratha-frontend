import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const EditPaymentMethodModalCashier = ({ order, token, onClose }) => {
    const [selectedMethod, setSelectedMethod] = useState(order.paymentMethod || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedMethod) {
            toast.warning("กรุณาเลือกช่องทางชำระเงิน");
            return;
        }

        try {
            setLoading(true);
            await axios.put(
                `http://localhost:5000/api/cashier/orders/${order.id}`,
                { paymentMethod: selectedMethod },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("อัปเดตช่องทางชำระเงินสำเร็จ");
            onClose();
        } catch (err) {
            console.error("อัปเดตช่องทางชำระเงินล้มเหลว", err);
            toast.error("เกิดข้อผิดพลาดในการอัปเดตช่องทางชำระเงิน");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
                <h2 className="text-lg font-bold mb-4 text-center text-gray-800">แก้ไขช่องทางชำระเงิน</h2>

                <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-300"
                >
                    <option value="CASH">เงินสด</option>
                    <option value="PROMPTPAY">พร้อมเพย์</option>
                    <option value="QR">QR Code</option>
                </select>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
                        disabled={loading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        disabled={loading}
                    >
                        {loading ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPaymentMethodModalCashier;
