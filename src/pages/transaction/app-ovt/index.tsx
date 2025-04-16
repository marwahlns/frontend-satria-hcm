import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import Modal from "../../../components/Modal";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  approved_remark: yup.string().when("$remarkField", {
    is: "approved_remark",
    then: (schema) => schema.required("approved Remark is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  rejected_remark: yup.string().when("$remarkField", {
    is: "rejected_remark",
    then: (schema) => schema.required("Rejected remark is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrxOvt, setSelectedTrxOvt] = useState(null);
  const [isRefresh, setIsRefresh] = useState<number>(0);
  const [submitLabel, setSubmitLabel] = useState("");
  const [remarkField, setRemarkField] = useState<
    "approved_remark" | "rejected_remark"
  >("approved_remark");
  const [submitColor, setSubmitColor] = useState("btn-primary");
  const [filter, setFilter] = useState<number>(0);
  const isEditing = selectedTrxOvt !== null;
  const [isViewing, setIsViewing] = useState(false);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { remarkField },
  });

  const resetForm = () => {
    reset({
      approved_remark: null,
      rejected_remark: null,
    });
    setIsModalOpen(false);
    setSelectedTrxOvt(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    let isapproved = remarkField === "approved_remark";
    let endpoint = isapproved ? "approved" : "rejected";
    let payload = isapproved
      ? { approved_remark: data.approved_remark }
      : { rejected_remark: data.rejected_remark };

    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${
          isapproved ? "accept" : "reject"
        } this overtime request?`,
        icon: isapproved ? "success" : "error",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${isapproved ? "accept" : "reject"} it!`,
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxOvertime/${endpoint}/${selectedTrxOvt.id}`,
        payload
      );

      setIsRefresh((prev) => prev + 1);

      Swal.fire({
        title: "Success!",
        text: `Overtime has been successfully ${
          isapproved ? "approved" : "rejected"
        }.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: `Failed to ${
          isapproved ? "accept" : "reject"
        } overtime. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleapproved = (trxOvt) => {
    setIsViewing(false);
    setIsModalOpen(true);
    const toggleButton = document.querySelector(
      '[data-modal-toggle="#modal_trxOvt"]'
    ) as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setRemarkField("approved_remark");
    setSubmitLabel("approved");
    setSubmitColor("btn-success");
    setSelectedTrxOvt(trxOvt);

    reset({
      approved_remark: trxOvt.approved_remark || "",
      rejected_remark: "",
    });
  };

  const handleRejected = (trxOvt) => {
    setIsViewing(false);
    setIsModalOpen(true);

    const toggleButton = document.querySelector(
      '[data-modal-toggle="#modal_trxOvt"]'
    ) as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setRemarkField("rejected_remark");
    setSubmitLabel("Reject");
    setSubmitColor("btn-danger");
    setSelectedTrxOvt(trxOvt);

    reset({
      approved_remark: "",
      rejected_remark: trxOvt.rejected_remark || "",
    });
  };

  const handleView = (trxOvt) => {
    setIsViewing(true);
    setIsModalOpen(true);
    setSelectedTrxOvt(trxOvt);
    if (trxOvt.status_id === 3) {
      setRemarkField("approved_remark");
    } else if (trxOvt.status_id === 4) {
      setRemarkField("rejected_remark");
    }
    reset({
      approved_remark: trxOvt?.approved_remark ?? "",
      rejected_remark: trxOvt?.rejected_remark ?? "",
    });
  };

  useEffect(() => {
    if (selectedTrxOvt) {
      reset({
        approved_remark: selectedTrxOvt.approved_remark ?? "",
        rejected_remark: selectedTrxOvt.rejected_remark ?? "",
      });
    }
  }, [selectedTrxOvt, reset]);

  type ITrOvt = {
    user: number;
    dept: number;
    shift: number;
    check_in_ovt: string;
    check_out_ovt: string;
    status_id: number;
  };

  const columns: ColumnDef<ITrOvt>[] = [
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
      header: "Departement",
      enableSorting: true,
    },
    {
      accessorKey: "shift",
      header: "Nama Shift",
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
              onClick={() => handleView(data)}
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            {data.status_id === 2 && (
              <>
                <button
                  className={clsx(
                    "btn btn-icon bg-green-500 btn-xs transition-transform",
                    "hover:scale-[105%]",
                    "active:scale-[100%]"
                  )}
                  onClick={() => handleapproved(data)}
                >
                  <i className="ki-outline ki-check-squared text-white"></i>
                </button>
                <button
                  className={clsx(
                    "btn btn-icon bg-red-500 btn-xs transition-transform",
                    "hover:scale-[105%]",
                    "active:scale-[100%]"
                  )}
                  onClick={() => handleRejected(data)}
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
            Overtime submission data list
          </h1>

          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex gap-3 items-center">
              <div
                className="dropdown"
                data-dropdown="true"
                data-dropdown-trigger="click"
              >
                <button className="dropdown-toggle btn btn-light">
                  <i className="ki-filled ki-filter-tablet"></i>
                  Filter Data
                </button>
                <div className="dropdown-content w-full max-w-56 py-2">
                  <div className="menu menu-default flex flex-col w-full">
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(0)}>
                        <span className="menu-title">All</span>
                      </a>
                    </div>
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(2)}>
                        <span className="menu-title">Pending</span>
                      </a>
                    </div>
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(3)}>
                        <span className="menu-title">approved</span>
                      </a>
                    </div>
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(4)}>
                        <span className="menu-title">Rejected</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Export */}
              <button className="btn btn-filled btn-primary">
                <i className="ki-outline ki-plus-squared"></i>
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxOvertime?status=${filter}`}
        isRefresh={isRefresh}
      />

      <Modal isModalOpen={isModalOpen}>
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Submission Overtime Data
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={resetForm}
          >
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>

        {/* Form */}
        <form id="ovtForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body max-h-[65vh] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Employee Name</label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={selectedTrxOvt?.user ?? ""}
                />
              </div>
              <div>
                <label className="form-label">Employee Department</label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={selectedTrxOvt?.dept ?? ""}
                />
              </div>
              <div>
                <label className="form-label">Employee Shift</label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={selectedTrxOvt?.shift ?? ""}
                />
              </div>
              <div>
                <label className="form-label">Employee Status</label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={selectedTrxOvt?.user ?? ""}
                />
              </div>
              <div>
                <label className="form-label">Overtime Entry Time</label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={selectedTrxOvt?.check_in ?? ""}
                />
              </div>
              <div>
                <label className="form-label">Overtime Time Out</label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={selectedTrxOvt?.check_out ?? ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div className="mt-6">
                {" "}
                <label className="form-label">Overtime Note</label>
                <input
                  className="input w-full"
                  type="text"
                  readOnly
                  value={selectedTrxOvt?.note_ovt ?? ""}
                />
              </div>
              {!(isViewing && selectedTrxOvt?.status_id === 2) && (
                <div>
                  <label className="form-label">
                    {selectedTrxOvt?.status_id === 3
                      ? "approved Remark"
                      : selectedTrxOvt?.status_id === 4
                      ? "Reject Remark"
                      : "Remark"}
                  </label>
                  {selectedTrxOvt?.status_id === 2 ? (
                    <input
                      {...register(remarkField)}
                      className={`input w-full ${
                        errors[remarkField] ? "border-red-500" : ""
                      }`}
                      type="text"
                      placeholder={
                        remarkField === "approved_remark"
                          ? "approved Remark"
                          : "Reject Remark"
                      }
                    />
                  ) : (
                    <input
                      {...register(remarkField)}
                      className="input w-full"
                      type="text"
                      readOnly
                      value={
                        selectedTrxOvt ? selectedTrxOvt[remarkField] ?? "" : ""
                      }
                    />
                  )}
                  {errors[remarkField] && (
                    <p className="text-red-500 text-sm">
                      {errors[remarkField]?.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isViewing && (
            <div className="flex justify-end items-center mt-6 space-x-3 mr-5">
              <button
                type="button"
                className="btn btn-light"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${submitColor} flex items-center`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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
                  submitLabel
                )}
              </button>
            </div>
          )}
        </form>
      </Modal>
    </Main>
  );
}
