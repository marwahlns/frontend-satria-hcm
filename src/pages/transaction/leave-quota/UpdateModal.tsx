import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import AsyncSelect from "react-select/async";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const UpdateModal = ({ isModalOpen, onClose, selectedData, setRefetch, isRefetch }) => {
    const schema = yup.object().shape({
        name: yup
            .string(),

        id_user: yup
            .string(),

        id_leave_type: yup
            .object({
                value: yup.string().required("Leave type is required"),
                label: yup.string().required("Leave type is required"),
            })
            .required("Leave type is required"),

        valid_from: yup
            .string()
            .required("Valid from is required"),

        valid_to: yup
            .string()
            .required("Valid to is required"),

        leaves_quota: yup
            .number()
            .typeError("Leave quota must be a number")
            .min(0, "Cannot be negative")
            .required("Leave quota is required"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            id_user: "",
            id_leave_type: {},
            valid_from: "",
            valid_to: "",
        },
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    useEffect(() => {
        if (selectedData) {
            reset({
                id_user: selectedData.id_user,
                name: selectedData.user_name,
                valid_from: formatDate(selectedData.valid_from),
                valid_to: formatDate(selectedData.valid_to),
                id_leave_type: selectedData.leaves_type_id
                    ? {
                        value: selectedData.leaves_type_id,
                        label: selectedData.leaves_type
                    }
                    : null,
                leaves_quota: selectedData.leaves_quota,
            });
        }
    }, [selectedData, reset]);

    const onSubmit = async (data) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/trx/leave-quota/${selectedData.id}`,
                {
                    ...data,
                    id_leave_type: data.id_leave_type?.value,
                    valid_from: data.valid_from,
                    valid_to: data.valid_to,
                    leave_quota: data.leaves_quota,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "Leave quota updated successfully",
                    icon: "success",
                    timer: 1500,
                });
                setRefetch(!isRefetch);
                onClose();
                reset();
            } else {
                onClose();
                reset();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const leaveTypeOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/leave-type`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((leave_type) => ({
                    value: leave_type.id,
                    label: leave_type.title,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Update Transaction Leave Quota</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">NRP</label>
                            <Controller
                                name="id_user"
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
                                        type="date"
                                        className={clsx(
                                            "input",
                                            errors.valid_from ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.valid_from && (
                                <p className="text-red-500 text-sm mt-1">{errors.valid_from.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Valid To</label>
                            <Controller
                                name="valid_to"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="date"
                                        className={clsx(
                                            "input",
                                            errors.valid_to ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.valid_to && (
                                <p className="text-red-500 text-sm mt-1">{errors.valid_to.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Leave Type</label>
                            <Controller
                                name="id_leave_type"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={leaveTypeOptions}
                                        placeholder="Select.."
                                        className="w-full text-sm"
                                        value={field.value}
                                        onChange={(selectedOption) => field.onChange(selectedOption)}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.id_leave_type ? "#EF4444" : "#DBDFE9",
                                                "&:hover": {
                                                    borderColor: state.isFocused ? "#DBDFE9" : "#EF4444",
                                                },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.id_leave_type && (
                                <p className="text-red-500 text-sm mt-1">{errors.id_leave_type.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Leave Quota</label>
                            <Controller
                                name="leaves_quota"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                            errors.leaves_quota ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.leaves_quota && (
                                <p className="text-red-500 text-sm mt-1">{errors.leaves_quota.message}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="modal-footer justify-end flex-shrink-0">
                    <div className="flex gap-2">
                        <button type="button" className="btn btn-light" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateModal;