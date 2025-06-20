const DetailModal = ({ isModalOpen, onClose, title = "Modal", children }) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[95vw] max-w-[1200px] bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default DetailModal;
