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
  code: yup
    .string()
    .required("Code is required")
    .matches(/^[A-Za-z0-9]+$/, "Code can only contain letters and numbers"),

  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),

  inTime: yup
    .string()
    .required("In Time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format must be HH:mm"),

  outTime: yup
    .string()
    .required("Out Time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format must be HH:mm"),

  graceBeforeIn: yup
    .number()
    .typeError("Grace Time Before In must be a number")
    .min(0, "Cannot be negative")
    .required("Grace Time Before In is required"),

  graceAfterIn: yup
    .number()
    .typeError("Grace Time After In must be a number")
    .min(0, "Cannot be negative")
    .required("Grace Time After In is required"),

  graceBeforeOut: yup
    .number()
    .typeError("Grace Time Before Out must be a number")
    .min(0, "Cannot be negative")
    .required("Grace Time Before Out is required"),

  graceAfterOut: yup
    .number()
    .typeError("Grace Time After Out must be a number")
    .min(0, "Cannot be negative")
    .required("Grace Time After Out is required"),
});

export default function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [isRefresh, setIsRefresh] = useState<number>(0);
  const isEditing = selectedShift !== null;

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
      code: "",
      name: "",
      inTime: "",
      outTime: "",
      graceBeforeIn: null,
      graceAfterIn: null,
      graceBeforeOut: null,
      graceAfterOut: null,
    });
    setSelectedShift(null);
    const modal = document.getElementById("modal_shift");
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

      if (isEditing) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift/${selectedShift.id}`,
          {
            code: data.code,
            nama: data.name,
            inTime: data.inTime,
            outTime: data.outTime,
            gtBeforeIn: data.graceBeforeIn,
            gtAfterIn: data.graceAfterIn,
            gtBeforeOut: data.graceBeforeOut,
            gtAfterOut: data.graceAfterOut,
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift`,
          {
            code: data.code,
            nama: data.name,
            inTime: data.inTime,
            outTime: data.outTime,
            gtBeforeIn: data.graceBeforeIn,
            gtAfterIn: data.graceAfterIn,
            gtBeforeOut: data.graceBeforeOut,
            gtAfterOut: data.graceAfterOut,
          }
        );
      }
      setIsRefresh((prev) => prev + 1);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan shift. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (shift) => {
    console.log("Full Shift object:", JSON.stringify(shift, null, 2));

    const toggleButton = document.querySelector(
      '[data-modal-toggle="#modal_shift"]'
    ) as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setSelectedShift(shift);
    console.log("shift cuyyy", shift);

    reset({
      code: shift.code,
      name: shift.name,
      inTime: shift.in_time,
      outTime: shift.out_time,
      graceBeforeIn: shift.gt_before_in,
      graceAfterIn: shift.gt_after_in,
      graceBeforeOut: shift.gt_before_out,
      graceAfterOut: shift.gt_after_out,
    });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this shift?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift/${id}`
        );
        Swal.fire("Deleted!", "The shift has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the shift.", "error");
      }
      setIsRefresh((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const modalElement = document.getElementById("modal_shift");

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

  type IShift = {
    id: string;
    code: string;
    nama: string;
    inTime: string;
    outTime: string;
    gtBeforeIn: number;
    gtAfterIn: number;
    gtBeforeOut: number;
    gtAfterOut: number;
  };

  const columns: ColumnDef<IShift>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "code",
      header: "Code",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "in_time",
      header: "In Time",
      enableSorting: true,
    },
    {
      accessorKey: "out_time",
      header: "Out Time",
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
                "btn btn-icon bg-orange-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
              onClick={() => handleUpdate(data)}
            >
              <i className="ki-outline ki-pencil text-white"></i>
            </button>
            <button
              className={clsx(
                "btn btn-icon bg-red-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
              onClick={() => handleDelete(data.id)}
            >
              <i className="ki-outline ki-trash text-white"></i>
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
            data-modal-toggle="#modal_shift"
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/shift`}
        isRefresh={isRefresh}
      />

      {/* Modal */}
      <div className="modal" data-modal="true" id="modal_shift">
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
            <form id="shiftForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Code</label>
                  <input
                    {...register("code")}
                    className={`input w-full ${
                      errors.code ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder="Code"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm">
                      {errors.code.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    {...register("name")}
                    className={`input w-full ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder="Name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">In Time</label>
                  <input
                    {...register("inTime")}
                    className={`input w-full ${
                      errors.inTime ? "border-red-500" : ""
                    }`}
                    type="time"
                  />
                  {errors.inTime && (
                    <p className="text-red-500 text-sm">
                      {errors.inTime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Out Time</label>
                  <input
                    {...register("outTime")}
                    className={`input w-full ${
                      errors.outTime ? "border-red-500" : ""
                    }`}
                    type="time"
                  />
                  {errors.outTime && (
                    <p className="text-red-500 text-sm">
                      {errors.outTime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Grace Time Before In
                  </label>
                  <input
                    {...register("graceBeforeIn")}
                    className="input w-full"
                    type="number"
                    placeholder="Grace Before In"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Grace Time After In
                  </label>
                  <input
                    {...register("graceAfterIn")}
                    className="input w-full"
                    type="number"
                    placeholder="Grace After In"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Grace Time Before Out
                  </label>
                  <input
                    {...register("graceBeforeOut")}
                    className="input w-full"
                    type="number"
                    placeholder="Grace Before Out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Grace Time After Out
                  </label>
                  <input
                    {...register("graceAfterOut")}
                    className="input w-full"
                    type="number"
                    placeholder="Grace After Out"
                  />
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
                type="submit"
                className="btn btn-primary flex justify-center grow"
                disabled={loading}
                form="shiftForm"
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
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
}
