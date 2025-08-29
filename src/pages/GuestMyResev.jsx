import { useState } from "react";
import { toast } from "react-toastify";
import axios from "../utils/axiosInstance";

const TIME_SLOTS = [
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00",
];

const GuestMyResev = () => {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [reservations, setReservations] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSearch = async () => {
    if (!form.name || !form.phone) {
      toast.error("กรุณากรอกชื่อและเบอร์โทร");
      return;
    }

    try {
      const res = await axios.post("/reservations/guest-check", form);

      const data = res.data;

      setReservations(data.reservations || []);
    } catch (err) {
      const message = err?.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      toast.error(message);
    }
  };

  const cancelReservation = async (reservationId) => {
    const confirmCancel = window.confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?");
    if (!confirmCancel) return;

    try {
      const res = await axios.put(`/reservations/${reservationId}/cancel`);

      const data = res.data;

      toast.success("ยกเลิกการจองสำเร็จ");

      setReservations(prev =>
        prev.map(r =>
          r.reservationId === reservationId
            ? { ...r, status: "CANCELLED" }
            : r
        )
      );

      setTimeout(() => {
        setReservations(prev =>
          prev.filter(r => r.reservationId !== reservationId)
        );
      }, 3000);
    } catch (err) {
      const message = err?.response?.data?.message || "เกิดข้อผิดพลาดในการยกเลิก";
      toast.error(message);
    }
  };

  const getTimeSlotLabel = (startTimeStr) => {
    const startTime = new Date(startTimeStr).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Bangkok"
    });
    return TIME_SLOTS.find(slot => slot.startsWith(startTime)) ?? startTime;
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
      <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-100 drop-shadow-md tracking-wide animate-pulse">
        ตรวจสอบการจอง
      </h1>

      <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-lg space-y-4 mb-6">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="กรอกชื่อของคุณ"
            className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-red-500 focus:border-red-500"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="08xxxxxxxx"
            className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-red-500 focus:border-red-500"
          />
        </label>

        <button
          onClick={handleSearch}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md transition"
        >
          ค้นหารายการจองของฉัน
        </button>
      </div>


      {reservations
        .filter((rsv) => rsv.status !== "CANCELLED") // ✅ กรองไม่แสดงที่ยกเลิก
        .map((rsv, index) => {
          const statusInfo = getStatusInfo(rsv.status);
          return (
            <div
              key={index}
              className="border border-gray-300 rounded-lg shadow-md bg-opacity-80 p-5 mb-5 bg-white space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-red-600">
                  📅 {new Date(rsv.time).toLocaleDateString("th-TH")}
                </div>
                <div className={`text-sm font-bold ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>🕐 <strong>เวลา:</strong> {getTimeSlotLabel(rsv.time)}</p>
                <p>🍽️ <strong>โต๊ะ:</strong> {rsv.tableNumber ?? rsv.tableId}</p>
                <p>👥 <strong>จำนวนคน:</strong> {rsv.people ?? "ไม่ระบุ"}</p>
              </div>

              {rsv.status === "PENDING" && (
                <div className="text-right mt-3">
                  <button
                    onClick={() => cancelReservation(rsv.reservationId)}
                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    ยกเลิกการจอง
                  </button>
                </div>
              )}
            </div>
          );
        })}

    </div>
  );
};

export default GuestMyResev;
