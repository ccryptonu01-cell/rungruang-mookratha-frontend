import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import useCartStore from "../../store/cart-store";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
    const [method, setMethod] = useState("PROMPTPAY");
    const [proofImage, setProofImage] = useState(null);
    const [proofImageFile, setProofImageFile] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [showCashModal, setShowCashModal] = useState(false);

    const cartItems = useCartStore((state) => state.cartItems);
    const tableNumber = useCartStore((state) => state.tableNumber);
    const clearCart = useCartStore((state) => state.clearCart);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "receipts");
        formData.append("cloud_name", "dybgekx5y");

        const res = await fetch("https://api.cloudinary.com/v1_1/dybgekx5y/image/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.secure_url;
    };

    useEffect(() => {
        if (method === "QR" && !isSubmitting) {

            if (!total || isNaN(total) || total <= 0) {
                return;
            }

            axios
                .post("http://localhost:5000/api/payment/qr", { amount: total })
                .then((res) => setQrData(res.data))
                .catch((err) => {
                    console.error("QR Error:", err);
                    toast.error("สร้าง QR Code ไม่สำเร็จ");
                });
        }
    }, [method, total, isSubmitting]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofImage(URL.createObjectURL(file));
            setProofImageFile(file);
        }
    };

    const submitOrder = async (status, slipUrl = null) => {
        const token = localStorage.getItem("token");

        const payload = {
            tableNumber,
            items: cartItems,
            total,
            method,
            status,
            slipUrl,
        };

        try {
            await axios.post("http://localhost:5000/api/orders", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("ยืนยันออเดอร์เรียบร้อยแล้ว");
            clearCart();
            navigate("/user");

        } catch (err) {
            console.error("ส่งออเดอร์ล้มเหลว", err);
            toast.error("ส่งออเดอร์ไม่สำเร็จ");
        }
    };

    const handleSubmit = async () => {
        if ((method === "PROMPTPAY" || method === "QR") && !proofImageFile) {
            toast.error("กรุณาแนบสลิปก่อนยืนยันออเดอร์");
            return;
        }

        if (method === "CASH") {
            setShowCashModal(true);
            return;
        }

        try {
            setIsSubmitting(true);
            toast.info("กำลังอัปโหลดสลิป...");
            const slipUrl = await uploadToCloudinary(proofImageFile);
            await submitOrder("ชำระเงินแล้ว", slipUrl);
        } catch (err) {
            console.error("อัปโหลดสลิปผิดพลาด", err);
            toast.error("อัปโหลดสลิปไม่สำเร็จ");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="relative max-w-2xl mx-auto bg-white p-6 rounded shadow text-black font-prompt">
            <h1 className="text-xl font-bold mb-4 text-center">เลือกช่องทางชำระเงิน</h1>

            <div className="flex justify-center gap-4 mb-6">
                {["PROMPTPAY", "QR", "CASH"].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`px-4 py-2 rounded font-medium ${method === m ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                        {m === "PROMPTPAY" && "พร้อมเพย์"}
                        {m === "QR" && "แสกน QR Code"}
                        {m === "CASH" && "เงินสด"}
                    </button>
                ))}
            </div>

            {method === "PROMPTPAY" && (
                <div className="bg-blue-50 border border-blue-300 p-4 rounded mb-4 text-center">
                    <p className="text-blue-700 font-semibold">ชำระผ่านเบอร์: 095-664-8993</p>
                    <p className="text-blue-700">ชื่อบัญชี: นายกิตติพัฒน์ ขันธุลา</p>
                </div>
            )}

            {method === "QR" && qrData?.qrCode && (
                <div className="text-center mb-4">
                    <p className="mb-2 font-semibold">สแกน QR ด้านล่างเพื่อชำระเงิน</p>
                    <img src={qrData.qrCode} alt="QR Payment" className="mx-auto max-h-60" />
                    <a href={qrData.qrCode} download="promptpay-qr.png" className="text-blue-600 underline mt-2 inline-block">
                        ดาวน์โหลด QR Code
                    </a>
                </div>
            )}

            <div className="mb-6 border-t pt-4">
                <h2 className="text-lg font-semibold mb-2">รายการอาหาร</h2>
                {tableNumber && <p className="text-lg font-semibold mb-2">โต๊ะ: {tableNumber}</p>}
                {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center">ไม่มีรายการอาหาร</p>
                ) : (
                    <>
                        <ul className="space-y-2">
                            {cartItems.map((item) => (
                                <li key={item.id} className="flex justify-between">
                                    <span>
                                        {item.name} x {item.qty}
                                    </span>
                                    <span>{item.qty * item.price} บาท</span>
                                </li>
                            ))}
                        </ul>
                        <div className="text-right mt-4 font-bold">รวมทั้งหมด: {total} บาท</div>
                    </>
                )}
            </div>

            {(method === "PROMPTPAY" || method === "QR") && (
                <div className="mb-6">
                    <label className="block mb-2 font-medium">กรุณาอัปโหลดสลิปโอนเงินของท่าน</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {proofImage && <img src={proofImage} alt="proof" className="mt-4 max-h-56 mx-auto" />}
                </div>
            )}

            {method === "CASH" && (
                <div className="text-center text-red-600 font-semibold mb-4">
                    *** กรุณาเช็คบิลที่หน้าเคาท์เตอร์ ***
                </div>
            )}

            <div className="text-center">
                <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded text-lg">
                    ยืนยันออเดอร์
                </button>
            </div>

            {/* ✅ Modal สำหรับเงินสด */}
            {showCashModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
                        <h2 className="text-lg font-semibold text-red-600 mb-4">
                            กรุณาเช็คบิลที่หน้าเคาท์เตอร์ ขอบคุณครับ
                        </h2>
                        <button
                            onClick={async () => {
                                setShowCashModal(false);
                                await submitOrder("ยังไม่ชำระเงิน");
                            }}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
