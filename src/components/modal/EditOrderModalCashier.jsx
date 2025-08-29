import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";

const EditOrderModalCashier = ({ order, onClose, onRefresh }) => {
    const token = useEcomStore((state) => state.token);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // โหลดเมนูทั้งหมด
    useEffect(() => {
        if (!token) return;

        axiosInstance
            .get("/cashier/menu", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setMenuItems(res.data.menus))
            .catch((err) => console.error("โหลดเมนูไม่สำเร็จ:", err));
    }, [token]);

    // โหลดเมนูเดิมของออเดอร์
    useEffect(() => {
        if (order && order.orderItems) {
            const formatted = order.orderItems.map((item) => ({
                menuItemId: item.menuId,
                name: item.menu.name,
                price: item.price,
                quantity: item.quantity,
            }));
            setSelectedItems(formatted);
        }
    }, [order]);

    // คำนวณราคารวม
    useEffect(() => {
        const total = selectedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        setTotalPrice(total);
    }, [selectedItems]);

    // เพิ่มเมนู
    const handleAddItem = (menu) => {
        const existing = selectedItems.find((i) => i.menuItemId === menu.id);
        if (existing) {
            const updated = selectedItems.map((i) =>
                i.menuItemId === menu.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            );
            setSelectedItems(updated);
        } else {
            setSelectedItems([
                ...selectedItems,
                {
                    menuItemId: menu.id,
                    name: menu.name,
                    price: menu.price,
                    quantity: 1,
                },
            ]);
        }
    };

    // ลบเมนู
    const handleRemoveItem = (id) => {
        const updated = selectedItems.filter((i) => i.menuItemId !== id);
        setSelectedItems(updated);
    };

    // เปลี่ยนจำนวน
    const handleQuantityChange = (id, value) => {
        const updated = selectedItems.map((i) =>
            i.menuItemId === id ? { ...i, quantity: parseInt(value) || 1 } : i
        );
        setSelectedItems(updated);
    };

    // กดบันทึก
    const handleSave = async () => {
        try {
            const payload = {
                items: selectedItems.map((item) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                })),
            };

            await axiosInstance.put(
                `/cashier/orders/detail/${order.id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("บันทึกสำเร็จ");
            onClose();
            onRefresh();
        } catch (err) {
            console.error("❌ บันทึกไม่สำเร็จ:", err);
            toast.error("เกิดข้อผิดพลาดในการบันทึก");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">แก้ไขออเดอร์</h2>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    {menuItems.map((menu) => (
                        <button
                            key={menu.id}
                            onClick={() => handleAddItem(menu)}
                            className="border rounded px-2 py-1 hover:bg-gray-100"
                        >
                            {menu.name} ({menu.price}฿)
                        </button>
                    ))}
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">เมนูที่เลือก:</h3>
                    {selectedItems.map((item) => (
                        <div
                            key={item.menuItemId}
                            className="flex items-center justify-between mb-2"
                        >
                            <span>{item.name}</span>
                            <input
                                type="number"
                                className="w-16 border px-2"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleQuantityChange(item.menuItemId, e.target.value)
                                }
                            />
                            <span>{item.price * item.quantity}฿</span>
                            <button
                                className="text-red-500 ml-4"
                                onClick={() => handleRemoveItem(item.menuItemId)}
                            >
                                ลบ
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-right font-bold">
                    ยอดรวม: {totalPrice} ฿
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditOrderModalCashier;
