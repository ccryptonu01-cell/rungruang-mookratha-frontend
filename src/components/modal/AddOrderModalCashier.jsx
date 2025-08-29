import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const AddOrderModalCashier = ({ token, onClose, onOrderAdded }) => {
    const [menus, setMenus] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedTableNumber, setSelectedTableNumber] = useState("");

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await axiosInstance.get("/menu");
                setMenus(res.data.menus || []);
            } catch (err) {
                console.error("ดึงเมนูล้มเหลว", err);
            }
        };
        fetchMenus();
    }, []);

    const addItem = (menu) => {
        const exists = selectedItems.find((item) => item.id === menu.id);
        if (exists) return;
        setSelectedItems([...selectedItems, { ...menu, qty: 1 }]);
    };

    const updateQty = (id, qty) => {
        setSelectedItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, qty: parseInt(qty) || 1 } : item
            )
        );
    };

    const removeItem = (id) => {
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
    };

    const total = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const handleSave = async () => {
        if (!selectedTableNumber.trim()) {
            toast.warning("กรุณากรอกหมายเลขโต๊ะ");
            return;
        }

        if (selectedItems.length === 0) {
            toast.warning("กรุณาเลือกเมนูก่อนบันทึก");
            return;
        }

        try {
            const payload = {
                tableNumber: parseInt(selectedTableNumber, 10),
                items: selectedItems.map((item) => ({
                    menuItemId: item.id,
                    quantity: item.qty
                }))
            };

            await axiosInstance.post("/cashier/orders", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("เพิ่มออเดอร์สำเร็จ");
            setSelectedItems([]);
            setSelectedTableNumber("");

            if (onOrderAdded) onOrderAdded();
            if (onClose) onClose();

        } catch (err) {
            console.error("เพิ่มออเดอร์ไม่สำเร็จ", err);
            toast.error("ไม่สามารถเพิ่มออเดอร์ได้");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-xl">
                <h2 className="text-lg font-bold mb-4">เพิ่มออเดอร์ (แคชเชียร์)</h2>

                <label className="block font-semibold mb-1">หมายเลขโต๊ะ:</label>
                <input
                    type="number"
                    value={selectedTableNumber}
                    onChange={(e) => setSelectedTableNumber(e.target.value)}
                    className="border p-2 mb-4 rounded w-full"
                    placeholder="เช่น 1, 2, 10"
                />

                <div className="grid grid-cols-2 gap-2 mb-4">
                    {menus.map((menu) => (
                        <button
                            key={menu.id}
                            onClick={() => addItem(menu)}
                            className="border p-2 rounded hover:bg-gray-100 text-left"
                        >
                            {menu.name} ({menu.price}฿)
                        </button>
                    ))}
                </div>

                <h3 className="font-semibold mb-2">เมนูที่เลือก:</h3>
                {selectedItems.length === 0 && (
                    <p className="text-gray-500 mb-2 text-sm">ยังไม่มีเมนูที่เลือก</p>
                )}
                {selectedItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between mb-1"
                    >
                        <span>{item.name}</span>
                        <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateQty(item.id, e.target.value)}
                            className="border w-16 text-center mx-2 rounded"
                        />
                        <span>{item.price * item.qty}฿</span>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 text-sm ml-2"
                        >
                            ลบ
                        </button>
                    </div>
                ))}

                <div className="mt-4 flex justify-between items-center">
                    <span className="font-bold">ยอดรวม: {total} ฿</span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="bg-gray-300 px-4 py-2 rounded"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOrderModalCashier;
