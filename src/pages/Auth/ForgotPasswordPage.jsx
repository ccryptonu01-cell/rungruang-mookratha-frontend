import React, { useState } from "react";
import axios from "../utils/axiosInstance";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleSendResetLink = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await axios.post("/auth/forgot-password", {
                email,
            });
            setMessage(res.data.message);
            setShowModal(true);
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
        }
    };

    return (
        <div className="text-black max-w-md mx-auto mt-20 p-6 bg-white rounded shadow font-prompt">
            <h2 className="text-2xl font-bold mb-4">ลืมรหัสผ่านใช่ไหม?</h2>
            <form onSubmit={handleSendResetLink}>
                <label className="block mb-2 font-semibold">กรุณากรอกอีเมลของคุณ</label>
                <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border rounded mb-4"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                    ส่งลิงก์รีเซ็ตรหัสผ่าน
                </button>
            </form>

            {message && <p className="text-green-600 mt-4">{message}</p>}
            {error && <p className="text-red-600 mt-4">{error}</p>}

            {/* Modal แสดงเมื่อ showModal = true */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md text-center min-w-[380px]">
                        <h2 className="text-xl font-bold mb-4 text-green-600">
                            ✅ ส่งอีเมลสำเร็จ
                        </h2>
                        <p className="whitespace-nowrap">
                            กรุณาตรวจสอบกล่องอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน
                        </p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordPage;
