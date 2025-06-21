import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import ActionModal from "@/components/Modals/ActionModalUpper";
import DetailModal from "@/components/Modals/DetailModalUpper";
import FilterData from "@/components/FilterData";
import Swal from "sweetalert2";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import StatusStepper from "@/components/StatusStepper";
import { IoMdPaper } from "react-icons/io";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [isRefetch, setIsRefetch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<{
    month: string;
    year: string;
    status?: number;
  }>({
    month: "",
    year: "",
    status: 0,
  });
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
  const handleShowFile = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this resign request?`,
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
          remark: data.remark,
          actionType: selectedActionType,
          trxType: "resign",
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
          text: `Resign has been successfully ${selectedActionType}.`,
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
        text: `Failed to ${selectedActionType} resign. Please try again.`,
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
            type: "resign",
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
      const fileName = `Data_Resign_${yyyy}-${mm}-${dd}.xlsx`;

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
        text: `Failed to export Excel.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  type ITrResign = {
    user_name: number;
    user_departement: number;
    effective_date: string;
    reason: string;
    status_id: number;
    actionType: string;
    modalType: string;
    status_submittion: string;
    file_upload: string;
  };

  const columns: ColumnDef<ITrResign>[] = [
    {
      accessorKey: "number",
      header: "No",
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
      accessorKey: "effective_date",
      header: "Effective Date",
      enableSorting: true,
    },
    // {
    //   accessorKey: "reason",
    //   header: "Reason",
    //   enableSorting: true,
    // },
    {
      accessorKey: "file_upload",
      header: "Resign Attachment",
      cell: ({ row }) => {
        const file = row.original.file_upload;
        if (file) {
          const fileUrl = `http://localhost:3000/uploads/file_resign/${file}`;
          return (
            <div className="flex justify-center cursor-pointer">
              <IoMdPaper
                size={24}
                color="#E53E3E"
                onClick={() => handleShowFile(fileUrl)}
                title="View PDF"
              />
            </div>
          );
        } else {
          return <span>No File</span>;
        }
      },
      enableSorting: false,
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
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Resign Submissions
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="btn btn-filled btn-primary"
            >
              <i className="ki-filled ki-filter-tablet mr-1" />
              Filter
            </button>

            {showFilter && (
              <div className="absolute top-12 left-0 z-50">
                <FilterData
                  onSelect={(selectedFilter) => {
                    setFilter(selectedFilter);
                    setShowFilter(false);
                  }}
                />
              </div>
            )}
          </div>

          <button
            className="btn btn-filled btn-success"
            onClick={handleExportExcel}
            disabled={loading}
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
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>

      <ActionModal
        isModalOpen={isActionModalOpen}
        onClose={onClose}
        title={`${selectedActionType} Resign Request`}
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitText={selectedActionType}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
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
                    ["Employee Name", selectedData?.user_name],
                    ["Employee Department", selectedData?.user_departement],
                    ["Effective Date", selectedData?.effective_date],
                    ["Resign Reason", selectedData?.reason],
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

          <section
            className={clsx(
              "rounded-xl shadow-md p-6 mt-8",
              selectedActionType === "Approved" && "bg-green-100",
              selectedActionType === "Rejected" && "bg-red-100",
              selectedActionType === "Accepted" && "bg-blue-100"
            )}
          >
            <h3 className="text-lg font-bold border-b pb-3 mb-4 text-gray-800">
              Remark
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="form-label mb-2">
                  {selectedActionType === "Approved" &&
                  selectedData?.status_id === 1
                    ? "Approved Remark"
                    : `${selectedActionType} Remark`}
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="remark"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      autoFocus
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
          </section>
        </form>
      </ActionModal>

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={onClose}
        title="Resign Request Detail"
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
            <section className="text-sm text-gray-700 space-y-8">
              <h3 className="text-lg font-bold border-b pb-2 text-gray-700">
                General Information
              </h3>
              <div className="flex flex-wrap gap-6 mt-4">
                {[
                  ["Employee Name", selectedData?.user_name],
                  ["Employee Department", selectedData?.user_departement],
                  ["Effective Date", selectedData?.effective_date],
                  ["Resign Reason", selectedData?.reason],
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
      </DetailModal>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=resign&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />
    </Main>
  );
}
