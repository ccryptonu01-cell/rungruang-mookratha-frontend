import React from "react";
import useCartStore from "../../../store/cart-store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const cartItems = useCartStore((s) => s.cartItems);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // ✅ เพิ่มฟังก์ชันใหม่ (แทน handleConfirmOrder เดิม)
  const handleGoToPaymentPage = () => {
    if (!tableNumber) {
      toast.warning("กรุณากรอกหมายเลขโต๊ะก่อนยืนยัน");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("ยังไม่มีรายการอาหารในตะกร้า");
      return;
    }

    // ✅ แค่เปลี่ยนหน้า
    navigate("/user/paymentPage");
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="กรอกหมายเลขโต๊ะ"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {cartItems.length === 0 ? (
        <p>ยังไม่มีรายการในตะกร้า</p>
      ) : (
        <>
          <ul className="mb-4 space-y-2 text-sm">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center gap-2">
                <div className="flex-1 truncate font-semibold">
                  {item.name} - {item.price * item.qty} บาท
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    –
                  </button>
                  <div className="w-8 text-center border rounded bg-white">{item.qty}</div>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 underline"
                  >
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-right font-bold mb-3">
            รวมทั้งหมด: <span className="text-green-700">{total} บาท</span>
          </p>

          {/* ✅ เปลี่ยนจาก handleConfirmOrder → handleGoToPaymentPage */}
          <button
            onClick={handleGoToPaymentPage}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            ไปหน้าชำระเงิน
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
