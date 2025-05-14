import Modal from "@/components/Modal";
import DataTable from "../../../components/Datatables";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import axios from "axios";
import AsyncSelect from "react-select/async";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { headers } from "next/headers";

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
    const [inputMethod, setInputMethod] = useState<"excel" | "table">("excel");

    const schema = yup.object().shape({
        inputMethod: yup.string().required(),

        id_user: yup
            .array()
            .min(1, "Employee selection is required")
            .required("Employee selection is required"),

        leave_type_id: yup
            .object({
                value: yup.string().required("Leave type is required"),
                label: yup.string().required("Leave type is required"),
            })
            .required("Leave type is required"),

        valid_from: yup
            .string()
            .required("Valid from is required"),

        valid_to: yup
            .string()
            .required("Valid to is required"),

        leave_quota: yup
            .array()
            .required("Leave quota is required"),

        leave_quota_1: yup
            .number()
            .required("Leave quota is required"),

        file: yup
            .mixed()
            .when(inputMethod, {
                is: "excel",
                then: (schema) => schema.required("File is required"),
                otherwise: (schema) => schema.notRequired(),
            }),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            inputMethod: "excel",
            id_user: [],
            leave_type_id: null,
            leave_quota: [],
            valid_from: "",
            valid_to: "",
            file: null,
        },
    });

    type IEmployee = {
        email: string;
        name: string;
        personal_number: string;
    };

    const columns: ColumnDef<IEmployee>[] = [
        {
            id: "select",
            header: ({ table }) => {
                const selectedIds = watch("id_user") || [];

                const allIds = table.getRowModel().rows.map((row) => row.original.personal_number).filter(Boolean);
                const isAllSelected = allIds.every((nrp) => selectedIds.includes(nrp));

                const handleSelectAll = (checked: boolean) => {
                    setValue("id_user", checked ? allIds : []);
                };

                return (
                    <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                );
            },
            cell: ({ row }) => {
                const selectedIds = watch("id_user") || [];
                const nrp = row.original.personal_number;

                if (!nrp) return "NRP Tidak Ada";

                const handleSelect = (checked: boolean, nrp: string) => {
                    const prev = getValues("id_user") || [];

                    const newSelected = checked
                        ? [...prev, nrp]
                        : prev.filter((val) => val !== nrp);

                    setValue("id_user", newSelected);
                };

                return (
                    <div className="flex justify-center">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            value={nrp}
                            checked={selectedIds.includes(nrp)}
                            onChange={(e) => handleSelect(e.target.checked, nrp)}
                        />
                    </div>
                );
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            accessorKey: "personal_number",
            header: "NRP",
            enableSorting: true,
        },
        {
            accessorKey: "name",
            header: "Name",
            enableSorting: true,
            cell: ({ row }) => row.original.name || "Unknown",
        },
    ];

    useEffect(() => {
        if (isModalOpen === false) {
            reset();
        }
        if (inputMethod === "excel") {
            setValue("leave_quota", []);
            setValue("id_user", []);
        } else {
            setValue("file", null);
            setFile(null);
        }
        setValue("inputMethod", "excel");

    }, [isModalOpen, reset, inputMethod]);

    const onSubmit = async (data) => {
        if (new Date(data.valid_from) > new Date(data.valid_to)) {
            Swal.fire({
                icon: "error",
                title: "Invalid Date Range",
                text: "Valid From cannot be later than Valid To!",
            });
            return;
        }

        try {
            if (!data.id_user || data.id_user.length === 0) {
                Swal.fire({
                    icon: "error",
                    title: "Select User",
                    text: "Please select at least 1 user!",
                });
                return;
            }

            const selectedUsers = watch("id_user") || [];

            const finalQuota = inputMethod === "excel"
                ? data.leave_quota
                : selectedUsers.map(() => Number(data.leave_quota_1));

            const payload = {
                id_user: watch("id_user") || [],
                id_leave_type: data.leave_type_id?.value,
                leave_quota: finalQuota,
                valid_from: data.valid_from,
                valid_to: data.valid_to,
            };
            
            const token = Cookies.get("token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/trx/leave-quota`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.status == 201) {
                Swal.fire({
                    text: "Transaction leave quota added successfully",
                    icon: "success",
                    timer: 1500,
                });
                setRefetch(!isRefetch);
                onClose();
                setFile(null);
                reset();
            } else {
                onClose();
                reset();
            }
        } catch (error) {
            // console.error("Error:", error);
            // alert("Terjadi kesalahan, silakan coba lagi.");
            const errorMessage =
                error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi.";
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: errorMessage,
            });
        }
    };

    const leaveTypeOptions = async (inputValue) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/master/leave-type`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: inputValue,
                }
            });
            if (response.data.success) {
                return response.data.data.data.map((leave_type) => ({
                    value: leave_type.id,
                    label: leave_type.title,
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const [file, setFile] = useState<File | null>(null);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [] },
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                handleFileUpload(file);
            }
        },
    });

    const handleDownloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/template_leave_quota.xlsx";
        link.download = "template_leave_quota.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (file: File) => {
        setFile(file);
        setValue("file", file);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData: { NRP: string; Nama: string; Quota?: number }[] = XLSX.utils.sheet_to_json(sheet);

            // Ambil NRP
            const nrpList = jsonData.map((row) => row.NRP).filter((nrp) => !!nrp);
            const quotaList = jsonData.map((row) => row.Quota).filter((quota) => typeof quota === "number");

            setValue("id_user", nrpList);
            setValue("leave_quota", quotaList);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">Add Transaction Leave Quota</h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={() => { setFile(null); onClose(); }}>
                    <i className="ki-outline ki-cross"></i>
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="form-group mb-2">
                            <label className="form-label mb-1">Leave Type</label>
                            <Controller
                                name="leave_type_id"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={leaveTypeOptions}
                                        placeholder="Select.."
                                        className={clsx("w-full text-sm")}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: errors.leave_type_id ? "#EF4444" : "#DBDFE9",
                                                "&:hover": { borderColor: state.isFocused ? "#DBDFE9" : "#EF4444" },
                                            }),
                                        }}
                                        onChange={(selectedOption) => {
                                            field.onChange(selectedOption);
                                        }}
                                    />
                                )}
                            />
                            {errors.leave_type_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.leave_type_id.message}</p>
                            )}
                        </div>
                        {inputMethod === "table" && (
                            <div className="form-group mb-2">
                                <label className="form-label mb-1">Leave Quota</label>
                                <Controller
                                    name="leave_quota_1"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            className={clsx(
                                                "input",
                                                errors.leave_quota_1 ? "border-red-500 hover:border-red-500" : ""
                                            )}
                                            placeholder="Leave Quota"
                                        />
                                    )}
                                />
                                {errors.leave_quota_1 && (
                                    <p className="text-red-500 text-sm mt-1">{errors.leave_quota_1.message}</p>
                                )}
                            </div>
                        )}
                        <div className="form-group col-span-2 flex items-center gap-12 mb-2">
                            <label className="form-label flex items-center gap-2.5 text-nowrap">
                                <input
                                    className="radio"
                                    name="radio2"
                                    type="radio"
                                    value="excel"
                                    checked={inputMethod === "excel"}
                                    onChange={() => {
                                        setInputMethod("excel");
                                        setValue("inputMethod", "excel");
                                    }}
                                />
                                Upload Excel
                            </label>
                            <label className="form-label flex items-center gap-2.5 text-nowrap">
                                <input
                                    className="radio"
                                    name="radio2"
                                    type="radio"
                                    value="table"
                                    checked={inputMethod === "table"}
                                    onChange={() => {
                                        setInputMethod("table");
                                        setValue("inputMethod", "table")
                                    }}
                                />
                                Checklist Table
                            </label>
                        </div>
                        {inputMethod === "excel" ? (
                            <div className="form-group col-span-2">
                                <label className="form-label mb-1">Upload Excel</label>
                                <button className="btn btn-link mb-2" onClick={handleDownloadTemplate}>
                                    Download Template Excel
                                </button>
                                <Controller
                                    name="file"
                                    control={control}
                                    render={({ field }) => (
                                        <div
                                            {...field}
                                            {...getRootProps()}
                                            className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer"
                                        >
                                            <input
                                                {...getInputProps()}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(file);
                                                }}
                                            />
                                            <p className="text-sm text-gray-600">
                                                {file ? file.name : "Click to select file or drag & drop here"}
                                            </p>
                                        </div>
                                    )}
                                />
                                {errors.file && (
                                    <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
                                )}
                                {watch("id_user")?.length > 0 && (
                                    <p className="text-green-600 text-sm mt-1">
                                        {watch("id_user").length} user berhasil diimport dari Excel.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="form-group col-span-2">
                                <DataTable
                                    title={"User List"}
                                    columns={columns}
                                    url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/user`}
                                    isRefetch={isRefetch}
                                />
                                {errors.id_user && (
                                    <p className="text-red-500 text-sm mt-1">{errors.id_user.message}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer justify-end flex-shrink-0">
                    <div className="flex gap-2">
                        <button type="button" className="btn btn-light" onClick={() => { setFile(null); onClose(); }}>
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