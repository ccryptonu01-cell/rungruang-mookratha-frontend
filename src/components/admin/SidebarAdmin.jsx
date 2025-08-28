import { NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard } from 'lucide-react'
import { Table } from 'lucide-react'
import { ListOrdered } from 'lucide-react'
import { Logs } from 'lucide-react'
import { Package } from 'lucide-react'
import { CircleDollarSign } from 'lucide-react'
import { SquareMenu } from 'lucide-react'
import { SquareUser } from 'lucide-react'
import { LogOut } from 'lucide-react'
import useEcomStore from "../../store/ecom-store"

const SidebarAdmin = () => {
    const navigate = useNavigate()
    const actionLogout = useEcomStore((state) => state.actionLogout)

    const handleLogout = () => {
        actionLogout()
        localStorage.removeItem("token") // ป้องกัน fallback ที่อาจเก็บแยกไว้
        navigate("/login")
    }

    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-gray-100 flex flex-col z-50">
            {/* Header */}
            <div className="h-24 bg-gray-900 flex items-center justify-center text-2xl font-bold">
                Admin Panel
            </div>

            {/* Menu */}
            <nav className="flex-1 px-2 py-4 space-y-2">
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? 'bg-gray-900 rounded-md text-white px-4 py-2 flex items-center'
                            : 'text-gray-300 px-4 py-2 hover:bg-gray-700 hover:text-white rounded flex items-center'
                    }>
                    <LayoutDashboard className="mr-2" />
                    แดชบอร์ด
                </NavLink>

                <NavLink to="reservations" className={({ isActive }) =>
                    isActive
                        ? 'bg-gray-900 rounded-md text-white px-4 py-2 flex items-center'
                        : 'text-gray-300 px-4 py-2 hover:bg-gray-700 hover:text-white rounded flex items-center'}>
                    <Table className="mr-2" />
                    การจองโต๊ะ
                </NavLink>

                <NavLink to="orders" className={({ isActive }) =>
                    isActive
                        ? 'bg-gray-900 rounded-md text-white px-4 py-2 flex items-center'
                        : 'text-gray-300 px-4 py-2 hover:bg-gray-700 hover:text-white rounded flex items-center'}>
                    <ListOrdered className="mr-2" />
                    ออเดอร์
                </NavLink>

                <NavLink to="menu" className={({ isActive }) =>
                    isActive
                        ? 'bg-gray-900 rounded-md text-white px-4 py-2 flex items-center'
                        : 'text-gray-300 px-4 py-2 hover:bg-gray-700 hover:text-white rounded flex items-center'}>
                    <SquareMenu className="mr-2" />
                    จัดการเมนู
                </NavLink>

                <NavLink to="inventory" className={({ isActive }) =>
                    isActive
                        ? 'bg-gray-900 rounded-md text-white px-4 py-2 flex items-center'
                        : 'text-gray-300 px-4 py-2 hover:bg-gray-700 hover:text-white rounded flex items-center'}>
                    <Package className="mr-2" />
                    จัดการวัตถุดิบ
                </NavLink>

                <NavLink to="manage-users" className={({ isActive }) =>
                    isActive
                        ? 'bg-gray-900 rounded-md text-white px-4 py-2 flex items-center'
                        : 'text-gray-300 px-4 py-2 hover:bg-gray-700 hover:text-white rounded flex items-center'}>
                    <SquareUser className="mr-2" />
                    จัดการผู้ใช้
                </NavLink>
            </nav>

            {/* Logout Button */}
            <div className="p-4">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center"
                >
                    <LogOut className="mr-2" />
                    ออกจากระบบ
                </button>
            </div>
        </div>
    )
}

export default SidebarAdmin