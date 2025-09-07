import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const EditOrderModal = ({ order, token, onClose }) => {
    const [menuList, setMenuList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isMenuLoaded, setIsMenuLoaded] = useState(false);

    if (!order || !order.orderItems) return null;

    // โหลดเมนู
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await axiosInstance.get("/admin/menu");
                setMenuList(res.data.menus || []);
                setIsMenuLoaded(true);
            } catch (err) {
                console.error("โหลดเมนูล้มเหลว", err);
            }
        };
        fetchMenus();
    }, []);

    // 2. รอ menuList และ order พร้อมแล้ว ค่อย map
    useEffect(() => {
        if (!menuList.length || !order?.orderItems?.length) return;

        const initial = order.orderItems
            .map(item => {
                const menuId = Number(item.menuId || item.menu?.id);
                if (!menuId) return null;

                const existingMenu = menuList.find(m => m.id === menuId);
                if (!existingMenu) return null; //

                return {
                    menuId,
                    qty: Number(item.qty || 1),
                    price: Number(existingMenu.price || 0),
                    name: existingMenu.name,
                };
            })
            .filter(Boolean);

        setSelectedItems(initial);
    }, [menuList, order]);

    // แก้จำนวน
    const handleQtyChange = (menuId, qty) => {
        const num = parseInt(qty);
        setSelectedItems(prev =>
            prev.map(item =>
                item.menuId === menuId ? { ...item, qty: isNaN(num) || num < 1 ? 1 : num } : item
            )
        );
    };

    // เพิ่มเมนูใหม่
    const handleAddItem = (menu) => {
        if (selectedItems.some(item => item.menuId === menu.id)) return;
        setSelectedItems([...selectedItems, {
            menuId: menu.id,
            qty: 1,
            price: Number(menu.price || 0),
            name: menu.name
        }]);
    };

    // ลบเมนู
    const handleRemoveItem = (menuId) => {
        setSelectedItems(prev => prev.filter(item => item.menuId !== menuId));
    };

    // คำนวณยอดรวม
    const total = selectedItems.reduce((sum, item) =>
        sum + ((item.qty && item.price) ? item.qty * item.price : 0), 0);

    // บันทึก
    const handleSave = async () => {
        const valid = selectedItems.every(item =>
            Number.isInteger(item.menuId) &&
            item.menuId > 0 &&
            item.qty &&
            !isNaN(item.qty) &&
            !isNaN(item.price)
        );

        if (!valid) {
            alert("มีรายการที่ไม่สมบูรณ์ กรุณาตรวจสอบเมนูอีกครั้ง");
            return;
        }

        try {
            const payload = {
                orderItems: selectedItems.map(item => ({
                    menuId: Number(item.menuId),
                    qty: Number(item.qty),
                    price: Number(item.price || 0)
                })),
                totalPrice: Number(total)
            };

            await axiosInstance.put(`/admin/orders/detail/${order.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onClose();
        } catch (err) {
            console.error("❌ อัปเดตเมนูล้มเหลว:", err);
            alert("บันทึกล้มเหลว กรุณาลองใหม่");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto font-prompt">
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
                    {selectedItems.length === 0 ? (
                        <p className="text-gray-500">ยังไม่มีเมนูที่เลือก</p>
                    ) : (
                        selectedItems.map(item => (
                            <div key={item.menuId} className="flex items-center justify-between border-b py-1">
                                <span className="w-1/3 truncate">{item.name}</span>
                                <input
                                    type="number"
                                    min={1}
                                    className="border p-1 w-16 text-right"
                                    value={item.qty}
                                    onChange={e => handleQtyChange(item.menuId, e.target.value)}
                                />
                                <span className="w-1/4 text-right">
                                    {isNaN(item.qty * item.price) ? "-" : item.qty * item.price}฿
                                </span>
                                <button
                                    onClick={() => handleRemoveItem(item.menuId)}
                                    className="text-red-500 ml-2"
                                >ลบ</button>
                            </div>
                        ))
                    )}
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
