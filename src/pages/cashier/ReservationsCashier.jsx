import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const ReservationsCashier = () => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

  const fetchReservations = async () => {
    try {
      const res = await axios.get("/cashier/reservations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const sorted = (res.data.reservations || []).sort((a, b) => new Date(b.time) - new Date(a.time));
      setReservations(sorted);
    } catch (err) {
      console.error("โหลดข้อมูลล้มเหลว", err);
      toast.error("ไม่สามารถโหลดข้อมูลการจองได้!");
    }
  };

  const getName = (r) => r.user?.username || r.guestUser?.name || "-";
  const getPhone = (r) => r.user?.phone || r.guestUser?.phone || "-";

  const formatTimeRangeWithDate = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const hour = date.getHours();
    const startHour = hour.toString().padStart(2, "0");
    const endHour = (hour + 1).toString().padStart(2, "0");
    return `${datePart} ${startHour}:00 - ${endHour}:00`;
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await axios.put(
        "/cashier/reservations/status",
        {
          tableNumber: selectedReservation?.table?.tableNumber,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("อัปเดตสถานะโต๊ะสำเร็จ!");
      setShowStatusModal(false);
      fetchReservations(); // รีโหลดข้อมูลใหม่
    } catch (err) {
      console.error("อัปเดตสถานะล้มเหลว", err);
      toast.error("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const getThaiStatus = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "ว่าง";
      case "RESERVED":
        return "จองแล้ว";
      case "OCCUPIED":
        return "ไม่ว่าง";
      case "PENDING":
        return "รอดำเนินการ";
      default:
        return "-";
    }
  };

  const handleDateFilterChange = (e) => {
    setFilterDate(e.target.value);
  };

  const applyDateFilter = () => {
    setCurrentPage(1);
    setShowDatePickerModal(false);
  };

  const filteredReservations = reservations.filter((r) => {
    if (filterDate) {
      const rDate = new Date(r.time).toLocaleDateString("en-US");
      const selected = new Date(filterDate).toLocaleDateString("en-US");
      if (rDate !== selected) return false;
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const name = getName(r).toLowerCase();
      const phone = getPhone(r);
      const table = r.table?.tableNumber?.toString() || "";

      if (!name.includes(lower) && !phone.includes(lower) && !table.includes(lower)) {
        return false;
      }
    }

    return true;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">การจองโต๊ะ (Cashier)</h1>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="ค้นหาชื่อ / เบอร์ / โต๊ะ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={() => setShowDatePickerModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          เลือกวันที่
        </button>
        <button
          onClick={() => {
            setFilterDate("");
            setCurrentPage(1);
            toast.success("แสดงการจองทั้งหมดเรียบร้อย");
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          แสดงทั้งหมด
        </button>

        {filterDate && (
          <span className="text-lg font-medium">
            แสดงสำหรับวันที่{" "}
            {new Date(filterDate).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            <button
              onClick={() => setFilterDate("")}
              className="ml-2 text-red-500 hover:text-red-700 font-bold"
            >
              (ล้าง)
            </button>
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow text-center">
          <thead className="bg-gray-100">
            <tr>
              <th>ID</th>
              <th>ชื่อผู้จอง</th>
              <th>เบอร์โทร</th>
              <th>วันที่-เวลา</th>
              <th>โต๊ะ</th>
              <th>จำนวนคน</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4">
                  ไม่พบข้อมูลการจอง
                </td>
              </tr>
            ) : (
              currentItems.map((r) => (
                <tr key={r.id}>
                  <td className="p-2 border">{r.id}</td>
                  <td className="p-2 border">{getName(r)}</td>
                  <td className="p-2 border">{getPhone(r)}</td>
                  <td className="p-2 border">{formatTimeRangeWithDate(r.time)}</td>
                  <td className="p-2 border">{r.table?.tableNumber || "-"}</td>
                  <td className="p-2 border">{r.people}</td>
                  <td className="p-2 border">{getThaiStatus(r.table?.status)}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => {
                        setSelectedReservation(r);
                        setShowManageModal(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      จัดการ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {Math.ceil(filteredReservations.length / itemsPerPage) > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          {Array.from({ length: Math.ceil(filteredReservations.length / itemsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal: เลือกวันที่ */}
      {showDatePickerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80 text-center">
            <h2 className="text-xl font-bold mb-4">เลือกวันที่จอง</h2>
            <input
              type="date"
              value={filterDate}
              onChange={handleDateFilterChange}
              className="border p-2 rounded mb-4 w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={applyDateFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                ตกลง
              </button>
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ✅ Modal: จัดการโต๊ะ */}
      {showManageModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80 text-center">
            <h2 className="text-xl font-bold mb-4">จัดการโต๊ะ</h2>
            <button
              onClick={() => {
                setShowManageModal(false);
                setShowStatusModal(true);
              }}
              className="w-full px-4 py-2 bg-green-500 text-white rounded mb-2"
            >
              เปลี่ยนสถานะ
            </button>
            <button
              onClick={() => setShowManageModal(false)}
              className="w-full px-4 py-2 bg-gray-300 text-black rounded"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* ✅ Modal: เลือกสถานะใหม่ */}
      {showStatusModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80 text-center">
            <h2 className="text-xl font-bold mb-4">เลือกสถานะใหม่</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleUpdateStatus("AVAILABLE")}
                className="w-full px-4 py-2 bg-green-500 text-white rounded"
              >
                ว่าง
              </button>
              <button
                onClick={() => handleUpdateStatus("RESERVED")}
                className="w-full px-4 py-2 bg-red-500 text-white rounded"
              >
                จองแล้ว
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full px-4 py-2 bg-gray-400 text-white rounded"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReservationsCashier;
