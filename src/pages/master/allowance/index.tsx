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
  allowance_name: yup
    .string()
    .required("Allowance name is required"),

  nominal: yup
    .number()
    .required("Nominal is required")
});

export default function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAllowance, setselectedAllowance] = useState(null);
  const [isRefresh, setIsRefresh] = useState<number>(0);
  const isEditing = selectedAllowance !== null;

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
      allowance_name: "",
      nominal: (null),
    });
    setselectedAllowance(null);
    const modal = document.getElementById("modal_allowance");
    const closeButton = modal?.querySelector('[data-modal-dismiss="true"]') as HTMLElement;
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/allowance/${selectedAllowance.id}`,
          {
            allowance_name: data.allowance_name,
            nominal: data.nominal,
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/allowance`,
          {
            allowance_name: data.allowance_name,
            nominal: data.nominal
          }
        );
      }
      setIsRefresh((prev) => prev + 1);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan allowance. Silakan coba lagi.");
      console.log("Error: "+err)
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (allowance) => {
    const toggleButton = document.querySelector('[data-modal-toggle="#modal_allowance"]') as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setselectedAllowance(allowance);

    reset({
      allowance_name: allowance.allowance_name,
      nominal: allowance.nominal,
    });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this allowance?",
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/allowance/${id}`
        );
        Swal.fire("Deleted!", "The allowance has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the allowance.", "error");
      }
      setIsRefresh((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const modalElement = document.getElementById("modal_allowance");

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

  type IAllowance = {
    id: string;
    allowance_name: string;
    nominal: number;
  };

  const columns: ColumnDef<IAllowance>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "allowance_name",
      header: "Allowance Name",
      enableSorting: true,
    },
    {
      accessorKey: "nominal",
      header: "Nominal",
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
          <h1 className="text-3xl font-bold text-gray-800">Allowance List</h1>
          {/* Button */}
          <button className="btn btn-filled btn-primary" data-modal-toggle="#modal_allowance">
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/allowance`}
        isRefresh={isRefresh}
      />

      {/* Modal */}
      <div className="modal" data-modal="true" id="modal_allowance">
        <div className="modal-content max-w-[600px] top-[10%]">
          <div className="modal-header">
            <h3 className="modal-allowance_name">
              Data Allowance
            </h3>
            <button className="btn btn-xs btn-icon btn-light" data-modal-dismiss="true" onClick={() => resetForm()}>
              <i className="ki-outline ki-cross">
              </i>
            </button>
          </div>
          <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3">
            <form id="allowanceForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    {...register("allowance_name")}
                    className={`input w-full ${errors.allowance_name ? "border-red-500" : ""}`}
                    type="text"
                    placeholder="Allowance Name"
                  />
                  {errors.allowance_name && <p className="text-red-500 text-sm">{errors.allowance_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Nominal</label>
                  <input
                    {...register("nominal")}
                    className={`input w-full ${errors.nominal ? "border-red-500" : ""}`}
                    type="number"
                    placeholder="Nominal"
                  />
                  {errors.nominal && <p className="text-red-500 text-sm">{errors.nominal.message}</p>}
                </div>
              </div>
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
          </div>
          <div className="modal-footer justify-end">
            <div className="flex gap-4">
              <button className="btn btn-light" data-modal-dismiss="true" onClick={() => resetForm()}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex justify-center grow"
                disabled={loading}
                form="allowanceForm"
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
