import Modal from "@/components/Modal";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const DetailModal = ({ isModalOpen, onClose, selectedData }) => {
  const { reset } = useForm({
    defaultValues: {
      rejected_remark: "",
    },
  });

  useEffect(() => {
    if (isModalOpen === false) {
      reset();
    }
  }, [isModalOpen, reset]);

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Submission Mutation Data
        </h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>

      {/* Form */}
      <form id="mutationForm">
        <div className="modal-body max-h-[65vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Employee Name</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.user_name ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Employee Department</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.dept ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Effective Date mutation</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.effective_date ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Reason Mutation</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.reason ?? ""}
              />
            </div>
          </div>
          {selectedData?.status_id !== 1 && (
            <div className="grid grid-cols-1 gap-5">
              <div className="mt-6">
                <label className="form-label">
                  {selectedData?.status_id === 2
                    ? "Accepted Remark"
                    : "Rejected Remark"}
                </label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={
                    selectedData?.status_id === 2
                      ? selectedData?.accepted_remark ?? ""
                      : selectedData?.rejected_remark ?? ""
                  }
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default DetailModal;
