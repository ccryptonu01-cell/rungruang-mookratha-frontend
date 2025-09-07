import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const toNumber = (v) => {
    if (typeof v === "number") return v;
    if (v == null) return NaN;
    const cleaned = String(v).replace(/[^\d.]/g, ""); // เอา ฿, ช่องว่าง ฯลฯ ออก
    return cleaned === "" ? NaN : Number(cleaned);
};

const EditOrderModal = ({ order, token, onClose }) => {
    const [menuList, setMenuList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await axiosInstance.get("/admin/menu");
                const menus = (res.data.menus || []).map(m => ({
                    ...m,
                    price: toNumber(m.price),
                }));
                setMenuList(menus);

                const initial = order.orderItems.map(item => ({
                    menuId: Number(item.menuId ?? item.menu?.id ?? 0),
                    qty: Number(item.qty) || 1,
                    price: toNumber(item.price ?? item.menu?.price ?? 0),
                    name: item.menu?.name || ""
                }));
                setSelectedItems(initial);
                console.table(initial);

            } catch (err) {
                console.error("โหลดเมนูล้มเหลว", err);
            }
        };

        fetchMenus();
    }, [order]);

    const handleQtyChange = (menuId, qty) => {
        const num = parseInt(qty);
        setSelectedItems(prev =>
            prev.map(item =>
                item.menuId === menuId ? { ...item, qty: isNaN(num) || num < 1 ? 1 : num } : item
            )
        );
    };

    const handleAddItem = (menu) => {
        if (selectedItems.some(item => item.menuId === menu.id)) return;
        setSelectedItems([...selectedItems, {
            menuId: menu.id,
            qty: 1,
            price: toNumber(menu.price),
            name: menu.name
        }]);
    };

    const handleRemoveItem = (menuId) => {
        setSelectedItems(prev => prev.filter(item => item.menuId !== menuId));
    };

    const total = selectedItems.reduce((sum, item) => {
        const q = Number(item.qty);
        const p = toNumber(item.price);
        return sum + (Number.isFinite(q) && Number.isFinite(p) ? q * p : 0);
    }, 0);

    const handleSave = async () => {
        const normalized = selectedItems.map(it => ({
            menuId: Number(it.menuId),
            qty: Number(it.qty),
            price: toNumber(it.price),
            name: it.name,
        }));

        const invalid = normalized.find((it) =>
            !Number.isInteger(it.menuId) || it.menuId <= 0 ||
            !Number.isInteger(it.qty) || it.qty <= 0 ||
            !Number.isFinite(it.price) || it.price < 0
        );
        if (invalid) {
            console.warn("Invalid menu item:", invalid);
            alert(`มีข้อมูลเมนูไม่ถูกต้อง: ${invalid.name || invalid.menuId} (จำนวนต้อง ≥1 และราคาเป็นตัวเลข)`);
            return;
        }

        const payload = {
            orderItems: normalized.map(({ menuId, qty, price }) => ({ menuId, qty, price })),
            totalPrice: Number(total),
        };

        try {
            await axiosInstance.put(`/admin/orders/detail/${order.id}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            onClose();
        } catch (err) {
            console.error("อัปเดตเมนูล้มเหลว:", err?.response?.data || err);
            alert(err?.response?.data?.message || "แก้ไขคำสั่งซื้อไม่สำเร็จ");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">แก้ไขเมนู</h2>

                <div className="mb-4">
                    <h3 className="font-semibold">เมนูทั้งหมด:</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {menuList.map(menu => (
                            <button
                                key={menu.id}
                                onClick={() => handleAddItem(menu)}
                                className="border p-1 rounded hover:bg-gray-100 text-left"
                            >
                                {menu.name} ({menu.price}฿)
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">เมนูที่เลือก:</h3>
                    {selectedItems.map(item => (
                        <div key={item.menuId} className="flex items-center justify-between border-b py-1">
                            <span>{item.name}</span>
                            <input
                                type="number"
                                min={1}
                                className="border p-1 w-16 text-right"
                                value={item.qty}
                                onChange={e => handleQtyChange(item.menuId, e.target.value)}
                            />
                            <span>{isNaN(item.qty * item.price) ? "-" : item.qty * item.price}฿</span>
                            <button onClick={() => handleRemoveItem(item.menuId)} className="text-red-500 ml-2">ลบ</button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-right">
                    <strong>ยอดรวม: {isNaN(total) ? "-" : total} ฿</strong>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">ยกเลิก</button>
                    <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">บันทึก</button>
                </div>
            </div>
        </div>
    );
};

export default EditOrderModal;
