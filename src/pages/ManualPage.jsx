// src/pages/ManualPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const ManualPage = () => {
  return (
    <div className="min-h-screen bg-white text-black p-6 font-prompt">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-red-600">คู่มือการใช้งาน</h1>

        <p>
          ยินดีต้อนรับสู่ระบบจองโต๊ะและสั่งอาหารร้านหมูกระทะ!
          คู่มือนี้จะช่วยให้คุณใช้งานระบบได้อย่างง่ายดาย
        </p>

        <ol className="list-decimal list-inside space-y-2">
          <li>🔑 สมัครสมาชิกหรือเข้าสู่ระบบ</li>
          <li>📅 จองโต๊ะในวันและเวลาที่ต้องการ</li>
          <li>📲 เลือกเมนูอาหารและเพิ่มลงในตะกร้า(สำหรับสมาชิก)</li>
          <li>💳 การชำระเงิน</li>
          <li>📄 ตรวจสอบสถานะการจองและประวัติ</li>
          <li>📄 การแจ้งข้อมูลการจองที่ร้าน</li>
        </ol>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            หากพบปัญหาการใช้งาน กรุณาติดต่อผู้ดูแลระบบ
          </p>
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
