import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { UtensilsCrossed } from "lucide-react";
import useEcomStore from "../../../store/ecom-store";
import { toast } from "react-toastify";

const ListMenu = ({ refreshTrigger }) => {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editMenuId, setEditMenuId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editStatus, setEditStatus] = useState("มีอยู่");
    const [editImage, setEditImage] = useState(null);
    const [editPreview, setEditPreview] = useState(null);
    const [editDescription, setEditDescription] = useState("");
    const { token, hasHydrated } = useEcomStore();

    const fetchMenus = async () => {
        try {
            const res = await axiosInstance.get("/api/menu");
            setMenus(res.data.menus);
        } catch (err) {
            console.error("ดึงข้อมูลเมนูล้มเหลว", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get("/admin/category", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(res.data.categories);
        } catch (err) {
            console.error("ดึงหมวดหมู่ล้มเหลว", err);
        }
    };

    useEffect(() => {
        if (!hasHydrated) return;

        fetchMenus();

        if (!token) {
            console.warn("❌ ไม่มี token ห้ามเรียกหมวดหมู่");
            return;
        }

        fetchCategories();
    }, [refreshTrigger, hasHydrated, token]);

    const handleDelete = async (id) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?")) return;
        try {
            await axiosInstance.delete(`/admin/menu/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("ลบเมนูเรียบร้อยแล้ว");
            setMenus((prev) => prev.filter((m) => m.id !== id));
        } catch (err) {
            console.error("ลบเมนูล้มเหลว", err);
            toast.error("เกิดข้อผิดพลาดในการลบเมนู");
        }
    };

    const startEdit = (menu) => {
        setEditMenuId(menu.id);
        setEditName(menu.name);
        setEditPrice(menu.price);
        setEditStatus(menu.status || "มีอยู่");
        setEditImage(null);
        setEditPreview(null);
        setEditDescription(menu.description || "");
    };

    const cancelEdit = () => {
        setEditMenuId(null);
        setEditName("");
        setEditPrice("");
        setEditStatus("มีอยู่");
        setEditImage(null);
        setEditPreview(null);
        setEditDescription("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditImage(file);
        setEditPreview(URL.createObjectURL(file));
    };

    const saveEdit = async () => {
        try {
            const formData = new FormData();
            formData.append("name", editName);
            formData.append("price", editPrice);
            formData.append("status", editStatus);
            formData.append("description", editDescription);
            if (editImage) formData.append("image", editImage);

            await axiosInstance.put(`/admin/menu/${editMenuId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("แก้ไขเมนูเรียบร้อยแล้ว");
            cancelEdit();
            fetchMenus();
        } catch (err) {
            console.error("แก้ไขเมนูล้มเหลว", err);
            toast.error("เกิดข้อผิดพลาดในการแก้ไขเมนู");
        }
    };

    const filteredMenus = menus.filter((menu) =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedMenus = categories.map(category => ({
        categoryName: category.name,
        items: filteredMenus.filter(menu => menu.categoryId === category.id)
    }));

    return (
        <div className="mt-6 font-sans text-sm text-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <UtensilsCrossed className="w-5 h-5" />
                    รายการเมนูทั้งหมด
                </h2>
                <input
                    type="text"
                    placeholder="ค้นหาเมนู..."
                    className="border px-3 py-2 w-64 rounded text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {groupedMenus.map(group => (
                <div key={group.categoryName} className="mb-6">
                    <h3 className="text-lg font-semibold bg-gray-100 py-2 px-4 rounded text-black">
                        {group.categoryName}
                    </h3>
                    <div className="bg-white shadow rounded-md border mt-2">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left text-base">รูปภาพเมนู</th>
                                    <th className="px-4 py-2 text-left text-base">ชื่อเมนู</th>
                                    <th className="px-4 py-2 text-left text-base">รายละเอียด</th>
                                    <th className="px-4 py-2 text-left text-base">ราคา</th>
                                    <th className="px-4 py-2 text-left text-base">สถานะ</th>
                                    <th className="px-4 py-2 text-right text-base">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.items.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-500 py-4">
                                            ไม่พบข้อมูลเมนู
                                        </td>
                                    </tr>
                                ) : (
                                    group.items.map(menu => (
                                        <tr key={menu.id} className="hover:bg-gray-50 border-t">
                                            <td className="px-4 py-2">
                                                <img
                                                    src={editMenuId === menu.id && editPreview ? editPreview : menu.image}
                                                    alt={menu.name}
                                                    className="w-24 h-24 object-cover rounded shadow"
                                                />
                                                {editMenuId === menu.id && (
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="mt-1 text-xs"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-base font-medium">
                                                {editMenuId === menu.id ? (
                                                    <input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    menu.name
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-base font-medium whitespace-pre-line">
                                                {editMenuId === menu.id ? (
                                                    <textarea
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    menu.description || "-"
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-base font-medium">
                                                {editMenuId === menu.id ? (
                                                    <input
                                                        type="number"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    `${menu.price} บาท`
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-base font-medium">
                                                {editMenuId === menu.id ? (
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    >
                                                        <option value="มีอยู่">มีอยู่</option>
                                                        <option value="หมดแล้ว">หมดแล้ว</option>
                                                    </select>
                                                ) : (
                                                    <span className={menu.status === "หมดแล้ว" ? "text-red-600" : "text-green-600"}>
                                                        {menu.status || "มีอยู่"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right space-x-2">
                                                {editMenuId === menu.id ? (
                                                    <>
                                                        <button
                                                            onClick={saveEdit}
                                                            className="bg-green-500 text-white px-3 py-1 rounded text-base hover:bg-green-600 "
                                                        >
                                                            บันทึก
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="bg-gray-400 text-white px-3 py-1 rounded text-base hover:bg-gray-500"
                                                        >
                                                            ยกเลิก
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(menu)}
                                                            className="bg-blue-500 text-white px-3 py-3 rounded text-base hover:bg-blue-600"
                                                        >
                                                            แก้ไข
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(menu.id)}
                                                            className="bg-red-500 text-white px-3 py-3 rounded text-base hover:bg-red-600"
                                                        >
                                                            ลบ
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListMenu;
