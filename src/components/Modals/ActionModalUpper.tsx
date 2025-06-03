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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 md:mx-8">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <i className="ki-outline ki-cross text-xl"></i>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-6 py-4">{children}</div>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          {showCancel && (
            <button className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
          )}
          {showSubmit && (
            <button
              className={clsx(
                "btn flex items-center text-white",
                submitText === "Rejected" || submitText === "Canceled"
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
    </div>
  );
};

export default ActionModal;
