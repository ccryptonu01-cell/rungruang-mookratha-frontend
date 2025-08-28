import { Link } from "react-router-dom";

const HomeUser = () => {
  const buttons = [
    { label: "จองโต๊ะ", path: "/reservation" },
    { label: "สั่งอาหาร", path: "/user/order-food" },
    { label: "ดูข้อมูลจองโต๊ะ", path: "/user/my-reservations" },
    { label: "ดูข้อมูลออเดอร์", path: "/user/my-orders" },
    { label: "ข้อมูลโปรไฟล์", path: "/user/profile" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 relative z-10 px-4 ">
      {buttons.map((btn, index) => (
        <Link
          key={index}
          to={btn.path}
          className="bg-orange-400 hover:bg-orange-300 transition-all duration-200 text-black font-prompt text-lg sm:text-xl w-72 sm:w-80 py-4 rounded-full shadow-md text-center tracking-wide"
        >
          {btn.label}
        </Link>
      ))}
    </div>
  );
};

export default HomeUser;
