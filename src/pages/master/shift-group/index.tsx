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

  hari: yup.object().shape({
    monday: yup.string().required("Required"),
    tuesday: yup.string().required("Required"),
    wednesday: yup.string().required("Required"),
    thursday: yup.string().required("Required"),
    friday: yup.string().required("Required"),
    saturday: yup.string().required("Required"),
    sunday: yup.string().required("Required"),
  }),
});

export default function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefresh, setIsRefresh] = useState<number>(0);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const isEditing = selectedShift !== null;

  const {
    reset,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      hari: {},
    },
  });

  const selectedShifts = watch("hari");

  const resetForm = () => {
    reset({
      code: "",
      name: "",
      hari: null,
    });
    setSelectedShift(null);
    const modal = document.getElementById("modal_shift_group");
    const closeButton = modal?.querySelector(
      '[data-modal-dismiss="true"]'
    ) as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  };

  useEffect(() => {
    const modalElement = document.getElementById("modal_shift_group");

    const handleModalClose = (event) => {
      if (event.target === modalElement) {
        resetForm();
      }
    };

    fetchShifts();

    modalElement?.addEventListener("click", handleModalClose);

    return () => {
      modalElement?.removeEventListener("click", handleModalClose);
    };
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift`
      );
      setShifts(response.data.data.data);
    } catch (error) {
      console.error("Gagal mengambil data shift:", error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let response;

      let formattedDetails;

      // Saat create, kirim index_day dan id_shift
      formattedDetails = Object.entries(data.hari)
        .filter(([day, shiftCode]) => shiftCode)
        .map(([day, shiftCode]) => ({
          index_day: day.charAt(0).toUpperCase() + day.slice(1), // Format hari jadi kapital
          id_shift: shiftCode,
        }));

      if (isEditing) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift-group/${selectedShift.id}`,
          {
            code: data.code,
            nama: data.name,
            details: formattedDetails, // Hanya id_shift untuk update
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift-group`,
          {
            code: data.code,
            nama: data.name,
            details: formattedDetails, // Kirim index_day & id_shift untuk create
          }
        );
      }

      setIsRefresh((prev) => prev + 1);
      resetForm();
    } catch (err) {
      console.error("Error submitting shift group:", err);
      setError("Gagal menyimpan shift. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (shift) => {
    // Buka modal
    const toggleButton = document.querySelector(
      '[data-modal-toggle="#modal_shift_group"]'
    ) as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }

    setSelectedShift(shift);

    // Transformasi data details untuk hanya mengambil id_shift per hari
    const updatedDays = shift.details.reduce((acc, item) => {
      if (item.index_day) {
        acc[item.index_day.toLowerCase()] = item.id_shift;
      }
      return acc;
    }, {});

    // Set nilai awal form dengan format yang benar
    reset({
      code: shift.code,
      name: shift.nama,
      hari: updatedDays, // Masukkan ke dalam objek `hari`
    });

    console.log("Form Reset with Data:", {
      code: shift.code,
      name: shift.nama,
      hari: updatedDays, // Debugging untuk memastikan format benar
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/shift-group/${id}`
        );

        Swal.fire("Deleted!", "The shift has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the shift.", "error");
      }
      setIsRefresh((prev) => prev + 1);
    }
  };

  type IShiftGroup = {
    id: string;
    code: string;
    nama: string;
    details: Record<string, string>;
  };

  const columns: ColumnDef<IShiftGroup>[] = [
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
      accessorKey: "nama",
      header: "Name",
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
          <h1 className="text-3xl font-bold text-gray-800">Shift Group List</h1>
          {/* Button */}
          <button
            className="btn btn-filled btn-primary"
            data-modal-toggle="#modal_shift_group"
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/shift-group`}
        isRefresh={isRefresh}
      />

      {/* Modal */}
      <div className="modal" data-modal="true" id="modal_shift_group">
        <div className="modal-content max-w-[600px] top-[10%]">
          <div className="modal-header">
            <h3 className="modal-title">Data Shift Group</h3>
            <button
              className="btn btn-xs btn-icon btn-light"
              data-modal-dismiss="true"
              onClick={() => resetForm()}
            >
              <i className="ki-outline ki-cross"></i>
            </button>
          </div>
          <div className="modal-body scrollable-y py-0 my-5 pl-6 pr-3 mr-3 h-[300px] max-h-[95%]">
            <form id="shiftGroupForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4">
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

                <table className="w-full border-collapse border border-red-300 mt-4">
                  <thead>
                    <tr className="bg-red-200">
                      <th className="border border-gray-300 p-2">Day</th>
                      <th className="border border-gray-300 p-2">Shift</th>
                      <th className="border border-gray-300 p-2">In Time</th>
                      <th className="border border-gray-300 p-2">Out Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ] as const
                    ).map((day) => (
                      <tr key={day} className="text-center">
                        <td className="border border-gray-300 p-2">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <select
                            {...register(`hari.${day}` as any)}
                            className="select w-full"
                          >
                            <option value="">Pilih Shift</option>
                            {shifts.map((shift) => (
                              <option key={shift.code} value={shift.code}>
                                {shift.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            className="cursor-not-allowed w-full text-center"
                            type="time"
                            readOnly
                            value={
                              shifts.find(
                                (shift) => shift.code === selectedShifts?.[day]
                              )?.in_time || ""
                            }
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            className="cursor-not-allowed w-full text-center"
                            type="time"
                            readOnly
                            value={
                              shifts.find(
                                (shift) => shift.code === selectedShifts?.[day]
                              )?.out_time || ""
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                form="shiftGroupForm"
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
