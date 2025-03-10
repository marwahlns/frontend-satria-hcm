import { useState } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white max-w-[600px] w-full p-5 rounded-lg shadow-lg relative">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>
        <div className="py-4">{children}</div>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="btn btn-light">
            Cancel
          </button>
          <button className="btn btn-primary">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
