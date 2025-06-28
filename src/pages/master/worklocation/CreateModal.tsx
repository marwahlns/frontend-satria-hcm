import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";

// Dynamic import untuk MapPicker (menghindari SSR issues)
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64 bg-gray-100 rounded">Loading map...</div>
});

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);

    const schema = yup.object().shape({
        location_code: yup
            .string()
            .test("not-empty", "Worklocation code cannot be empty or spaces only", value => {
                return value?.trim().length > 0;
            })
            .required("Worklocation code is required"),

        location_name: yup
            .string()
            .test("not-empty", "Worklocation name cannot be empty or spaces only", value => {
                return value?.trim().length > 0;
            })
            .required("Worklocation name is required"),

        location_lat_long: yup
            .string()
            .required("Latitude & longitude is required.")
            .matches(
                /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/,
                "Invalid latitude & longitude format. Use numbers, commas, and hyphens (e.g., -6.234, 106.876)."
            )
            .test(
                "not-empty-or-spaces",
                "Latitude & longitude cannot be empty or spaces only.",
                (value) => {
                    return value ? value.trim().length > 0 : false;
                }
            ),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            location_code: "",
            location_name: "",
            location_lat_long: "",
        },
    });

    const watchedLatLong = watch("location_lat_long");

    useEffect(() => {
        if (isModalOpen === false) {
            reset();
            setSelectedPosition(null);
            setShowMap(false);
        }
    }, [isModalOpen, reset]);

    useEffect(() => {
        if (watchedLatLong && watchedLatLong.includes(',')) {
            const [lat, lng] = watchedLatLong.split(',').map(coord => parseFloat(coord.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
                setSelectedPosition({ lat, lng });
            }
        }
    }, [watchedLatLong]);

    const handleMapSelect = (position) => {
        setSelectedPosition(position);
        setValue("location_lat_long", `${position.lat}, ${position.lng}`);
    };

    const toggleMap = () => {
        setShowMap(!showMap);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/worklocation`,
                {
                    location_code: data.location_code,
                    location_name: data.location_name,
                    location_lat_long: data.location_lat_long,
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
            Swal.fire({
                text: "Failed to add worklocation",
                icon: "error",
                timer: 1500,
            });
        } finally {
            setLoading(false);
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
                            <label className="form-label mb-1">Code<span className="text-red-500">*</span></label>
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
                            <label className="form-label mb-1">Name<span className="text-red-500">*</span></label>
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
                            <label className="form-label mb-1">Latitude, Longitude<span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <Controller
                                    name="location_lat_long"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            className={clsx(
                                                "input flex-1",
                                                errors.location_lat_long ? "border-red-500 hover:border-red-500" : ""
                                            )}
                                            placeholder="Latitude, Longitude"
                                        />
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={toggleMap}
                                    className="btn btn-outline btn-primary whitespace-nowrap"
                                >
                                    <i className="ki-outline ki-map mr-1"></i>
                                    {showMap ? "Hide Map" : "Choose on Map"}
                                </button>
                            </div>
                            {errors.location_lat_long && (
                                <p className="text-red-500 text-sm mt-1">{errors.location_lat_long.message}</p>
                            )}
                        </div>
                        
                        {/* Map Section */}
                        {showMap && (
                            <div className="col-span-2">
                                <div className="border border-gray-300 rounded p-4">
                                    <h4 className="text-sm font-medium mb-3">Click on the map to select location</h4>
                                    <MapPicker
                                        onLocationSelect={handleMapSelect}
                                        selectedPosition={selectedPosition}
                                        height="400px"
                                    />
                                    {selectedPosition && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            Selected: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                                        </div>
                                    )}
                                </div>
                            </div>
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

export default CreateModal;