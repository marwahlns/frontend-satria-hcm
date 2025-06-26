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
        code: yup
            .string()
            .required("Code is required")
            .matches(/^[A-Za-z0-9]+$/, "Code can only contain letters and numbers"),

        name: yup
            .string()
            .required("Name is required")
            .test("not-empty", "Name cannot be empty or spaces only", value => {
                return value?.trim().length > 0;
            })
            .min(3, "Name must be at least 3 characters"),

        inTime: yup
            .string()
            .required("In Time is required")
            .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format must be HH:mm"),

        outTime: yup
            .string()
            .required("Out Time is required")
            .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format must be HH:mm"),

        graceBeforeIn: yup
            .number()
            .typeError("Grace Time Before In must be a number")
            .min(0, "Cannot be negative")
            .required("Grace Time Before In is required"),

        graceAfterIn: yup
            .number()
            .typeError("Grace Time After In must be a number")
            .min(0, "Cannot be negative")
            .required("Grace Time After In is required"),

        graceBeforeOut: yup
            .number()
            .typeError("Grace Time Before Out must be a number")
            .min(0, "Cannot be negative")
            .required("Grace Time Before Out is required"),

        graceAfterOut: yup
            .number()
            .typeError("Grace Time After Out must be a number")
            .min(0, "Cannot be negative")
            .required("Grace Time After Out is required"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
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
                graceAfterIn: selectedData.gt_after_in,
                graceBeforeOut: selectedData.gt_before_out,
                graceAfterOut: selectedData.gt_after_out,
            });
        }
    }, [selectedData, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift/${selectedData.id}`,
                {
                    ...data,
                    nama: data.name,
                    inTime: data.inTime,
                    outTime: data.outTime,
                    gtBeforeIn: data.graceBeforeIn,
                    gtAfterIn: data.graceAfterIn,
                    gtBeforeOut: data.graceBeforeOut,
                    gtAfterOut: data.graceAfterOut,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "Shift updated successfully",
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Update Data Shift</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Code<span className="text-red-500">*</span></label>
                            <Controller
                                name="code"
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
                            {errors.code && (
                                <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Name<span className="text-red-500">*</span></label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            "input",
                                            errors.name ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">In Time<span className="text-red-500">*</span></label>
                            <Controller
                                name="inTime"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="time"
                                        className={clsx(
                                            "input",
                                            errors.inTime ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.inTime && (
                                <p className="text-red-500 text-sm mt-1">{errors.inTime.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Out Time<span className="text-red-500">*</span></label>
                            <Controller
                                name="outTime"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="time"
                                        className={clsx(
                                            "input",
                                            errors.outTime ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.outTime && (
                                <p className="text-red-500 text-sm mt-1">{errors.outTime.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time Before In (Minutes)<span className="text-red-500">*</span></label>
                            <Controller
                                name="graceBeforeIn"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                            errors.graceBeforeIn ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.graceBeforeIn && (
                                <p className="text-red-500 text-sm mt-1">{errors.graceBeforeIn.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time After In (Minutes)<span className="text-red-500">*</span></label>
                            <Controller
                                name="graceAfterIn"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                            errors.graceAfterIn ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.graceAfterIn && (
                                <p className="text-red-500 text-sm mt-1">{errors.graceAfterIn.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time Before Out (Minutes)<span className="text-red-500">*</span></label>
                            <Controller
                                name="graceBeforeOut"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                            errors.graceBeforeOut ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.graceBeforeOut && (
                                <p className="text-red-500 text-sm mt-1">{errors.graceBeforeOut.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Grace Time After Out (Minutes)<span className="text-red-500">*</span></label>
                            <Controller
                                name="graceAfterOut"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                            errors.graceAfterOut ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                    />
                                )}
                            />
                            {errors.graceAfterOut && (
                                <p className="text-red-500 text-sm mt-1">{errors.graceAfterOut.message}</p>
                            )}
                        </div>
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