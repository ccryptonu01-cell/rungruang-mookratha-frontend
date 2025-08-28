import React from "react";
import { ShoppingCart } from 'lucide-react';
import useCartStore from "../../store/cart-store";
import { toast } from "react-toastify";

const ProductCard = ({ menu, highlighted, showCartButton = false }) => {
    const descriptionList = menu.description?.split("\n") || [];
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAddToCart = () => {
        if (menu.status === "หมดแล้ว") {
            toast.warning("สินค้านี้หมดแล้ว");
            return;
        }

        addToCart(menu);
        toast.success(`เพิ่ม "${menu.name}" เข้าตะกร้าแล้ว`);
    };

    return (
        <div
            id={`menu-${menu.id}`}
            className={`border rounded-md shadow-md p-3 text-black bg-white transition duration-300 ${highlighted ? "ring-2 ring-yellow-400 scale-105" : ""
                }`}
        >
            {/* Image */}
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                {menu.image ? (
                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}
            </div>

            {/* Status & Name */}
            <div className="py-2">
                <p
                    className={`text-center text-md font-bold ${menu.status === "หมดแล้ว" ? "text-red-600" : "text-green-500"
                        }`}
                >
                    {menu.status || "ไม่มีข้อมูล"}
                </p>
                <p className="text-lg font-semibold text-center">{menu.name}</p>
                <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-1 justify-center">
                    {descriptionList.map((desc, i) => (
                        <span key={i}>{desc}</span>
                    ))}
                </div>
            </div>

            {/* Price + Cart Button */}
            <div className="flex justify-between items-center mt-2">
                <span className="text-base font-bold text-red-600">{menu.price} บาท</span>

                {showCartButton && (
                    <button
                        onClick={handleAddToCart}
                        className={`p-2 rounded-md shadow-md ${menu.status === "หมดแล้ว"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                            }`}
                        disabled={menu.status === "หมดแล้ว"}
                    >
                        <ShoppingCart className="text-white w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
