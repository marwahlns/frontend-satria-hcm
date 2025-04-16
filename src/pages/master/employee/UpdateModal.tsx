import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";

const UpdateModal = ({ isModalOpen, onClose, selectedData, setRefetch, isRefetch }) => {
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
            .string()
            .required("Marital status is required."),
        address: yup
            .string()
            .required("Address is required."),
        vendor: yup
            .string()
            .required("Vendor is required."),
        join_date: yup
            .string()
            .required("Join date is required."),
        end_date: yup
            .string()
            .required("End date is required."),
        plant: yup
            .string()
            .required("Plant is required."),
        klasifikasi: yup
            .string()
            .required("Classification is required."),
        manager: yup
            .string(),
        department: yup
            .string()
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
        if (selectedData) {
            reset({
                name: selectedData.name,
                nrp: selectedData.user_detail?.nrp || "",
                email: selectedData.email,
                phone: selectedData.phone,
                bdate: selectedData.user_detail?.birth_date
                    ? new Date(selectedData.user_detail.birth_date).toISOString().split("T")[0]
                    : "",
                gender: selectedData.user_detail?.gender,
                marital_status: selectedData.user_detail?.marital_status,
                address: selectedData.user_detail?.address,
                vendor: selectedData.user_detail?.vendor,
                join_date: selectedData.user_detail?.join_date
                    ? new Date(selectedData.user_detail.join_date).toISOString().split("T")[0]
                    : "",
                end_date: selectedData.user_detail?.end_date
                    ? new Date(selectedData.user_detail.end_date).toISOString().split("T")[0]
                    : "",
                plant: selectedData.user_detail?.plant,
                klasifikasi: selectedData.user_detail?.klasifikasi,
                manager: selectedData.user_detail?.manager,
                department: selectedData.department,
                section: selectedData.section,
                division: selectedData.division,
            });
        }
    }, [selectedData, reset]);

    const onSubmit = async (data) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/master/user/${selectedData.id}`,
                {
                    ...data,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    bdate: data.bdate,
                    gender: data.gender,
                    marital_status: data.marital_status,
                    address: data.address,
                    vendor: data.vendor,
                    join_date: data.join_date,
                    end_date: data.end_date,
                    plant: data.plant,
                    klasifikasi: data.klasifikasi,
                    nrp: data.nrp,
                    department: data.department,
                    section: data.section,
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
                    text: "User updated successfully",
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

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Update Data User</h3>
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
                                    <input {...field} type="text" className={clsx("input", errors.name && "border-red-500")} />
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
                                    <input {...field} type="text" className={clsx("input", errors.nrp && "border-red-500")} />
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
                                    <input {...field} type="text" className={clsx("input", errors.email && "border-red-500")} />
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
                                    <input {...field} type="text" className={clsx("input", errors.phone && "border-red-500")} />
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
                                    <Select
                                        {...field}
                                        options={genderOptions}
                                        className="w-full text-sm"
                                        placeholder="Select..."
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.marital_status ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                        onChange={(selectedOption) => field.onChange(selectedOption.value)}
                                        value={genderOptions.find((option) => option.value === field.value)}
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
                                    />
                                )}
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Vendor</label>
                            <Controller
                                name="marital_status"
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
                                                borderColor: errors.marital_status ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                        onChange={(selectedOption) => field.onChange(selectedOption.value)}
                                        value={genderOptions.find((option) => option.value === field.value)}
                                    />
                                )}
                            />
                            {errors.marital_status && <p className="text-red-500 text-sm mt-1">{errors.marital_status.message}</p>}
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
                        <div className="form-group">
                            <label className="form-label mb-1">Plant</label>
                            <Controller
                                name="plant"
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
                                                borderColor: errors.plant ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                        onChange={(selectedOption) => field.onChange(selectedOption.value)}
                                        value={genderOptions.find((option) => option.value === field.value)}
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
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.klasifikasi && "border-red-500")} />
                                )}
                            />
                            {errors.klasifikasi && <p className="text-red-500 text-sm mt-1">{errors.klasifikasi.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Supervisor</label>
                            <Controller
                                name="klasifikasi"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.klasifikasi && "border-red-500")} />
                                )}
                            />
                            {errors.klasifikasi && <p className="text-red-500 text-sm mt-1">{errors.klasifikasi.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Department</label>
                            <Controller
                                name="department"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input", errors.department && "border-red-500")} />
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
                                        className={clsx("input", errors.section && "border-red-500")} />
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
                                        className={clsx("input", errors.division && "border-red-500")} />
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

export default UpdateModal;