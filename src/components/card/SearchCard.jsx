import React from "react";
import { ShoppingCart } from "lucide-react";

const ProductCard = ({ menu, highlighted }) => {
    const descriptionList = menu.description?.split("\n") || [];

    return (
        <div
            id={`menu-${menu.id}`}
            className={`border rounded-md shadow-md p-4 text-black bg-white transition-all duration-300 ${highlighted ? "ring-4 ring-yellow-400 scale-105" : ""
                }`}
        >
            {/* รูปภาพ */}
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                {menu.image ? (
                    <img
                        src={menu.image}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}
            </div>

            {/* สถานะ + ชื่อเมนู */}
            <div className="py-2">
                <p
                    className={`text-center text-sm font-semibold ${menu.status === "หมดแล้ว" ? "text-red-600" : "text-green-600"
                        }`}
                >
                    {menu.status || "ไม่มีข้อมูล"}
                </p>
                <p className="text-lg font-bold text-center">{menu.name}</p>

                {/* คำอธิบายแนวนอน */}
                <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2 justify-center">
                    {descriptionList.map((desc, idx) => (
                        <span key={idx}>{desc}</span>
                    ))}
                </div>
            </div>

            {/* ราคา + ปุ่มสั่ง */}
            <div className="flex justify-between items-center mt-3">
                <span className="text-base font-bold text-gray-800">
                    {menu.price} บาท
                </span>
                <button className="bg-green-500 rounded-md p-2 hover:bg-green-600 shadow-md">
                    <ShoppingCart className="text-white w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
