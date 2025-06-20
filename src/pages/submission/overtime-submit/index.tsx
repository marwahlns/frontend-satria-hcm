import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import FilterData from "@/components/FilterData";
import Cookies from "js-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "@/components/Modal";
import ActionModal from "@/components/Modals/ActionModalUpper";
import DetailModal from "@/components/Modals/DetailModalUpper";
import StatusStepper from "@/components/StatusStepper";
import {
  format,
  parse,
  addHours,
  setHours,
  setMinutes,
  isToday,
} from "date-fns";

export default function Home() {
  const [loading, setLoading] = useState(false);
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
  const [searchValue, setSearchValue] = useState("");

  const submitSchema = yup.object({
    check_in_ovt: yup.string().required("Start date is required"),
    check_out_ovt: yup.string().required("End date is required"),
    note_ovt: yup.string().required("Overtime note is required"),
    canceled_remark: yup.string().nullable(),
  });
  const cancelSchema = yup.object({
    canceled_remark: yup
      .string()
      .nullable()
      .required("Canceled remark is required."),
  });

  interface OvertimeFormValues {
    check_in_ovt?: string;
    check_out_ovt?: string;
    note_ovt?: string;
    canceled_remark?: string;
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<OvertimeFormValues>({
    resolver: yupResolver(
      selectedActionType === "Canceled" ? cancelSchema : submitSchema
    ),
    defaultValues: {
      check_in_ovt: "",
      check_out_ovt: "",
      note_ovt: "",
      canceled_remark: "",
    },
  });

  const checkInValue = watch("check_in_ovt");
  const checkInDate = checkInValue
    ? parse(checkInValue, "dd-MMM-yyyy HH:mm", new Date())
    : null;
  const checkOutMin = checkInDate;
  const checkOutMax = checkInDate ? addHours(checkInDate, 24) : null;

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
    reset();
  };

  const onCancel = async (data) => {
    try {
      setLoading(true);
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this overtime request?`,
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
          trxType: "overtime",
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
          text: `Overtime has been successfully ${selectedActionType}.`,
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
        text: `Failed to ${selectedActionType} overtime. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to submit this overtime request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, submit it!`,
        cancelButtonText: "Discard",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }
      const token = Cookies.get("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/?type=overtime`,
        {
          ...data,
          check_in_ovt: data.check_in_ovt,
          check_out_ovt: data.check_out_ovt,
          note_ovt: data.note_ovt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 201) {
        Swal.fire({
          text: "Overtime added successfully",
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
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to submit overtime. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
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
            type: "overtime",
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
      const fileName = `Data_Overtime_${yyyy}-${mm}-${dd}.xlsx`;

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

  type ITrOvertime = {
    status_id: number;
    status_submittion: string;
  };

  const columns: ColumnDef<ITrOvertime>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "check_in",
      header: "Check In Ovt",
      enableSorting: false,
    },
    {
      accessorKey: "check_out",
      header: "Check Out Ovt",
      enableSorting: false,
    },
    // {
    //   accessorKey: "note_ovt",
    //   header: "Note",
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
            {data.status_id == 1 && (
              <>
                <button
                  data-tooltip="#cancel_tooltip"
                  className="btn btn-sm btn-outline btn-danger"
                  onClick={() => handleOpenActionModal(data, "Canceled")}
                >
                  <i className="ki-outline ki-arrow-circle-left text-white"></i>
                </button>
                <div className="tooltip" id="cancel_tooltip">
                  Cancel
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Overtime</h1>
          <p className="text-gray-500 text-sm">Your Overtime Record</p>
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
          <button
            className="btn btn-filled btn-primary"
            onClick={() => handleOpenAddModal()}
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=overtime&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />

      <Modal isModalOpen={isAddModalOpen}>
        <div className="modal-header">
          <h3 className="modal-title">Add Overtime Submittion</h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body max-h-[65vh] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Check In Overtime
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  control={control}
                  name="check_in_ovt"
                  render={({ field }) => {
                    const selectedDate = field.value
                      ? new Date(field.value)
                      : null;
                    const now = new Date();

                    const isSelectedToday =
                      selectedDate && isToday(selectedDate);

                    const minTime = isSelectedToday
                      ? now
                      : setHours(setMinutes(new Date(), 0), 0);

                    const maxTime = isSelectedToday
                      ? setHours(setMinutes(new Date(), 45), 23)
                      : setHours(setMinutes(new Date(), 45), 23);

                    return (
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                          const formatted = date
                            ? format(date, "dd-MMM-yyyy HH:mm")
                            : "";
                          field.onChange(formatted);
                          setValue("check_in_ovt", formatted);
                          setValue("check_out_ovt", null);
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd-MMM-yyyy HH:mm"
                        className={clsx(
                          "input w-full text-sm py-2 px-3 rounded-md border",
                          errors.check_in_ovt
                            ? "border-red-500"
                            : "border-gray-300"
                        )}
                        placeholderText="Pick a date and time"
                        minDate={now}
                        minTime={minTime}
                        maxTime={maxTime}
                      />
                    );
                  }}
                />
                {errors.check_in_ovt && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.check_in_ovt?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Check Out Overtime
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  control={control}
                  name="check_out_ovt"
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date: Date | null) => {
                        const formatted = date
                          ? format(date, "dd-MMM-yyyy HH:mm")
                          : "";
                        field.onChange(formatted);
                        setValue("check_out_ovt", formatted);
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd-MMM-yyyy HH:mm"
                      className={clsx(
                        "input w-full text-sm py-2 px-3 rounded-md border",
                        errors.check_out_ovt
                          ? "border-red-500"
                          : "border-gray-300"
                      )}
                      placeholderText="Pick a date and time"
                      minDate={checkOutMin}
                      maxDate={checkOutMax}
                      minTime={
                        field.value &&
                        new Date(field.value).toDateString() ===
                          checkOutMin?.toDateString()
                          ? checkOutMin
                          : new Date(0, 0, 0, 0, 0)
                      }
                      maxTime={
                        field.value &&
                        new Date(field.value).toDateString() ===
                          checkOutMax?.toDateString()
                          ? checkOutMax
                          : new Date(0, 0, 0, 23, 45)
                      }
                    />
                  )}
                />
                {errors.check_out_ovt && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.check_out_ovt?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 mt-6">
              <div>
                <label className="form-label mb-1">
                  Overtime Note
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="note_ovt"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className={clsx(
                        "w-full text-sm text-gray-700 p-3 rounded-md bg-white border border-gray-300",
                        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
                        "placeholder:text-gray-500",
                        errors.note_ovt &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Your note"
                      rows={4}
                    />
                  )}
                />
                {errors.note_ovt && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.note_ovt.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer justify-end flex-shrink-0">
            <div className="flex gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Discard
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3.536-3.536a9 9 0 10-12.728 12.728L4 12z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={onClose}
        title="Overtime Request Detail"
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
                    ["Check In Ovt", selectedData?.check_in],
                    ["Check Out Ovt", selectedData?.check_out],
                    ["Shift At Date", selectedData?.shift],
                    ["Notes", selectedData?.note_ovt],
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

      <ActionModal
        isModalOpen={isActionModalOpen}
        onClose={onClose}
        title={`${selectedActionType} Overtime Request`}
        onSubmit={handleSubmit(onCancel)}
        loading={loading}
        submitText={selectedActionType}
      >
        <form onSubmit={handleSubmit(onCancel)}>
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
              <section className="text-sm text-gray-700 space-y-8">
                <h3 className="text-lg font-bold border-b pb-2 text-gray-700">
                  General Information
                </h3>
                <div className="flex flex-wrap gap-6 mt-4">
                  {[
                    ["Check In Ovt", selectedData?.check_in],
                    ["Check Out Ovt", selectedData?.check_out],
                    ["Shift At Date", selectedData?.shift],
                    ["Notes", selectedData?.note_ovt],
                  ].map(([label, value], idx) => (
                    <div key={idx} className="w-full md:w-[30%]">
                      <div className="font-semibold text-gray-600">{label}</div>
                      <p className="font-bold">{value ?? "-"}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
          <section className="bg-gray-50 rounded-xl shadow-md p-6 mt-8">
            <h3 className="text-lg font-bold border-b pb-3 mb-4 text-gray-800">
              Remark
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="form-label mb-2">
                  Canceled Remark
                  <span className="text-red-500 ml-1">*</span>
                </label>
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
          </section>
        </form>
      </ActionModal>
    </div>
  );
}
