import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const toNumber = (v) => {
    if (typeof v === "number") return v;
    if (v == null) return NaN;
    const cleaned = String(v).replace(/[^\d.]/g, "");
    return cleaned === "" ? NaN : Number(cleaned);
};

// หมวดหมู่
const CATEGORY_MAP = {
    30001: "ชุดหมูกระทะ",
    60001: "ชุดผัก",
    60002: "เมนูอาหาร",
    60003: "เครื่องดื่ม",
    60004: "เบียร์สดช้าง",
};

const CATEGORY_ORDER = [30001, 60001, 60002, 60004, 60003];

const groupMenusByCategory = (menus) => {
    const groups = {};
    for (const menu of menus) {
        const catId = menu.categoryId;
        const catName = CATEGORY_MAP[catId] || "ไม่ทราบหมวด";
        if (!groups[catName]) groups[catName] = [];
        groups[catName].push(menu);
    }
    return groups;
};

const getSortedCategoryEntries = (menus) => {
    const grouped = groupMenusByCategory(menus);
    return CATEGORY_ORDER.map(id => {
        const name = CATEGORY_MAP[id];
        return [name, grouped[name] || []];
    }).filter(([_, menus]) => menus.length > 0);
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

                const initial = order.orderItems
                    .filter(item => item.menu?.id) // ✅ ลบเมนูที่ไม่มี id
                    .map((item) => {
                        const menuId = Number(item.menu?.id);
                        const price = toNumber(item.menu?.price ?? item.price);
                        const name = item.menu?.name || `เมนูไม่มีชื่อ`;
                        return {
                            menuId,
                            qty: Number(item.qty) || 1,
                            price,
                            name,
                        };
                    });

                setSelectedItems(initial);
            } catch (err) {
                console.error("โหลดเมนูล้มเหลว", err);
            }
        };

        fetchMenus();
    }, [order]);

    const handleQtyChange = (menuId, qty, name) => {
        const num = parseInt(qty);
        setSelectedItems(prev =>
            prev.map(item =>
                (item.menuId === menuId || item.name === name)
                    ? { ...item, qty: isNaN(num) || num < 1 ? 1 : num }
                    : item
            )
        );
    };

    const handleRemoveItem = (menuId, name) => {
        setSelectedItems(prev =>
            prev.filter(item => !(item.menuId === menuId || item.name === name))
        );
    };

    const handleAddItem = (menu) => {
        const menuId = Number(menu.id);
        if (!Number.isInteger(menuId) || menuId <= 0) {
            alert(`ไม่สามารถเพิ่มเมนู "${menu.name}" ได้ (ไม่มีรหัสเมนู)`);
            return;
        }
        if (selectedItems.some(item => item.menuId === menuId)) return;
        setSelectedItems(prev => [
            ...prev,
            {
                menuId,
                qty: 1,
                price: toNumber(menu.price),
                name: menu.name,
            }
        ]);
    };

    const total = selectedItems.reduce((sum, item) => {
        const q = Number(item.qty);
        const p = toNumber(item.price);
        return sum + (Number.isFinite(q) && Number.isFinite(p) ? q * p : 0);
    }, 0);

    const handleSave = async () => {
        const validItems = selectedItems.filter(it =>
            Number.isInteger(it.qty) && it.qty > 0 &&
            Number.isFinite(toNumber(it.price)) && toNumber(it.price) >= 0
        );

        const payload = {
            orderItems: validItems.map(({ menuId, qty, price, name }) => ({
                menuId: Number.isInteger(menuId) ? menuId : undefined,
                qty: Number(qty),
                price: toNumber(price),
                name,
            })),
            totalPrice: validItems.reduce((sum, item) =>
                sum + item.qty * toNumber(item.price), 0
            ),
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
                    {getSortedCategoryEntries(menuList).map(([category, menus]) => (
                        <div key={category} className="mb-2">
                            <h4 className="font-bold mt-2 text-red-600">{category}</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {menus.map(menu => (
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
                    ))}
                </div>

                <div>
                    <h3 className="font-semibold mb-2">เมนูที่เลือก:</h3>
                    {selectedItems.map((item, index) => (
                        <div key={item.menuId ?? `${item.name}-${index}`} className="flex items-center justify-between border-b py-1">
                            <span>{item.name}</span>
                            <input
                                type="number"
                                min={1}
                                className="border p-1 w-16 text-right"
                                value={item.qty}
                                onChange={e => handleQtyChange(item.menuId, e.target.value, item.name)}
                            />
                            <span>{isNaN(item.qty * item.price) ? "-" : item.qty * item.price}฿</span>
                            <button onClick={() => handleRemoveItem(item.menuId, item.name)} className="text-red-500 ml-2">
                                ลบ
                            </button>
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
