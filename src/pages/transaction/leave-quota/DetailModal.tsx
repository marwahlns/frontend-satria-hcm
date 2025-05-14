import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import { useEffect } from "react";

const DetailModal = ({ isModalOpen, onClose, selectedData, setRefetch, isRefetch }) => {
    const schema = yup.object().shape({
        nrp: yup
            .string(),

        name: yup
            .string(),

        id_user: yup
            .string(),

        leave_type_id: yup
            .string(),

        valid_from: yup
            .string(),

        valid_to: yup
            .string(),

        leave_quota: yup
            .string(),

        used_leave: yup
            .string(),

        leave_balance: yup
            .string(),
    });

    const {
        control,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            id_user: "",
            leave_type_id: "",
            valid_from: "",
            valid_to: "",
        },
    });

    useEffect(() => {
        if (selectedData) {
            reset({
                nrp: selectedData.id_user,
                name: selectedData.MsUser.name,
                valid_from: selectedData.valid_from,
                valid_to: selectedData.valid_to,
                leave_type_id: selectedData.MsLeaveType.title,
                leave_quota: selectedData.leaves_quota,
                used_leave: selectedData.used_leave,
                leave_balance: selectedData.leave_balance,
            });
        }
    }, [selectedData, reset]);

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Detail Transaction Leave Quota</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">NRP</label>
                            <Controller
                                name="nrp"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx("input")}
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
                                        className={clsx("input")}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Valid From</label>
                            <Controller
                                name="valid_from"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Valid To</label>
                            <Controller
                                name="valid_to"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Leave Type</label>
                            <Controller
                                name="leave_type_id"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Leave Quota</label>
                            <Controller
                                name="leave_quota"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Used Leave</label>
                            <Controller
                                name="used_leave"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Leave Balance</label>
                            <Controller
                                name="leave_balance"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx("input")}
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