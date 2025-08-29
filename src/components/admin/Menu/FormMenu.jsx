import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import useEcomStore from "../../../store/ecom-store";
import { Plus, XCircle } from "lucide-react";
import { toast } from "react-toastify";

const FormMenu = ({ onAddSuccess }) => {
    const { token, hasHydrated } = useEcomStore();
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (!hasHydrated) return;

        if (!token) {
            console.warn("❌ ยังไม่มี token ห้ามเรียก API");
            return;
        }

        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get("/admin/category", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCategories(res.data.categories);
            } catch (err) {
                console.error("โหลดหมวดหมู่ล้มเหลว", err);
            }
        };

        fetchCategories();
    }, [hasHydrated, token]); 

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !price || !image || !categoryId) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงหมวดหมู่");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("image", image);
        formData.append("categoryId", parseInt(categoryId)); // ✅ ตรงนี้สำคัญมาก

        try {
            await axiosInstance.post("/admin/menu", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("เพิ่มเมนูสำเร็จ");
            setName("");
            setPrice("");
            setDescription("");
            setCategoryId("");
            clearImage();
            if (onAddSuccess) onAddSuccess();
        } catch (err) {
            console.error(err);
            toast.error("เกิดข้อผิดพลาดในการเพิ่มเมนู");
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md font-sans">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Plus className="w-5 h-5" /> เพิ่มเมนูอาหาร
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block mb-1 font-medium text-base text-gray-700">ชื่อเมนู</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-base text-gray-700">ราคา (บาท)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-base text-gray-700">รายละเอียดเมนู</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="ใส่รายละเอียดเมนู เช่น วัตถุดิบ พิเศษ ฯลฯ"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-base text-gray-700">หมวดหมู่</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-medium text-base text-gray-700">เลือกรูปภาพ</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border p-2 rounded focus:outline-none"
                    />

                    {preview && (
                        <div className="mt-4 relative w-64 h-64 rounded overflow-hidden border">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-1"
                            >
                                <XCircle className="w-5 h-5 text-red-500" />
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition duration-200 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    เพิ่มเมนู
                </button>
            </form>
        </div>
    );
};

export default FormMenu;
