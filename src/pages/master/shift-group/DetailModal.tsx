import Modal from "@/components/Modal";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import { useEffect, useState } from "react";

const DetailModal = ({ isModalOpen, onClose, selectedData }) => {
    const [selectedShifts, setSelectedShifts] = useState({});

    const {
        control,
        reset,
    } = useForm({
        defaultValues: {
            code: "",
            name: "",
            hari: {},
        },
    });

    useEffect(() => {
        if (selectedData) {
            const mappedShifts = selectedData.details.reduce((acc, item) => {
                acc[item.index_day.toLowerCase()] = {
                    value: item.id_shift,
                    label: item.id_shift + " | " + item.MsShift.name,
                    in_time: item.MsShift.in_time || "",
                    out_time: item.MsShift.out_time || "",
                };
                return acc;
            }, {});

            reset({
                code: selectedData.code,
                name: selectedData.nama,
                hari: mappedShifts,
            });

            setSelectedShifts(mappedShifts);
        }
    }, [selectedData, reset]);

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Detail Data Shift Group</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-[400px] max-h-[65vh]">
                    <div className="form-group mb-2">
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
                                            <input
                                                className="cursor-not-allowed w-full text-center"
                                                type="text"
                                                readOnly
                                                value={selectedShifts?.[day]?.label ?? "-"}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                className="cursor-not-allowed w-full text-center"
                                                type="time"
                                                readOnly
                                                value={selectedShifts?.[day]?.in_time ?? ""}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                className="cursor-not-allowed w-full text-center"
                                                type="time"
                                                readOnly
                                                value={selectedShifts?.[day]?.out_time ?? ""}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default DetailModal;