import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const UpdateModal = ({ isModalOpen, onClose, selectedData, setRefetch, isRefetch }) => {
    const [loading, setLoading] = useState(false);
    const schema = yup.object().shape({
        title: yup
            .string()
            .test("not-empty", "Title cannot be empty or spaces only", value => {
                return value?.trim().length > 0;
            })
            .required("Title is required"),
        is_quota_needed: yup
            .number()
            .oneOf([0, 1], "Please select a quota option")
            .required("Quota selection is required"),
        days: yup
            .number()
            .required("Days is required"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: "",
            is_quota_needed: undefined,
            days: 0,
        },
    });

    useEffect(() => {
        if (selectedData) {
            reset({
                title: selectedData.title,
                is_quota_needed: selectedData.is_quota_needed,
                days: selectedData.days,
            });
        }
    }, [selectedData, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/leave-type/${selectedData.id}`,
                {
                    title: data.title,
                    is_quota_needed: data.is_quota_needed,
                    days: data.days,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    text: "Leave type updated successfully",
                    icon: "success",
                    timer: 1500,
                });
                setRefetch(!isRefetch);
                onClose();
                reset();
            } else {
                Swal.fire({
                    text: "Failed to update leave type",
                    icon: "error",
                    timer: 1500,
                });
            }
        } catch (error) {
            console.error("Error:", error);
            
            if (error.response?.status === 400) {
                Swal.fire({
                    text: error.response.data.message || "Invalid input data",
                    icon: "error",
                    timer: 2000,
                });
            } else if (error.response?.status === 404) {
                Swal.fire({
                    text: "Leave type not found",
                    icon: "error",
                    timer: 2000,
                });
            } else if (error.response?.status === 500) {
                Swal.fire({
                    text: "Server error. Please try again later.",
                    icon: "error",
                    timer: 2000,
                });
            } else {
                Swal.fire({
                    text: "Network error. Please check your connection.",
                    icon: "error",
                    timer: 2000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Update Data Leave Type</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="form-group mb-2">
                        <label className="form-label mb-1">Title<span className="text-red-500">*</span></label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    className={clsx(
                                        "input",
                                        errors.title ? "border-red-500 hover:border-red-500" : ""
                                    )}
                                />
                            )}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="form-group mb-2">
                        <label className="form-label mb-2">Quota Setting<span className="text-red-500">*</span></label>
                        <Controller
                            name="is_quota_needed"
                            control={control}
                            render={({ field }) => (
                                <div className="flex gap-12">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm mr-2"
                                            checked={field.value === 0}
                                            onChange={() => field.onChange(0)}
                                        />
                                        <span className="text-sm">Subject to Quota Limit</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm mr-2"
                                            checked={field.value === 1}
                                            onChange={() => field.onChange(1)}
                                        />
                                        <span className="text-sm">Unlimited (No Quota)</span>
                                    </label>
                                </div>
                            )}
                        />
                        {errors.is_quota_needed && (
                            <p className="text-red-500 text-sm mt-1">{errors.is_quota_needed.message}</p>
                        )}
                    </div>
                </div>
                <div className="modal-footer justify-end flex-shrink-0">
                    <div className="flex gap-2">
                        <button type="button" className="btn btn-light" onClick={onClose}>
                            Discard
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 mr-3 text-white"
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
                                "Submit"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateModal;