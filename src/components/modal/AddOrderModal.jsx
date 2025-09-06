import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

/** แมป id -> ชื่อหมวด (แก้/เพิ่มได้ตามระบบคุณ) */
const CATEGORY_LABELS = {
    30001: "ชุดหมูกระทะ",
    60001: "ชุดผัก",
    60002: "เมนูอาหาร",
    60003: "เครื่องดื่ม",
    60004: "เบียร์สด",
};

/** ---------- normalize เมนูให้มี id/name/price/categoryId/categoryName ---------- */
const normalizeMenu = (m) => {
    const categoryObj =
        m?.category && typeof m.category === "object" ? m.category : null;

    const categoryId =
        (categoryObj && (categoryObj.id ?? categoryObj.categoryId)) ??
        m?.categoryId ??
        m?.category_id ??
        (typeof m?.category === "number" ? m.category : null) ??
        null;

    const categoryName =
        (categoryObj &&
            (categoryObj.name ||
                categoryObj.title ||
                categoryObj.label ||
                categoryObj.nameTH ||
                categoryObj.name_th)) ||
        m?.categoryName ||
        m?.category_name ||
        m?.categoryTitle ||
        (typeof m?.category === "string" ? m.category : null) ||
        (categoryId != null ? CATEGORY_LABELS[Number(categoryId)] : null) ||
        null;

    return {
        id: m.id ?? m.menuId ?? m.itemId ?? m._id,
        name: m.name ?? m.menuName ?? m.title ?? m.itemName,
        price: Number(m.price ?? m.sellPrice ?? m.unitPrice ?? 0),
        categoryId,
        categoryName,
        _raw: m,
    };
};

const AddOrderModal = ({ token, onClose, onSuccess }) => {
    const [menus, setMenus] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedTableNumber, setSelectedTableNumber] = useState("");

    const [activeCat, setActiveCat] = useState("ทั้งหมด");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await axiosInstance.get("/admin/menu", {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                const raw = res.data?.menus ?? res.data?.data ?? res.data ?? [];
                const normalized = (Array.isArray(raw) ? raw : []).map(normalizeMenu)
                    // กรองตัวที่ไม่มี id หรือ name ออก
                    .filter((x) => x.id != null && x.name);
                setMenus(normalized);
            } catch (err) {
                console.error("ดึงเมนูล้มเหลว", err);
                toast.error("ดึงเมนูล้มเหลว");
                setMenus([]);
            }
        };
        fetchMenus();
    }, [token]);

    /** utils ดึงหมวดจากเมนูที่ถูก normalize แล้ว */
    const getCatId = (m) => m.categoryId ?? null;
    const getCatName = (m) =>
        m.categoryName ??
        (m.categoryId != null ? CATEGORY_LABELS[Number(m.categoryId)] : "อื่นๆ") ??
        "อื่นๆ";

    /** กลุ่มตามหมวด */
    const groupsObj = useMemo(() => {
        const g = {};
        for (const m of menus) {
            const id = getCatId(m);
            const name = getCatName(m);
            const key = `${id ?? "x"}|${name}`;
            if (!g[key]) g[key] = { key, id, name, items: [] };
            g[key].items.push(m);
        }
        return g;
    }, [menus]);

    /** เรียงลำดับหมวด */
    const preferredOrder = ["ชุดหมูกระทะ", "ชุดผัก", "เมนูอาหาร", "เครื่องดื่ม", "เบียร์สด"];
    const orderedCats = useMemo(() => {
        const arr = Object.values(groupsObj);
        const hasId = arr.every((c) => c.id != null);
        if (hasId) return arr.sort((a, b) => Number(a.id) - Number(b.id));
        const rank = (name) => {
            const i = preferredOrder.indexOf(name);
            return i === -1 ? 999 : i;
        };
        return arr.sort((a, b) => {
            const ra = rank(a.name);
            const rb = rank(b.name);
            if (ra !== rb) return ra - rb;
            return a.name.localeCompare(b.name, "th");
        });
    }, [groupsObj]);

    const categories = useMemo(
        () => ["ทั้งหมด", ...orderedCats.map((c) => c.name)],
        [orderedCats]
    );

    /** ค้นหา */
    const filterBySearch = (list) => {
        if (!search.trim()) return list;
        const q = search.trim().toLowerCase();
        return list.filter(
            (m) =>
                m.name?.toLowerCase().includes(q) ||
                String(m.price ?? "").includes(q)
        );
    };

    /** ตะกร้า */
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

    /** บันทึก (admin: /admin/orders + payload เดิมของคุณ) */
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
                    id: item.id,
                    qty: item.qty,
                })),
                method: "CASH",
                status: "ยังไม่ชำระเงิน",
                slipUrl: null,
            };

            await axiosInstance.post("/admin/orders", payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            toast.success("เพิ่มออเดอร์สำเร็จ");
            setSelectedItems([]);
            setSelectedTableNumber("");
            onSuccess && onSuccess();
            onClose && onClose();
        } catch (err) {
            console.error("เพิ่มออเดอร์ไม่สำเร็จ", err);
            toast.error("ไม่สามารถเพิ่มออเดอร์ได้");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[min(100%,950px)] max-h-[90vh] shadow-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-bold">เพิ่มออเดอร์ (แอดมิน)</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-xl"
                        aria-label="close"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 grid md:grid-cols-2 gap-6 overflow-y-auto">
                    {/* LEFT */}
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

                        {/* Tabs + Search */}
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

                        {/* แสดงรายการ */}
                        <div className="mt-4 flex-1 overflow-y-auto pr-1">
                            {menus.length === 0 ? (
                                <p className="text-gray-500 text-sm">ไม่มีเมนู</p>
                            ) : activeCat === "ทั้งหมด" ? (
                                orderedCats.length === 0 ? (
                                    // fallback: ถ้ายังจัดหมวดไม่ได้ ให้แสดงแบบแบน
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {filterBySearch(menus).map((menu) => (
                                            <button
                                                key={menu.id}
                                                onClick={() => addItem(menu)}
                                                className="border rounded-lg p-3 text-left hover:bg-gray-50"
                                            >
                                                <div className="font-medium">{menu.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {getCatName(menu)}
                                                </div>
                                                <div className="mt-1 text-sm">{menu.price}฿</div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    orderedCats.map((cat) => {
                                        const list = filterBySearch(cat.items);
                                        if (list.length === 0) return null;
                                        return (
                                            <div key={cat.key} className="mb-5">
                                                <div className="sticky top-0 bg-white py-1">
                                                    <h4 className="text-sm font-bold">{cat.name}</h4>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {list.map((menu) => (
                                                        <button
                                                            key={menu.id}
                                                            onClick={() => addItem(menu)}
                                                            className="border rounded-lg p-3 text-left hover:bg-gray-50"
                                                        >
                                                            <div className="font-medium">{menu.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {cat.name}
                                                            </div>
                                                            <div className="mt-1 text-sm">{menu.price}฿</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                            ) : (
                                (() => {
                                    const cat = orderedCats.find((c) => c.name === activeCat);
                                    const list = filterBySearch(cat?.items || []);
                                    if (!cat || list.length === 0)
                                        return <p className="text-gray-500 text-sm">ไม่พบเมนู</p>;
                                    return (
                                        <div className="mb-5">
                                            <div className="sticky top-0 bg-white py-1">
                                                <h4 className="text-sm font-bold">{cat.name}</h4>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {list.map((menu) => (
                                                    <button
                                                        key={menu.id}
                                                        onClick={() => addItem(menu)}
                                                        className="border rounded-lg p-3 text-left hover:bg-gray-50"
                                                    >
                                                        <div className="font-medium">{menu.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {cat.name}
                                                        </div>
                                                        <div className="mt-1 text-sm">{menu.price}฿</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </div>

                    {/* RIGHT (Cart) */}
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
                                            {getCatName(item)} · {item.price}฿
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

                {/* Footer sticky ล่างเสมอ */}
                <div className="px-6 py-3 border-t bg-white sticky bottom-0">
                    <div className="flex items-center justify-between">
                        <span className="font-bold">ยอดรวม: {total} ฿</span>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
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

export default AddOrderModal;
