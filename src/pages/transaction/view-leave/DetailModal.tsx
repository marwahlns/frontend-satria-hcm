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
          Submission Leave Data
        </h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>

      {/* Form */}
      <form id="leaveForm">
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
              <label className="form-label">Start Date Leave</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.start_date ?? ""}
              />
            </div>
            <div>
              <label className="form-label">End Date Leave</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.end_date ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Leave Type Name</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.leave_type_name ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Leave Reason</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.leave_reason ?? ""}
              />
            </div>
          </div>
          {selectedData?.status_id !== 1 && (
            <div className="grid grid-cols-1 gap-5 mt-6">
              {selectedData?.status_id === 2 && (
                <div>
                  <label className="form-label">Accepted Remark</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.accepted_remark ?? ""}
                  />
                </div>
              )}

              {selectedData?.status_id === 3 && (
                <div>
                  <label className="form-label">Approved Remark</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.approved_remark ?? ""}
                  />
                </div>
              )}

              {selectedData?.status_id === 4 && (
                <div>
                  <label className="form-label">Rejected Remark</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.rejected_remark ?? ""}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default DetailModal;
