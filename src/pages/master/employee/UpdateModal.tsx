import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import AsyncSelect from "react-select/async";

const genderOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
];

const UpdateModal = ({ isModalOpen, onClose, selectedData, setRefetch, isRefetch }) => {
    const [loading, setLoading] = useState(false);
    const schema = yup.object().shape({
        name: yup
            .string()
            .required("Full name is required."),
        nrp: yup
            .string()
            .required("NRP is required."),
        email: yup
            .string()
            .email("Invalid email format.")
            .required("Email is required."),
        phone: yup
            .string()
            .required("Phone number is required."),
        bdate: yup
            .string()
            .required("Birth date is required."),
        gender: yup
            .object({
                value: yup.string().required("Gender is required."),
                label: yup.string().required("Gender is required."),
            })
            .required("Gender is required."),
        marital_status: yup
            .object({
                value: yup.string().required("Marital status is required."),
                label: yup.string().required("Marital status is required."),
            })
            .required("Marital status is required."),
        address: yup
            .string()
            .required("Address is required."),
        vendor: yup
            .object({
                value: yup.string().required("Vendor is required."),
                label: yup.string().required("Vendor is required."),
            })
            .required("Vendor is required."),
        join_date: yup
            .string()
            .required("Join date is required."),
        end_date: yup
            .string()
            .required("End date is required."),
        worklocation: yup
            .object({
                value: yup.string().required("Worklocation is required."),
                label: yup.string().required("Worklocation is required."),
            })
            .required("Worklocation is required."),
        plant: yup
            .object({
                value: yup.string().required("Plant is required."),
                label: yup.string().required("Plant is required."),
            })
            .required("Plant is required."),
        klasifikasi: yup
            .object({
                value: yup.string().required("Classification is required."),
                label: yup.string().required("Classification is required."),
            })
            .required("Classification is required."),
        superior: yup
            .object({
                value: yup.string().required("Superior is required."),
                label: yup.string().required("Superior is required."),
                section_code: yup.string().nullable(),
                section: yup.string().nullable(),
                divid: yup.string().nullable(),
                companyid: yup.string().nullable(),
                company_name: yup.string().nullable(),
                dept: yup.string().nullable(),
                department: yup.string().nullable(),
                division: yup.string().nullable(),
            })
            .required("Superior is required."),
        section: yup
            .string(),
        department: yup
            .string(),
        division: yup
            .string(),
        title: yup
            .string()
            .required("Title is required."),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            nrp: "",
            email: "",
            phone: "",
            bdate: "",
            gender: null,
            marital_status: null,
            address: "",
            vendor: null,
            join_date: "",
            end_date: "",
            worklocation: null,
            plant: null,
            klasifikasi: null,
            superior: null,
            section: "",
            department: "",
            division: "",
            title: "",
        },
    });

    useEffect(() => {
        const fetchAndSet = async () => {
            const [userDetail] = selectedData.user_detail || [];

            const formatDate = (dateString) => {
                return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
            };

            const [maritalStatus, vendor, worklocation, plant, klasifikasi, superior] = await Promise.all([
                userDetail?.marital_status
                    ? getSelectedMaritalStatus(userDetail.marital_status)
                    : null,
                userDetail?.vendor
                    ? getSelectedVendor(userDetail.vendor)
                    : null,
                selectedData?.worklocation_code
                    ? getSelectedWorklocation(selectedData.worklocation_code)
                    : null,
                userDetail?.plant
                    ? getSelectedPlant(userDetail.plant)
                    : null,
                userDetail?.klasifikasi
                    ? getSelectedKlasifikasi(userDetail.klasifikasi)
                    : null,
                selectedData?.superior
                    ? getSelectedSuperior(selectedData.superior)
                    : null,
            ]);

            reset({
                name: selectedData.name,
                nrp: selectedData.personal_number,
                email: selectedData.email,
                phone: selectedData.phone,
                bdate: formatDate(userDetail?.birth_date),
                gender: genderOptions.find(opt => opt.value === userDetail?.gender) ?? null,
                marital_status: maritalStatus,
                address: userDetail?.address,
                vendor: vendor,
                join_date: formatDate(userDetail?.join_date),
                end_date: formatDate(userDetail?.end_date),
                plant: plant,
                klasifikasi: klasifikasi,
                superior: superior,
                department: selectedData.department,
                section: selectedData.section,
                division: selectedData.division,
                title: selectedData.title,
                worklocation: worklocation,
            });
        };

        if (selectedData) fetchAndSet();
    }, [selectedData, reset]);

    const onSubmit = async (data) => {
        if (new Date(data.join_date) > new Date(data.end_date)) {
            Swal.fire({
                icon: "error",
                title: "Invalid Date Range",
                text: "Join Date cannot be later than End Date!",
            });
            return;
        }
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/user/${selectedData.id}`,
                {
                    ...data,
                    name: data.name,
                    nrp: data.nrp,
                    email: data.email,
                    phone: data.phone,
                    bdate: data.bdate,
                    gender: data.gender.value,
                    marital_status: data.marital_status?.value,
                    address: data.address,
                    vendor: data.vendor.value,
                    join_date: data.join_date,
                    end_date: data.end_date,
                    plant: data.plant.value,
                    worklocation_code: data.worklocation.value,
                    worklocation_name: data.worklocation.name,
                    worklocation_lat_long: data.worklocation.lat_long,
                    klasifikasi: data.klasifikasi.value,
                    superior: data.superior.value,
                    section_code: data.superior.section_code,
                    section: data.superior.section,
                    dept: data.superior.dept,
                    department: data.superior.department,
                    divid: data.superior.divid,
                    division: data.superior.division,
                    companyid: data.superior.companyid,
                    company_name: data.superior.company_name,
                    title: data.title,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 200) {
                Swal.fire({
                    text: "User updated successfully",
                    icon: "success",
                    timer: 1500,
                });
                setRefetch(!isRefetch);
                onClose();
                reset();
            }
        } catch (error) {
            console.error(error);
            const errorMessage =
                error?.response?.data?.message || "Something went wrong";
            Swal.fire({
                text: errorMessage,
                icon: "error",
                timer: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    const maritalOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getMarital`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((marital) => ({
                    value: marital.id,
                    label: marital.code + " | " + marital.ket,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const getSelectedMaritalStatus = async (selectedId) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getMarital`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: "",
                },
            });

            if (response.data.success) {
                const list = response.data.data.data;
                const found = list.find((m) => m.id === selectedId);

                return found
                    ? {
                        value: found.id,
                        label: found.code + " | " + found.ket,
                    }
                    : null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching marital status:", error);
            return null;
        }
    };

    // Helper untuk ambil data Vendor
    const vendorOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getVendor`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: inputValue }
            });
            if (response.data.success) {
                return response.data.data.data.map((vendor) => ({
                    value: vendor.id,
                    label: vendor.name,
                }));
            } else return [];
        } catch (error) {
            console.error("Error fetching vendor:", error);
            return [];
        }
    };

    const getSelectedVendor = async (selectedId) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getVendor`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: "" }
            });
            if (response.data.success) {
                const list = response.data.data.data;
                const found = list.find((v) => v.id === selectedId);

                return found
                    ? {
                        value: found.id,
                        label: found.code + " | " + found.name,
                    }
                    : null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching selected vendor:", error);
            return null;
        }
    };

    // Worklocation
    const worklocationOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/worklocation`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((worklocation) => ({
                    value: worklocation.worklocation_code,
                    label: worklocation.worklocation_code + " | " + worklocation.worklocation_name,
                    name: worklocation.worklocation_name,
                    lat_long: worklocation.worklocation_lat_long,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const getSelectedWorklocation = async (selectedCode) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/worklocation`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: "" }
            });
            if (response.data.success) {
                const list = response.data.data.data;
                const found = list.find((v) => v.worklocation_code === selectedCode);

                return found
                    ? {
                        value: found.worklocation_code,
                        label: found.worklocation_code + " | " + found.worklocation_name,
                    }
                    : null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching selected worklocation:", error);
            return null;
        }
    };

    // Plant
    const plantOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getPlant`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((plant) => ({
                    value: plant.plant_name,
                    label: plant.plant_name,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const getSelectedPlant = async (selectedId) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getPlant`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: "" }
            });
            if (response.data.success) {
                const list = response.data.data.data;
                const found = list.find((v) => v.plant_name === selectedId);

                return found
                    ? {
                        value: found.plant_name,
                        label: found.plant_name,
                    }
                    : null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching selected plant:", error);
            return null;
        }
    };

    // Klasifikasi
    const klasifikasiOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getKlasifikasi`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: inputValue }
            });
            if (response.data.success) {
                return response.data.data.data.map((klas) => ({
                    value: klas.id,
                    label: klas.name
                }));
            } else return [];
        } catch (error) {
            console.error("Error fetching klasifikasi:", error);
            return [];
        }
    };

    const getSelectedKlasifikasi = async (selectedId) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getKlasifikasi`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: "" }
            });
            if (response.data.success) {
                const found = response.data.data.data.find((k) => k.id === selectedId);
                return found ? { value: found.id, label: found.name } : null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching selected klasifikasi:", error);
            return null;
        }
    };

    // Superior
    const superiorOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getSuperior`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: inputValue }
            });
            if (response.data.success) {
                return response.data.data.data.map((sup) => ({
                    value: sup.personal_number,
                    label: sup.name,
                    section_code: sup.section_code,
                    section: sup.section,
                    dept: sup.dept,
                    department: sup.department,
                    divid: sup.divid,
                    division: sup.division,
                    companyid: sup.companyid,
                    company_name: sup.company_name,
                }));
            } else return [];
        } catch (error) {
            console.error("Error fetching superior:", error);
            return [];
        }
    };

    const getSelectedSuperior = async (selectedId) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getSuperior`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: "" }
            });
            if (response.data.success) {
                const found = response.data.data.data.find((sup) => sup.personal_number === selectedId);
                return found ? {
                    value: found.personal_number,
                    label: found.name,
                    section_code: found.section_code,
                    section: found.section,
                    dept: found.dept,
                    department: found.department,
                    divid: found.divid,
                    division: found.division,
                    companyid: found.companyid,
                    company_name: found.company_name,
                } : null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching selected superior:", error);
            return null;
        }
    };

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Update Data User</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Full Name<span className="text-red-500">*</span></label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.name && "border-red-500")} />
                                )}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">NRP<span className="text-red-500">*</span></label>
                            <Controller
                                name="nrp"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.nrp && "border-red-500")} />
                                )}
                            />
                            {errors.nrp && <p className="text-red-500 text-sm mt-1">{errors.nrp.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Email<span className="text-red-500">*</span></label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.email && "border-red-500")} />
                                )}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Phone/WA<span className="text-red-500">*</span></label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.phone && "border-red-500")} />
                                )}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Birth Date<span className="text-red-500">*</span></label>
                            <Controller
                                name="bdate"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="date" className={clsx("input", errors.bdate && "border-red-500")} />
                                )}
                            />
                            {errors.bdate && <p className="text-red-500 text-sm mt-1">{errors.bdate.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Gender<span className="text-red-500">*</span></label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={genderOptions}
                                        className="w-full text-sm"
                                        placeholder="Select..."
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.gender ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                        onChange={(selectedOption) => field.onChange(selectedOption)}
                                        value={field.value}
                                    />
                                )}
                            />
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                        </div>
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Marital Status<span className="text-red-500">*</span></label>
                            <Controller
                                name="marital_status"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={maritalOptions}
                                        placeholder="Select.."
                                        className="w-full text-sm"
                                        value={field.value || null}
                                        onChange={(selectedOption) => field.onChange(selectedOption)}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.marital_status ? "#EF4444" : "#DBDFE9",
                                                "&:hover": {
                                                    borderColor: state.isFocused ? "#DBDFE9" : "#EF4444",
                                                },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.marital_status && (
                                <p className="text-red-500 text-sm mt-1">{errors.marital_status.message}</p>
                            )}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Address<span className="text-red-500">*</span></label>
                            <Controller
                                name="address"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        rows={6}
                                        className={clsx("textarea", errors.address && "border-red-500")}
                                        placeholder="Address"
                                    />
                                )}
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Vendor<span className="text-red-500">*</span></label>
                            <Controller
                                name="vendor"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={vendorOptions}
                                        placeholder="Select.."
                                        className="w-full text-sm"
                                        value={field.value || null}
                                        onChange={(selectedOption) => field.onChange(selectedOption)}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.marital_status ? "#EF4444" : "#DBDFE9",
                                                "&:hover": {
                                                    borderColor: state.isFocused ? "#DBDFE9" : "#EF4444",
                                                },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.vendor && <p className="text-red-500 text-sm mt-1">{errors.vendor.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Join Date<span className="text-red-500">*</span></label>
                            <Controller
                                name="join_date"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="date" className={clsx("input", errors.join_date && "border-red-500")} />
                                )}
                            />
                            {errors.join_date && <p className="text-red-500 text-sm mt-1">{errors.join_date.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">End Date<span className="text-red-500">*</span></label>
                            <Controller
                                name="end_date"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="date"
                                        className={clsx("input", errors.end_date && "border-red-500")} />
                                )}
                            />
                            {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Worklocation<span className="text-red-500">*</span></label>
                            <Controller
                                name="worklocation"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={worklocationOptions}
                                        placeholder="Select.."
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.worklocation ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.worklocation && <p className="text-red-500 text-sm mt-1">{errors.worklocation.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Plant<span className="text-red-500">*</span></label>
                            <Controller
                                name="plant"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={plantOptions}
                                        placeholder="Select.."
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.plant ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.plant && <p className="text-red-500 text-sm mt-1">{errors.plant.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Klasifikasi<span className="text-red-500">*</span></label>
                            <Controller
                                name="klasifikasi"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={klasifikasiOptions}
                                        placeholder="Select.."
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.klasifikasi ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.klasifikasi && <p className="text-red-500 text-sm mt-1">{errors.klasifikasi.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Superior<span className="text-red-500">*</span></label>
                            <Controller
                                name="superior"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={superiorOptions}
                                        placeholder="Select.."
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.superior ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                        onChange={(selected) => {
                                            field.onChange(selected);
                                            setValue("department", selected?.department || "");
                                            setValue("section", selected?.section || "");
                                            setValue("division", selected?.division || "");
                                        }}
                                    />
                                )}
                            />
                            {errors.superior && <p className="text-red-500 text-sm mt-1">{errors.superior.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Department<span className="text-red-500">*</span></label>
                            <Controller
                                name="department"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.department && "border-red-500")}
                                        placeholder="Department"
                                        readOnly />
                                )}
                            />
                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Section</label>
                            <Controller
                                name="section"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.section && "border-red-500")}
                                        placeholder="Section"
                                        readOnly />
                                )}
                            />
                            {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Division<span className="text-red-500">*</span></label>
                            <Controller
                                name="division"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.division && "border-red-500")}
                                        placeholder="Division"
                                        readOnly />
                                )}
                            />
                            {errors.division && <p className="text-red-500 text-sm mt-1">{errors.division.message}</p>}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Title<span className="text-red-500">*</span></label>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.title && "border-red-500")}
                                        placeholder="Title" />
                                )}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
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