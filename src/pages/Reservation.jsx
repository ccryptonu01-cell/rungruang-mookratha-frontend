import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import useEcomStore from "../store/ecom-store";
import MainNav from "../components/MainNav";
import UserNav from "../components/UserNav";
import TableMap from "../components/Reserv/Table";
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

const Reservation = () => {
  const user = useEcomStore((state) => state.user);
  const token = useEcomStore((state) => state.token);
  const [tableNumberToIdMap, setTableNumberToIdMap] = useState({});
  const navigate = useNavigate();

  const [selectedTables, setSelectedTables] = useState([]);
  const [form, setForm] = useState({
    date: "",
    timeSlot: "",
    name: user?.username || "",
    phone: user?.phone || "",
    people: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "people") {
      setForm({ ...form, [name]: Math.max(1, parseInt(value || "1")) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const toggleTable = (tableId) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectedDateTimeStr =
    form.date && form.timeSlot
      ? (() => {
        const [hour, minute] = form.timeSlot.split(" - ")[0].split(":");
        const localISO = `${form.date}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00+07:00`;
        console.log("📅 selectedDateTimeStr", localISO);
        return localISO;
      })()
      : null;

  const selectedDateTimeObj = useMemo(() => {
    if (!form.date || !form.timeSlot) return null;
    const [hour, minute] = form.timeSlot.split(" - ")[0].split(":");
    const date = new Date(form.date);
    date.setHours(parseInt(hour));
    date.setMinutes(parseInt(minute));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }, [form.date, form.timeSlot]);

  const handleSubmit = async () => {
    if (!form.date || !form.timeSlot || !form.people || !selectedTables.length || !selectedDateTimeStr) {
      toast.error("กรุณาระบุวันที่ เวลา จำนวนคน และเลือกโต๊ะ");
      return;
    }

    const isGuest = !user?.role || user.role !== "USER";

    if (isGuest && (!form.name || !form.phone)) {
      toast.error("กรุณาระบุชื่อและเบอร์โทร สำหรับผู้ใช้งานทั่วไป");
      return;
    }

    console.log('selectedTables', selectedTables)

    const payload = {
      startTime: selectedDateTimeStr,
      people: form.people,
      tableIds: selectedTables.map((tableNumber) => tableNumberToIdMap[tableNumber]),
      ...(isGuest
        ? { name: form.name, phone: form.phone }
        : {}),
    };

    const endpoint = isGuest
      ? "/reservations"
      : "/user/reservations";

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(user?.role === "USER" && token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      };

      await axios.post(endpoint, payload, { headers });

      toast.success("จองโต๊ะสำเร็จ!", { position: "top-center" });
      setTimeout(() => {
        navigate(user?.role === "USER" ? "/user" : "/");
      }, 1500);
    } catch (err) {
      console.error("❌ ส่งข้อมูลล้มเหลว:", err);
      const msg = err?.response?.data?.message || "จองไม่สำเร็จ";
      toast.error(msg, { position: "top-center" });
    }
  };

  return (
    <>
      {user?.role === "USER" ? (
        <UserNav onlyBack backPath="/user" />
      ) : (
        <MainNav />
      )}

      <div className="p-6 text-black font-prompt max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-red-600">จองโต๊ะของท่าน</h1>
        <p className="text-center text-lg font-medium mb-6">
          {user?.role === "USER"
            ? `สวัสดีคุณ ${user?.username}`
            : "กรุณากรอกข้อมูลเพื่อจองโต๊ะ"}
        </p>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">วันที่</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">ช่วงเวลา</label>
              <select
                name="timeSlot"
                value={form.timeSlot}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">-- เลือกช่วงเวลา --</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {!user?.role && (
              <>
                <div>
                  <label className="block mb-1 font-semibold">ชื่อ</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">เบอร์โทร</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block mb-1 font-semibold">จำนวนคน</label>
              <input
                type="number"
                name="people"
                value={form.people}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {!form.date || !form.timeSlot ? (
            <p className="text-red-500 text-center text-base font-semibold">
              ** กรุณาเลือกวันที่และช่วงเวลาก่อนเลือกโต๊ะ **
            </p>
          ) : null}

          {selectedTables.length > 0 && (
            <div className="text-base md:text-lg font-semibold text-green-700 bg-green-100 p-3 rounded-md mb-2 text-center">
              คุณเลือกโต๊ะ: {selectedTables.join(", ")}
            </div>
          )}

          <TableMap
            selectedTables={selectedTables}
            toggleTable={toggleTable}
            selectedDateTime={selectedDateTimeObj}
            setTableNumberToIdMap={setTableNumberToIdMap}
          />

          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition"
          >
            ยืนยันการจอง
          </button>
        </div>
      </div>
    </>
  );
};

export default Reservation;
