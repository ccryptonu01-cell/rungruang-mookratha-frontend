import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";

const CATEGORY_MAP = {
    30001: "ชุดหมูกระทะ",
    60001: "ชุดผัก",
    60002: "เมนูอาหาร",
    60003: "เครื่องดื่ม",
    60004: "เบียร์สดช้าง",
};
const CATEGORY_ORDER = [30001, 60001, 60002, 60004, 60003];

const toNumber = (v) => {
    if (typeof v === "number") return v;
    if (v == null) return NaN;
    const cleaned = String(v).replace(/[^\d.]/g, "");
    return cleaned === "" ? NaN : Number(cleaned);
};

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

const EditOrderModalCashier = ({ order, onClose, onRefresh }) => {
    const token = useEcomStore((state) => state.token);
    const [menuList, setMenuList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    // โหลดเมนูทั้งหมด
    useEffect(() => {
        if (!token) return;
        axiosInstance
            .get("/cashier/menu", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const menus = (res.data.menus || [])
                    .filter(m => Number.isInteger(m.id))
                    .map(m => ({ ...m, price: toNumber(m.price) }));
                setMenuList(menus);
            })
            .catch((err) => console.error("โหลดเมนูไม่สำเร็จ:", err));
    }, [token]);

    // โหลดเมนูเดิมของออเดอร์
    useEffect(() => {
        if (order?.orderItems) {
            const formatted = order.orderItems
                .filter(item => item.menu?.id)
                .map((item) => ({
                    menuItemId: item.menuId,
                    name: item.menu.name,
                    price: toNumber(item.price),
                    quantity: item.quantity,
                }));
            setSelectedItems(formatted);
        }
    }, [order]);

    const handleAddItem = (menu) => {
        const id = Number(menu.id);
        if (!Number.isInteger(id) || id <= 0) {
            alert(`ไม่สามารถเพิ่มเมนู "${menu.name}" ได้ (ไม่มีรหัสเมนู)`);
            return;
        }
        const existing = selectedItems.find((i) => i.menuItemId === id);
        if (existing) {
            setSelectedItems(selectedItems.map((i) =>
                i.menuItemId === id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setSelectedItems([
                ...selectedItems,
                {
                    menuItemId: id,
                    name: menu.name,
                    price: toNumber(menu.price),
                    quantity: 1,
                },
            ]);
        }
    };

    const handleRemoveItem = (id) => {
        setSelectedItems(selectedItems.filter((i) => i.menuItemId !== id));
    };

    const handleQuantityChange = (id, value) => {
        const num = parseInt(value);
        setSelectedItems(selectedItems.map((i) =>
            i.menuItemId === id ? { ...i, quantity: isNaN(num) || num < 1 ? 1 : num } : i
        ));
    };

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

    const totalPrice = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const filteredMenus = menuList
        .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const sortedMenus = [...filteredMenus].sort((a, b) => {
        if (sortOrder === "asc") return a.price - b.price;
        if (sortOrder === "desc") return b.price - a.price;
        return 0;
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto relative">
                {/* ปุ่มกากบาท */}
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                    onClick={onClose}
                >
                    ×
                </button>

                <h2 className="text-xl font-bold mb-4">แก้ไขออเดอร์</h2>

                <input
                    type="text"
                    placeholder="ค้นหาเมนู..."
                    className="border rounded p-1 w-full mb-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="mb-4">
                    <select
                        className="border rounded p-1 w-1/3"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="">เรียงตาม...</option>
                        <option value="asc">ราคาน้อย → มาก</option>
                        <option value="desc">ราคามาก → น้อย</option>
                    </select>
                </div>

                <div className="mb-4">
                    {getSortedCategoryEntries(sortedMenus).map(([cat, menus]) => (
                        <div key={cat} className="mb-2">
                            <h4 className="font-bold mt-2 text-red-600">{cat}</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {menus.map((menu) => (
                                    <button
                                        key={menu.id}
                                        onClick={() => handleAddItem(menu)}
                                        className="border rounded px-2 py-1 hover:bg-gray-100 text-left"
                                    >
                                        {menu.name} ({menu.price}฿)
                                    </button>
                                ))}
                            </div>
                        </div>
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
