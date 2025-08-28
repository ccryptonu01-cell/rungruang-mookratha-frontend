import React from "react";

const ConfirmCancelModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] text-center">
        <h2 className="text-lg font-semibold mb-3 text-red-600">ยืนยันการยกเลิก</h2>
        <p className="mb-5 text-sm text-gray-700">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกออเดอร์นี้?</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;
