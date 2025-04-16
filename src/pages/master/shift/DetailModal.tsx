import Modal from "@/components/Modal";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import { useEffect } from "react";

const DetailModal = ({ isModalOpen, onClose, selectedData }) => {

    const {
        control,
        reset,
    } = useForm({
        defaultValues: {
            code: "",
            name: "",
            inTime: "",
            outTime: "",
            graceBeforeIn: 0,
            graceBeforeOut: 0,
            graceAfterIn: 0,
            graceAfterOut: 0,
        },
    });

    useEffect(() => {
        if (selectedData) {
            reset({
                code: selectedData.code,
                name: selectedData.name,
                inTime: selectedData.in_time,
                outTime: selectedData.out_time,
                graceBeforeIn: selectedData.gt_before_in,
                graceBeforeOut: selectedData.gt_after_in,
                graceAfterIn: selectedData.gt_before_out,
                graceAfterOut: selectedData.gt_after_out,
            });
        }
    }, [selectedData, reset]);

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Detail Data Shift</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-[300px] max-h-[95%]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Code</label>
                            <Controller
                                name="code"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Name</label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">In Time</label>
                            <Controller
                                name="inTime"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="time"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Out Time</label>
                            <Controller
                                name="outTime"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="time"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time Before In (Minutes)</label>
                            <Controller
                                name="graceBeforeIn"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time After In (Minutes)</label>
                            <Controller
                                name="graceAfterIn"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time Before Out (Minutes)</label>
                            <Controller
                                name="graceBeforeOut"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time After Out (Minutes)</label>
                            <Controller
                                name="graceAfterOut"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default DetailModal;