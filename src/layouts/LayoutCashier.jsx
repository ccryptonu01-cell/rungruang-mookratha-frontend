import { Outlet } from "react-router-dom";
import SidebarCashier from "../components/cashier/SidebarCashier";
import HeaderCashier from "../components/cashier/HeaderCashier";

const LayoutCashier = () => {
    return (
        <div className="flex">
            {/* Sidebar ซ้าย */}
            <SidebarCashier />

            {/* ด้านขวา - ส่วนหลัก */}
            <div className="flex flex-col flex-1 ml-64">
                <HeaderCashier />
                <main className="p-6 flex-1 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default LayoutCashier;
