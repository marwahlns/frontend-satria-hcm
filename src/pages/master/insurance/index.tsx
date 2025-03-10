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
  insurance_type: yup
    .string()
    .required("Title is required"),

  membership_number: yup
    .string()
    .required("Membership number is required"),
    
  deduction: yup
    .number()
    .required("Deduction is required"),
});

export default function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedInsurance, setselectedInsurance] = useState(null);
  const [isRefresh, setIsRefresh] = useState<number>(0);
  const isEditing = selectedInsurance !== null;

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
      insurance_type: "",
      membership_number: "",
      deduction: (null),
    });
    setselectedInsurance(null);
    const modal = document.getElementById("modal_insurance");
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/insurance/${selectedInsurance.id}`,
          {
            insurance_type: data.insurance_type,
            membership_number: data.membership_number,
            deduction: data.deduction,
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/insurance`,
          {
            insurance_type: data.insurance_type,
            membership_number: data.membership_number,
            deduction: data.deduction,
          }
        );
      }
      setIsRefresh((prev) => prev + 1);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan insurance. Silakan coba lagi.");
      console.log("Error: "+err)
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (insurance) => {
    const toggleButton = document.querySelector('[data-modal-toggle="#modal_insurance"]') as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setselectedInsurance(insurance);

    reset({
      insurance_type: insurance.insurance_type,
      membership_number: insurance.membership_number,
      deduction: insurance.deduction,
    });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this insurance?",
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/insurance/${id}`
        );
        Swal.fire("Deleted!", "The insurance has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the insurance.", "error");
      }
      setIsRefresh((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const modalElement = document.getElementById("modal_insurance");

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

  type IInsurance = {
    id: string;
    insurance_type: string;
    membership_number: string;
    deduction: string;
  };

  const columns: ColumnDef<IInsurance>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "insurance_type",
      header: "Insurance Type",
      enableSorting: true,
    },
    {
      accessorKey: "membership_number",
      header: "Membership Number",
      enableSorting: true,
    },
    {
        accessorKey: "deduction",
        header: "Deduction",
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
          <h1 className="text-3xl font-bold text-gray-800">Insurance List</h1>
          {/* Button */}
          <button className="btn btn-filled btn-primary" data-modal-toggle="#modal_insurance">
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/insurance`}
        isRefresh={isRefresh}
      />

      {/* Modal */}
      <div className="modal" data-modal="true" id="modal_insurance">
        <div className="modal-content max-w-[600px] top-[10%]">
          <div className="modal-header">
            <h3 className="modal-title">
              Data Insurance
            </h3>
            <button className="btn btn-xs btn-icon btn-light" data-modal-dismiss="true" onClick={() => resetForm()}>
              <i className="ki-outline ki-cross">
              </i>
            </button>
          </div>
          <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3">
            <form id="insuranceForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Insurance Type</label>
                  <input
                    {...register("insurance_type")}
                    className={`input w-full ${errors.insurance_type ? "border-red-500" : ""}`}
                    type="text"
                    placeholder="Insurance Type"
                  />
                  {errors.insurance_type && <p className="text-red-500 text-sm">{errors.insurance_type.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Membership Number</label>
                  <input
                    {...register("membership_number")}
                    className={`input w-full ${errors.membership_number ? "border-red-500" : ""}`}
                    type="number"
                    placeholder="Membership Number"
                  />
                  {errors.membership_number && <p className="text-red-500 text-sm">{errors.membership_number.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Deduction</label>
                  <input
                    {...register("deduction")}
                    className={`input w-full ${errors.deduction ? "border-red-500" : ""}`}
                    type="number"
                    placeholder="Deduction"
                  />
                  {errors.deduction && <p className="text-red-500 text-sm">{errors.deduction.message}</p>}
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
                form="insuranceForm"
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
