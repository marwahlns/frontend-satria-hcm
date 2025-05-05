import Modal from "@/components/Modal";
import clsx from "clsx";

const ActionModal = ({
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
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>
      <div className="modal-body max-h-[65vh] overflow-auto">{children}</div>
      <div className="modal-footer justify-end flex-shrink-0">
        <div className="flex gap-2">
          {showCancel && (
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
          )}

          {showSubmit && (
            <button
              type="button"
              className={clsx(
                "btn flex items-center text-white",
                submitText === "Rejected"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              )}
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                submitText
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ActionModal;
