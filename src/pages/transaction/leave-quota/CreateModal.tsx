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

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

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

    valid_from: yup.string().required("Valid from is required"),

    valid_to: yup.string().required("Valid to is required"),

    leave_quota: yup.array().when('inputMethod', {
      is: 'excel',
      then: (schema) => schema
        .min(1, "Leave quota is required")
        .test('all-numbers', 'All quota values must be valid numbers', (value) => {
          if (!value) return false;
          return value.every(quota =>
            typeof quota === 'number' &&
            !isNaN(quota) &&
            quota >= 0 &&
            Number.isInteger(quota)
          );
        }),
      otherwise: (schema) => schema.notRequired(),
    }),

    leave_quota_1: yup.number().when('inputMethod', {
      is: 'table',
      then: (schema) => schema
        .required("Leave quota is required")
        .min(0, "Leave quota must be 0 or positive")
        .integer("Leave quota must be a whole number"),
      otherwise: (schema) => schema.notRequired().nullable().transform((value, originalValue) => originalValue === '' ? null : value),
    }),

    file: yup.mixed().when('inputMethod', {
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
    register,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      inputMethod: "excel",
      id_user: [],
      leave_type_id: null,
      leave_quota: [],
      leave_quota_1: null,
      valid_from: "",
      valid_to: "",
      file: null,
    },
  });

  const currentInputMethod = watch("inputMethod");

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

        const allIds = table
          .getRowModel()
          .rows.map((row) => row.original.personal_number)
          .filter(Boolean);
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
      setFile(null);
      setValue("inputMethod", "excel");
    }
  }, [isModalOpen, reset, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      if (new Date(data.valid_from) > new Date(data.valid_to)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Date Range",
          text: "Valid From cannot be later than Valid To!",
        });
        setLoading(false);
        return;
      }

      const selectedUsers = watch("id_user") || [];

      let finalQuota;
      if (currentInputMethod === "excel") {
        finalQuota = data.leave_quota;
        if (!finalQuota || finalQuota.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Invalid Quota Data",
            text: "No valid quota data found. Please check your Excel file.",
          });
          setLoading(false);
          return;
        }

        if (finalQuota.length !== selectedUsers.length) {
          Swal.fire({
            icon: "error",
            title: "Data Mismatch",
            text: `Number of users (${selectedUsers.length}) doesn't match number of quotas (${finalQuota.length}).`,
          });
          setLoading(false);
          return;
        }

        const invalidQuotas = finalQuota.filter(quota =>
          typeof quota !== 'number' || isNaN(quota) || quota < 0 || !Number.isInteger(quota)
        );

        if (invalidQuotas.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Invalid Quota Values",
            text: "Some quota values are invalid. Please check your Excel file and re-upload.",
          });
          setLoading(false);
          return;
        }

      } else {
        finalQuota = selectedUsers.map(() => Number(data.leave_quota_1));
      }

      const payload = {
        id_user: selectedUsers,
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: response.data.message || "Failed to submit data. Please try again.",
        });
        onClose();
        reset();
        setFile(null);
      }
    } catch (error: any) {
      console.error("Error:", error);
      let errorMessage = "An error occurred. Please try again.";

      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      Swal.fire({
        icon: "error",
        title: "Something went wrong.",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveTypeOptions = async (inputValue) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/leave-type?trx_quota=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: inputValue,
          },
        }
      );
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

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    onDrop: (acceptedFiles) => {
      const droppedFile = acceptedFiles[0];
      if (droppedFile) {
        handleFileUpload(droppedFile);
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

  const handleFileUpload = (uploadedFile: File) => {
    const acceptedMimeTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

    if (!acceptedMimeTypes.includes(uploadedFile.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Only .xlsx Excel files are allowed.",
      });
      setFile(null);
      setValue("file", null);
      setValue("id_user", []);
      setValue("leave_quota", []);
      return;
    }

    setFile(uploadedFile);
    setValue("file", uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData: { NRP: string; Nama: string; Quota?: number }[] =
          XLSX.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Invalid Excel File",
            text: "The Excel file is empty or has an invalid format!",
          });
          setFile(null);
          setValue("file", null);
          setValue("id_user", []);
          setValue("leave_quota", []);
          return;
        }

        const nrpList = jsonData.map((row) => String(row.NRP)).filter((nrp) => !!nrp);
        if (nrpList.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Invalid Data",
            text: "No valid NRP found in the Excel file!",
          });
          setFile(null);
          setValue("file", null);
          setValue("id_user", []);
          setValue("leave_quota", []);
          return;
        }

        const quotaList = [];
        const invalidQuotaRows = [];

        jsonData.forEach((row, index) => {
          const quota = row.Quota;

          if (quota === undefined || quota === null) {
            invalidQuotaRows.push(`Row ${index + 2}: Quota is missing`);
            return;
          }

          const numericQuota = Number(quota);
          if (isNaN(numericQuota) || numericQuota < 0) {
            invalidQuotaRows.push(`Row ${index + 2}: "${quota}" is not a valid number`);
            return;
          }

          if (!Number.isInteger(numericQuota)) {
            invalidQuotaRows.push(`Row ${index + 2}: "${quota}" must be an integer`);
            return;
          }

          quotaList.push(numericQuota);
        });

        if (invalidQuotaRows.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Invalid Quota Data",
            html: `
          <div style="text-align: left;">
            <p>The following rows contain invalid quota values:</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${invalidQuotaRows.map(error => `<li>${error}</li>`).join('')}
            </ul>
            <p><strong>Requirements:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Quota must be a number</li>
              <li>Quota must be 0 or positive</li>
              <li>Quota must be an integer</li>
            </ul>
          </div>
          `,
            width: 500,
          });
          setFile(null);
          setValue("file", null);
          setValue("id_user", []);
          setValue("leave_quota", []);
          return;
        }

        if (nrpList.length !== quotaList.length) {
          Swal.fire({
            icon: "error",
            title: "Data Mismatch",
            text: `Number of NRPs (${nrpList.length}) does not match the number of valid quotas (${quotaList.length})!`,
          });
          setFile(null);
          setValue("file", null);
          setValue("id_user", []);
          setValue("leave_quota", []);
          return;
        }

        setValue("id_user", nrpList);
        setValue("leave_quota", quotaList);

        Swal.fire({
          icon: "success",
          title: "Excel Imported Successfully",
          text: `${nrpList.length} employees imported with valid quota data.`,
          timer: 2000,
        });

      } catch (error) {
        console.error("Error parsing Excel:", error);
        Swal.fire({
          icon: "error",
          title: "Excel Parsing Error",
          text: "Failed to read the Excel file. Please check the file format.",
        });
        setFile(null);
        setValue("file", null);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title">Add Transaction Leave Quota</h3>
        <button
          type="button"
          className="btn btn-xs btn-icon btn-light"
          onClick={() => {
            setFile(null);
            onClose();
          }}
        >
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-auto max-h-[65vh]">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group mb-2">
              <label className="form-label mb-1">Valid From<span className="text-red-500">*</span></label>
              <Controller
                name="valid_from"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className={clsx(
                      "input",
                      errors.valid_from
                        ? "border-red-500 hover:border-red-500"
                        : ""
                    )}
                  />
                )}
              />
              {errors.valid_from && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.valid_from.message}
                </p>
              )}
            </div>
            <div className="form-group mb-2">
              <label className="form-label mb-1">Valid To<span className="text-red-500">*</span></label>
              <Controller
                name="valid_to"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className={clsx(
                      "input",
                      errors.valid_to
                        ? "border-red-500 hover:border-red-500"
                        : ""
                    )}
                  />
                )}
              />
              {errors.valid_to && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.valid_to.message}
                </p>
              )}
            </div>
            <div className="form-group mb-2">
              <label className="form-label mb-1">Leave Type<span className="text-red-500">*</span></label>
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
                        borderColor: errors.leave_type_id
                          ? "#EF4444"
                          : "#DBDFE9",
                        "&:hover": {
                          borderColor: state.isFocused ? "#DBDFE9" : "#EF4444",
                        },
                      }),
                    }}
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption);
                    }}
                  />
                )}
              />
              {errors.leave_type_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.leave_type_id.message}
                </p>
              )}
            </div>
            {currentInputMethod === "table" && (
              <div className="form-group mb-2">
                <label className="form-label mb-1">Leave Quota<span className="text-red-500">*</span></label>
                <Controller
                  name="leave_quota_1"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className={clsx(
                        "input",
                        errors.leave_quota_1
                          ? "border-red-500 hover:border-red-500"
                          : ""
                      )}
                      placeholder="Leave Quota"
                    />
                  )}
                />
                {errors.leave_quota_1 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.leave_quota_1.message}
                  </p>
                )}
              </div>
            )}
            <div className="form-group col-span-2 flex items-center gap-12 mb-2">
              <label className="form-label flex items-center gap-2.5 text-nowrap">
                <input
                  {...register("inputMethod")}
                  className="radio"
                  name="radio2"
                  type="radio"
                  value="excel"
                  checked={currentInputMethod === "excel"}
                  onChange={(e) => {
                    setValue("inputMethod", e.target.value);
                    setValue("id_user", []);
                    setValue("file", null);
                    setFile(null);
                    setValue("leave_quota_1", null);
                    setValue("leave_quota", []);
                  }}
                />
                Upload Excel
              </label>
              <label className="form-label flex items-center gap-2.5 text-nowrap">
                <input
                  {...register("inputMethod")}
                  className="radio"
                  name="radio2"
                  type="radio"
                  value="table"
                  checked={currentInputMethod === "table"}
                  onChange={(e) => {
                    setValue("inputMethod", e.target.value);
                    setValue("file", null);
                    setFile(null);
                    setValue("id_user", []);
                    setValue("leave_quota", []);
                  }}
                />
                Checklist Table
              </label>
            </div>
            {currentInputMethod === "excel" ? (
              <div className="form-group col-span-2">
                <label className="form-label mb-1">Upload Excel</label>
                <button type="button" className="btn btn-link mb-2" onClick={handleDownloadTemplate}>
                  Download Template Excel
                </button>
                <Controller
                  name="file"
                  control={control}
                  render={({ field }) => (
                    <div
                      {...getRootProps({
                        className: clsx(
                          "border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer",
                          errors.file ? "border-red-500" : ""
                        )
                      })}
                    >
                      <input
                        {...getInputProps()}
                        onChange={(e) => {
                          const uploadedFile = e.target.files?.[0];
                          if (uploadedFile) handleFileUpload(uploadedFile);
                          field.onChange(uploadedFile);
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
                  columns={columns}
                  url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/user`}
                  isRefetch={isRefetch}
                  onSearchChange={handleSearchChange}
                />
                {errors.id_user && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.id_user.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer justify-end flex-shrink-0">
          <div className="flex gap-2">
            <button
              type="button" className="btn btn-light" onClick={() => { setFile(null); onClose(); }}
            >
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