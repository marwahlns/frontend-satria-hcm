import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  approved_remark: yup.string().required("Approved remark is required"),
  rejected_remark: yup.string().required("Rejected remark is required"),
});

export default function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTrxOvt, setselectedTrxOvt] = useState(null);
  const [isRefresh, setIsRefresh] = useState<number>(0);
  const [submitLabel, setSubmitLabel] = useState("Submit");
  const [remarkField, setRemarkField] = useState<
    "approved_remark" | "rejected_remark"
  >("approved_remark");
  const [submitColor, setSubmitColor] = useState("btn-primary"); // Default warna

  const isEditing = selectedTrxOvt !== null;

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const resetForm = () => {
    reset({
      approved_remark: null,
    });
    setselectedTrxOvt(null);
    const modal = document.getElementById("modal_trxOvt");
    const closeButton = modal?.querySelector(
      '[data-modal-dismiss="true"]'
    ) as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let response;
      response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxOvertime/${selectedTrxOvt.id}`,
        {
          approved_remark: data.approved_remark,
        }
      );
      setIsRefresh((prev) => prev + 1);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to approve overtime. Please try again.");
      console.log("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproved = (trxOvt) => {
    console.log("trx Overtime object:", JSON.stringify(trxOvt, null, 2));

    const toggleButton = document.querySelector(
      '[data-modal-toggle="#modal_trxOvt"]'
    ) as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setRemarkField("approved_remark");
    setSubmitLabel("Approve");
    setSubmitColor("btn-success");
    setselectedTrxOvt(trxOvt);

    reset({
      approved_remark: trxOvt.approved_remark,
    });
  };

  const handleRejected = (trxOvt) => {
    console.log("trx Overtime object:", JSON.stringify(trxOvt, null, 2));

    const toggleButton = document.querySelector(
      '[data-modal-toggle="#modal_trxOvt"]'
    ) as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setRemarkField("rejected_remark");
    setSubmitLabel("Reject");
    setSubmitColor("btn-danger");
    setselectedTrxOvt(trxOvt);

    reset({
      approved_remark: trxOvt.approved_remark,
    });
  };

  useEffect(() => {
    const modalElement = document.getElementById("modal_trxOvt");

    const handleModalClose = (event) => {
      if (event.target === modalElement) {
        resetForm();
      }
    };
    modalElement?.addEventListener("click", handleModalClose);

    return () => {
      modalElement?.removeEventListener("click", handleModalClose);
    };
  }, []);

  type ITrOvt = {
    user: number;
    dept: number;
    shift: number;
    check_in_ovt: string;
    check_out_ovt: string;
  };

  const columns: ColumnDef<ITrOvt>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "user",
      header: "User",
      enableSorting: true,
    },
    {
      accessorKey: "dept",
      header: "Departement",
      enableSorting: true,
      //   cell: ({ row }) => row.original.user_name || "Unknown", // Menampilkan nama user
    },
    {
      accessorKey: "shift",
      header: "Nama Shift",
      enableSorting: true,
      //   cell: ({ row }) => row.original.shift_group_name || "Unknown", // Menampilkan nama shift group
    },
    {
      accessorKey: "check_in_ovt",
      header: "Check In",
      enableSorting: true,
    },
    {
      accessorKey: "check_out_ovt",
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
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            <button
              className={clsx(
                "btn btn-icon bg-green-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
              onClick={() => handleApproved(data)}
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
          </div>
        );
      },
    },
  ];

  return (
    <Main>
      <div className="mb-6">
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-bold text-gray-800">Shift List</h1>
          {/* Button */}
          <button
            className="btn btn-filled btn-primary"
            data-modal-toggle="#modal_trxOvt"
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxOvertime`}
        isRefresh={isRefresh}
      />

      {/* Modal*/}
      <div className="modal" data-modal="true" id="modal_trxOvt">
        <div className="modal-content max-w-[600px] top-[10%]">
          <div className="modal-header">
            <h3 className="modal-title">Data Shift</h3>
            <button
              className="btn btn-xs btn-icon btn-light"
              data-modal-dismiss="true"
              onClick={() => resetForm()}
            >
              <i className="ki-outline ki-cross"></i>
            </button>
          </div>
          <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-[300px] max-h-[95%]">
            <form id="ovtForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Employee Name
                  </label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedTrxOvt?.user ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Employee Departement
                  </label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedTrxOvt?.dept ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Employee Shift
                  </label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedTrxOvt?.shift ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Employee Status
                  </label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedTrxOvt?.user ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Overtime entry time
                  </label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedTrxOvt?.check_in_ovt ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Overtime time out
                  </label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedTrxOvt?.check_out_ovt ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Overtime note
                  </label>
                  <input
                    className="input w-full"
                    type="text"
                    readOnly
                    value={selectedTrxOvt?.note_ovt ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    {remarkField === "approved_remark"
                      ? "Approved Remark"
                      : "Reject Remark"}
                  </label>
                  <input
                    {...register(remarkField)}
                    className={`input w-full ${
                      errors[remarkField] ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder={
                      remarkField === "approved_remark"
                        ? "Approved Remark"
                        : "Reject Remark"
                    }
                  />
                  {errors[remarkField] && (
                    <p className="text-red-500 text-sm">
                      {errors[remarkField]?.message}
                    </p>
                  )}
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-center mt-2">{error}</p>
              )}
            </form>
          </div>
          <div className="modal-footer justify-end">
            <div className="flex gap-4">
              <button
                className="btn btn-light"
                data-modal-dismiss="true"
                onClick={() => resetForm()}
              >
                Cancel
              </button>
              <button
                className={`btn ${submitColor} flex justify-center grow`}
                disabled={loading}
                form="ovtForm"
              >
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
                  submitLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
}
