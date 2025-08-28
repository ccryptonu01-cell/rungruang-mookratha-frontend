import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute'

// layouts
import Layout from "../layouts/Layout"
import LayoutAdmin from "../layouts/LayoutAdmin"
import LayoutUser from "../layouts/LayoutUser.jsx"
import LayoutCashier from '../layouts/LayoutCashier.jsx'

// pages - guest
import Home from "../pages/Home"
import Menu from "../pages/Menu"
import Login from "../pages/Auth/Login"
import Register from "../pages/Auth/Register"
import Reservation from '../pages/Reservation'

// pages - admin
import Dashboard from "../pages/admin/Dashboard"
import MenuAdmin from '../pages/admin/MenuAdmin'
import Orders from '../pages/admin/Orders'
import Reservations from '../pages/admin/Reservations'
import Inventory from '../pages/admin/Inventory'
import OrderHistory from '../pages/admin/OrderHistory'
import ManageUsers from '../pages/admin/ManageUsers'

// pages - user / cashier
import HomeUser from "../pages/user/HomeUser"
import DashboardCashier from '../pages/cashier/DashboardCashier'
import OrderFood from '../pages/user/OrderFood'
import MyReservations from '../pages/user/MyReservations'
import MyOrders from '../pages/user/MyOrders'
import CancelReservations from '../pages/user/CancelReservations'
import CancelOrders from '../pages/user/CancelOrders'
import Profile from '../pages/user/Profile'
import PaymentPage from '../pages/user/PaymentPage.jsx'
import GuestMyResev from '../pages/GuestMyResev.jsx'
import OrderCashier from '../pages/cashier/OrderCashier.jsx'
import ReservationCashier from '../pages/cashier/ReservationsCashier.jsx'
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage.jsx'

const AppRoutes = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // ตรงนี้คือ redirect path ตาม role (ถ้ามี token)
    let defaultRedirect = null;
    if (token) {
        if (role === "ADMIN") defaultRedirect = "/admin";
        else if (role === "CASHIER") defaultRedirect = "/cashier";
        else defaultRedirect = "/user";
    }

    const router = createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: defaultRedirect
                        ? <Navigate to={defaultRedirect} replace />
                        : <Navigate to="/home" replace /> // ✅ redirect ไป /home
                },
                { path: 'home', element: <Home /> }, // ✅ เพิ่ม route ให้ /home
                { path: 'menu', element: <Menu /> },
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
                { path: 'guest-my-reserv', element: <GuestMyResev /> },
                { path: 'forgot-password', element: <ForgotPasswordPage /> },
                { path: 'reset-password', element: <ResetPasswordPage /> },
            ]
        },

        { path: '/reservation', element: <Reservation /> },

        {
            path: '/admin',
            element: <ProtectedRoute role="ADMIN" />,
            children: [
                {
                    element: <LayoutAdmin />,
                    children: [
                        { index: true, element: <Dashboard /> },
                        { path: 'menu', element: <MenuAdmin /> },
                        { path: 'orders', element: <Orders /> },
                        { path: 'reservations', element: <Reservations /> },
                        { path: 'inventory', element: <Inventory /> },
                        { path: 'order-history', element: <OrderHistory /> },
                        { path: 'manage-users', element: <ManageUsers /> },
                    ]
                }
            ]
        },

        {
            path: '/cashier',
            element: <ProtectedRoute role="CASHIER" />,
            children: [
                {
                    element: <LayoutCashier />,
                    children: [
                        { index: true, element: <DashboardCashier /> },
                        { path: 'order-cashier', element: <OrderCashier /> },
                        { path: 'reserv-cashier', element: <ReservationCashier /> }
                    ]
                }
            ]
        },

        {
            path: '/user',
            element: <ProtectedRoute role="USER" />,
            children: [
                {
                    element: <LayoutUser />,
                    children: [
                        { index: true, element: <HomeUser /> },
                        { path: 'order-food', element: <OrderFood /> },
                        { path: 'my-reservations', element: <MyReservations /> },
                        { path: 'my-orders', element: <MyOrders /> },
                        { path: 'cancel-reservation', element: <CancelReservations /> },
                        { path: 'cancel-order', element: <CancelOrders /> },
                        { path: 'profile', element: <Profile /> },
                        { path: 'reservation', element: <Reservations /> },
                        { path: 'paymentPage', element: <PaymentPage /> }
                    ]
                }
            ]
        }
    ]);

    return <RouterProvider router={router} />
}

export default AppRoutes;
