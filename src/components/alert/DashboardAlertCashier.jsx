import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { AlertCircle } from "lucide-react";

const DashboardAlertCashier = () => {
    const [unpaidOrders, setUnpaidOrders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const unpaidRes = await axiosInstance.get(
                    "/cashier/alert/unpaid-orders",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = unpaidRes.data;
                if (Array.isArray(data)) {
                    setUnpaidOrders(data);
                } else if (Array.isArray(data.orders)) {
                    setUnpaidOrders(data.orders);
                } else {
                    console.warn("⚠️ API response format ผิด:", data);
                    setUnpaidOrders([]);
                }
            } catch (err) {
                console.error("ไม่สามารถโหลดออเดอร์ที่ยังไม่ชำระเงินได้:", err);
                setUnpaidOrders([]);
            }
        };

        fetchData();
    }, []);

    if (unpaidOrders.length === 0) return null;

    return (
        unpaidOrders.length > 0 && (
            <div className="flex items-start gap-4 bg-red-100 border border-red-400 text-red-800 px-5 py-4 rounded-lg shadow-sm mb-6">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex flex-col">
                    <span className="font-semibold text-sm sm:text-base">
                        ยังมีออเดอร์ที่ยังไม่ชำระเงิน {unpaidOrders.length} รายการ
                    </span>
                    <a
                        href="/cashier/order-cashier"
                        className="mt-2 w-fit bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-md transition shadow"
                    >
                        ไปที่หน้าจัดการออเดอร์
                    </a>
                </div>
            </div>
        )
    );

};

export default DashboardAlertCashier;

