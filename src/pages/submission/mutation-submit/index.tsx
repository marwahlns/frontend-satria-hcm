import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import FilterData from "@/components/FilterData";
import Cookies from "js-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enGB } from "date-fns/locale";
import Modal from "@/components/Modal";
import ActionModal from "@/components/Modals/ActionModal";
import DetailModal from "@/components/Modals/DetailModalUpper";
import StatusStepper from "@/components/StatusStepper";
import AsyncSelect from "react-select/async";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [filter, setFilter] = useState<{
    month: string;
    year: string;
    status?: number;
  }>({
    month: "",
    year: "",
    status: 0,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSuperior, setSelectedSuperior] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDivisionLabel, setSelectedDivisionLabel] = useState("");
  const [selectedDepartmentLabel, setSelectedDepartmentLabel] = useState("");

  const submitSchema = yup.object({
    effective_date: yup.string().required("Effective date is required"),
    reason: yup.string().required("Resign reason is required"),
    superior_from: yup.string().required("Superior is required"),
    division_from: yup.string().required("Division is required"),
    department_from: yup.string().required("Department is required"),
    superior_to: yup.string().required("Superior is required"),
    division_to: yup.string().required("Division is required"),
    department_to: yup.string().required("Department is required"),
    user: yup.string().required("Employee is required"),
    canceled_remark: yup.string().nullable(),
  });

  const cancelSchema = yup.object({
    canceled_remark: yup
      .string()
      .nullable()
      .required("Canceled remark is required."),
  });

  interface MutationFormValues {
    effective_date?: string;
    reason?: string;
    canceled_remark?: string;
    superior_from?: string;
    division_from?: string;
    department_from?: string;
    superior_to?: string;
    division_to?: string;
    department_to?: string;
    user?: string;
  }

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MutationFormValues>({
    resolver: yupResolver(
      selectedActionType === "Canceled" ? cancelSchema : submitSchema
    ),
    defaultValues: {
      effective_date: "",
      reason: "",
      canceled_remark: "",
      superior_from: "",
      division_from: "",
      department_from: "",
      superior_to: "",
      division_to: "",
      department_to: "",
      user: "",
    },
  });

  useEffect(() => {
    if (!watch("division_from")) {
      setValue("division_from", "-");
    }
    if (!watch("department_from")) {
      setValue("department_from", "-");
    }
  }, [watch, setValue]);

  const loadUserOptions = async (inputValue) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/user`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: inputValue,
            submition: "true",
          },
        }
      );

      if (response.data.success) {
        return response.data.data.data.map((user) => ({
          value: user.personal_number,
          label: user.name,
          division: {
            value: user.divid,
            label: user.division,
          },
          department: {
            value: user.dept,
            label: user.department,
          },
          superior: user.superior,
          isDisabled: user.isDisable === true,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading users:", error);
      return [];
    }
  };

  const superiorOptions = async (inputValue) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/user/getSuperior`,
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
        return response.data.data.data.map((superior) => ({
          value: superior.personal_number,
          label: superior.name,
          section_code: superior.section_code,
          section: superior.section,
          dept: superior.dept,
          department: superior.department,
          divid: superior.divid,
          division: superior.division,
          companyid: superior.companyid,
          company_name: superior.company_name,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };

  const handleOpenActionModal = (data, actionType) => {
    setSelectedData(data);
    setSelectedActionType(actionType);
    setIsActionModalOpen(true);
  };

  const handleOpenDetailModal = (data) => {
    setSelectedData(data);
    setIsDetailModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const onClose = () => {
    setIsActionModalOpen(false);
    setIsDetailModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedData(null);
    setValue("department_to", "");
    setValue("division_to", "");
    setValue("department_from", "");
    setValue("division_from", "");
    reset();
  };

  const onCancel = async (data) => {
    try {
      setLoading(true);
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this mutation request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${selectedActionType} it!`,
        cancelButtonText: "Discard",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }
      const token = Cookies.get("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/${selectedData.id}`,
        {
          remark: data.canceled_remark,
          actionType: selectedActionType,
          trxType: "mutation",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: `Mutation has been successfully ${selectedActionType}.`,
          icon: "success",
          confirmButtonText: "OK",
        });
        setIsRefetch(!isRefetch);
        onClose();
        reset();
      } else {
        reset();
        onClose();
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: `Failed to ${selectedActionType} mutation. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (searchId) => {
    const token = Cookies.get("token");
    try {
      setLoading(true);
      setLoadingId(searchId);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            type: "mutation",
            exportData: "pdf",
            status: filter.status,
            month: filter.month,
            year: filter.year,
            search: searchId,
          },
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to export PDF file");
      }

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const fileName = `Data_Mutation_${yyyy}-${mm}-${dd}.pdf`;

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to export PDF.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setLoadingId(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/?type=mutation`,
        {
          ...data,
          superior_from: data.superior_from,
          division_from: data.division_from,
          department_from: data.department_from,
          superior_to: data.superior_to,
          division_to: data.division_to,
          department_to: data.department_to,
          effective_date: data.effective_date,
          reason: data.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 201) {
        Swal.fire({
          text: "Mutation added successfully",
          icon: "success",
          timer: 1500,
        });
        setIsRefetch(!isRefetch);
        onClose();
        reset();
      } else {
        onClose();
        reset();
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: `Failed to ${selectedActionType} mutation. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const optionBackgroundColor = (state) => {
    if (state.isDisabled) return "#ffe5e5";
    if (state.isSelected) return "#2684ff";
    if (state.isFocused) return "#f0f0f0";
    return "white";
  };

  const handleExportExcel = async () => {
    const token = Cookies.get("token");
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            type: "mutation",
            exportData: true,
            status: filter.status,
            month: filter.month,
            year: filter.year,
            search: searchValue,
          },
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to export Excel file");
      }

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const fileName = `Data_Mutation_${yyyy}-${mm}-${dd}.xlsx`;

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to export excel`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  type ITrMutation = {
    id: number;
    status_id: number;
    status_submittion: string;
  };

  const columns: ColumnDef<ITrMutation>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    // {
    //   accessorKey: "division_from",
    //   header: "From Division",
    //   enableSorting: true,
    // },
    {
      accessorKey: "dept_from",
      header: "From Department",
      enableSorting: true,
    },
    // {
    //   accessorKey: "superior_from",
    //   header: "From Superior",
    //   enableSorting: true,
    // },
    // {
    //   accessorKey: "reason",
    //   header: "Reason",
    //   enableSorting: true,
    // },
    // {
    //   accessorKey: "division_to",
    //   header: "To Divison",
    //   enableSorting: true,
    // },
    {
      accessorKey: "dept_to",
      header: "To Department",
      enableSorting: true,
    },
    {
      accessorKey: "effective_date",
      header: "Effective Date",
      enableSorting: false,
    },
    // {
    //   accessorKey: "superior_to",
    //   header: "Superior To",
    //   enableSorting: true,
    // },
    {
      accessorKey: "status_submittion",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const statusId = row.original.status_id;
        const statusSubmittion = row.original.status_submittion;

        const getStatusColor = (statusId: number) => {
          switch (statusId) {
            case 1:
              return "badge badge-pill badge-outline badge-dark";
            case 2:
              return "badge badge-pill badge-outline badge-primary";
            case 3:
              return "badge badge-pill badge-outline badge-success";
            case 6:
              return "badge badge-pill badge-outline badge-danger";
            default:
              return "badge badge-pill badge-outline badge-warning";
          }
        };

        const badgeClass = getStatusColor(statusId);

        return (
          <div className="flex justify-center">
            <span className={`${badgeClass} text-center`}>
              {statusSubmittion ?? ""}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex space-x-1 justify-center">
            <button
              data-tooltip="#update_tooltip"
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => handleOpenDetailModal(data)}
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            <div className="tooltip" id="update_tooltip">
              Detail
            </div>
            <button
              className="btn btn-sm btn-outline btn-danger"
              onClick={() => handleExportPDF(data.id)}
              disabled={loadingId === data.id}
            >
              {loadingId === data.id ? (
                <span className="flex items-center gap-1">
                  <span className="loading loading-spinner loading-xs"></span>
                  Exporting...
                </span>
              ) : (
                <i className="ki-filled ki-file-down"></i>
              )}
            </button>
            {/* {data.status_id == 1 && (
              <>
                <button
                  data-tooltip="#delete_tooltip"
                  className="btn btn-sm btn-outline btn-danger"
                  onClick={() => handleOpenActionModal(data, "Canceled")}
                >
                  <i className="ki-outline ki-trash text-white"></i>
                </button>
                <div className="tooltip" id="delete_tooltip">
                  Cancel
                </div>
              </>
            )} */}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mutation</h1>
          <p className="text-gray-500 text-sm">Your Mutation Record</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            className="btn btn-outline btn-success"
            onClick={() => handleExportExcel()}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Exporting...
              </>
            ) : (
              <>
                <i className="ki-filled ki-file-down"></i>
                Export
              </>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="btn btn-outline btn-primary"
            >
              <i className="ki-filled ki-filter-tablet mr-1" />
              Filter
            </button>
            {showFilter && (
              <FilterData
                onSelect={(selectedFilter) => {
                  setFilter(selectedFilter);
                  setShowFilter(false);
                }}
              />
            )}
          </div>
          {/* <button
            className="btn btn-filled btn-primary"
            onClick={() => handleOpenAddModal()}
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button> */}
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=mutation&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />

      <Modal isModalOpen={isAddModalOpen}>
        <div className="modal-header">
          <h3 className="modal-title">Add Mutation Submission</h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body max-h-[65vh] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Mutation */}
              <div>
                <label className="form-label">
                  Employee Mutation
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="user"
                  control={control}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      cacheOptions
                      defaultOptions
                      loadOptions={loadUserOptions}
                      placeholder="Select User"
                      value={
                        field.value
                          ? {
                              value: selectedUser?.value,
                              label: selectedUser?.label || "",
                            }
                          : null
                      }
                      getOptionLabel={(e) => e.label}
                      getOptionValue={(e) => e.value}
                      isOptionDisabled={(option) =>
                        (option as any).isDisabled === true
                      }
                      styles={{
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: optionBackgroundColor(state),
                          color: state.isDisabled ? "#999" : base.color,
                          cursor: state.isDisabled ? "not-allowed" : "default",
                        }),
                      }}
                      onChange={(selectedOption) => {
                        const option = selectedOption as any;
                        field.onChange(option?.value || "");
                        setSelectedUser(option);

                        setValue(
                          "department_from",
                          option?.department?.value || "-"
                        );
                        setValue(
                          "division_from",
                          option?.division?.value || "-"
                        );
                        setValue("superior_from", option?.superior || "-");

                        setSelectedDivisionLabel(
                          option?.division?.label || "-"
                        );
                        setSelectedDepartmentLabel(
                          option?.department?.label || "-"
                        );
                      }}
                      classNamePrefix="react-select"
                      className="w-full text-sm"
                    />
                  )}
                />
                {errors.user && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.user.message}
                  </p>
                )}
              </div>

              {/* Effective Date */}
              <div>
                <label className="form-label">
                  Effective Date<span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  control={control}
                  name="effective_date"
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date: Date | null) => {
                        field.onChange(date);
                        setValue(
                          "effective_date",
                          date
                            ? new Date(date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : ""
                        );
                      }}
                      className={clsx(
                        "input w-full text-sm py-2 px-3 rounded-md border",
                        errors.effective_date
                          ? "border-red-500"
                          : "border-gray-300"
                      )}
                      placeholderText="Pick a date"
                      dateFormat="dd-MMM-yyyy"
                      isClearable
                      locale={enGB}
                      minDate={new Date()}
                    />
                  )}
                />
                {errors.effective_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.effective_date?.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-label block w-full break-words mb-1">
                  Mutation From:
                </label>
              </div>
              <div>
                <label className="form-label block mb-1">Superior Now</label>
                <div
                  className={clsx(
                    "w-full text-sm",
                    errors.superior_from && "text-red-500"
                  )}
                >
                  {watch("superior_from") || "-"}
                </div>
                {errors.superior_from && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.superior_from.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label block mb-1">Division Now</label>
                <div
                  className={clsx(
                    "w-full text-sm",
                    errors.division_from && "text-red-500"
                  )}
                >
                  {selectedDivisionLabel || "-"}
                </div>
                {errors.division_from && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.division_from.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label block mb-1">Department Now</label>
                <div
                  className={clsx(
                    "w-full text-sm",
                    errors.department_from && "text-red-500"
                  )}
                >
                  {selectedDepartmentLabel || "-"}
                </div>
                {errors.department_from && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.department_from.message}
                  </p>
                )}
              </div>

              {/* Mutation To Header */}
              <div className="md:col-span-2">
                <label className="form-label block w-full break-words mb-1">
                  Mutation To:
                </label>
              </div>

              {/* Superior To */}
              <div>
                <label className="form-label">
                  Superior Employee
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="superior_to"
                  control={control}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      cacheOptions
                      defaultOptions
                      loadOptions={superiorOptions}
                      placeholder="Select Superior"
                      value={
                        field.value
                          ? {
                              value: selectedSuperior?.value,
                              label: selectedSuperior?.label || "",
                            }
                          : null
                      }
                      onChange={(selectedOption) => {
                        const option = selectedOption as any;
                        field.onChange(option?.value || "");
                        setSelectedSuperior(option);

                        setValue("department_to", option?.department || "-");
                        setValue("division_to", option?.division || "-");
                      }}
                      classNamePrefix="react-select"
                      className="w-full text-sm"
                    />
                  )}
                />
                {errors.superior_to && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.superior_to.message}
                  </p>
                )}
              </div>

              {/* Division To */}
              <div>
                <label className="form-label block mb-1">Division To</label>
                <div
                  className={clsx(
                    "w-full text-sm",
                    errors.division_to && "text-red-500"
                  )}
                >
                  {watch("division_to") || "-"}
                </div>
                {errors.division_to && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.division_to.message}
                  </p>
                )}
              </div>

              {/* Department To */}
              <div>
                <label className="form-label block mb-1">Department To</label>
                <div
                  className={clsx(
                    "w-full text-sm",
                    errors.department_to && "text-red-500"
                  )}
                >
                  {watch("department_to") || "-"}
                </div>
                {errors.department_to && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.department_to.message}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="form-label">
                  Resign Reason<span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className={clsx(
                        "w-full text-sm text-gray-700 p-3 rounded-md bg-white border border-gray-300",
                        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
                        "placeholder:text-gray-500",
                        errors.reason &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Your reason"
                      rows={4}
                    />
                  )}
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.reason.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer justify-end flex-shrink-0">
            <div className="flex gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Discard
              </button>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={onClose}
        title="Mutation Request Detail"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-60">
            <h3 className="font-bold border-b pb-2 text-gray-700">
              Approval Stage
            </h3>
            <StatusStepper
              statusId={selectedData?.status_id ?? 1}
              createdDate={selectedData?.created_at}
              acceptedDate={selectedData?.accepted_date}
              approvedDate={selectedData?.approved_date}
              rejectedDate={selectedData?.rejected_date}
              canceledDate={selectedData?.canceled_date}
              acceptedRemark={selectedData?.accepted_remark}
              approvedRemark={selectedData?.approved_remark}
              rejectedRemark={selectedData?.rejected_remark}
              canceledRemark={selectedData?.canceled_remark}
              acceptTo={selectedData?.accept_to}
              approveTo={selectedData?.approve_to}
            />
          </div>
          <div className="flex-1 space-y-8">
            <form className="text-sm text-gray-700 space-y-8">
              <section>
                <h3 className="text-lg font-bold border-b pb-2 text-gray-700">
                  General Information
                </h3>
                <div className="flex flex-wrap gap-6 mt-4">
                  {[
                    ["From Divison", selectedData?.division_from],
                    ["From Department", selectedData?.dept_from],
                    ["From Superior", selectedData?.superior_from],
                    ["To Division", selectedData?.division_to],
                    ["To Department", selectedData?.dept_to],
                    ["To Superior", selectedData?.superior_to],
                    ["Effective Date", selectedData?.effective_date],
                    ["Mutation Reason", selectedData?.reason],
                  ].map(([label, value], idx) => (
                    <div key={idx} className="w-full md:w-[30%]">
                      <div className="font-semibold text-gray-600">{label}</div>
                      <p className="font-bold">{value ?? "-"}</p>
                    </div>
                  ))}
                </div>
              </section>
            </form>
          </div>
        </div>
      </DetailModal>

      {/* <ActionModal
        isModalOpen={isActionModalOpen}
        onClose={onClose}
        title={`${selectedActionType} Mutation Request`}
        onSubmit={handleSubmit(onCancel)}
        loading={loading}
        submitText={selectedActionType}
      >
        <form onSubmit={handleSubmit(onCancel)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Effective Date Mutation</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.effective_date ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Mutation Reason</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.reason ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 mt-6">
            <div>
              <label className="form-label">Canceled Remark</label>
              <Controller
                name="canceled_remark"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={clsx(
                      "input",
                      errors.canceled_remark
                        ? "border-red-500 hover:border-red-500"
                        : ""
                    )}
                  />
                )}
              />
              {errors.canceled_remark && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.canceled_remark.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </ActionModal> */}
    </div>
  );
}
