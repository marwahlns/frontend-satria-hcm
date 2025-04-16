import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
    const schema = yup.object().shape({
        location_code: yup
            .string()
            .required("Worklocation code is required"),

        location_name: yup
            .string()
            .required("Worklocation name is required"),

        location_lat_long: yup
            .string()
            .required("Latitude & longitude is required"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            location_code: "",
            location_name: "",
            location_lat_long: "",
        },
    });

    useEffect(() => {
        if (isModalOpen === false) {
            reset();
        }
    }, [isModalOpen, reset]);

    const onSubmit = async (data) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/worklocation`,
                {
                    ...data,
                    location_code: data.location_code,
                    location_name: data.location_name,
                    location_lat: data.location_lat,
                    location_long: data.location_long,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "Worklocation added successfully",
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
                <h3 className="modal-title">Add Data Worklocation</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-2">
                            <label className="form-label mb-1">Code</label>
                            <Controller
                                name="location_code"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            "input",
                                            errors.location_code ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                        placeholder="Workloaction Code"
                                    />
                                )}
                            />
                            {errors.location_code && (
                                <p className="text-red-500 text-sm mt-1">{errors.location_code.message}</p>
                            )}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Name</label>
                            <Controller
                                name="location_name"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            "input",
                                            errors.location_name ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                        placeholder="Worklocation Name"
                                    />
                                )}
                            />
                            {errors.location_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.location_name.message}</p>
                            )}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Latitude, Longitude</label>
                            <Controller
                                name="location_lat_long"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className={clsx(
                                            "input",
                                            errors.location_lat_long ? "border-red-500 hover:border-red-500" : ""
                                        )}
                                        placeholder="Latitude, Longitude"
                                    />
                                )}
                            />
                            {errors.location_lat_long && (
                                <p className="text-red-500 text-sm mt-1">{errors.location_lat_long.message}</p>
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

export default CreateModal;