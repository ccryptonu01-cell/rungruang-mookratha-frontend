import React, { useState } from "react";
import { Link } from "react-router-dom";

const ManualPage = () => {
    const [tab, setTab] = useState("guest");

    const isActive = (key) =>
        key === tab ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700";

    return (
        <div className="min-h-screen bg-white text-black p-6 font-prompt">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-red-600">คู่มือการใช้งาน</h1>

                {/* 🔺 แถบเมนู Tab */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setTab("guest")}
                        className={`px-4 py-2 rounded-md font-medium transition ${isActive("guest")}`}
                    >
                        👤 ผู้ใช้ทั่วไป (ไม่สมัครสมาชิก)
                    </button>
                    <button
                        onClick={() => setTab("user")}
                        className={`px-4 py-2 rounded-md font-medium transition ${isActive("user")}`}
                    >
                        🧑‍💻 ผู้ใช้แบบสมัครสมาชิก
                    </button>
                    <button
                        onClick={() => setTab("proof")}
                        className={`px-4 py-2 rounded-md font-medium transition ${isActive("proof")}`}
                    >
                        📄 การแจ้งหลักฐานการจองที่ร้าน
                    </button>
                </div>

                {/* 🔺 เนื้อหาแต่ละแท็บ */}
                {tab === "guest" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-red-600">สำหรับผู้ใช้ทั่วไป</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>เลือกวันที่และเวลาที่ต้องการจองโต๊ะ</li>
                            <li>กรอกข้อมูลเบื้องต้น (ชื่อ, เบอร์โทร)</li>
                            <li>ยืนยันการจอง</li>
                            <li>ไปที่หน้ารายการจองของฉัน กรอกข้อมูลเบื้องต้น และ แคปภาพข้อมูลการจองของท่าน</li>
                            <li>แสดงหลักฐานการจองเมื่อมาถึงร้าน</li>
                        </ol>
                    </div>
                )}

                {tab === "user" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-green-600">สำหรับผู้ใช้แบบสมัครสมาชิก</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>เข้าสู่ระบบด้วยบัญชีที่ลงทะเบียนไว้</li>
                            <li>เลือกโต๊ะ, เวลาที่ต้องการ และสามารถสั่งอาหารล่วงหน้าได้</li>
                            <li>ชำระเงินผ่านระบบ (PromptPay, QR) หากชำระผ่านช่องทางเงินสดกรุณาชำระเงินที่หน้าเคาท์เตอร์</li>
                            <li>ตรวจสอบประวัติการจอง และ การชำระเงินได้ทุกเวลาที่หน้ารายละเอียดออเดอร์</li>
                            <li>แสดงหลักฐานที่ร้านเพื่อยืนยันการจอง</li>
                        </ol>
                    </div>
                )}

                {tab === "proof" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-blue-600">การแจ้งหลักฐานการจองที่ร้าน</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>เมื่อทำการจองสำเร็จแล้ว ให้เก็บหน้าจอยืนยันไว้</li>
                            <li>หากชำระเงินแล้ว ให้เก็บสลิป หรือหน้าหลักฐานการโอนเงิน</li>
                            <li>เมื่อมาถึงร้าน ให้แสดงหน้าจอการจองหรือสลิปกับพนักงาน</li>
                            <li>พนักงานจะตรวจสอบข้อมูล และพาไปยังโต๊ะที่จองไว้</li>
                            <li>หากไม่มีหลักฐานการจอง อาจต้องรอคิวตามลำดับ</li>
                        </ol>
                    </div>
                )}

                {/* 🔺 ปุ่มกลับ */}
                <div className="border-t pt-4">
                    <Link
                        to="/"
                        className="inline-block mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        ← กลับหน้าแรก
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ManualPage;
