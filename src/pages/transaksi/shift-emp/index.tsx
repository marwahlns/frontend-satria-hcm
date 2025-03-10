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
  code: yup.string().required("Code is required"),

  id_user: yup.string().required("Employee is required"),

  id_shift_group: yup.string().required("Shift Group is required"),

  valid_from: yup
    .string()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/, "Valid From must be in YYYY-MM format")
    .required("Valid From is required"),

  valid_to: yup
    .string()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/, "Valid To must be in YYYY-MM format")
    .required("Valid To is required"),
});

export default function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTrxShift, setselectedTrxShift] = useState(null);
  const [isRefresh, setIsRefresh] = useState<number>(0);
  const [groupShift, setGroupShifts] = useState([]);
  const [employee, setEmployees] = useState([]);

  const isEditing = selectedTrxShift !== null;

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const fetchGroupShifts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift-group`
      );
      setGroupShifts(response.data.data.data);
    } catch (error) {
      console.error("Gagal mengambil data group shift:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/user`
      );
      setEmployees(response.data.data.data);
    } catch (error) {
      console.error("Gagal mengambil data employee:", error);
    }
  };

  const resetForm = () => {
    reset({
      code: null,
      id_user: "",
      id_shift_group: "",
      valid_from: "",
      valid_to: "",
    });
    setselectedTrxShift(null);
    const modal = document.getElementById("modal_shiftEmp");
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/shift-employee/${selectedTrxShift.id}`,
          {
            code: data.code,
            id_user: data.id_user,
            id_shift_group: data.id_shift_group,
            valid_from: data.valid_from,
            valid_to: data.valid_to,
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/shift-employee`,
          {
            code: data.code,
            id_user: data.id_user,
            id_shift_group: data.id_shift_group,
            valid_from: data.valid_from,
            valid_to: data.valid_to,
          }
        );
      }
      setIsRefresh((prev) => prev + 1);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to save Employee Shift. Please try again.");
      console.log("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (shiftEmp) => {
    const toggleButton = document.querySelector(
      '[data-modal-toggle="#modal_shiftEmp"]'
    ) as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setselectedTrxShift(shiftEmp);

    reset({
      code: shiftEmp.code,
      id_user: shiftEmp.id_user,
      id_shift_group: shiftEmp.id_shift_group,
      valid_from: shiftEmp.valid_from,
      valid_to: shiftEmp.valid_to,
    });
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this Shift Employee?",
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/shift-employee/${id}`
        );
        Swal.fire(
          "Deleted!",
          "The Shift Employee has been deleted.",
          "success"
        );
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the employee.", "error");
      }
      setIsRefresh((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const modalElement = document.getElementById("modal_shiftEmp");

    const handleModalClose = (event) => {
      if (event.target === modalElement) {
        resetForm();
      }
    };

    fetchEmployees();
    fetchGroupShifts();
    modalElement?.addEventListener("click", handleModalClose);

    return () => {
      modalElement?.removeEventListener("click", handleModalClose);
    };
  }, []);

  type IEmployee = {
    id: number;
    code: number;
    user_name: string;
    shift_group_name: string;
    valid_from: string;
    valid_to: string;
  };

  const columns: ColumnDef<IEmployee>[] = [
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
      accessorKey: "id_user",
      header: "Employee Name",
      enableSorting: true,
      cell: ({ row }) => row.original.user_name || "Unknown", // Menampilkan nama user
    },
    {
      accessorKey: "id_shift_group",
      header: "Nama Shift",
      enableSorting: true,
      cell: ({ row }) => row.original.shift_group_name || "Unknown", // Menampilkan nama shift group
    },
    {
      accessorKey: "valid_from",
      header: "Valid From",
      enableSorting: true,
    },
    {
      accessorKey: "valid_to",
      header: "Valid To",
      enableSorting: true,
    },
    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex space-x-1 justify-center">
            <button className="btn btn-icon bg-blue-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]">
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            <button
              className="btn btn-icon bg-orange-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
              onClick={() => handleUpdate(data)}
            >
              <i className="ki-outline ki-pencil text-white"></i>
            </button>
            <button
              className="btn btn-icon bg-red-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
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
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800">Shift Employee</h1>

        <div className="flex items-center justify-end gap-4 mt-4">
          {/* Button */}
          <div className="flex justify-start mt-4">
            <input className="file-input" type="file" accept=".xlsx" />
          </div>
          <div className="flex justify-start mt-4">
            <button className="btn btn-filled btn-success">Upload Data</button>
          </div>
          <div className="flex justify-start mt-4">
            <button className="btn btn-filled btn-info">
              Download Template Import
            </button>
          </div>
          <div className="flex justify-start mt-4">
            <button
              className="btn btn-filled btn-primary"
              data-modal-toggle="#modal_shiftEmp"
            >
              <i className="ki-outline ki-plus-squared"></i>
              Add Data
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/shift-employee`}
        isRefresh={isRefresh}
      />

      {/* Modal */}
      <div className="modal" data-modal="true" id="modal_shiftEmp">
        <div className="modal-content max-w-[600px] top-[10%]">
          <div className="modal-header">
            <h3 className="modal-title">Shift Employee Data</h3>
            <button
              className="btn btn-xs btn-icon btn-light"
              data-modal-dismiss="true"
              onClick={() => resetForm()}
            >
              <i className="ki-outline ki-cross"></i>
            </button>
          </div>
          <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3">
            <form id="shiftEmpForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                {/* Valid From (Month & Year) */}
                <div>
                  <label className="block text-sm font-medium">
                    Valid From
                  </label>
                  <input
                    {...register("valid_from")}
                    className={`input w-full ${
                      errors.valid_from ? "border-red-500" : ""
                    }`}
                    type="month"
                  />
                  {errors.valid_from && (
                    <p className="text-red-500 text-sm">
                      {errors.valid_from.message}
                    </p>
                  )}
                </div>

                {/* Valid To (Month & Year) */}
                <div>
                  <label className="block text-sm font-medium">Valid To</label>
                  <input
                    {...register("valid_to")}
                    className={`input w-full ${
                      errors.valid_to ? "border-red-500" : ""
                    }`}
                    type="month"
                  />
                  {errors.valid_to && (
                    <p className="text-red-500 text-sm">
                      {errors.valid_to.message}
                    </p>
                  )}
                </div>
                {/* Code Input (Text) */}
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
                  <label className="block text-sm font-medium">
                    Employee Name
                  </label>
                  <select {...register(`id_user`)} className="select">
                    <option value="">Pilih Employee</option>
                    {employee.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  {errors.id_user && (
                    <p className="text-red-500 text-sm">
                      {errors.id_user.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Shift Group
                  </label>
                  <select {...register(`id_shift_group`)} className="select">
                    <option value="">Pilih Shift Group</option>
                    {groupShift.map((groupShift) => (
                      <option key={groupShift.id} value={groupShift.id}>
                        {groupShift.nama}
                      </option>
                    ))}
                  </select>
                  {errors.id_user && (
                    <p className="text-red-500 text-sm">
                      {errors.id_user.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message */}
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
                form="shiftEmpForm"
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
