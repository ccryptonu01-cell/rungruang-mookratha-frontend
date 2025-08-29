import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import useEcomStore from "../../../store/ecom-store";
import { deleteInventory, updateInventory } from "../../../api/Inventory";
import EditInventoryModal from "./EditInventoryModal";
import { Package } from 'lucide-react';
import { toast } from 'react-toastify';

const ListInventory = ({ refreshTrigger }) => {
    const token = useEcomStore((state) => state.token);
    const [items, setItems] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchInventory = async () => {
        try {
            const res = await axiosInstance.get("/api/admin/inventory", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setItems(res.data.data);
        } catch (err) {
            console.error("Fetch inventory error:", err);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [token, refreshTrigger]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        return `${day} ${hour}.${minute} น.`;
    };

    const handleDelete = (id) => {
        toast(
            ({ closeToast }) => (
                <div
                    className="p-8 bg-white rounded-xl shadow-2xl mx-auto"
                    style={{ width: "500px", maxWidth: "100%" }}
                >
                    <div className="text-center text-xl font-semibold text-gray-800 mb-6">
                        ⚠️ ยืนยันการลบวัตถุดิบนี้?
                    </div>
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={closeToast}
                            className="px-6 py-3 text-lg bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await deleteInventory(token, id);
                                    fetchInventory();
                                    closeToast();
                                    toast.success("ลบวัตถุดิบสำเร็จ");
                                } catch (err) {
                                    closeToast();
                                    toast.error("เกิดข้อผิดพลาดในการลบ");
                                }
                            }}
                            className="px-6 py-3 text-lg bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            ลบ
                        </button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false,
                style: {
                    background: "transparent",
                    boxShadow: "none",
                    display: "flex",
                    justifyContent: "center",
                    width: "auto",
                    maxWidth: "none",
                },
            }
        );
    };


    const handleEdit = (item) => {
        setEditItem(item);
        setIsModalOpen(true);
    };

    const handleSaveEdit = async (updatedItem) => {
        try {
            await updateInventory(token, updatedItem.id, {
                itemName: updatedItem.itemName,
                quantity: updatedItem.quantity,
            });
            setIsModalOpen(false);
            setEditItem(null);
            fetchInventory();
        } catch (err) {
            alert("อัปเดตไม่สำเร็จ");
        }
    };

    const filteredItems = items.filter((item) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mt-6 font-sans text-sm text-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Package className="w-5 h-5" /> รายการวัตถุดิบทั้งหมด
                </h2>
                <input
                    type="text"
                    placeholder="ค้นหาวัตถุดิบ..."
                    className="border px-3 py-2 w-64 rounded text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredItems.length === 0 ? (
                <p className="text-gray-600">ไม่มีข้อมูลวัตถุดิบ</p>
            ) : (
                <table className="w-full text-sm bg-white shadow rounded-md">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 text-left text-base">ชื่อวัตถุดิบ</th>
                            <th className="px-4 py-2 text-center text-base">จำนวน (กิโลกรัม)</th>
                            <th className="px-4 py-2 text-center text-base">เพิ่มเมื่อ</th>
                            <th className="px-4 py-2 text-center text-base">แก้ไขล่าสุด</th>
                            <th className="px-4 py-2 text-right text-base">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 border-t">
                                <td className="px-4 py-2 text-base">{item.itemName}</td>
                                <td className="px-4 py-2 text-center text-base">{item.quantity}</td>
                                <td className="px-4 py-2 text-center text-base text-gray-600">
                                    {formatDate(item.createdAt)}
                                </td>
                                <td className="px-4 py-2 text-center text-base text-gray-600">
                                    {formatDate(item.updatedAt)}
                                </td>
                                <td className="px-4 py-2 text-right space-x-2 text-base">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <EditInventoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEdit}
                item={editItem}
            />
        </div>
    );
};

export default ListInventory;
