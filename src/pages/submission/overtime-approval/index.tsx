import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import ActionModal from "@/components/Modals/ActionModal";
import DetailModal from "@/components/Modals/DetailModal";
import FilterData from "@/components/FilterData";
import Swal from "sweetalert2";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import StatusStepper from "@/components/StatusStepper";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [isRefetch, setIsRefetch] = useState(false);
  const [filter, setFilter] = useState<{ month: string; year: string; status?: number }>({
    month: "",
    year: "",
    status: 0,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const schema = yup.object().shape({
    remark: yup.string().required("Please fill out remark"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      remark: "",
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

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const onClose = () => {
    setIsActionModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedData(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this overtime request?`,
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
          remark: data.remark,
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
      console.error("Error exporting EXCEL:", error);
      alert("Failed to export Excel.");
    }
  };

  type ITrOvertime = {
    user_name: number;
    user_departement: number;
    shift_name: number;
    check_in: string;
    check_out: string;
    status_id: number;
    actionType: string;
    modalType: string;
    status_submittion: string;
  };

  const columns: ColumnDef<ITrOvertime>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "user_name",
      header: "User",
      enableSorting: true,
    },
    {
      accessorKey: "user_departement",
      header: "Departement",
      enableSorting: true,
    },
    {
      accessorKey: "check_in",
      header: "Check In",
      enableSorting: true,
    },
    {
      accessorKey: "check_out",
      header: "Check Out",
      enableSorting: true,
    },
    {
      accessorKey: "note_ovt",
      header: "Note",
      enableSorting: true,
    },
    {
      accessorKey: "status_submittion",
      header: "Status",
      enableSorting: true,
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
            {(data.modalType === "detail" || data.modalType === "action") && (
              <button
                className="btn btn-sm btn-outline btn-primary"
                onClick={() => handleOpenDetailModal(data)}
              >
                <i className="ki-outline ki-eye text-white"></i>
              </button>
            )}

            {data.modalType === "action" && (
              <>
                <button
                  className="btn btn-sm btn-outline btn-success"
                  onClick={() => handleOpenActionModal(data, data.actionType)}
                >
                  <i className="ki-outline ki-check-squared text-white"></i>
                </button>

                <button
                  className="btn btn-sm btn-outline btn-danger"
                  data-tooltip="#reject_tooltip"
                  onClick={() => handleOpenActionModal(data, "Rejected")}
                >
                  <i className="ki-outline ki-cross-square text-white"></i>
                </button>
                <div className="tooltip" id="reject_tooltip">
                  Rejected
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
      <div className="mb-6">
        <div className="flex flex-col gap-4 mt-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Overtime submission data list
          </h1>

          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex gap-3 items-center">
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
              )}{" "}
              <button
                className="btn btn-filled btn-success"
                onClick={() => handleExportExcel()}
              >
                <i className="ki-filled ki-file-down"></i>
                Export to Excel
              </button>
            </div>
          </div>

          <ActionModal
            isModalOpen={isActionModalOpen}
            onClose={onClose}
            title={`${selectedActionType} Overtime Request`}
            onSubmit={handleSubmit(onSubmit)}
            loading={loading}
            submitText={selectedActionType}
          >
            <form id="overtimeForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Umum */}
                <div>
                  <label className="form-label">Employee Name</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.user_name ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Employee Department</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.user_departement ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Check In</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.check_in ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Check Out</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.check_out ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Note Overtime</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.note_ovt ?? ""}
                  />
                </div>
              </div>

              <>
                {selectedActionType === "Approved" ||
                  (selectedActionType === "Rejected" &&
                    selectedData?.status_id === 2 && (
                      <div className="grid grid-cols-1 gap-5 mt-6">
                        <div>
                          <label className="form-label">Accepted Remark</label>
                          <input
                            className="input w-full"
                            type="text"
                            readOnly
                            value={selectedData?.accepted_remark ?? ""}
                          />
                        </div>
                      </div>
                    ))}

                <div className="grid grid-cols-1 gap-5 mt-6">
                  <div>
                    <label className="form-label">
                      {selectedActionType === "Approved" &&
                      selectedData?.status_id === 1
                        ? "Approved Remark"
                        : `${selectedActionType} Remark`}
                    </label>
                    <Controller
                      name="remark"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={clsx(
                            "input",
                            errors.remark
                              ? "border-red-500 hover:border-red-500"
                              : ""
                          )}
                        />
                      )}
                    />
                    {errors.remark && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.remark.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            </form>
          </ActionModal>

          <DetailModal
            isModalOpen={isDetailModalOpen}
            onClose={onClose}
            title="Overtime Request Detail"
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
                      <div className="font-semibold text-gray-600">
                        Check In Overtime
                      </div>
                      <p>{selectedData?.check_in_ovt ?? "-"}</p>
                    </div>

                    <div>
                      <div className="font-semibold text-gray-600">
                        Check Out Overtime
                      </div>
                      <p>{selectedData?.check_out_ovt ?? "-"}</p>
                    </div>

                    <div>
                      <div className="font-semibold text-gray-600">Note</div>
                      <p>{selectedData?.note_ovt ?? "-"}</p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </DetailModal>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=overtime&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />
    </Main>
  );
}
