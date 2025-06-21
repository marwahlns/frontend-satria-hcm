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

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
    const [loading, setLoading] = useState(false);
    const [selectedShifts, setSelectedShifts] = useState({});

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
            }),

        hari: yup.object().shape({
            monday: yup
                .mixed()
                .required("Required"),
            tuesday: yup
                .mixed()
                .required("Required"),
            wednesday: yup
                .mixed()
                .required("Required"),
            thursday: yup
                .mixed()
                .required("Required"),
            friday: yup
                .mixed()
                .required("Required"),
            saturday: yup
                .mixed()
                .required("Required"),
            sunday: yup
                .mixed()
                .required("Required"),
        }),
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
            hari: {},
        },
    });

    useEffect(() => {
        if (isModalOpen === false) {
            reset();
        }
    }, [isModalOpen, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            let formattedDetails = Object.entries(data.hari)
                .filter(([day, shiftObj]) => shiftObj && typeof shiftObj === "object" && "value" in shiftObj)
                .map(([day, shiftObj]) => ({
                    index_day: day.charAt(0).toUpperCase() + day.slice(1),
                    id_shift: (shiftObj as { value: string }).value,
                }));

            const token = Cookies.get("token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift-group`,
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
            const errorMessage =
                error?.response?.data?.message || "Something went wrong";

            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error",
            });
            setLoading(false);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const shiftOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/shift`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((shift) => ({
                    value: shift.code,
                    label: shift.code + " | " + shift.name,
                    in_time: shift.in_time,
                    out_time: shift.out_time,
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
                <h3 className="modal-title">Add Data Shift Group</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-[400px] max-h-[65vh]">
                    <div className="form-group mb-2">
                        <label className="form-label mb-1">Code<span className="text-red-500">*</span></label>
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    className={clsx(
                                        "input",
                                        errors.code ? "border-red-500 hover:border-red-500" : ""
                                    )}
                                    placeholder="Code"
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
                                    placeholder="Name"
                                />
                            )}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="form-group mb-2">
                        <table className="w-full border-collapse border border-red-300 mt-4">
                            <thead>
                                <tr className="bg-blue-200">
                                    <th className="border border-gray-300 p-2">Day</th>
                                    <th className="border border-gray-300 p-2">Shift</th>
                                    <th className="border border-gray-300 p-2">In Time</th>
                                    <th className="border border-gray-300 p-2">Out Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                                    <tr key={day} className="text-center">
                                        <td className="border border-gray-300 p-2">
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <Controller
                                                name={`hari.${day}` as any}
                                                control={control}
                                                render={({ field }) => (
                                                    <AsyncSelect
                                                        {...field}
                                                        cacheOptions
                                                        defaultOptions
                                                        loadOptions={shiftOptions}
                                                        placeholder="Select.."
                                                        className="w-full text-sm"
                                                        styles={{
                                                            control: (base, state) => ({
                                                                ...base,
                                                                borderColor: errors.hari?.[day] ? "#EF4444" : "#DBDFE9",
                                                                "&:hover": {
                                                                    borderColor: state.isFocused ? "#DBDFE9" : "#EF4444",
                                                                },
                                                            }),
                                                        }}
                                                        onChange={(selectedOption) => {
                                                            field.onChange(selectedOption);
                                                            setSelectedShifts((prev) => ({
                                                                ...prev,
                                                                [day]: selectedOption,
                                                            }));
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                className="cursor-not-allowed w-full text-center"
                                                type="time"
                                                readOnly
                                                value={selectedShifts?.[day]?.in_time || ""}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                className="cursor-not-allowed w-full text-center"
                                                type="time"
                                                readOnly
                                                value={selectedShifts?.[day]?.out_time || ""}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default CreateModal;