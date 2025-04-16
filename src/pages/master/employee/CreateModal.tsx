import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import AsyncSelect from "react-select/async";
import clsx from "clsx";
import axios from "axios";
import Select from "react-select";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
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
            .string()
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
            })
            .required("Superior is required."),
        department: yup
            .object({
                value: yup.string().required("Department is required."),
                label: yup.string().required("Department is required."),
            })
            .required("Department is required."),
        section: yup
            .string(),
        division: yup
            .string()
            .required("Division is required."),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/user`,
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
                    section: data.section,
                    dept: data.department.value,
                    department: data.department.label,
                    division: data.division,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "User added successfully",
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

    const genderOptions = [
        { value: "Laki-laki", label: "Laki-laki" },
        { value: "Perempuan", label: "Perempuan" },
    ];

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

    const vendorOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getVendor`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((vendor) => ({
                    value: vendor.id,
                    label: vendor.code + " | " + vendor.name,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

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

    const klasifikasiOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getKlasifikasi`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((klasifikasi) => ({
                    value: klasifikasi.id,
                    label: klasifikasi.name,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const superiorOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getSuperior`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((superior) => ({
                    value: superior.personal_number,
                    label: superior.name,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const departmentOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getDepartment`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((department) => ({
                    value: department.id,
                    label: department.nama,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

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

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Add Data User</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-[400px] max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Full Name</label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.name && "border-red-500")} placeholder="Full Name" />
                                )}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">NRP</label>
                            <Controller
                                name="nrp"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.nrp && "border-red-500")} placeholder="NRP" />
                                )}
                            />
                            {errors.nrp && <p className="text-red-500 text-sm mt-1">{errors.nrp.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Email</label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.email && "border-red-500")} placeholder="example@domain.com" />
                                )}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Phone/WA</label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input", errors.phone && "border-red-500")} placeholder="Phone/WA" />
                                )}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Birth Date</label>
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
                            <label className="form-label mb-1">Gender</label>
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
                                        onChange={(selectedOption) => field.onChange(selectedOption.value)}
                                        value={genderOptions.find((option) => option.value === field.value)}
                                    />
                                )}
                            />
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Marital Status</label>
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
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.marital_status ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                        onChange={(selectedOption) => {
                                            field.onChange(selectedOption);
                                        }}
                                    />
                                )}
                            />
                            {errors.marital_status && <p className="text-red-500 text-sm mt-1">{errors.marital_status.message}</p>}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Address</label>
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
                            <label className="form-label mb-1">Vendor</label>
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
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.vendor ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.vendor && <p className="text-red-500 text-sm mt-1">{errors.vendor.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Join Date</label>
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
                            <label className="form-label mb-1">End Date</label>
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
                            <label className="form-label mb-1">Worklocation</label>
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
                            <label className="form-label mb-1">Plant</label>
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
                            <label className="form-label mb-1">Klasifikasi</label>
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
                            <label className="form-label mb-1">superior</label>
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
                                    />
                                )}
                            />
                            {errors.superior && <p className="text-red-500 text-sm mt-1">{errors.superior.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Department</label>
                            <Controller
                                name="department"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={departmentOptions}
                                        placeholder="Select.."
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.department ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                    />
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
                                        placeholder="Section" />
                                )}
                            />
                            {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Division</label>
                            <Controller
                                name="division"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.division && "border-red-500")}
                                        placeholder="Division" />
                                )}
                            />
                            {errors.division && <p className="text-red-500 text-sm mt-1">{errors.division.message}</p>}
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