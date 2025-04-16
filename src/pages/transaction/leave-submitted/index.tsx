import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import ActionModal from "@/components/Modals/ActionModal";
import DetailModal from "@/components/Modals/DetailModal";
import FilterData from "@/components/FilterData";
import Swal from "sweetalert2";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

export default function Home() {
  const [filter, setFilter] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "accept" atau "reject"
  const [actionRole, setActionRole] = useState(""); // "Superior" atau "DeptHead"
  const [selectedData, setSelectedData] = useState(null);
  const [isRefetch, setIsRefetch] = useState(false);
  const [role, setRole] = useState("");
  const api = `${process.env.NEXT_PUBLIC_API_URL}`;
  const schema = yup.object().shape({
    remark: yup.string().required("Please fill out remark"),
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      remark: "",
    },
  });

  useEffect(() => {
    // Mengambil role dari cookie dan set ke state
    const roleFromCookie = Cookies.get("role");
    setRole(roleFromCookie || ""); // Set role, jika tidak ada role di cookie maka set ke string kosong

    // Update value remark di form jika status_leave tersedia
    if (selectedData) {
      reset({
        remark:
          selectedData.status_id === 1 ? "" : selectedData.status_leave || "",
      });
    }
  }, [selectedData, reset]);

  const handleOpenActiondModal = (data, type, role) => {
    setSelectedData(data);
    setActionType(type); // "accept" atau "reject"
    setActionRole(role); // "Superior" atau "DeptHead"
    setIsActionModalOpen(true);
  };

  const handleOpenDetailModal = (data) => {
    let remark = "";

    console.log("remark", data);
    switch (data.status_id) {
      case 2:
        remark = data.accepted_remark;
        break;
      case 3:
        remark = data.approved_remark;
        break;
      case 4:
      case 5:
        remark = data.rejected_remark;
        break;
      default:
        remark = "";
    }

    setSelectedData({ ...data, remark });
    setIsDetailModalOpen(true);
  };

  const getRemarkLabel = (statusId) => {
    switch (statusId) {
      case 2:
        return "Accepted Remark";
      case 3:
        return "Approved Remark";
      case 4:
      case 5:
        return "Rejected Remark";
      default:
        return "Remark";
    }
  };

  const onClose = () => {
    setIsActionModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedData(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      //   const token = Cookies.get("token");
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to accept this leave request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, accept it!`,
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }
      console.log("ppppp");
      console.log("ppppp", selectedData.id);
      const role = Cookies.get("role");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxLeave/${selectedData.id}`,
        {
          remark: data.remark,
          role: role,
        }
      );
      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Leave has been successfully accepted",
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
        text: "Failed to accept leave. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleExportExcel = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${api}/api/trx/trxLeave/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from the API");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      const url = window.URL.createObjectURL(blob);

      link.href = url;
      link.download = "Data_Peminjaman_Buku.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Failed to export data.");
    }
  };

  type ITrLeave = {
    user_name: string;
    user_departement: string;
    status_id: number;
  };

  const columns: ColumnDef<ITrLeave>[] = [
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
      accessorKey: "leave_type_name",
      header: "Leave Type",
      enableSorting: true,
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
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="flex space-x-1 justify-center">
            <button
              className={clsx(
                "btn btn-icon bg-blue-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
              onClick={() => handleOpenDetailModal(data)}
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>

            {role === "Superior" && data.status_id === 1 && (
              <>
                <button
                  className="btn btn-icon bg-green-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
                  onClick={() =>
                    handleOpenActiondModal(data, "accept", "Superior")
                  }
                >
                  <i className="ki-outline ki-check-squared text-white"></i>
                </button>
                <button
                  className="btn btn-icon bg-red-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
                  onClick={() =>
                    handleOpenActiondModal(data, "reject", "Superior")
                  }
                >
                  <i className="ki-outline ki-cross-square text-white"></i>
                </button>
              </>
            )}

            {role === "DeptHead" && data.status_id === 2 && (
              <>
                <button
                  className="btn btn-icon bg-green-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
                  onClick={() =>
                    handleOpenActiondModal(data, "approved", "DeptHead")
                  }
                >
                  <i className="ki-outline ki-check-squared text-white"></i>
                </button>
                <button
                  className="btn btn-icon bg-red-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
                  onClick={() =>
                    handleOpenActiondModal(data, "rejected", "DeptHead")
                  }
                >
                  <i className="ki-outline ki-cross-square text-white"></i>
                </button>
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
            Leave submission data list
          </h1>

          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex gap-3 items-center">
              <FilterData
                role={role}
                onSelect={(filter) => setFilter(filter)}
              />
              <button
                className="btn btn-filled btn-primary"
                onClick={handleExportExcel}
              >
                <i className="ki-outline ki-plus-squared"></i>
                Export Data
              </button>
            </div>
          </div>

          <ActionModal
            isModalOpen={isActionModalOpen}
            onClose={onClose}
            title={
              actionType === "reject"
                ? actionRole === "Superior"
                  ? "Rejected Accepted Leave Request"
                  : "Rejected Approved Leave Request"
                : actionRole === "Superior"
                ? "Accepted Leave Request"
                : "Approved Leave Request"
            }
            onSubmit={handleSubmit(onSubmit)}
            loading={loading}
            submitText={
              actionType === "reject"
                ? "Rejected"
                : actionRole === "Superior"
                ? "Accepted"
                : "Approved"
            }
          >
            <form id="leaveForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="form-label">Start Date Leave</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.start_date ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">End Date Leave</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.end_date ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Leave Type Name</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.leave_type_name ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Leave Reason</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.leave_reason ?? ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="mt-6">
                  <label className="form-label">
                    {getRemarkLabel(selectedData?.status_id)}{" "}
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
            </form>
          </ActionModal>

          <DetailModal
            isModalOpen={isDetailModalOpen}
            onClose={onClose}
            title="Detail Modal"
            onSubmit={handleSubmit(onSubmit)}
            loading={loading}
          >
            <form id="leaveForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="form-label">Start Date Leave</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.start_date ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">End Date Leave</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.end_date ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Leave Type Name</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.leave_type_name ?? ""}
                  />
                </div>
                <div>
                  <label className="form-label">Leave Reason</label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedData?.leave_reason ?? ""}
                  />
                </div>
              </div>

              {/* Untuk remark */}
              <div className="grid grid-cols-1 gap-5">
                {selectedData?.status_id !== 1 && (
                  <div className="mt-6">
                    <label className="form-label">
                      {getRemarkLabel(selectedData?.status_id)}{" "}
                    </label>

                    <input
                      className="input w-full"
                      type="text"
                      readOnly
                      value={
                        selectedData?.status_id === 2
                          ? selectedData?.accepted_remark
                          : selectedData?.status_id === 3
                          ? selectedData?.approved_remark
                          : selectedData?.status_id === 4 ||
                            selectedData?.status_id === 5
                          ? selectedData?.reject_remark
                          : ""
                      }
                    />
                  </div>
                )}
              </div>
            </form>
          </DetailModal>
        </div>
      </div>

      <DataTable
        title={"Leave Submition"}
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxLeave?status=${filter}`}
        isRefetch={isRefetch}
      />
    </Main>
  );
}
