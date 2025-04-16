import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";

const UpdateModal = ({ isModalOpen, onClose, selectedData, setRefetch, isRefetch }) => {

    const schema = yup.object().shape({
        title: yup
            .string()
            .required("Title is required"),

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
            days: 0,
        },
    });

    useEffect(() => {
        if (selectedData) {
            reset({
                title: selectedData.title,
                days: selectedData.days,
            });
        }
    }, [selectedData, reset]);

    const onSubmit = async (data) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/leave-type/${selectedData.id}`,
                {
                    ...data,
                    title: data.title,
                    days: data.days,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "Leave type updated successfully",
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Title</label>
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
                            <label className="form-label mb-1">Days</label>
                            <Controller
                                name="days"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        className={clsx(
                                            "input",
                                            errors.days ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                )}
                            />
                            {errors.days && (
                                <p className="text-red-500 text-sm mt-1">{errors.days.message}</p>
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