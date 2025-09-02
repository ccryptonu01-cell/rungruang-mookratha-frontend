import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import useEcomStore from "../store/ecom-store";

function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useEcomStore((state) => state.user);

  return (
    <nav className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-md z-40 relative">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-0 flex flex-col sm:flex-row justify-between items-center gap-3 sm:h-20">

        {/* เมนูสามขีด (ซ้ายบน) */}
        <div className="sm:pl-2 self-start sm:self-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* โลโก้ตรงกลาง */}
        <div className="h-20 w-20 bg-white rounded-full shadow-md border-4 border-yellow-400 flex items-center justify-center z-20">
          <img
            src={logo}
            alt="Logo"
            className="h-full w-full object-contain rounded-full"
          />
        </div>

        {/* ปุ่ม Login / Register */}
        {!user && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto max-w-xs sm:max-w-none items-center sm:items-center">
            <Link
              to="/register"
              className="bg-white text-red-600 hover:bg-red-100 font-bold py-2 px-4 rounded-xl shadow transition duration-150 font-prompt text-sm sm:text-base w-full sm:w-auto text-center"
            >
              สมัครสมาชิก
            </Link>
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow transition duration-150 font-prompt text-sm sm:text-base w-full sm:w-auto text-center"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        )}
      </div>

      {/* Dropdown Menu (มือถือ) */}
      {!user && (
        <div
          className={`absolute top-20 left-0 w-1/2 h-screen bg-black bg-opacity-80 text-white p-4 z-50 transform transition-all duration-500 ease-in-out ${isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
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
