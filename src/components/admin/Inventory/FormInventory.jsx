import React, { useState } from "react";
import { createInventory } from "../../../api/Inventory";
import useEcomStore from "../../../store/ecom-store";
import { Plus } from 'lucide-react';
import { ArchiveRestore } from 'lucide-react';
import { toast } from 'react-toastify';

const FormInventory = ({ onAddSuccess }) => {
  const token = useEcomStore((state) => state.token);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบการกรอกข้อมูล
    if (!itemName || !quantity) {
      toast.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      await createInventory(token, {
        itemName,
        quantity: parseInt(quantity)
      });

      toast.success("เพิ่มวัตถุดิบสำเร็จ!");
      setItemName('');
      setQuantity('');
      onAddSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md font-sans">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ArchiveRestore className="w-5 h-5" />
        เพิ่มวัตถุดิบ
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-base font-medium text-gray-700">ชื่อวัตถุดิบ</label>
          <input
            className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="text"
            placeholder="เช่น หมูสามชั้น"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-base font-medium text-gray-700">จำนวน</label>
          <input
            className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="number"
            placeholder="ระบุจำนวน"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มวัตถุดิบ
        </button>
      </form>
    </div>
  );
};

export default FormInventory;
