import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";

// หมวดตามหน้าเมนู (ลำดับที่ต้องการ)
const CATEGORY_ORDER = ["ชุดหมูกระทะ", "ชุดผัก", "เมนูอาหาร", "เครื่องดื่ม", "เนื้อสัตว์"];
const CATEGORY_BY_ID = {
    30001: "ชุดหมูกระทะ",
    60001: "ชุดผัก",
    60002: "เมนูอาหาร",
    60003: "เครื่องดื่ม",
    60004: "เนื้อสัตว์",
};

const EditOrderModal = ({ order, token, onClose }) => {
    const [menuList, setMenuList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await axiosInstance.get("/admin/menu");
                setMenuList(res.data.menus || []);
            } catch (err) {
                console.error("โหลดเมนูล้มเหลว", err);
            }
        };

        const initial = (order.orderItems || []).map((item) => ({
            menuId: item.menuId,
            qty: item.qty || 1,
            price: item.price,
            name: item.menu?.name || "",
        }));
        setSelectedItems(initial);
        fetchMenus();
    }, [order]);

    // เลือกชื่อหมวดที่ "ตรงกับหน้าเมนูเท่านั้น" (ไม่แมตช์ = ตัดทิ้ง)
    const resolveCategoryName = (menu) => {
        const direct =
            menu?.category?.name ||
            menu?.categoryName ||
            (typeof menu?.category === "string" ? menu.category : null);
        if (direct && CATEGORY_ORDER.includes(direct)) return direct;

        const idCandidate =
            menu?.categoryId ??
            menu?.category_id ??
            menu?.category?.id ??
            menu?.catId ??
            menu?.cat_id;
        const byId = CATEGORY_BY_ID[Number(idCandidate)];
        if (byId && CATEGORY_ORDER.includes(byId)) return byId;

        return null;
    };

    // จัดกลุ่มตามหน้าเมนู
    const groupedMenus = useMemo(() => {
        const bucket = {};
        for (const m of menuList) {
            const cat = resolveCategoryName(m);
            if (!cat) continue;
            if (!bucket[cat]) bucket[cat] = [];
            bucket[cat].push(m);
        }
        const ordered = {};
        CATEGORY_ORDER.forEach((cat) => {
            if (bucket[cat]?.length) {
                ordered[cat] = bucket[cat]
                    .slice()
                    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "th"));
            }
        });
        return ordered;
    }, [menuList]);

    const handleQtyChange = (menuId, qty) => {
        const num = parseInt(qty);
        setSelectedItems((prev) =>
            prev.map((item) =>
                item.menuId === menuId
                    ? { ...item, qty: isNaN(num) || num < 1 ? 1 : num }
                    : item
            )
        );
    };

    const handleAddItem = (menu) => {
        if (selectedItems.some((item) => item.menuId === menu.id)) return;
        setSelectedItems((prev) => [
            ...prev,
            { menuId: menu.id, qty: 1, price: menu.price, name: menu.name },
        ]);
    };

    const handleRemoveItem = (menuId) => {
        setSelectedItems((prev) => prev.filter((i) => i.menuId !== menuId));
    };

    const total = selectedItems.reduce(
        (sum, item) => sum + (item.qty && item.price ? item.qty * item.price : 0),
        0
    );

    const handleSave = async () => {
        const valid = selectedItems.every((item) => Number.isFinite(+item.qty) && +item.qty >= 1);
        if (!valid) {
            alert("กรุณากรอกจำนวนให้ครบทุกเมนู");
            return;
        }
        try {
            // ส่งเฉพาะเมนู+จำนวน ให้ backend คิดราคาเอง
            const payload = {
                orderItems: selectedItems.map((i) => ({
                    menuId: i.menuId,
                    qty: Number(i.qty),
                })),
            };

            await axiosInstance.put(`/admin/orders/detail/${order.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onClose();
        } catch (err) {
            console.error("อัปเดตเมนูล้มเหลว", {
                status: err?.response?.status,
                data: err?.response?.data,
            });
            alert(`อัปเดตไม่สำเร็จ: ${err?.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">แก้ไขเมนู</h2>

                {/* เมนูทั้งหมด (แยกตามหน้าเมนู) */}
                <div className="mb-4">
                    <h3 className="font-semibold">เมนูทั้งหมด:</h3>
                    {Object.keys(groupedMenus).map((cat) => (
                        <div key={cat} className="mt-3">
                            <div className="text-sm font-semibold text-gray-600 px-1 py-0.5">
                                {cat}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {groupedMenus[cat].map((menu) => (
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
                    {selectedItems.map((item) => (
                        <div
                            key={item.menuId}
                            className="flex items-center justify-between border-b py-1"
                        >
                            <span className="truncate pr-2">{item.name}</span>
                            <input
                                type="number"
                                min={1}
                                className="border p-1 w-16 text-right"
                                value={item.qty}
                                onChange={(e) => handleQtyChange(item.menuId, e.target.value)}
                            />
                            <span>
                                {isNaN(item.qty * item.price) ? "-" : item.qty * item.price}฿
                            </span>
                            <button
                                onClick={() => handleRemoveItem(item.menuId)}
                                className="text-red-500 ml-2"
                            >
                                ลบ
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-right">
                    <strong>ยอดรวม: {isNaN(total) ? "-" : total} ฿</strong>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
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
    );
};

export default EditOrderModal;
