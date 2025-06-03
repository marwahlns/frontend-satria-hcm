import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import clsx from "clsx";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enGB } from "date-fns/locale";
import { IoMdPaper } from "react-icons/io";
import StatusStepper from "@/components/StatusStepper";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  declarationData?: any;
  officialTravelData?: any;
  type?: any;
};

const schemaBase = yup.object().shape({
  code_trx: yup.string().required("Transaction code is required"),
  user: yup.string().required("User name is required"),
  start_date_actual: yup.date().nullable().required("Start date is required"),
  end_date_actual: yup.date().nullable().required("End date is required"),
  total_money_change: yup.string().required("Total money change is required"),
  date_range: yup
    .array()
    .of(yup.date().nullable().typeError("Invalid date format"))
    .length(2, "Date range must contain exactly 2 dates")
    .required("Date range is required"),
  pdfFile: yup
    .mixed<File>()
    .required("PDF document is required")
    .test("fileSize", "Max file size is 2MB", (value) => {
      return value instanceof File && value.size <= 2 * 1024 * 1024;
    })
    .test("fileType", "Only PDF files are allowed", (value) => {
      return value instanceof File && value.type === "application/pdf";
    }),
  details: yup
    .array()
    .of(
      yup.object().shape({
        date_activity: yup
          .date()
          .nullable()
          .required("Activity date is required"),
        location_activity: yup
          .string()
          .required("Activity location is required"),
        hotel_cost: yup.string().nullable(),
        taxi_cost: yup.string().nullable(),
        ticket_cost: yup.string().nullable(),
        upd_cost: yup.string().nullable(),
        consume_cost: yup.string().nullable(),
        other_cost: yup.string().nullable(),
        total_cost: yup.string().required("Total cost is required"),
        explanation: yup.string().required("Explanation is required"),
      })
    )
    .required("Activity details are required"),
});
const cancelSchema = yup.object({
  canceled_remark: yup
    .string()
    .nullable()
    .required("Canceled remark is required."),
});

const actionSchema = yup.object({
  remark: yup.string().required("Please fill out remark"),
});

export default function ModalDeclaration({
  isOpen,
  onClose,
  declarationData,
  officialTravelData,
  type,
}: Props) {
  const data = declarationData ?? officialTravelData;
  const [rows, setRows] = useState([
    {
      date_activity: "",
      location_activity: "",
      hotel_cost: 0,
      consume_cost: 0,
      upd_cost: 0,
      taxi_cost: 0,
      ticket_cost: 0,
      other_cost: 0,
      total_cost: 0,
      explanation: "",
    },
  ]);

  interface FormValues {
    code_trx?: string;
    user?: string;
    start_date_actual?: Date | null;
    end_date_actual?: Date | null;
    date_range?: (Date | null)[];
    total_money_change?: string | null;
    pdfFile?: File;
    details?: {
      date_activity?: Date | null;
      location_activity?: string;
      hotel_cost?: string | null;
      taxi_cost?: string | null;
      ticket_cost?: string | null;
      upd_cost?: string | null;
      consume_cost?: string | null;
      other_cost?: string | null;
      total_cost?: string;
      explanation?: string;
    }[];
    canceled_remark?: string;
    remark?: string;
  }

  const schema =
    type === "Canceled"
      ? cancelSchema
      : type === "Approved" || type === "Accepted" || type === "Rejected"
      ? actionSchema
      : schemaBase;

  const {
    handleSubmit,
    reset,
    setValue,
    register,
    watch,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      code_trx: officialTravelData?.code ?? "",
      user: officialTravelData?.user ?? "",
      start_date_actual: new Date(),
      end_date_actual: new Date(),
      date_range: [null, null],
      total_money_change: null,
      pdfFile: undefined,
      details: [
        {
          date_activity: null,
          location_activity: "",
          hotel_cost: null,
          taxi_cost: null,
          upd_cost: null,
          ticket_cost: null,
          consume_cost: null,
          other_cost: null,
          total_cost: "",
          explanation: "",
        },
      ],
      canceled_remark: "",
      remark: "",
    },
  });

  const watchedDetails = useWatch({
    control,
    name: "details",
  });

  const totalCost = watchedDetails?.reduce((sum, item) => {
    const value = parseFloat(item?.total_cost || "");
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  useEffect(() => {
    if (!officialTravelData) return;

    setValue("code_trx", officialTravelData.code ?? "");
    setValue("user", officialTravelData.user ?? "");

    if (declarationData?.details && declarationData.details.length > 0) {
      setRows(declarationData.details);

      declarationData.details.forEach((item, i) => {
        setValue(`details.${i}.date_activity`, item.date_activity);
        setValue(
          `details.${i}.location_activity`,
          item.location_activity || ""
        );
        setValue(`details.${i}.hotel_cost`, item.hotel_cost ?? "0");
        setValue(`details.${i}.consume_cost`, item.consume_cost ?? "0");
        setValue(`details.${i}.upd_cost`, item.upd_cost ?? "0");
        setValue(`details.${i}.taxi_cost`, item.taxi_cost ?? "0");
        setValue(`details.${i}.ticket_cost`, item.ticket_cost ?? "0");
        setValue(`details.${i}.other_cost`, item.other_cost ?? "0");
        setValue(`details.${i}.explanation`, item.explanation || "");
      });
    }

    if (
      declarationData?.start_date_actual &&
      declarationData?.end_date_actual
    ) {
      const start = new Date(declarationData.start_date_actual);
      const end = new Date(declarationData.end_date_actual);
      setValue("start_date_actual", start);
      setValue("end_date_actual", end);
      setValue("date_range", [start, end]);
    }

    const total = Number(totalCost) || 0;
    const downPayment = parseRupiah(data?.down_payment);
    const selisih = total - downPayment;
    setValue("total_money_change", selisih.toString());
  }, [
    officialTravelData,
    declarationData,
    totalCost,
    data?.down_payment,
    setValue,
  ]);

  useEffect(() => {
    if (!watchedDetails || !Array.isArray(watchedDetails)) return;

    watchedDetails.forEach((item, i) => {
      const total =
        parseFloat(item?.hotel_cost ?? "0") +
        parseFloat(item?.consume_cost ?? "0") +
        parseFloat(item?.upd_cost ?? "0") +
        parseFloat(item?.taxi_cost ?? "0") +
        parseFloat(item?.ticket_cost ?? "0") +
        parseFloat(item?.other_cost ?? "0");

      const existingTotal = parseFloat(item?.total_cost ?? "0");
      if (existingTotal !== total) {
        setValue(`details.${i}.total_cost`, total.toFixed(2));
      }
    });
  }, [watchedDetails, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        date_activity: "",
        location_activity: "",
        hotel_cost: 0,
        consume_cost: 0,
        upd_cost: 0,
        taxi_cost: 0,
        ticket_cost: 0,
        other_cost: 0,
        total_cost: 0,
        explanation: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(
      newRows.length === 0
        ? [
            {
              date_activity: "",
              location_activity: "",
              hotel_cost: 0,
              consume_cost: 0,
              upd_cost: 0,
              taxi_cost: 0,
              ticket_cost: 0,
              other_cost: 0,
              total_cost: 0,
              explanation: "",
            },
          ]
        : newRows
    );
  };

  const formatRupiahLive = (value: string): string => {
    if (!value) return "";
    const numberString = value.replace(/[^\d]/g, "");
    const number = parseInt(numberString);
    if (isNaN(number)) return "";
    return "Rp " + number.toLocaleString("id-ID");
  };

  const parseRupiah = (rp?: string | null): number => {
    if (!rp) return 0;
    const angka = rp.replace(/\D/g, "");
    return Number(angka) || 0;
  };

  const total = Number(totalCost) || 0;
  const downPayment = parseRupiah(data?.down_payment);
  const selisih = total - downPayment;

  const keterangan =
    selisih > 0
      ? "Kembali ke Karyawan"
      : selisih < 0
      ? "Kembali ke Perusahaan"
      : "Tidak ada pengembalian";

  const color =
    selisih > 0
      ? "text-green-600"
      : selisih < 0
      ? "text-red-600"
      : "text-gray-600";

  const onSubmit = async (data) => {
    try {
      const token = Cookies.get("token");

      if (type === "Create") {
        const formData = new FormData();
        formData.append("code", data.code ?? "");
        formData.append("code_trx", data.code_trx ?? "");
        formData.append("user", data.user ?? "");
        formData.append(
          "start_date_actual",
          data.start_date_actual?.toISOString() ?? ""
        );
        formData.append(
          "end_date_actual",
          data.end_date_actual?.toISOString() ?? ""
        );
        formData.append("total_money_change", data.total_money_change ?? "0");

        if (data.pdfFile) {
          formData.append("file", data.pdfFile || new Blob());
        }

        formData.append(
          "details",
          JSON.stringify(
            data.details.map((detail) => ({
              ...detail,
              hotel_cost: Number(detail.hotel_cost || "0"),
              taxi_cost: Number(detail.taxi_cost || "0"),
              upd_cost: Number(detail.upd_cost || "0"),
              consume_cost: Number(detail.consume_cost || "0"),
              ticket_cost: Number(detail.ticket_cost || "0"),
              other_cost: Number(detail.other_cost || "0"),
              total_cost: Number(detail.total_cost),
              date_activity: detail.date_activity
                ? new Date(detail.date_activity).toISOString()
                : null,
            }))
          )
        );

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/?type=declaration`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 201) {
          Swal.fire({
            text: "Declaration added successfully",
            icon: "success",
            timer: 1500,
          });
          window.dispatchEvent(new CustomEvent("refetchDeclarationTable"));
          handleClose();
        }
      } else if (
        type === "Canceled" ||
        type === "Accepted" ||
        type === "Approved" ||
        type === "Rejected"
      ) {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/${declarationData.id}`,
          {
            remark:
              type === "Canceled"
                ? data.canceled_remark ?? ""
                : data.remark ?? "",
            actionType: type,
            trxType: "declaration",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 200) {
          Swal.fire({
            text: `${type} successfully`,
            icon: "success",
            timer: 1500,
          });
          window.dispatchEvent(new CustomEvent("refetchDeclarationTable"));
          handleClose();
        }
      } else {
        Swal.fire({
          text: "Unsupported operation",
          icon: "warning",
        });
      }
    } catch (error) {
      Swal.fire({ text: "Operation failed", icon: "error" });
    }
  };

  if (!isOpen) return null;

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          className="bg-white rounded-xl shadow-md w-[90%] max-w-7xl p-8"
          style={{ minHeight: "300px" }}
        >
          <div className="modal-header mb-6 relative">
            <h3 className="text-left text-lg font-bold uppercase w-full">
              Travel Declaration
            </h3>
            <button
              className="btn btn-xs btn-icon btn-light absolute right-4 top-4"
              onClick={handleClose}
            >
              <i className="ki-outline ki-cross"></i>
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, (err) =>
              console.log("YUP VALIDATION ERROR:", err)
            )}
          >
            <div
              className="modal-body text-sm overflow-y-auto"
              style={{ maxHeight: "60vh" }}
            >
              <div
                className={`grid grid-cols-1 md:grid-cols-${
                  type === "Create" ? 3 : 4
                } gap-x-12 gap-y-6 text-left`}
              >
                {type !== "Create" && (
                  <div className="w-full md:w-60">
                    <StatusStepper
                      statusId={data?.status_id ?? 1}
                      createdDate={data?.created_at}
                      acceptedDate={data?.accepted_date}
                      approvedDate={data?.approved_date}
                      rejectedDate={data?.rejected_date}
                      canceledDate={data?.canceled_date}
                      acceptedRemark={data?.accepted_remark}
                      approvedRemark={data?.approved_remark}
                      rejectedRemark={data?.rejected_remark}
                      canceledRemark={data?.canceled_remark}
                      acceptTo={data?.accept_to}
                      approveTo={data?.approve_to}
                    />
                  </div>
                )}
                <div className="space-y-2 border-r pr-6">
                  <Controller
                    name="code_trx"
                    control={control}
                    render={() => (
                      <p>
                        <span className="font-semibold">ST Number</span>:{" "}
                        {data?.code_trx || "-"}
                      </p>
                    )}
                  />

                  <p>
                    <span className="font-semibold">Name</span>:{" "}
                    {data?.user_name ?? ""}
                  </p>
                  <Controller
                    name="user"
                    control={control}
                    render={() => (
                      <p>
                        <span className="font-semibold">NRP</span>:{" "}
                        {data?.user || "-"}
                      </p>
                    )}
                  />
                  <p>
                    <span className="font-semibold">Department/Division</span>:{" "}
                    {data?.user_department ?? ""} / {data?.user_division ?? ""}
                  </p>
                  <p>
                    <span className="font-semibold">Position</span>:{" "}
                    {data?.user_position ?? ""}
                  </p>
                </div>

                <div className="space-y-2 border-r pr-6">
                  <p>
                    <span className="font-semibold">Cost Center</span>: Rp{" "}
                    {data?.total_cost ?? ""}
                  </p>
                  <p>
                    <span className="font-semibold">
                      {data?.symbol_currency ?? ""} Mid Rate
                    </span>
                    : 1 {data?.symbol_currency ?? ""}= Rp {data?.currency ?? ""}
                  </p>
                  <p>
                    <span className="font-semibold">Job Type</span>:{" "}
                    {data?.work_status ?? ""}
                  </p>
                  <p>
                    <span className="font-semibold">Travel Type</span>:{" "}
                    {data?.lodging ?? ""}
                  </p>
                  <p>
                    <span className="font-semibold">Travel To</span>:{" "}
                    {data?.destination_city ?? ""}
                  </p>
                </div>

                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Travel From</span>:{" "}
                    {data?.worklocation_name ?? ""}
                  </p>

                  <p>
                    <span className="font-semibold">Departure Date</span>:{" "}
                    {data?.start_date ?? ""}
                  </p>
                  <p>
                    <span className="font-semibold">Return Date</span>:{" "}
                    {data?.end_date ?? ""}
                  </p>
                  <div>
                    <label className="form-label">
                      Start Date - End Date Actual
                      <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                    </label>
                    <Controller
                      control={control}
                      name="date_range"
                      render={({ field }) => (
                        <DatePicker
                          selectsRange
                          startDate={field.value?.[0] || null}
                          endDate={field.value?.[1] || null}
                          onChange={(dates: [Date | null, Date | null]) => {
                            const [start, end] = dates;
                            field.onChange(dates);
                            setValue("start_date_actual", start ?? null);
                            setValue("end_date_actual", end ?? null);
                          }}
                          className={clsx(
                            "input w-full text-sm py-2 px-3 rounded-md border",
                            errors.start_date_actual || errors.end_date_actual
                              ? "border-red-500"
                              : "border-gray-300"
                          )}
                          placeholderText="Pick a date"
                          dateFormat="dd-MMM-yyyy"
                          isClearable={!data || data !== declarationData}
                          locale={enGB}
                          disabled={data === declarationData}
                          minDate={
                            new Date(
                              new Date().setDate(new Date().getDate() + 5)
                            )
                          }
                        />
                      )}
                    />
                    {(errors.start_date_actual || errors.end_date_actual) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.start_date_actual?.message ||
                          errors.end_date_actual?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <h4 className="text-md font-bold mb-4">
                  Travel Expense Details
                </h4>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full text-sm text-left border-collapse min-w-[900px]">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="border p-2 text-center">Date</th>
                        <th className="border p-2 text-center">Location</th>
                        <th className="border p-2 text-center">Hotel</th>
                        <th className="border p-2 text-center">Consume</th>
                        <th className="border p-2 text-center">UPD</th>
                        <th className="border p-2 text-center">Taxi/Fuel</th>
                        <th className="border p-2 text-center">Ticket/Toll</th>
                        <th className="border p-2 text-center">Others</th>
                        <th className="border p-2 text-center">Total</th>
                        <th className="border p-2 text-center">Notes</th>
                        {data === officialTravelData && (
                          <th className="border p-2 text-center">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border p-2 h-10">
                            <Controller
                              control={control}
                              name={`details.${i}.date_activity`}
                              shouldUnregister={false}
                              render={({ field }) => {
                                const startDate = watch("start_date_actual");
                                const endDate = watch("end_date_actual");
                                const selectedDate =
                                  field.value &&
                                  !isNaN(new Date(field.value).getTime())
                                    ? new Date(field.value)
                                    : null;

                                return (
                                  <DatePicker
                                    placeholderText="Select Date"
                                    selected={selectedDate}
                                    onChange={(date: Date | null) =>
                                      field.onChange(date)
                                    }
                                    dateFormat="dd MMMM yyyy"
                                    className="w-full border rounded px-1 py-0.5 text-xs"
                                    locale={enGB}
                                    minDate={
                                      startDate
                                        ? new Date(startDate)
                                        : undefined
                                    }
                                    maxDate={
                                      endDate ? new Date(endDate) : undefined
                                    }
                                    disabled={data === declarationData}
                                  />
                                );
                              }}
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              className="w-full border rounded px-1 py-0.5 text-xs"
                              {...register(`details.${i}.location_activity`)}
                              disabled={data === declarationData}
                            />
                          </td>
                          <td className="border p-2 text-right">
                            <Controller
                              control={control}
                              name={`details.${i}.hotel_cost`}
                              render={({ field: { onChange, value } }) => (
                                <input
                                  type="text"
                                  min={0}
                                  className="w-full border rounded px-1 py-0.5 text-xs text-right"
                                  value={formatRupiahLive(
                                    value?.toString() || ""
                                  )}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    onChange(rawValue);
                                  }}
                                  disabled={data === declarationData}
                                />
                              )}
                            />
                          </td>
                          <td className="border p-2 text-right">
                            <Controller
                              control={control}
                              name={`details.${i}.consume_cost`}
                              render={({ field: { onChange, value } }) => (
                                <input
                                  type="text"
                                  min={0}
                                  className="w-full border rounded px-1 py-0.5 text-xs text-right"
                                  value={formatRupiahLive(
                                    value?.toString() || ""
                                  )}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    onChange(rawValue);
                                  }}
                                  disabled={data === declarationData}
                                />
                              )}
                            />
                          </td>
                          <td className="border p-2 text-right">
                            <Controller
                              control={control}
                              name={`details.${i}.upd_cost`}
                              render={({ field: { onChange, value } }) => (
                                <input
                                  type="text"
                                  min={0}
                                  className="w-full border rounded px-1 py-0.5 text-xs text-right"
                                  value={formatRupiahLive(
                                    value?.toString() || ""
                                  )}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    onChange(rawValue);
                                  }}
                                  disabled={data === declarationData}
                                />
                              )}
                            />
                          </td>
                          <td className="border p-2 text-right">
                            <Controller
                              control={control}
                              name={`details.${i}.taxi_cost`}
                              render={({ field: { onChange, value } }) => (
                                <input
                                  type="text"
                                  min={0}
                                  className="w-full border rounded px-1 py-0.5 text-xs text-right"
                                  value={formatRupiahLive(
                                    value?.toString() || ""
                                  )}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    onChange(rawValue);
                                  }}
                                  disabled={data === declarationData}
                                />
                              )}
                            />
                          </td>
                          <td className="border p-2 text-right">
                            <Controller
                              control={control}
                              name={`details.${i}.ticket_cost`}
                              render={({ field: { onChange, value } }) => (
                                <input
                                  type="text"
                                  min={0}
                                  className="w-full border rounded px-1 py-0.5 text-xs text-right"
                                  value={formatRupiahLive(
                                    value?.toString() || ""
                                  )}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    onChange(rawValue);
                                  }}
                                  disabled={data === declarationData}
                                />
                              )}
                            />
                          </td>
                          <td className="border p-2 text-right">
                            <Controller
                              control={control}
                              name={`details.${i}.other_cost`}
                              render={({ field: { onChange, value } }) => (
                                <input
                                  type="text"
                                  min={0}
                                  className="w-full border rounded px-1 py-0.5 text-xs text-right"
                                  value={formatRupiahLive(
                                    value?.toString() || ""
                                  )}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    onChange(rawValue);
                                  }}
                                  disabled={data === declarationData}
                                />
                              )}
                            />
                          </td>
                          <td className="border p-2 text-right font-semibold">
                            <Controller
                              control={control}
                              name={`details.${i}.total_cost`}
                              render={({ field }) => {
                                const formattedValue = field.value
                                  ? "Rp " +
                                    Number(field.value).toLocaleString("id-ID")
                                  : "";
                                return (
                                  <input
                                    type="text"
                                    className="w-full border-none bg-transparent text-right font-semibold cursor-not-allowed"
                                    value={formattedValue}
                                    readOnly
                                  />
                                );
                              }}
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              className="w-full border rounded px-1 py-0.5 text-xs"
                              {...register(`details.${i}.explanation`)}
                              disabled={data === declarationData}
                            />
                            {errors.details?.[i]?.explanation && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.details[i].explanation.message}
                              </p>
                            )}
                          </td>
                          {data === officialTravelData && (
                            <td className="border p-2 text-center">
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-800 font-bold"
                                onClick={() => removeRow(i)}
                                title="Delete Row"
                              >
                                &times;
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data === officialTravelData && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Row
                  </button>
                )}
              </div>

              <div className="mt-6 border-t pt-6 px-6 bg-white shadow-md rounded-xl">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1 max-w-sm">
                    <label className="block font-semibold mb-2 text-gray-700">
                      {type === "Create" ? (
                        <>
                          Upload Evidence{" "}
                          <span className="text-red-600 ml-1">*</span>
                        </>
                      ) : (
                        "File Evidence"
                      )}
                    </label>

                    {type === "Create" ? (
                      <Controller
                        name="pdfFile"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                            className={clsx(
                              "block w-full text-sm text-gray-700 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100",
                              errors.pdfFile && "border border-red-500"
                            )}
                          />
                        )}
                      />
                    ) : (
                      <div className="p-4 border rounded bg-gray-50 flex items-center cursor-pointer hover:bg-gray-100 transition">
                        {declarationData?.evidence_file ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/file_declaration/${declarationData.evidence_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Click to open PDF"
                            className="text-red-600 hover:text-red-800 flex items-center gap-2 truncate max-w-full"
                          >
                            <IoMdPaper size={36} />
                            <span>{declarationData.evidence_file}</span>
                          </a>
                        ) : (
                          <p className="text-gray-500 italic">
                            No file uploaded
                          </p>
                        )}
                      </div>
                    )}

                    {errors.pdfFile && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pdfFile.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 max-w-sm flex flex-col justify-between">
                    <div className="mb-4 flex justify-between">
                      <span className="font-semibold text-gray-700">
                        Total Cost:
                      </span>
                      <span className="text-gray-800">
                        Rp {totalCost.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="mb-4 flex justify-between">
                      <span className="font-semibold text-gray-700">
                        Down Payment Approved:
                      </span>
                      <span className="text-gray-800">
                        {data?.down_payment ?? "-"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-6 mb-4">
                      <span className="font-semibold text-gray-700">
                        Selisih:
                      </span>
                      <span className={`font-medium ${color}`}>
                        {keterangan} - Rp {selisih.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {type === "Canceled" && (
                <div className="mt-6 mb-4 max-w-full">
                  <label className="form-label">
                    Canceled Remark <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="canceled_remark"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={clsx(
                          "input w-full",
                          errors.canceled_remark && "border-red-500"
                        )}
                        placeholder="Enter cancellation remark..."
                      />
                    )}
                  />
                  {errors.canceled_remark && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.canceled_remark.message}
                    </p>
                  )}
                </div>
              )}

              {(type === "Approved" || type === "Accepted") && (
                <div className="mt-6 mb-4 max-w-full">
                  <label className="form-label">
                    Remark <span className="text-red-500">*</span>
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
                        placeholder="Enter remark..."
                      />
                    )}
                  />
                  {errors.remark && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.remark.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer justify-end mt-6">
              <div className="flex gap-2">
                {(type === "Create" ||
                  type === "Accepted" ||
                  type === "Approve" ||
                  type === "Rejected" ||
                  type === "Canceled") && (
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleClose}
                  >
                    Discard
                  </button>
                )}

                {type === "Create" && (
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                )}

                {type === "Accepted" && (
                  <button type="submit" className="btn btn-primary">
                    Accepted
                  </button>
                )}

                {type === "Approved" && (
                  <button type="submit" className="btn btn-primary">
                    Approved
                  </button>
                )}

                {type === "Rejected" && (
                  <button type="submit" className="btn btn-danger">
                    Rejected
                  </button>
                )}

                {type === "Canceled" && (
                  <button type="submit" className="btn btn-danger">
                    Canceled
                  </button>
                )}

                {type === "Detail" && (
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleClose}
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
