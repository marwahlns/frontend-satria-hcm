import Modal from "@/components/Modal";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import { useEffect } from "react";
import Select from "react-select";

const DetailModal = ({ isModalOpen, onClose, selectedData }) => {
    const {
        control,
        reset,
    } = useForm({
        defaultValues: {
            name: "",
            nrp: "",
            email: "",
            phone: "",
            bdate: "",
            gender: null,
            marital_status: "",
            address: "",
            vendor: "",
            join_date: "",
            end_date: "",
            worklocation: "",
            plant: "",
            klasifikasi: "",
            superior: "",
            department: "",
            section: "",
            division: "",
            title: "",
        },
    });

    useEffect(() => {
        if (selectedData) {
            const [userDetail] = selectedData.user_detail || [];

            const formatDate = (dateString) => {
                if (!dateString) return "";

                const date = new Date(dateString);
                return date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });
            };

            reset({
                name: selectedData.name,
                nrp: selectedData.personal_number || "",
                email: selectedData.email,
                phone: selectedData.phone,
                bdate: formatDate(userDetail?.birth_date),
                gender: userDetail?.gender,
                marital_status: `${userDetail?.MsMarital.code} | ${userDetail?.MsMarital.ket}`,
                address: userDetail?.address,
                vendor: `${userDetail?.MsVendor.code} | ${userDetail?.MsVendor.name}`,
                join_date: formatDate(userDetail?.join_date),
                end_date: formatDate(userDetail?.end_date),
                worklocation: `${selectedData.worklocation_code} | ${selectedData.worklocation_name}`,
                plant: userDetail?.plant,
                klasifikasi: userDetail?.MsKlasifikasi.name,
                superior: selectedData.superior,
                department: selectedData.department,
                section: selectedData.section,
                division: selectedData.division,
                title:selectedData.title,
            });
        }
    }, [selectedData, reset]);

    const genderOptions = [
        { value: "Laki-laki", label: "Laki-laki" },
        { value: "Perempuan", label: "Perempuan" },
    ];

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Detail Data User</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-[400px] max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Full Name</label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input")} readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">NRP</label>
                            <Controller
                                name="nrp"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input")} readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Email</label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input")} readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Phone/WA</label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input")} readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Birth Date</label>
                            <Controller
                                name="bdate"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text" className={clsx("input")} readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Gender</label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text"
                                        className={clsx("input")} readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Marital Status</label>
                            <Controller
                                name="marital_status"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text"
                                        className={clsx("input")} readOnly />
                                )}
                            />
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
                                        className={clsx("textarea")}
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Vendor</label>
                            <Controller
                                name="vendor"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} type="text"
                                        className={clsx("input")} readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Join Date</label>
                            <Controller
                                name="join_date"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">End Date</label>
                            <Controller
                                name="end_date"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Worklocation</label>
                            <Controller
                                name="worklocation"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Plant</label>
                            <Controller
                                name="plant"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Klasifikasi</label>
                            <Controller
                                name="klasifikasi"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Superior</label>
                            <Controller
                                name="superior"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Department</label>
                            <Controller
                                name="department"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Section</label>
                            <Controller
                                name="section"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label mb-1">Division</label>
                            <Controller
                                name="division"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                        <div className="form-group col-span-2">
                            <label className="form-label mb-1">Title</label>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <input {...field}
                                        type="text"
                                        className={clsx("input")}
                                        readOnly />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default DetailModal;