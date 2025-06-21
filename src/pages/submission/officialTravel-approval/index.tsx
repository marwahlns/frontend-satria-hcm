import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
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
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [isRefetch, setIsRefetch] = useState(false);
  const [filter, setFilter] = useState<{
    month: string;
    year: string;
    status?: number;
  }>({
    month: "",
    year: "",
    status: 0,
  });
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
    setValue,
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
  useEffect(() => {
    if (selectedData?.is_downPayment && selectedData.total_cost) {
      setValue(
        "down_payment",
        formatRupiahLive(selectedData.total_cost.toString())
      );
    }
  }, [selectedData, setValue]);

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
      setLoading(true);
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this official travel request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${selectedActionType} it!`,
        cancelButtonText: "Discard",
        reverseButtons: true,
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
    } finally {
      setLoading(false);
    }
  };
  const handleExportPDF = async (searchId) => {
    const token = Cookies.get("token");
    try {
      setLoading(true);
      setLoadingId(searchId);
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
            search: searchId,
          },
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to export PDF file");
      }

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const fileName = `Data_Official_Travel_${yyyy}-${mm}-${dd}.pdf`;

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to export pdf`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setLoadingId(null);
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
    id: number;
    code: string;
    user_name: number;
    user_departement: number;
    purpose: string;
    destination_place1: string;
    destination_place2: string;
    destination_place3: string;
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
      header: "No",
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
    // {
    //   accessorKey: "purpose",
    //   header: "Purpose",
    //   enableSorting: true,
    // },
    {
      accessorKey: "destination_place1",
      header: "Destination Place",
      enableSorting: true,
      cell: ({ row }) => {
        const data = row.original;

        const places = [
          data.destination_place1,
          data.destination_place2,
          data.destination_place3,
        ].filter(Boolean);

        if (places.length === 0) return "-";

        const firstPlace = places[0];

        return places.length > 1 ? `${firstPlace}, etc` : firstPlace;
      },
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      enableSorting: false,
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      enableSorting: false,
    },
    {
      accessorKey: "status_submittion",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const code = row.original.code;
        const statusId = row.original.status_id;
        const statusSubmittion = row.original.status_submittion;

        const getStatusColor = (statusId: number, code: string) => {
          const isDomestik = code.startsWith("TRF2");

          switch (statusId) {
            case 1:
              return "badge badge-pill badge-outline badge-dark";
            case 8:
            case 9:
            case 10:
            case 12:
            case 13:
              return "badge badge-pill badge-outline badge-primary";
            case 11:
              return isDomestik
                ? "badge badge-pill badge-outline badge-success"
                : "badge badge-pill badge-outline badge-primary";
            case 14:
              return !isDomestik
                ? "badge badge-pill badge-outline badge-success"
                : "badge badge-pill badge-outline badge-primary";
            case 6:
              return "badge badge-pill badge-outline badge-danger";
            default:
              return "badge badge-pill badge-outline badge-warning";
          }
        };

        const badgeClass = getStatusColor(statusId, code);

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
            {(data.modalType === "detail" || data.modalType === "action") && (
              <>
                <button
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={() => handleOpenDetailModal(data)}
                >
                  <i className="ki-outline ki-eye text-white"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline btn-danger"
                  onClick={() => handleExportPDF(data.id)}
                  disabled={loadingId === data.id}
                >
                  {loadingId === data.id ? (
                    <span className="flex items-center gap-1">
                      <span className="loading loading-spinner loading-xs"></span>
                      Exporting...
                    </span>
                  ) : (
                    <i className="ki-filled ki-file-down"></i>
                  )}
                </button>
              </>
            )}

            {data.modalType === "action" &&
              ![6, 7].includes(data.status_id) && (
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
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Official Travel Submissions
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
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
            )}
          </div>
          {/* <button
            className="btn btn-filled btn-success"
            onClick={handleExportExcel}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Exporting...
              </>
            ) : (
              <>
                <i className="ki-filled ki-file-down"></i>
                Export to Excel
              </>
            )}
          </button> */}
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
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-60">
              <h3 className="font-bold border-b pb-2 text-gray-700">
                Approval Stage
              </h3>
              <StatusStepper
                code={selectedData?.code}
                statusId={selectedData?.status_id ?? 1}
                createdDate={selectedData?.created_at}
                acceptedDeptHeadDate={selectedData?.accepted_depthead_date}
                approvedDivHeadDate={selectedData?.approved_divhead_date}
                approvedDicDivDate={selectedData?.approved_divhead_date}
                approvedDeptHeadHCDate={selectedData?.approved_depthead_hc_date}
                approvedDivHeadHCDate={selectedData?.approved_divhead_hc_date}
                approvedDicHCDate={selectedData?.approved_dichc_date}
                approvedPresdirDate={selectedData?.approved_presdir_date}
                rejectedDate={selectedData?.rejected_date}
                canceledDate={selectedData?.canceled_date}
                acceptedDeptHeadRemark={selectedData?.accepted_depthead_remark}
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
              <section className="text-sm text-gray-700 space-y-8">
                <h3 className="text-lg font-bold border-b pb-2 text-gray-700">
                  General Information
                </h3>
                <div className="flex flex-wrap gap-6 mt-4">
                  {[
                    ["Code Official Travel", selectedData?.code],
                    ["Employee Name", selectedData?.user_name],
                    ["Employee Department", selectedData?.user_departement],
                    [
                      "Destination City",
                      [
                        selectedData?.destination_city1,
                        selectedData?.destination_city2,
                        selectedData?.destination_city3,
                      ].filter(Boolean),
                    ],
                    [
                      "Destination Place",
                      [
                        selectedData?.destination_place1?.value ??
                          selectedData?.destination_place1,
                        selectedData?.destination_place2?.value ??
                          selectedData?.destination_place2,
                        selectedData?.destination_place3?.value ??
                          selectedData?.destination_place3,
                      ].filter(Boolean),
                    ],
                    ["Transportation", selectedData?.transportation],
                    ["Lodging", selectedData?.lodging],
                    ["Work Status", selectedData?.work_status],
                    ["Office Activities", selectedData?.office_activities],
                    ["Activity Agenda", selectedData?.activity_agenda],
                    ["Start Date Travel", selectedData?.start_date],
                    ["End Date Travel", selectedData?.end_date],
                    ["Purpose Travel", selectedData?.purpose],
                  ].map(([label, value], idx) => (
                    <div key={idx} className="w-full md:w-[30%]">
                      <div className="font-semibold text-gray-600">{label}</div>
                      {Array.isArray(value) ? (
                        <ul className="list-disc pl-5 font-bold">
                          {value.length > 0 ? (
                            value.map((item, i) => <li key={i}>{item}</li>)
                          ) : (
                            <li>-</li>
                          )}
                        </ul>
                      ) : (
                        <p className="font-bold">{value ?? "-"}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
              <section className="mb-8 bg-gray-50 rounded-lg p-5 border">
                <h3 className="text-lg font-bold border-b pb-2 text-gray-700 mb-2">
                  Cost Detail
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
            </div>
          </div>

          <section
            className={clsx(
              "rounded-xl shadow-md p-6 mt-8",
              selectedActionType === "Approved" && "bg-green-100",
              selectedActionType === "Rejected" && "bg-red-100",
              selectedActionType === "Accepted" && "bg-blue-100"
            )}
          >
            <h3 className="text-lg font-bold border-b pb-3 mb-4 text-gray-800">
              Remarks
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="form-label mb-2">
                  {selectedActionType === "Approved" &&
                  selectedData?.status_id === 1
                    ? "Approved Remark"
                    : `${selectedActionType} Remark`}
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="remark"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      autoFocus
                      className={clsx(
                        "input",
                        errors.remark
                          ? "border-red-500 hover:border-red-500"
                          : ""
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
            <h3 className="font-bold border-b pb-2 text-gray-700">
              Approval Stage
            </h3>
            <StatusStepper
              code={selectedData?.code}
              statusId={selectedData?.status_id ?? 1}
              createdDate={selectedData?.created_at}
              acceptedDeptHeadDate={selectedData?.accepted_depthead_date}
              approvedDivHeadDate={selectedData?.approved_divhead_date}
              approvedDicDivDate={selectedData?.approved_divhead_date}
              approvedDeptHeadHCDate={selectedData?.approved_depthead_hc_date}
              approvedDivHeadHCDate={selectedData?.approved_divhead_hc_date}
              approvedDicHCDate={selectedData?.approved_dichc_date}
              approvedPresdirDate={selectedData?.approved_presdir_date}
              rejectedDate={selectedData?.rejected_date}
              canceledDate={selectedData?.canceled_date}
              acceptedDeptHeadRemark={selectedData?.accepted_depthead_remark}
              approvedDivHeadRemark={selectedData?.approved_divhead_remark}
              approvedDicDivRemark={selectedData?.approved_dicdiv_remark}
              approvedDeptHeadHCRemark={
                selectedData?.approved_depthead_hc_remark
              }
              approvedDivHeadHCRemark={selectedData?.approved_divhead_hc_remark}
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
                <h3 className="text-lg font-bold border-b pb-2 text-gray-700">
                  General Information
                </h3>
                <div className="flex flex-wrap gap-6 mt-4">
                  {[
                    ["Code Official Travel", selectedData?.code],
                    ["Employee Name", selectedData?.user_name],
                    ["Employee Department", selectedData?.user_departement],
                    [
                      "Destination City",
                      [
                        selectedData?.destination_city1,
                        selectedData?.destination_city2,
                        selectedData?.destination_city3,
                      ].filter(Boolean),
                    ],
                    [
                      "Destination Place",
                      [
                        selectedData?.destination_place1?.value ??
                          selectedData?.destination_place1,
                        selectedData?.destination_place2?.value ??
                          selectedData?.destination_place2,
                        selectedData?.destination_place3?.value ??
                          selectedData?.destination_place3,
                      ].filter(Boolean),
                    ],
                    ["Transportation", selectedData?.transportation],
                    ["Lodging", selectedData?.lodging],
                    ["Work Status", selectedData?.work_status],
                    ["Office Activities", selectedData?.office_activities],
                    ["Activity Agenda", selectedData?.activity_agenda],
                    ["Start Date Travel", selectedData?.start_date],
                    ["End Date Travel", selectedData?.end_date],
                    ["Purpose Travel", selectedData?.purpose],
                  ].map(([label, value], idx) => (
                    <div key={idx} className="w-full md:w-[30%]">
                      <div className="font-semibold text-gray-600">{label}</div>
                      {Array.isArray(value) ? (
                        <ul className="list-disc pl-5 font-bold">
                          {value.length > 0 ? (
                            value.map((item, i) => <li key={i}>{item}</li>)
                          ) : (
                            <li>-</li>
                          )}
                        </ul>
                      ) : (
                        <p className="font-bold">{value ?? "-"}</p>
                      )}
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

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=officialTravel&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />
    </Main>
  );
}
