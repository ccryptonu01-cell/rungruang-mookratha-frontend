const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="text-gray-700">{children}</div>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
