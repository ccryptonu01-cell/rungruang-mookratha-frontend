import React, { useState } from "react";
import axios from "axios";

const EditPaymentMethodModal = ({ order, token, onClose }) => {
    const [method, setMethod] = useState(order.paymentMethod || "");

    const handleSave = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/orders/${order.id}`,
                { paymentMethod: method },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onClose();
        } catch (err) {
            console.error("อัปเดตช่องทางชำระเงินผิดพลาด", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-[400px]">
                <h2 className="text-lg font-bold mb-4">แก้ไขช่องทางชำระเงิน</h2>

                <select
                    className="w-full border p-2 rounded mb-4"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <option value="PROMPTPAY">พร้อมเพย์</option>
                    <option value="QR">QR Code</option>
                    <option value="CASH">เงินสด</option>
                </select>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">ยกเลิก</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">บันทึก</button>
                </div>
            </div>
        </div>
    );
};

export default EditPaymentMethodModal;
