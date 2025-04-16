import Modal from "@/components/Modal";

const DetailModal = ({
  isModalOpen,
  onClose,
  title = "Modal",
  children,
  onSubmit,
  submitText = "Submit",
  loading = false,
  showSubmit = true,
  showCancel = true,
}) => {
  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>
      <div className="modal-body max-h-[65vh] overflow-auto">{children}</div>
    </Modal>
  );
};

export default DetailModal;
