import Modal from "@/components/Modal";

const DetailModal = ({ isModalOpen, onClose, title = "Modal", children }) => {
  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title text-lg">{title}</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>
      <div className="modal-body max-h-[65vh] overflow-auto">{children}</div>
    </Modal>
  );
};

export default DetailModal;
