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
    const [selectedTrxShift, setSelectedTrxShift] = useState({});

    const schema = yup.object().shape({
        code: yup
            .string(),

        name: yup
            .string(),

        id_user: yup
            .string(),

        id_shift_group: yup
            .object({
                value: yup.string().required("Shift Group is required"),
                label: yup.string().required("Shift Group is required"),
            })
            .required("Shift Group is required"),

        valid_from: yup
            .string()
            .required("Valid From is required"),

        valid_to: yup
            .string()
            .required("Valid To is required"),
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
            id_shift_group: null,
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
                code: selectedData.code,
                name: selectedData.MsUser.name,
                id_user: selectedData.id_user,
                valid_from: formatDate(selectedData.valid_from),
                valid_to: formatDate(selectedData.valid_to),
                id_shift_group: selectedData.id_shift_group
                    ? {
                        value: selectedData.id_shift_group,
                        label: selectedData.id_shift_group + " | " + selectedData.MsShiftGroup.nama
                    }
                    : null,
            });
        }
    }, [selectedData, reset]);    

    const onSubmit = async (data) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/trx/shift-employee/${selectedData.id}`,
                {
                    ...data,
                    valid_from: data.valid_from,
                    valid_to: data.valid_to,
                    id_shift_group: data.id_shift_group?.value,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "Transaction shift updated successfully",
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
                <h3 className="modal-title">Update Transaction Shift</h3>
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
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Shift Group</label>
                            <Controller
                                name="id_shift_group"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={shiftGroupOptions}
                                        placeholder="Select.."
                                        className="w-full text-sm"
                                        value={field.value || null}
                                        onChange={(selectedOption) => field.onChange(selectedOption)}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.id_shift_group ? "#EF4444" : "#DBDFE9",
                                                "&:hover": {
                                                    borderColor: state.isFocused ? "#DBDFE9" : "#EF4444",
                                                },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.id_shift_group && (
                                <p className="text-red-500 text-sm mt-1">{errors.id_shift_group.message}</p>
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