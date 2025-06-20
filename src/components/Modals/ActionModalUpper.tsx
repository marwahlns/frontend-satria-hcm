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

        <div className="max-h-[70vh] overflow-auto px-6 py-4">{children}</div>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          {showCancel && (
            <button className="btn btn-light" onClick={onClose}>
              Discard
            </button>
          )}
          {showSubmit && (
            <button
              className={clsx(
                "btn flex items-center text-white",
                submitText === "Rejected" || submitText === "Canceled"
                  ? "bg-red-500 hover:bg-red-600"
                  : submitText === "Accepted"
                  ? "bg-blue-500 hover:bg-blue-600"
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
    </div>
  );
};

export default ActionModal;
