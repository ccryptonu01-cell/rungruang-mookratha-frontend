import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import useEcomStore from "../store/ecom-store";

function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useEcomStore((state) => state.user); // ✅ ตรวจสถานะผู้ใช้

  return (
    <nav className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-md z-40">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-20 relative">

        {/* เมนูสามขีด */}
        <div className="pl-2">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* โลโก้ตรงกลาง */}
        <div className="flex justify-center items-center mb-4 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:top-2 h-20 w-20 mx-auto bg-white rounded-full shadow-md border-4 border-yellow-400 z-20">
          <img
            src={logo}
            alt="Logo"
            className="h-full w-full object-contain rounded-full"
          />
        </div>

        {/* ✅ เฉพาะ Guest เท่านั้นที่เห็นปุ่ม Login / Register */}
        {!user && (
          <div className="absolute right-4 top-4 sm:top-2 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:items-center w-full max-w-xs sm:w-auto z-10">
            <Link
              to="/register"
              className="bg-white text-red-600 hover:bg-red-100 font-bold py-2 px-4 rounded-xl shadow transition duration-150 font-prompt text-sm sm:text-base w-full text-center"
            >
              สมัครสมาชิก
            </Link>
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow transition duration-150 font-prompt text-sm sm:text-base w-full text-center"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        )}
      </div>

      {/* Dropdown Menu (ซ่อนเมื่อ user login แล้ว) */}
      {!user && (
        <div
          className={`absolute top-18 left-0 w-1/2 h-screen bg-black bg-opacity-80 text-white p-4 z-50 transform transition-all duration-500 ease-in-out ${isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
            } origin-top`}
        >
          <h2 className="text-xl font-bold mb-6 text-center tracking-wider border-b border-white pb-2 font-prompt">
            เมนู
          </h2>

          <Link
            to="/"
            className="block py-3 px-4 rounded-md mb-2 hover:bg-white hover:text-red-600 transition font-medium font-prompt"
            onClick={() => setIsOpen(false)}
          >
            🏠 หน้าแรก
          </Link>
          <Link
            to="/menu"
            className="block py-3 px-4 rounded-md mb-2 hover:bg-white hover:text-red-600 transition font-medium font-prompt"
            onClick={() => setIsOpen(false)}
          >
            🍲 เมนูอาหาร
          </Link>
          <Link
            to="/reservation"
            className="block py-3 px-4 rounded-md mb-2 hover:bg-white hover:text-red-600 transition font-medium font-prompt"
            onClick={() => setIsOpen(false)}
          >
            📅 จองโต๊ะ (ไม่สมัครสมาชิก)
          </Link>
          <Link
            to="/guest-my-reserv"
            className="block py-3 px-4 rounded-md mb-2 hover:bg-white hover:text-red-600 transition font-medium font-prompt"
            onClick={() => setIsOpen(false)}
          >
            📋 รายการจองของฉัน
          </Link>
        </div>
      )}
    </nav>
  );
}

export default MainNav;
