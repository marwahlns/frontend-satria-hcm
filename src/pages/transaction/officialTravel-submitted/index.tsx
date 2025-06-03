import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import ActionModal from "@/components/Modals/ActionModalUpper";
import DetailModal from "@/components/Modals/DetailModalUpper";
import FilterData from "@/components/FilterData";
import Swal from "sweetalert2";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import StatusStepper from "@/components/StatusStepperOfficialTravel";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [isRefetch, setIsRefetch] = useState(false);
  const [filter, setFilter] = useState({ month: "", year: "", status: 0 });
  const [showFilter, setShowFilter] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const api = `${process.env.NEXT_PUBLIC_API_URL}`;
  const schema = yup.object().shape({
    remark: yup.string().required("Please fill out remark"),
    down_payment: yup.string().when("$isDownPayment", {
      is: true,
      then: (schema) => schema.required("Please fill out down payment"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema, {
      context: {
        isDownPayment: selectedData?.is_downPayment === true,
      },
    }),
    defaultValues: {
      remark: "",
      down_payment: "",
    },
  });

  const formatRupiahLive = (value: string): string => {
    if (!value) return "";
    const numberString = value.replace(/[^\d]/g, "");
    const number = parseInt(numberString);
    if (isNaN(number)) return "";
    return "Rp " + number.toLocaleString("id-ID");
  };

  function parseRupiah(str: string): number | null {
    const angka = str.replace(/\D/g, "");
    if (!angka) return null;
    return Number(angka);
  }

  const handleOpenActionModal = (data, actionType) => {
    setSelectedData(data);
    setSelectedActionType(actionType);
    setIsActionModalOpen(true);
  };

  const handleOpenDetailModal = (data) => {
    setSelectedData(data);
    setIsDetailModalOpen(true);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const onClose = () => {
    setIsActionModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedData(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this official travel request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${selectedActionType} it!`,
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }
      const token = Cookies.get("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/${selectedData.id}`,
        {
          remark: data.remark,
          actionType: selectedActionType,
          trxType: "officialTravel",
          down_payment: parseRupiah(data.down_payment),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: `Official travel has been successfully ${selectedActionType}.`,
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
        text: `Failed to ${selectedActionType} official travel. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleExportExcel = async () => {
    const token = Cookies.get("token");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            type: "officialTravel",
            exportData: true,
            status: filter.status,
            month: filter.month,
            year: filter.year,
            search: searchValue,
          },
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to export Excel file");
      }

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const fileName = `Data_OfficialTrave,_${yyyy}-${mm}-${dd}.xlsx`;

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export Excel.");
    }
  };

  type ITrOfficialTravel = {
    user_name: number;
    user_departement: number;
    purpose: string;
    destination_city: string;
    start_date: string;
    end_date: string;
    status_id: number;
    actionType: string;
    modalType: string;
    status_submittion: string;
  };

  const columns: ColumnDef<ITrOfficialTravel>[] = [
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
      accessorKey: "purpose",
      header: "Purpose",
      enableSorting: true,
    },
    {
      accessorKey: "destination_city",
      header: "Destination City",
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
      accessorKey: "status_submittion",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const statusId = row.original.status_id;
        const statusSubmittion = row.original.status_submittion;

        const getStatusColor = (statusId: number) => {
          switch (statusId) {
            case 1:
              return "badge badge-pill badge-outline badge-dark";
            case 2:
              return "badge badge-pill badge-outline badge-primary";
            case 3:
              return "badge badge-pill badge-outline badge-success";
            case 6:
              return "badge badge-pill badge-outline badge-danger";
            default:
              return "badge badge-pill badge-outline badge-warning";
          }
        };

        const badgeClass = getStatusColor(statusId);

        return (
          <div className="flex justify-center">
            <span className={`${badgeClass} text-center`}>
              {statusSubmittion ?? ""}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="flex space-x-1 justify-center">
            {/* Tombol Detail selalu tampil kalau modalType-nya sesuai */}
            {(data.modalType === "detail" || data.modalType === "action") && (
              <button
                className="btn btn-sm btn-outline btn-primary"
                onClick={() => handleOpenDetailModal(data)}
              >
                <i className="ki-outline ki-eye text-white"></i>
              </button>
            )}

            {data.modalType === "action" && data.status_id !== 7 && (
              <>
                <button
                  className="btn btn-sm btn-outline btn-success"
                  onClick={() => handleOpenActionModal(data, data.actionType)}
                >
                  <i className="ki-outline ki-check-squared text-white"></i>
                </button>

                <button
                  className="btn btn-sm btn-outline btn-danger"
                  data-tooltip="#reject_tooltip"
                  onClick={() => handleOpenActionModal(data, "Rejected")}
                >
                  <i className="ki-outline ki-cross-square text-white"></i>
                </button>
                <div className="tooltip" id="reject_tooltip">
                  Rejected
                </div>
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
            Official travel submission data list
          </h1>

          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="btn btn-filled btn-primary"
              >
                <i className="ki-filled ki-filter-tablet mr-1" />
                Filter
              </button>
              {showFilter && (
                <FilterData
                  onSelect={(selectedFilter) => {
                    setFilter(selectedFilter);
                    setShowFilter(false);
                  }}
                  mode="officialTravel"
                />
              )}{" "}
              <button
                className="btn btn-filled btn-success"
                onClick={() => handleExportExcel()}
              >
                <i className="ki-filled ki-file-down"></i>
                Export to Excel
              </button>
            </div>
          </div>

          <ActionModal
            isModalOpen={isActionModalOpen}
            onClose={onClose}
            title={`${selectedActionType} Official Travel Request`}
            onSubmit={handleSubmit(onSubmit)}
            loading={loading}
            submitText={selectedActionType}
          >
            <form id="officialTravelForm" onSubmit={handleSubmit(onSubmit)}>
              {/* === Travel Info Section === */}
              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Travel Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Employee Name", value: selectedData?.user_name },
                    {
                      label: "Employee Department",
                      value: selectedData?.user_departement,
                    },
                    {
                      label: "Destination City",
                      value: selectedData?.destination_city,
                    },
                    {
                      label: "Destination Place",
                      value: selectedData?.destination_place,
                    },
                    {
                      label: "Transportation",
                      value: selectedData?.transportation,
                    },
                    { label: "Lodging", value: selectedData?.lodging },
                    { label: "Work Status", value: selectedData?.work_status },
                    {
                      label: "Office Activities",
                      value: selectedData?.office_activities,
                    },
                    {
                      label: "Activity Agenda",
                      value: selectedData?.activity_agenda,
                    },
                    {
                      label: "Start Date Travel",
                      value: selectedData?.start_date,
                    },
                    { label: "End Date Travel", value: selectedData?.end_date },
                    { label: "Purpose Travel", value: selectedData?.purpose },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {item.label}
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={item.value ?? ""}
                        className="input w-full bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-8 bg-gray-50 rounded-lg p-5 border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Cost Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Symbol Currency",
                      value: selectedData?.symbol_currency,
                    },
                    {
                      label: "Currency",
                      value: selectedData?.currency,
                    },
                    {
                      label: "Down Payment",
                      value: formatRupiahLive(selectedData?.down_payment),
                    },
                    {
                      label: "Taxi Cost",
                      value: formatRupiahLive(selectedData?.taxi_cost),
                    },
                    {
                      label: "Purpose Rent Cost",
                      value: formatRupiahLive(selectedData?.rent_cost),
                    },
                    {
                      label: "Hotel Cost",
                      value: formatRupiahLive(selectedData?.hotel_cost),
                    },
                    {
                      label: "UPD Cost",
                      value: formatRupiahLive(selectedData?.upd_cost),
                    },
                    {
                      label: "Fiskal Cost",
                      value: formatRupiahLive(selectedData?.fiskal_cost),
                    },
                    {
                      label: "Other Cost",
                      value: formatRupiahLive(selectedData?.other_cost),
                    },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {item.label}
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={item.value || "-"}
                        className="input w-full bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  ))}

                  <div className="md:col-span-3 mt-8 border-t pt-4">
                    <div className="text-sm font-semibold text-red-600">
                      Total Cost
                    </div>
                    <p className="text-red-700 font-bold text-xl mt-1">
                      {formatRupiahLive(selectedData?.total_cost)}
                    </p>
                  </div>
                </div>

                {selectedData?.is_downPayment && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Down Payment
                    </label>
                    <Controller
                      name="down_payment"
                      control={control}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <input
                          ref={ref}
                          type="text"
                          className={clsx(
                            "input w-full",
                            errors.down_payment && "border-red-500"
                          )}
                          value={formatRupiahLive(value)}
                          onChange={(e) =>
                            onChange(formatRupiahLive(e.target.value))
                          }
                          onBlur={onBlur}
                        />
                      )}
                    />
                    {errors.down_payment && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.down_payment.message}
                      </p>
                    )}
                  </div>
                )}
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Remarks
                </h3>

                {(selectedActionType === "Approved" ||
                  selectedActionType === "Rejected") && (
                  <>
                    {[
                      "DivHead",
                      "DicDiv",
                      "DeptHeadHC",
                      "DivHeadHC",
                      "DicHC",
                      "Presdir",
                    ].includes(selectedData?.statusUser) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accepted Dept Head Remark
                        </label>
                        <input
                          className="input w-full bg-gray-100 cursor-not-allowed"
                          type="text"
                          readOnly
                          value={selectedData?.accepted_depthead_remark ?? ""}
                        />
                      </div>
                    )}

                    {[
                      "DicDiv",
                      "DeptHeadHC",
                      "DivHeadHC",
                      "DicHC",
                      "Presdir",
                    ].includes(selectedData?.statusUser) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved DivHead Remark
                        </label>
                        <input
                          className="input w-full bg-gray-100 cursor-not-allowed"
                          type="text"
                          readOnly
                          value={selectedData?.approved_divhead_remark ?? ""}
                        />
                      </div>
                    )}

                    {["DeptHeadHC", "DivHeadHC", "DicHC", "Presdir"].includes(
                      selectedData?.statusUser
                    ) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved DicDiv Remark
                        </label>
                        <input
                          className="input w-full bg-gray-100 cursor-not-allowed"
                          type="text"
                          readOnly
                          value={selectedData?.approved_dicdiv_remark ?? ""}
                        />
                      </div>
                    )}

                    {["DivHeadHC", "DicHC", "Presdir"].includes(
                      selectedData?.statusUser
                    ) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved Dept. Head HC Remark
                        </label>
                        <input
                          className="input w-full bg-gray-100 cursor-not-allowed"
                          type="text"
                          readOnly
                          value={
                            selectedData?.approved_depthead_hc_remark ?? ""
                          }
                        />
                      </div>
                    )}

                    {["DicHC", "Presdir"].includes(
                      selectedData?.statusUser
                    ) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved DivHead HC Remark
                        </label>
                        <input
                          className="input w-full bg-gray-100 cursor-not-allowed"
                          type="text"
                          readOnly
                          value={selectedData?.approved_divhead_hc_remark ?? ""}
                        />
                      </div>
                    )}

                    {["Presdir"].includes(selectedData?.statusUser) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved DIC HC Remark
                        </label>
                        <input
                          className="input w-full bg-gray-100 cursor-not-allowed"
                          type="text"
                          readOnly
                          value={selectedData?.approved_dichc_remark ?? ""}
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedActionType === "Approved" &&
                    selectedData?.status_id === 1
                      ? "Approved Remark"
                      : `${selectedActionType} Remark`}
                  </label>
                  <Controller
                    name="remark"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={clsx(
                          "input w-full",
                          errors.remark && "border-red-500"
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
              </section>
            </form>
          </ActionModal>

          <DetailModal
            isModalOpen={isDetailModalOpen}
            onClose={onClose}
            title="Official Travel Request Detail"
          >
            <div className="flex flex-col md:flex-row gap-8 p-4">
              <div className="w-full md:w-60">
                <StatusStepper
                  statusId={selectedData?.status_id ?? 1}
                  createdDate={selectedData?.created_at}
                  acceptedDeptHeadDate={selectedData?.accepted_depthead_date}
                  approvedDivHeadDate={selectedData?.approved_divhead_date}
                  approvedDicDivDate={selectedData?.approved_divhead_date}
                  approvedDeptHeadHCDate={
                    selectedData?.approved_depthead_hc_date
                  }
                  approvedDivHeadHCDate={selectedData?.approved_divhead_hc_date}
                  approvedDicHCDate={selectedData?.approved_dichc_date}
                  approvedPresdirDate={selectedData?.approved_presdir_date}
                  rejectedDate={selectedData?.rejected_date}
                  canceledDate={selectedData?.canceled_date}
                  acceptedDeptHeadRemark={
                    selectedData?.accepted_depthead_remark
                  }
                  approvedDivHeadRemark={selectedData?.approved_divhead_remark}
                  approvedDicDivRemark={selectedData?.approved_dicdiv_remark}
                  approvedDeptHeadHCRemark={
                    selectedData?.approved_depthead_hc_remark
                  }
                  approvedDivHeadHCRemark={
                    selectedData?.approved_divhead_hc_remark
                  }
                  approvedDicHCRemark={selectedData?.approved_dichc_remark}
                  approvedPresdirRemark={selectedData?.approved_presdir_remark}
                  rejectedRemark={selectedData?.rejected_remark}
                  canceledRemark={selectedData?.canceled_remark}
                  acceptToDeptHead={selectedData?.accept_to_depthead}
                  approveToDivHead={selectedData?.approve_to_divhead}
                  approveToDicDiv={selectedData?.approve_to_dicdiv}
                  approveToDeptHeadHC={selectedData?.approve_to_depthead_hc}
                  approveToDivHeadHC={selectedData?.approve_to_divhead_hc}
                  approveToDicDivHC={selectedData?.approve_to_dichc}
                  approveToPresdir={selectedData?.approve_to_presdir}
                />
              </div>

              <div className="flex-1 space-y-8">
                <form className="text-sm text-gray-700 space-y-8">
                  <section>
                    <h3 className="text-lg font-bold border-b pb-2 text-gray-800">
                      General Information
                    </h3>
                    <div className="flex flex-wrap gap-6 mt-4">
                      <div className="w-full md:w-[30%]">
                        <div className="font-semibold text-gray-600">Code</div>
                        <p>{selectedData?.code ?? "-"}</p>
                      </div>
                      {[
                        ["Destination City", selectedData?.destination_city],
                        ["Destination Place", selectedData?.destination_place],
                        ["Start Date", selectedData?.start_date],
                        ["End Date", selectedData?.end_date],
                        [
                          "Total Leave Days",
                          `${selectedData?.total_leave_days ?? "-"} days`,
                        ],
                        ["Transportation", selectedData?.transportation],
                        ["Lodging", selectedData?.lodging],
                        ["Work Status", selectedData?.work_status],
                        ["Office Activities", selectedData?.office_activities],
                        ["Purpose", selectedData?.purpose],
                        ["Activity Agenda", selectedData?.activity_agenda],
                      ].map(([label, value], idx) => (
                        <div key={idx} className="w-full md:w-[30%]">
                          <div className="font-semibold text-gray-600">
                            {label}
                          </div>
                          <p>{value ?? "-"}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-gray-50 rounded-xl shadow-md p-6 mt-8">
                    <h3 className="text-lg font-bold border-b pb-3 mb-4 text-gray-800">
                      Cost Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <div className="text-sm font-semibold text-gray-600">
                          Symbol Currency
                        </div>
                        <p className="text-gray-800 mt-1">
                          {selectedData?.symbol_currency ?? "-"}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-600">
                          Currency
                        </div>
                        <p className="text-gray-800 mt-1">
                          {selectedData?.currency ?? "-"}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-green-600">
                          Down Payment
                        </div>
                        <p className="text-green-700 font-semibold mt-1">
                          {formatRupiahLive(selectedData?.down_payment)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { label: "Taxi Cost", value: selectedData?.taxi_cost },
                        { label: "Rent Cost", value: selectedData?.rent_cost },
                        {
                          label: "Hotel Cost",
                          value: selectedData?.hotel_cost,
                        },
                        { label: "UPD Cost", value: selectedData?.upd_cost },
                        {
                          label: "Fiskal Cost",
                          value: selectedData?.fiskal_cost,
                        },
                        {
                          label: "Other Cost",
                          value: selectedData?.other_cost,
                        },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="text-sm font-semibold text-gray-600">
                            {item.label}
                          </div>
                          <p className="text-gray-800 mt-1">
                            {formatRupiahLive(item.value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 border-t pt-4">
                      <div className="text-sm font-semibold text-red-600">
                        Total Cost
                      </div>
                      <p className="text-red-700 font-bold text-xl mt-1">
                        {formatRupiahLive(selectedData?.total_cost)}
                      </p>
                    </div>
                  </section>
                </form>
              </div>
            </div>
          </DetailModal>
        </div>
      </div>

      <DataTable
        title="Official Travel Submission"
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=officialTravel&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />
    </Main>
  );
}
