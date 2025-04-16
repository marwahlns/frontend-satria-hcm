import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import AsyncSelect from "react-select/async";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";

const DetailModal = ({ isModalOpen, onClose, selectedData, setRefetch, isRefetch }) => {
    const schema = yup.object().shape({
        code: yup
            .string(),

        name: yup
            .string(),

        id_user: yup
            .string(),

        id_shift_group: yup
            .string(),

        valid_from: yup
            .string(),

        valid_to: yup
            .string(),
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
            id_user: "",
            id_shift_group: "",
            valid_from: "",
            valid_to: "",
        },
    });

    useEffect(() => {        
        if (selectedData) {
            reset({
                code: selectedData.code,
                id_user: selectedData.id_user,
                name: selectedData.user_name,
                valid_from: selectedData.valid_from,
                valid_to: selectedData.valid_to,
                id_shift_group: selectedData.id_shift_group + " | " + selectedData.shift_group_name,    
            });
        }
    }, [selectedData, reset]);

    const onSubmit = async (data) => {
        try {
            let formattedDetails = Object.entries(data.hari)
                .filter(([day, shiftObj]) => shiftObj && typeof shiftObj === "object" && "value" in shiftObj)
                .map(([day, shiftObj]) => ({
                    index_day: day.charAt(0).toUpperCase() + day.slice(1),
                    id_shift: (shiftObj as { value: string }).value,
                }));

            const token = Cookies.get("token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/trx/shift-employee/${selectedData.id}`,
                {
                    ...data,
                    code: data.code,
                    nama: data.name,
                    details: formattedDetails,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "Shift group added successfully",
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

    const shiftGroupOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/shift-group`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((shift_group) => ({
                    value: shift_group.code,
                    label: shift_group.code + " | " + shift_group.nama,
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
                <h3 className="modal-title">Detail Transaction Shift</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Code</label>
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
                        </div>
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
                                        type="text"
                                        className={clsx(
                                            "input",
                                            errors.valid_from ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                        readOnly
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
                                        type="text"
                                        className={clsx(
                                            "input",
                                            errors.valid_to ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                        readOnly
                                    />
                                )}
                            />
                            {errors.valid_to && (
                                <p className="text-red-500 text-sm mt-1">{errors.valid_to.message}</p>
                            )}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Shift Group</label>
                            <Controller
                                name="id_shift_group"
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
                            {errors.id_shift_group && (
                                <p className="text-red-500 text-sm mt-1">{errors.id_shift_group.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default DetailModal;