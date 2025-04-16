import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

const AcceptedModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedData,
}) => {
  const [loading, setLoading] = useState(false);
  const schema = yup.object().shape({
    accepted_remark: yup.string().required("Please fill out accepted remark"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      accepted_remark: "",
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
        text: `Do you want to accept this resign request?`,
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

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxResign/accepted/${selectedData.id}`,
        {
          ...data,
          accepted_remark: data.accepted_remark,
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
          text: "Resign has been successfully accepted",
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
        text: "Failed to accept resign. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Submission Leave Data
        </h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>

      {/* Form */}
      <form id="resignForm" onSubmit={handleSubmit(onSubmit)}>
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
              <label className="form-label">Reason Resign</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.reason ?? ""}
              />
            </div>
            <div>
              <label className="form-label">Effective Date Resign</label>
              <input
                className="input w-full"
                type="text"
                readOnly
                value={selectedData?.effective_date ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 gap-5">
              <div className="mt-6">
                <label className="form-label">Accepted Remark</label>
                <Controller
                  name="accepted_remark"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={clsx(
                        "input",
                        errors.accepted_remark
                          ? "border-red-500 hover:border-red-500"
                          : ""
                      )}
                    />
                  )}
                />
                {errors.accepted_remark && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accepted_remark.message}
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
              "Accepted"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AcceptedModal;
