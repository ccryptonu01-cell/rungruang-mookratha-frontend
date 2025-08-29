import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!token) {
            setError("ไม่พบโทเค็น");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
            return;
        }

        try {
            const res = await axios.post(
                "/auth/reset-password",
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(res.data.message);
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                navigate("/login");
            }, 2500);
        } catch (err) {
            const msg = err.response?.data?.message || "เกิดข้อผิดพลาด โปรดลองอีกครั้ง";
            setError(msg);
        }
    };

    return (
        <div className="text-black max-w-md mx-auto mt-20 p-6 bg-white rounded shadow font-prompt">
            <h2 className="text-2xl font-bold mb-4">รีเซ็ตรหัสผ่านใหม่</h2>
            <form onSubmit={handleReset}>
                <label className="block mb-2 font-semibold">รหัสผ่านใหม่</label>
                <input
                    type="password"
                    required
                    className="w-full px-4 py-2 border rounded mb-4"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <label className="block mb-2 font-semibold">ยืนยันรหัสผ่าน</label>
                <input
                    type="password"
                    required
                    className="w-full px-4 py-2 border rounded mb-4"
                    placeholder="กรอกซ้ำรหัสผ่าน"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                    ยืนยันรีเซ็ตรหัสผ่าน
                </button>
            </form>
            {message && <p className="text-green-600 mt-4">{message}</p>}
            {error && <p className="text-red-600 mt-4">{error}</p>}

            {/* Modal แสดงเมื่อรีเซ็ตสำเร็จ */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md text-center min-w-[380px]">
                        <h2 className="text-xl font-bold mb-4 text-green-600">
                            ✅ รีเซ็ตรหัสผ่านสำเร็จ
                        </h2>
                        <p className="whitespace-nowrap">
                            คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
                        </p>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                navigate("/login");
                            }}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            ไปหน้าเข้าสู่ระบบ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResetPasswordPage;
