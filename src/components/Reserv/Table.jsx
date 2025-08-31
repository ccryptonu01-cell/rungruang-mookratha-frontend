import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { CheckCircle, XCircle, Star } from "lucide-react";
import useEcomStore from "../../store/ecom-store";

const tableLayout = [
    [1, 2, 3, 4, 5, null, 6],
    [7, 8, 9, 10, 11, null, 12],
    [13, 14, 15, 16, 17, null, 18],
    [19, 20, 21, 22, 23, null, 24],
    [null, null, null, null, null, null, 30],
    [25, 26, 27, 28, 29, null, null],
];

// 🟢 ฟังก์ชันแปลสถานะเป็นภาษาไทย
const getStatusLabel = (status) => {
    switch (status) {
        case "AVAILABLE":
            return "ว่าง";
        case "RESERVED":
            return "จองแล้ว";
        case "OCCUPIED":
            return "ไม่ว่าง";
        default:
            return "-";
    }
};

const TableMap = ({ selectedTables, toggleTable, selectedDateTime, setTableNumberToIdMap }) => {
    const [tableStatus, setTableStatus] = useState({});
    const user = useEcomStore((state) => state.user);
    const token = useEcomStore((state) => state.token);

    useEffect(() => {
        let intervalId;

        const fetchTables = async () => {
            try {

                console.log("🧪 selectedDateTime (typeof):", typeof selectedDateTime);
                console.log("🧪 selectedDateTime:", selectedDateTime);
                console.log("🧪 toISOString:", selectedDateTime?.toISOString());

                const isValidDate = selectedDateTime instanceof Date && !isNaN(selectedDateTime.getTime());
                if (!isValidDate) {
                    console.warn("⛔️ selectedDateTime ไม่ถูกต้อง:", selectedDateTime);
                    setTableStatus({});
                    return;
                }

                const isGuest = !user?.role || user.role !== "USER";
                const endpoint = isGuest ? "/reservations/tables" : "/user/tables";
                const headers = isGuest ? {} : { Authorization: `Bearer ${token}` };

                const selectedTime = (() => {
                    try {
                        const dateObj = new Date(selectedDateTime);
                        if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");
                        return dateObj.toISOString();
                    } catch {
                        console.warn("⚠️ selectedDateTime แปลงเป็น ISO ไม่ได้:", selectedDateTime);
                        return null;
                    }
                })();

                const res = await axiosInstance.get(endpoint, {
                    params: { selectedTime },
                    headers,
                });

                const statusMap = {};
                const numberToIdMap = {};
                res.data.tables.forEach((table) => {
                    statusMap[table.tableNumber] = table.status;
                    numberToIdMap[table.tableNumber] = table.id;
                });
                setTableStatus(statusMap);
                setTableNumberToIdMap(numberToIdMap);
            } catch (err) {
                console.error("โหลดสถานะโต๊ะล้มเหลว:", err);
            }
        };


        if (selectedDateTime) {
            fetchTables();
            intervalId = setInterval(fetchTables, 5000); // โหลดซ้ำทุก 5 วินาที
        }

        return () => clearInterval(intervalId);
    }, [selectedDateTime]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto font-prompt border border-gray-200">
            <h2 className="text-3xl font-bold text-center mb-6 text-red-600">เลือกโต๊ะของท่าน</h2>

            <div className="grid grid-cols-7 text-sm text-center mb-2 text-gray-600 font-semibold">
                <div className="col-span-5">ในร้าน</div>
                <div></div>
                <div>นอกร้าน</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {tableLayout.flat().map((cell, index) => {
                    if (cell === null) return <div key={`empty-${index}`} />;

                    const status = tableStatus[cell];
                    const isSelected = selectedTables.includes(cell);

                    const bgColor =
                        status === "RESERVED" || status === "OCCUPIED"
                            ? "bg-red-500 border-red-700"
                            : isSelected
                                ? "bg-yellow-400 border-yellow-600"
                                : "bg-green-500 border-green-700";

                    const Icon =
                        status === "RESERVED" || status === "OCCUPIED"
                            ? XCircle
                            : isSelected
                                ? Star
                                : CheckCircle;

                    return (
                        <div
                            key={cell}
                            onClick={() =>
                                (status === "AVAILABLE" || !status) && toggleTable(cell)
                            }

                            className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer text-white font-semibold border shadow-sm
                ${bgColor} hover:scale-105 transition-transform duration-150`}
                            title={`โต๊ะ ${cell} - ${getStatusLabel(status)}`}
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            {cell}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-sm" /> ว่าง
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-sm" /> จองแล้ว/ไม่ว่าง
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-sm" /> โต๊ะที่เลือก
                </div>
            </div>
        </div>
    );
};

export default TableMap;
