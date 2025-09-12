import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance.js";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../fonts/THSarabunNew.js";
import { logoBase64 } from "../../assets/logoBase64";
import CombineOrdersModal from "./CombineOrdersModal";

const ManageOrderModal = ({ order, token, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCombineOpen, setIsCombineOpen] = useState(false);
    if (!order) return null;

    const updatePaymentStatus = async (statusText) => {
        try {
            await axiosInstance.put(
                `/admin/orders/${order.id}`,
                { paymentStatus: statusText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`อัปเดตสถานะเป็น "${statusText}" สำเร็จ`);
            onClose();
        } catch (err) {
            console.error("อัปเดตสถานะไม่สำเร็จ", err);
            toast.error("ไม่สามารถอัปเดตสถานะได้");
        }
    };

    const handleCancel = async () => {
        try {
            await axiosInstance.put(
                `/admin/orders/${order.id}`,
                { status: "CANCELLED" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("ยกเลิกออเดอร์เรียบร้อย");
            onClose();
        } catch (err) {
            console.error("ยกเลิกออเดอร์ไม่สำเร็จ", err);
            toast.error("เกิดข้อผิดพลาดในการยกเลิก");
        }
    };

    const printSingleOrder = () => {
        if (!order.orderItems?.length) return toast.warn("ไม่มีรายการในออเดอร์นี้");

        const doc = new jsPDF();
        const margin = 15;
        doc.addFileToVFS("THSarabunNew.ttf", window.TH_SarabunNew_VFS);
        doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
        doc.setFont("THSarabunNew");

        const pageWidth = doc.internal.pageSize.getWidth();
        const logoSize = 30;
        const centerX = (pageWidth - logoSize) / 2;
        doc.addImage(logoBase64, "JPEG", centerX, 10, logoSize, logoSize);

        let y = 10 + logoSize + 10;
        doc.setFontSize(18);
        doc.text(`ใบเสร็จออเดอร์ #${order.id} โต๊ะ ${order.tableId}`, margin, y);
        y += 10;

        // เพิ่มวันที่และเวลา
        doc.setFontSize(14);
        const now = new Date();
        const formattedDateTime = now.toLocaleString("th-TH", {
            dateStyle: "short",
            timeStyle: "short",
        });
        doc.text(`วันที่: ${formattedDateTime}`, margin, y);
        y += 10;

        autoTable(doc, {
            startY: y,
            head: [["เมนู", "จำนวน", "ราคาต่อหน่วย (บาท)", "รวม (บาท)"]],
            body: order.orderItems.map(item => {
                const quantity = item.quantity || item.qty || 1;
                const price = Number(item.price || item.menu?.price || 0);
                return [
                    item.menu.name,
                    quantity,
                    price.toFixed(2),
                    (price * quantity).toFixed(2),
                ];
            }),
            styles: {
                font: "THSarabunNew",
                fontSize: 14,
            },
            headStyles: {
                fillColor: [230, 230, 230],
                font: "THSarabunNew",
                fontStyle: "normal",
                textColor: 20,
            },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(16);
        doc.text(`รวมทั้งหมด: ${Number(order.totalPrice || 0).toFixed(2)} บาท`, margin, finalY);
        doc.save(`order-${order.id}-table-${order.tableId}.pdf`);
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4">
                    จัดการออเดอร์ #{order.id}
                </h2>

                <div className="space-y-2 mb-3">
                    <button
                        onClick={printSingleOrder}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                        disabled={isLoading}
                    >
                        🧾 พิมพ์ใบเสร็จโต๊ะนี้ (PDF)
                    </button>

                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => updatePaymentStatus("ชำระเงินแล้ว")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                    >
                        ชำระเงินแล้ว
                    </button>

                    <button
                        onClick={() => updatePaymentStatus("ยังไม่ชำระเงิน")}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded"
                    >
                        ยังไม่ชำระเงิน
                    </button>

                    <button
                        onClick={handleCancel}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                    >
                        ยกเลิกออเดอร์
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-300 hover:bg-gray-400 py-2 rounded"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>

                {isCombineOpen && (
                    <CombineOrdersModal
                        tableId={order.tableId}
                        token={token}
                        onClose={() => setIsCombineOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default ManageOrderModal;
