import React, { useEffect, useState } from "react";
import { User, Clock } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const HeaderAdmin = () => {
    const username = useEcomStore((state) => state.username) || "admin";
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const buddhistYear = currentTime.year() + 543;
    const formattedDate = `${currentTime.format("D MMMM")} ${buddhistYear}`;
    const formattedTime = currentTime.format("HH:mm");

    return (
        <header className="bg-white min-h-[75px] flex items-center justify-between px-12 ml-64 py-6 shadow border-b">
            {/* ชื่อผู้ใช้งาน */}
            <div className="flex items-center gap-4 text-gray-800 text-xl font-medium">
                <User className="w-6 h-6 text-purple-600" />
                <span>
                    สวัสดี, คุณ <span className="font-bold capitalize">{username}</span>
                </span>
            </div>

            {/* วันที่/เวลา */}
            <div className="flex items-center gap-3 text-gray-700 text-base bg-gray-100 px-4 py-2 rounded-lg shadow-sm">
                <Clock className="w-5 h-5 text-red-500" />
                <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-gray-800">วันที่ {formattedDate}</span>
                    <span className="text-sm text-gray-600">เวลา {formattedTime} น.</span>
                </div>
            </div>
        </header>
    );
};

export default HeaderAdmin;
