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
        {/* Header: Judul Modal */}
        <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900">
            Submission Overtime Data
            </h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
            </button>
        </div>

        {/* Form */}
        <form id="ovtForm">
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
                    value={selectedData?.dept_name ?? ""}
                />
                </div>
                <div>
                <label className="form-label">Employee Shift</label>
                <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.shift ?? ""}
                />
                </div>
                <div>
                <label className="form-label">Employee Status</label>
                <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.user ?? ""}
                />
                </div>
                <div>
                <label className="form-label">Overtime Entry Time</label>
                <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.check_in ?? ""}
                />
                </div>
                <div>
                <label className="form-label">Overtime Time Out</label>
                <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.check_out ?? ""}
                />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
                <div className="mt-6">
                {" "}
                <label className="form-label">Overtime Note</label>
                <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.note_ovt ?? ""}
                />
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
            </div>
        </form>
        </Modal>
    );
    };

    export default DetailModal;
