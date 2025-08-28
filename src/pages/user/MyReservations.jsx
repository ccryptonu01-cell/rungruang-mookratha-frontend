import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import useEcomStore from "../../store/ecom-store";

const MyReservations = () => {
  const token = useEcomStore((state) => state.token);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const fetchReservations = async (date = "") => {
    try {
      const url = date
        ? `http://localhost:5000/api/user/reservations?date=${date}`
        : "http://localhost:5000/api/user/reservations";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReservations(res.data.reservations || []);
    } catch (err) {
      console.error("❌ โหลดข้อมูลล้มเหลว:", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setReservations([]);
    }
  };

  useEffect(() => {
    if (token) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const currentDate = `${yyyy}-${mm}-${dd}`;
      setSelectedDate(currentDate);
      fetchReservations(currentDate);
    }
  }, [token]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchReservations(date);
  };

  const cancelReservation = async (reservationId) => {
    const confirmCancel = window.confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?");
    if (!confirmCancel) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/user/reservations/${reservationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.message) {
        toast.success("ยกเลิกการจองสำเร็จ");
        setReservations((prev) =>
          prev.map((r) =>
            r.id === reservationId ? { ...r, status: "CANCELLED" } : r
          )
        );
        setTimeout(() => {
          setReservations((prev) => prev.filter((r) => r.id !== reservationId));
        }, 3000);
      } else {
        toast.error(res.data.message || "ไม่สามารถยกเลิกได้");
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการยกเลิก");
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return { label: "รอดำเนินการ", color: "text-yellow-600" };
      case "COMPLETED":
        return { label: "สำเร็จ", color: "text-green-600" };
      case "CANCELLED":
        return { label: "ยกเลิกแล้ว", color: "text-red-600" };
      default:
        return { label: status, color: "text-gray-600" };
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-black font-prompt">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-red-500 drop-shadow-md tracking-wide animate-pulse">
        ตรวจสอบการจอง
      </h1>

      <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-lg space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          เลือกวันที่ (ดูประวัติ)
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {reservations.length === 0 ? (
        <p className="text-center text-gray-500 font-semibold">ไม่พบข้อมูลการจอง</p>
      ) : (
        reservations
          .filter((r) => r.status !== "CANCELLED")
          .map((r, index) => {
            const statusInfo = getStatusInfo(r.status);

            const dateObj = r.date ? new Date(r.date) : null;
            const dateStr = dateObj
              ? dateObj.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
              })
              : "-";

            const timeStr = dateObj
              ? dateObj.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Bangkok",
              })
              : "-";

            const endTimeObj = dateObj
              ? new Date(dateObj.getTime() + 60 * 60 * 1000)
              : null;

            const endTimeStr = endTimeObj
              ? endTimeObj.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Bangkok",
              })
              : "-";

            return (
              <div
                key={index}
                className="border border-gray-300 rounded-lg shadow-md bg-opacity-80 p-5 mb-5 bg-white space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-red-600">
                    📅 {dateStr}
                  </div>
                  <div className={`text-sm font-bold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p>🕐 <strong>เวลา:</strong> {timeStr} - {endTimeStr}</p>
                  <p>🍽️ <strong>โต๊ะ:</strong> {r.tableNumber}</p>
                  <p>👥 <strong>จำนวนคน:</strong> {r.people}</p>
                </div>

                {r.status === "PENDING" && (
                  <div className="text-right mt-3">
                    <button
                      onClick={() => cancelReservation(r.id)}
                      className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      ยกเลิกการจอง
                    </button>
                  </div>
                )}
              </div>
            );
          })
      )}
    </div>
  );
};

export default MyReservations;
