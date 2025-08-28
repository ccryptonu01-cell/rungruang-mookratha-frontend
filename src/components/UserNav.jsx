import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { ArrowLeft } from "lucide-react";
import useEcomStore from "../store/ecom-store";

function UserNav({ onlyBack = false, backPath = "/user" }) {
  const navigate = useNavigate();
  const actionLogout = useEcomStore((s) => s.actionLogout);

  const handleLogout = () => {
    actionLogout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 h-20 shadow-lg flex items-center justify-between px-6 relative z-40">

      {/* ✅ ปุ่มย้อนกลับ (ซ่อนถ้า onlyBack = false) */}
      {onlyBack && (
        <button
          onClick={() => {
            if (window.location.pathname === "/user/paymentPage") {
              navigate("/user/order-food");
            } else {
              navigate(backPath);
            }
          }}
          className="flex items-center gap-2 text-white font-semibold hover:text-yellow-200 transition font-prompt"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden sm:inline">ย้อนกลับ</span>
        </button>
      )}

      {/* ✅ โลโก้ตรงกลาง */}
      <div className="h-16 w-16 absolute left-1/2 transform -translate-x-1/2 top-2 flex items-center justify-center bg-white rounded-full shadow-md border-4 border-yellow-400">
        <img
          src={logo}
          alt="Logo"
          className="h-full w-full object-contain rounded-full"
        />
      </div>

      {/* ✅ ปุ่มออกจากระบบ (เฉพาะเมื่อ onlyBack = false) */}
      {!onlyBack && (
        <div className="ml-auto">
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200 font-prompt"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </nav>
  );
}

export default UserNav;
