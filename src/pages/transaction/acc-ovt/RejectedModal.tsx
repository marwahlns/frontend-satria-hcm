import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

const RejectedModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedData,
}) => {
  const [loading, setLoading] = useState(false);
  const schema = yup.object().shape({
    rejected_remark: yup.string().required("Please fill out rejected remark"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rejected_remark: "",
    },
  });

  useEffect(() => {
    if (isModalOpen === false) {
      reset();
    }
  }, [isModalOpen, reset]);

  const onSubmit = async (data) => {
    try {
      //   const token = Cookies.get("token");
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to reject this overtime request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, reject it!`,
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxOvertime/rejected/${selectedData.id}`,
        {
          ...data,
          rejected_remark: data.rejected_remark,
        }
        // {
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //     },
        // },
      );
      if (response.status == 201) {
        Swal.fire({
          title: "Success!",
          text: "overtime has been successfully rejected",
          icon: "success",
          confirmButtonText: "OK",
        });
        setRefetch(!isRefetch);
        onClose();
        reset();
      } else {
        onClose();
        reset();
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to reject leave. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Modal isModalOpen={isModalOpen}>
      {/* Header: Judul Modal */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Submission Overtime Data
        </h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
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
                value={selectedData?.user_name ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Employee Department</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.dept_name ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Employee Shift</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.shift ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Employee Status</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.user ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Overtime Entry Time</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.check_in ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Overtime Time Out</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.check_out ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div className="mt-6">
              <label className="form-label">Overtime Note</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.note_ovt ?? ""}
              />
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div className="mt-6">
                <label className="form-label">rejected Remark</label>
                <Controller
                  name="rejected_remark"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={clsx(
                        "input",
                        errors.rejected_remark
                          ? "border-red-500 hover:border-red-500"
                          : ""
                      )}
                    />
                  )}
                />
                {errors.rejected_remark && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.rejected_remark.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center mt-6 space-x-3 mr-5">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success flex items-center"
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
              "Rejected"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectedModal;
