import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { CheckCircle, XCircle, Star } from "lucide-react";

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

const TableMap = ({ selectedTables, toggleTable, selectedDateTime }) => {
    const [tableStatus, setTableStatus] = useState({});
    const [tableNumberToIdMap, setTableNumberToIdMap] = useState({});

    useEffect(() => {
        let intervalId;

        const fetchTables = async () => {
            try {
                if (!selectedDateTime) {
                    setTableStatus({});
                    return;
                }

                const res = await axiosInstance.get("/tables", {
                    params: {
                        selectedTime: selectedDateTime.toISOString(),
                    },
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
                    const isSelected = selectedTables.includes(tableNumberToIdMap[cell]);

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
                                (status === "AVAILABLE" || !status) &&
                                toggleTable(tableNumberToIdMap[cell])
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
