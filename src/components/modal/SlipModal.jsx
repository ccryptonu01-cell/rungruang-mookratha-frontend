import React from "react";

const SlipModal = ({ slipUrl, onClose }) => {
  if (!slipUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 max-w-[90%] max-h-[90%] overflow-auto">
        <h2 className="text-lg font-bold mb-2">สลิปการชำระเงิน</h2>
        <img src={slipUrl} alt="Slip" className="max-w-full max-h-[70vh] object-contain" />
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlipModal;
