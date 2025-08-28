import React, { useEffect, useState } from "react";
import axios from "axios";
import useEcomStore from "../../store/ecom-store";
import { DisplayResults } from "../../components/admin/Dashboard/DisplayResults";
import DashboardAlert from "../../components/alert/DashboardAlert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");

const Dashboard = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("โหลดออเดอร์ล้มเหลว", err);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(res.data || []);
    } catch (err) {
      console.error("โหลดการจองล้มเหลว", err);
    }
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && token) {
      setLoading(true);
      Promise.all([fetchOrders(), fetchReservations()])
        .finally(() => setLoading(false));
    }
  }, [hydrated, token]);

  if (!hydrated) {
    return <div className="p-6 text-lg">⏳ กำลังโหลดข้อมูล...</div>;
  }

  const effectiveDate = filterDate
    ? new Date(filterDate).toISOString().slice(0, 10)
    : null;

  const filteredOrders = orders
    .filter((order) => order.paymentStatus === "ชำระเงินแล้ว")
    .filter((order) => {
      if (!effectiveDate) return true;
      const createdDate = new Date(order.createdAt).toISOString().slice(0, 10);
      return createdDate === effectiveDate;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalSales = filteredOrders.reduce(
    (sum, o) => sum + Number(o.totalPrice || 0),
    0
  );
  const totalOrders = filteredOrders.length;

  const reservedTables = new Set(
    reservations
      .filter((r) => r.table?.status === "RESERVED")
      .map((r) => r.table?.tableNumber)
  ).size;

  const lowSalesAlert = totalSales < 500;

  const salesByDate = orders
    .filter((o) => o.paymentStatus === "ชำระเงินแล้ว")
    .reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.total += Number(order.totalPrice || 0);
      } else {
        acc.push({ date, total: Number(order.totalPrice || 0) });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  const chartData = salesByDate.map(({ date, total }) => ({
    name: dayjs(date).format("D MMM"),
    ยอดขาย: total,
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 translate="no" className="text-2xl font-bold mb-4">📊 แดชบอร์ด</h1>

      <DashboardAlert />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-700 font-semibold">ยอดขายรวม</h2>
          <p className="text-2xl text-green-600 font-bold mt-2">
            ฿{Number(totalSales).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 translate="no" className="text-gray-700 font-semibold">จำนวนออเดอร์</h2>
          <p className="text-2xl text-blue-600 font-bold mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 translate="no" className="text-gray-700 font-semibold">โต๊ะที่ใช้งาน</h2>
          <p className="text-2xl text-purple-600 font-bold mt-2">
            {reservedTables}
          </p>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">📈 ยอดขายย้อนหลัง 7 วัน</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ยอดขาย" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DisplayResults orders={filteredOrders} defaultTab="latest" />


    </div>
  );
};

export default Dashboard;