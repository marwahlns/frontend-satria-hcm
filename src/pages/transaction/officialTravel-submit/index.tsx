import Main from "../../../main-layouts/layout-employee";
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
import { enGB } from "date-fns/locale";
import Modal from "@/components/Modal";
import ActionModal from "@/components/Modals/ActionModal";
import DetailModal from "@/components/Modals/DetailModal";
import StatusStepper from "@/components/StatusStepper";
import { useOfficialTravelStore } from "../../../stores/submitStore";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [filter, setFilter] = useState({ month: "", year: "", status: 0 });
  const [showFilter, setShowFilter] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const setTotalOfficialTravel = useOfficialTravelStore(
    (state) => state.setTotalOfficialTravels
  );

  const submitSchema = yup.object({
    start_date: yup.string().required("Start date is required"),
    end_date: yup.string().required("End date is required"),
    destination_city: yup.string().required("Destination city is required"),
    purpose: yup.string().required("Purpose official travel is required"),
    canceled_remark: yup.string().nullable(),
  });
  const cancelSchema = yup.object({
    canceled_remark: yup
      .string()
      .nullable()
      .required("Canceled remark is required."),
  });

  interface OfficialTravelFormValues {
    start_date?: string;
    end_date?: string;
    destination_city?: string;
    purpose?: string;
    canceled_remark?: string;
    date_range?: [Date | null, Date | null];
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<OfficialTravelFormValues>({
    resolver: yupResolver(
      selectedActionType === "Canceled" ? cancelSchema : submitSchema
    ),
    defaultValues: {
      start_date: "",
      end_date: "",
      destination_city: "",
      purpose: "",
      canceled_remark: "",
      date_range: [null, null],
    },
  });

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
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this official travel request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${selectedActionType} it!`,
        cancelButtonText: "Cancel",
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
          trxType: "officialTravel",
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
          text: `Official travel has been successfully ${selectedActionType}.`,
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
        text: `Failed to ${selectedActionType} official travel. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/?type=officialTravel`,
        {
          ...data,
          start_date: data.start_date,
          end_date: data.end_date,
          destination_city: data.destination_city,
          purpose: data.purpose,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        const total = response.data?.data?.totalItems;

        if (total !== undefined) {
          setTotalOfficialTravel(total);
        } else {
          const token = Cookies.get("token");
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=officialTravel`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data.success) {
            setTotalOfficialTravel(res.data.data.totalItems);
          }
        }

        Swal.fire({
          text: "Official travel added successfully",
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
      console.error(error);
    }
  };

  const handleExportExcel = async () => {
    const token = Cookies.get("token");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            type: "officialTravel",
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
      const fileName = `Data_Leave_${yyyy}-${mm}-${dd}.xlsx`;

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
      console.error("Error exporting EXCEL:", error);
      alert("Failed to export Excel.");
    }
  };

  type ITrLeave = {
    status_id: number;
    status_submittion: string;
  };

  const columns: ColumnDef<ITrLeave>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      enableSorting: true,
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      enableSorting: true,
    },
    {
      accessorKey: "total_leave_days",
      header: "Total Days",
      enableSorting: true,
    },
    {
      accessorKey: "destination_city",
      header: "Destination City",
      enableSorting: true,
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      enableSorting: true,
    },
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
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Main>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Official Travel</h1>
          <p className="text-gray-500 text-sm">Your Official Travel Record</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="btn btn-filled btn-primary"
            onClick={() => handleOpenAddModal()}
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>

          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="btn btn-filled btn-primary"
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

          <button
            className="btn btn-filled btn-success"
            onClick={() => handleExportExcel()}
          >
            <i className="ki-filled ki-file-down"></i>
            Export to Excel
          </button>
        </div>
      </div>

      <DataTable
        title={"Official Travel Submittion List"}
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=officialTravel&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />

      <Modal isModalOpen={isAddModalOpen}>
        <div className="modal-header">
          <h3 className="modal-title">Add Official Travel Submittion</h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body max-h-[65vh] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Leave Date
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  control={control}
                  name="date_range"
                  render={({ field }) => (
                    <DatePicker
                      selectsRange
                      startDate={field.value?.[0] || null}
                      endDate={field.value?.[1] || null}
                      onChange={(dates: [Date | null, Date | null]) => {
                        const [start, end] = dates;
                        field.onChange(dates);
                        setValue(
                          "start_date",
                          start
                            ? new Date(start).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : ""
                        );
                        setValue(
                          "end_date",
                          end
                            ? new Date(end).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : ""
                        );
                      }}
                      className={clsx(
                        "input w-full text-sm py-2 px-3 rounded-md border",
                        errors.start_date || errors.end_date
                          ? "border-red-500"
                          : "border-gray-300"
                      )}
                      placeholderText="Pick a date"
                      dateFormat="dd-MMM-yyyy"
                      isClearable={true}
                      locale={enGB}
                      minDate={new Date()}
                    />
                  )}
                />
                {(errors.start_date || errors.end_date) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date?.message || errors.end_date?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Destination City
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="destination_city"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={clsx(
                        "input",
                        errors.destination_city
                          ? "border-red-500 hover:border-red-500"
                          : ""
                      )}
                    />
                  )}
                />
                {errors.destination_city && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.destination_city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 mt-6">
              <div>
                <label className="form-label">
                  Official Travel Purpose
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className={clsx(
                        "w-full text-sm text-gray-700 p-3 rounded-md bg-white border border-gray-300",
                        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
                        "placeholder:text-gray-500",
                        errors.purpose &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Your purpose"
                      rows={4}
                    />
                  )}
                />
                {errors.purpose && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.purpose.message}
                  </p>
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

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={onClose}
        title="Leave Request Detail"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-60">
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
          <div className="flex-1">
            <form>
              <div className="flex flex-col gap-4 text-sm text-gray-700">
                <div>
                  <div className="font-semibold text-gray-600">Start Date</div>
                  <p>{selectedData?.start_date ?? "-"}</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-600">End Date</div>
                  <p>{selectedData?.end_date ?? "-"}</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-600">
                    Destination City
                  </div>
                  <p>{selectedData?.destination_city ?? "-"}</p>
                </div>
                <div>
                  <div className="font-semibold text-gray-600">
                    Total Leave Days
                  </div>
                  <p>{selectedData?.total_leave_days ?? "-"} days</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-600">Purpose</div>
                  <p>{selectedData?.purpose ?? "-"}</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DetailModal>

      <ActionModal
        isModalOpen={isActionModalOpen}
        onClose={onClose}
        title={`${selectedActionType} Official Travel Request`}
        onSubmit={handleSubmit(onCancel)}
        loading={loading}
        submitText={selectedActionType}
      >
        <form onSubmit={handleSubmit(onCancel)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date Travel</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.start_date ?? ""}
              />
            </div>
            <div>
              <label className="form-label">End Date Travel</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.end_date ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Destination City</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.destination_city ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Total Travel Days</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.total_leave_days ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Purpose</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.purpose ?? ""}
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
      </ActionModal>
    </Main>
  );
}
