import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const AddOrderModalCashier = ({ token, onClose, onOrderAdded }) => {
    const [menus, setMenus] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedTableNumber, setSelectedTableNumber] = useState("");
    const [activeCat, setActiveCat] = useState("ทั้งหมด");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await axiosInstance.get("/cashier/menu");
                setMenus(res.data.menus || []);
            } catch (err) {
                console.error("ดึงเมนูล้มเหลว", err);
            }
        };
        fetchMenus();
    }, []);

    const getCat = (m) =>
        (m?.category && typeof m.category === "object" && m.category.name) ||
        (typeof m?.category === "string" && m.category) ||
        m?.categoryName ||
        "อื่นๆ";

    const grouped = useMemo(() => {
        const g = {};
        menus.forEach((m) => {
            const c = getCat(m);
            if (!g[c]) g[c] = [];
            g[c].push(m);
        });
        return g;
    }, [menus]);

    const categories = useMemo(
        () => ["ทั้งหมด", ...Object.keys(grouped)],
        [grouped]
    );

    const visibleMenus = useMemo(() => {
        let list = activeCat === "ทั้งหมด" ? menus : grouped[activeCat] || [];
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (m) =>
                    m.name?.toLowerCase().includes(q) ||
                    String(m.price ?? "").includes(q)
            );
        }
        return list;
    }, [menus, grouped, activeCat, search]);

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

    const total = selectedItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * item.qty,
        0
    );

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
                    quantity: item.qty,
                })),
            };

            await axiosInstance.post("/cashier/orders", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("เพิ่มออเดอร์สำเร็จ");
            setSelectedItems([]);
            setSelectedTableNumber("");
            onOrderAdded && onOrderAdded();
            onClose && onClose();
        } catch (err) {
            console.error("เพิ่มออเดอร์ไม่สำเร็จ", err);
            toast.error("ไม่สามารถเพิ่มออเดอร์ได้");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            {/* กล่องโมดัล = คอลัมน์ + จำกัดความสูง + ตัดสกรอลล์จากภายนอก */}
            <div className="bg-white rounded-xl w-[min(100%,950px)] max-h-[90vh] shadow-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-bold">เพิ่มออเดอร์ (แคชเชียร์)</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-xl"
                        aria-label="close"
                    >
                        ×
                    </button>
                </div>

                {/* Body = พื้นที่สกรอลล์ได้ */}
                <div className="p-6 grid md:grid-cols-2 gap-6 overflow-y-auto">
                    {/* ซ้าย: โต๊ะ + หมวด + ค้นหา + รายการเมนู (สกรอลล์ภายในได้อีกชั้น) */}
                    <div className="flex flex-col">
                        {/* โต๊ะ */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-1">หมายเลขโต๊ะ:</label>
                            <input
                                type="number"
                                value={selectedTableNumber}
                                onChange={(e) => setSelectedTableNumber(e.target.value)}
                                className="border p-2 rounded w-full"
                                placeholder="เช่น 1, 2, 10"
                            />
                        </div>

                        {/* หมวด (เลื่อนซ้าย-ขวา) + ค้นหา */}
                        <div className="sticky top-0 bg-white pb-2 z-10">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setActiveCat(c)}
                                        className={`whitespace-nowrap px-3 py-1 rounded-full border text-sm ${activeCat === c
                                                ? "bg-black text-white border-black"
                                                : "bg-white hover:bg-gray-100"
                                            }`}
                                    >
                                        {c}
                                        {c !== "ทั้งหมด" && (
                                            <span className="ml-1 text-xs text-gray-500">
                                                ({grouped[c]?.length || 0})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-3">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="ค้นหาเมนูหรือราคา…"
                                />
                            </div>
                        </div>

                        {/* รายการเมนู (สกรอลล์แนวตั้ง) */}
                        <div className="mt-4 flex-1 overflow-y-auto pr-1">
                            {visibleMenus.length === 0 ? (
                                <p className="text-gray-500 text-sm">ไม่พบเมนู</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {visibleMenus.map((menu) => (
                                        <button
                                            key={menu.id}
                                            onClick={() => addItem(menu)}
                                            className="border rounded-lg p-3 text-left hover:bg-gray-50"
                                        >
                                            <div className="font-medium">{menu.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {getCat(menu)}
                                            </div>
                                            <div className="mt-1 text-sm">{menu.price}฿</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ขวา: ตะกร้า (สกรอลล์ได้) */}
                    <div className="flex flex-col">
                        <h3 className="font-semibold mb-2">
                            เมนูที่เลือก{" "}
                            <span className="text-gray-500 text-sm">
                                ({selectedItems.length} รายการ)
                            </span>
                        </h3>

                        <div className="flex-1 overflow-y-auto border rounded p-3 space-y-2">
                            {selectedItems.length === 0 && (
                                <p className="text-gray-500 text-sm">ยังไม่มีเมนูที่เลือก</p>
                            )}
                            {selectedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2"
                                >
                                    <div className="truncate">
                                        <div className="font-medium truncate">{item.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {getCat(item)} · {item.price}฿
                                        </div>
                                    </div>

                                    <input
                                        type="number"
                                        min={1}
                                        value={item.qty}
                                        onChange={(e) => updateQty(item.id, e.target.value)}
                                        className="border w-16 text-center rounded px-2 py-1"
                                    />

                                    <div className="w-20 text-right font-medium">
                                        {(Number(item.price) || 0) * item.qty}฿
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 text-sm"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer ติดล่างตลอด (ไม่เลื่อนหนี) */}
                <div className="px-6 py-3 border-t bg-white sticky bottom-0">
                    <div className="flex items-center justify-between">
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
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOrderModalCashier;
