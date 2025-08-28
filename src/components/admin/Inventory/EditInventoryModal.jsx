import React, { useState, useEffect } from "react";

const EditInventoryModal = ({ isOpen, onClose, onSave, item }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (item) {
      setItemName(item.itemName);
      setQuantity(item.quantity);
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, itemName, quantity: parseInt(quantity) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[300px]">
        <h2 className="text-lg font-bold mb-4">แก้ไขวัตถุดิบ</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="border w-full p-2"
            type="text"
            placeholder="ชื่อวัตถุดิบ"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
          <input
            className="border w-full p-2"
            type="number"
            placeholder="จำนวน"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <div className="flex justify-between pt-2">
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
              บันทึก
            </button>
            <button onClick={onClose} type="button" className="text-gray-500 px-3 py-1">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventoryModal;
