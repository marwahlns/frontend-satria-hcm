import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import FilterData from "@/components/FilterData";
import Cookies from "js-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enGB } from "date-fns/locale";
import Modal from "@/components/Modal";
import ActionModal from "@/components/Modals/ActionModalUpper";
import DetailModal from "@/components/Modals/DetailModalUpper";
import DeclarationModal from "@/components/Modals/DeclarationModal";
import StatusStepper from "@/components/StatusStepperOfficialTravel";
import { useOfficialTravelStore } from "../../../stores/submitStore";
import AsyncSelect from "react-select/async";
import { IoIosGlobe, IoIosPin } from "react-icons/io";
import AsyncCreatableSelect from "react-select/async-creatable";
import { IoIosList } from "react-icons/io";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isCancelTravelModalOpen, setIsCancelTravelModalOpen] = useState(false);
  const [isCancelDeclarationModalOpen, setIsCancelDeclarationModalOpen] =
    useState(false);
  const [declarationType, setDeclarationType] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [filter, setFilter] = useState<{ month: string; year: string; status?: number }>({
    month: "",
    year: "",
    status: 0,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const setTotalOfficialTravel = useOfficialTravelStore(
    (state) => state.setTotalOfficialTravels
  );
  const [travelType, setTravelType] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState<CountryOption[]>(
    []
  );
  const [exchangeRates, setExchangeRates] = useState<
    Record<string, number | string>
  >({});
  const [declarationData, setDeclarationData] = useState(null);
  const [officialTravelData, setOfficialTravelData] = useState(null);
  const submitSchemaBase = yup.object({
    start_date: yup.string().required("Start date is required"),
    end_date: yup.string().required("End date is required"),
    destination_city: yup
      .array()
      .of(yup.string())
      .min(1, "Destination city is required"),
    purpose: yup.string().required("Purpose official travel is required"),
    type: yup.string().required("Type is required"),
    destination_place: yup.string().required("Destination place is required"),
    transportation: yup.string().required("Transportation is required"),
    lodging: yup.string().required("Lodging is required"),
    work_status: yup.string().required("Work status is required"),
    office_activities: yup.string().required("Office activities is required"),
    taxi_cost: yup.number().required("Taxi cost is required"),
    hotel_cost: yup.number().required("Hotel cost is required"),
    rent_cost: yup.number().required("Rent cost is required"),
    upd_cost: yup.number().required("UPD cost is required"),
    fiskal_cost: yup.number().required("Fiskal cost is required"),
    other_cost: yup.number().required("Other cost is required"),
    total_cost: yup.number().required("Total cost is required"),
    activity_agenda: yup.string().required("Activity agenda is required"),
    canceled_remark: yup.string().nullable(),
  });
  const submitSchemaInternational = submitSchemaBase.shape({
    symbol_currency: yup
      .array()
      .of(yup.string())
      .min(1, "Symbol currency is required"),
    currency: yup.array().of(yup.string()).min(1, "Currency is required"),
  });

  const cancelSchema = yup.object({
    canceled_remark: yup
      .string()
      .nullable()
      .required("Canceled remark is required."),
  });

  interface OfficialTravelFormValues {
    start_date?: string;
    end_date?: string;
    destination_city?: string[];
    type?: string;
    destination_place?: string;
    transportation?: string;
    lodging?: string;
    work_status?: string;
    office_activities?: string;
    purpose?: string;
    symbol_currency?: string[];
    currency?: string[];
    taxi_cost?: number;
    hotel_cost?: number;
    rent_cost?: number;
    upd_cost?: number;
    fiskal_cost?: number;
    other_cost?: number;
    total_cost?: number;
    activity_agenda?: string;
    canceled_remark?: string;
    date_range?: [Date | null, Date | null];
  }

  const schema =
    selectedActionType === "Canceled"
      ? cancelSchema
      : travelType === "international"
      ? submitSchemaInternational
      : submitSchemaBase;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<OfficialTravelFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      start_date: "",
      end_date: "",
      destination_city: [],
      purpose: "",
      canceled_remark: "",
      type: "",
      symbol_currency: [],
      currency: [],
      destination_place: "",
      transportation: "",
      lodging: "",
      work_status: "",
      office_activities: "",
      taxi_cost: null,
      hotel_cost: null,
      rent_cost: null,
      upd_cost: null,
      fiskal_cost: null,
      other_cost: null,
      total_cost: null,
      activity_agenda: "",
      date_range: [null, null],
    },
  });

  const watchCosts = watch([
    "taxi_cost",
    "rent_cost",
    "upd_cost",
    "fiskal_cost",
    "other_cost",
    "hotel_cost",
  ]);

  useEffect(() => {
    const total = watchCosts.reduce((acc, cur) => acc + (cur ?? 0), 0);
    setValue("total_cost", total);

    if (travelType === "international" && selectedCountries.length > 0) {
      const currencyCodes = selectedCountries.map((c) => c.currencyCode);
      const currencyValues = selectedCountries.map((c) =>
        String(exchangeRates[c.currencyCode] ?? "")
      );
      setValue("symbol_currency", currencyCodes);
      setValue("currency", currencyValues);
    } else {
      setValue("symbol_currency", []);
      setValue("currency", []);
    }

    const handleRefetch = () => {
      setIsRefetch((prev) => !prev);
    };
    window.addEventListener("refetchDeclarationTable", handleRefetch);

    return () => {
      window.removeEventListener("refetchDeclarationTable", handleRefetch);
    };
  }, [
    watchCosts,
    selectedCountries,
    travelType,
    setValue,
    exchangeRates,
    setIsRefetch,
  ]);

  const handleOpenCancelTravelModal = (data, actionType) => {
    setSelectedData(data);
    setSelectedActionType(actionType);
    setIsCancelTravelModalOpen(true);
  };

  const handleOpenDetailModal = async (data) => {
    setSelectedData(data);

    if (data?.isDeclaration === true) {
      try {
        const declaration = await fetchDeclarations(data.code);
        setDeclarationData(declaration || null);
      } catch (error) {
        setDeclarationData(null);
      }
    } else {
      setDeclarationData(null);
    }

    setIsDetailModalOpen(true);
  };

  const handleOpenAddModal = (type) => {
    setTravelType(type);

    setIsAddModalOpen(true);
    setIsChooseModalOpen(false);
  };

  const handleOpenChooseModal = () => {
    setIsChooseModalOpen(true);
  };

  const handleOpenDeclarationModal = async (data) => {
    setLoading(true);

    try {
      if (data?.isDeclaration === true) {
        const declaration = await fetchDeclarations(data?.code);

        if (declaration) {
          setDeclarationData(declaration);
          setOfficialTravelData(declaration.officialTravel_data ?? null);
        } else {
          setDeclarationData(null);
          setOfficialTravelData(null);
        }
      } else {
        setDeclarationData(null);
        setOfficialTravelData({ ...data });
      }
    } catch (error) {
      setDeclarationData(null);
      setOfficialTravelData(null);
    } finally {
      setLoading(false);
      setIsDeclarationModalOpen(true);
    }
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const formatRupiahLive = (value: string): string => {
    if (!value) return "";
    const numberString = value.replace(/[^\d]/g, "");
    const number = parseInt(numberString);
    if (isNaN(number)) return "";
    return "Rp " + number.toLocaleString("id-ID");
  };

  const onClose = () => {
    setIsCancelTravelModalOpen(false);
    setIsCancelDeclarationModalOpen(false);
    setIsDetailModalOpen(false);
    setIsAddModalOpen(false);
    setIsChooseModalOpen(false);
    setSelectedData(null);
    reset();
    setSelectedCountries([]);
    setTravelType("");
    useOfficialTravelStore.getState().setOfficialTravelData(null);
  };

  function formatRupiah(num: number | null | undefined): string {
    if (num == null) return "";
    return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function parseRupiah(str: string): number | null {
    const angka = str.replace(/\D/g, "");
    if (!angka) return null;
    return Number(angka);
  }

  const transportOptions = [
    { label: "Pesawat", value: "Pesawat" },
    { label: "Bus", value: "Bus" },
    { label: "Kapal Laut", value: "Kapal Laut" },
    { label: "Kendaraan Kantor", value: "Kendaraan Kantor" },
    { label: "Kendaraan Pribadi", value: "Kendaraan Pribadi" },
  ];

  const lodgingOptions = [
    { label: "Tidak Menginap", value: "Tidak Menginap" },
    { label: "Mesh", value: "Mesh" },
    { label: "Hotel", value: "Hotel" },
    { label: "Mesh + Makan", value: "Mesh + makan" },
  ];

  const workstatusOptions = [
    { label: "Mekanik", value: "Mekanik" },
    { label: "Non-Mekanik", value: "Non-Mekanik" },
  ];
  const officeActivitiesOptions = [
    { label: "LAPANGAN", value: "Lapangan" },
    { label: "NON LAPANGAN", value: "Non-Lapangan" },
  ];

  const typeStOptions = [
    { label: "WITH TA (Jika butuh tiket pesawat)", value: "TA" },
    { label: "NON TA (Jika tidak butuh tiket pesawat)", value: "NTA" },
  ];

  const loadDomesticOptions = async (inputValue) => {
    const provResponse = await fetch(
      "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
    );
    const provData = await provResponse.json();
    const provinceOptions = provData.map((item) => ({
      label: item.name.toUpperCase(),
      value: item.name.toUpperCase(),
    }));

    return provinceOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadInternationalOptions = async (inputValue) => {
    const countryResponse = await fetch("https://restcountries.com/v3.1/all");
    const countryData = await countryResponse.json();

    const countryOptions = countryData
      .filter(
        (item) =>
          item.name &&
          item.name.common &&
          item.name.common.toUpperCase() !== "INDONESIA"
      )
      .map((item) => {
        const currencyCode = item.currencies
          ? Object.keys(item.currencies)[0]
          : "-";

        const currencyObj = item.currencies
          ? (Object.values(item.currencies)[0] as { symbol?: string })
          : undefined;

        return {
          label: item.name.common.toUpperCase(),
          value: item.name.common.toUpperCase(),
          currencyCode: currencyCode || "-",
          currencySymbol: currencyObj?.symbol || "-",
        };
      });

    return countryOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue) => {
    if (travelType === "domestic") return loadDomesticOptions(inputValue);
    if (travelType === "international")
      return loadInternationalOptions(inputValue);
    return Promise.resolve([]);
  };

  const createLoadOptions = (options) => (inputValue, callback) => {
    const filtered = options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setTimeout(() => callback(filtered), 300);
  };

  type CostField =
    | "taxi_cost"
    | "hotel_cost"
    | "rent_cost"
    | "upd_cost"
    | "fiskal_cost"
    | "other_cost";

  const costFields: { label: string; name: CostField }[] = [
    { label: "Taxi Cost", name: "taxi_cost" },
    { label: "Hotel Cost", name: "hotel_cost" },
    { label: "Rent Cost", name: "rent_cost" },
    { label: "UPD Cost", name: "upd_cost" },
    { label: "Fiskal Cost", name: "fiskal_cost" },
    { label: "Other Cost", name: "other_cost" },
  ];

  type CountryOption = {
    label: string;
    value: string;
    currencyCode?: string;
    currencySymbol?: string;
  };

  const fetchDeclarations = async (codeTrx) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=declaration`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: codeTrx,
            limit: 1,
          },
        }
      );
      const declaration = res.data?.data?.data?.[0] || null;
      return declaration;
    } catch (error) {
      return null;
    }
  };

  const onCancel = async (data) => {
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
          remark: data.canceled_remark,
          actionType: selectedActionType,
          trxType: "officialTravel",
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

  const onSubmit = async (data) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/?type=officialTravel`,
        {
          ...data,
          start_date: data.start_date,
          end_date: data.end_date,
          type: data.type,
          destination_place: data.destination_place,
          transportation: data.transportation,
          lodging: data.lodging,
          work_status: data.work_status,
          office_activities: data.office_activities,
          upd_cost: data.upd_cost,
          rent_cost: data.rent_cost,
          fiskal_cost: data.fiskal_cost,
          other_cost: data.other_cost,
          total_cost: data.total_cost,
          activity_agenda: data.activity_agenda,
          destination_city: Array.isArray(data.destination_city)
            ? data.destination_city.join(", ")
            : data.destination_city,
          symbol_currency: Array.isArray(data.symbol_currency)
            ? data.symbol_currency.join(", ")
            : data.symbol_currency,
          currency: Array.isArray(data.currency)
            ? data.currency.join(", ")
            : data.currency,
          purpose: data.purpose,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        const total = response.data?.data?.totalItems;

        if (total !== undefined) {
          setTotalOfficialTravel(total);
        } else {
          const token = Cookies.get("token");
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=officialTravel`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data.success) {
            setTotalOfficialTravel(res.data.data.totalItems);
          }
        }

        Swal.fire({
          text: "Official travel added successfully",
          icon: "success",
          timer: 1500,
        });
        setIsRefetch(!isRefetch);
        onClose();
        reset();
      } else {
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
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
      const fileName = `Data_Leave_${yyyy}-${mm}-${dd}.xlsx`;

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
      console.error("Error exporting EXCEL:", error);
      alert("Failed to export Excel.");
    }
  };

  type ITrLeave = {
    status_id: number;
    status_submittion: string;
    isDeclaration: boolean;
  };

  const columns: ColumnDef<ITrLeave>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
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
      accessorKey: "total_leave_days",
      header: "Total Days",
      enableSorting: true,
    },
    {
      accessorKey: "destination_city",
      header: "Destination City",
      enableSorting: true,
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      enableSorting: true,
    },
    {
      accessorKey: "status_submittion",
      header: "Status",
      enableSorting: false,
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
        const [showDeclarationDropdown, setShowDeclarationDropdown] =
          useState(false);

        const toggleDeclarationDropdown = () => {
          setShowDeclarationDropdown(!showDeclarationDropdown);
        };

        return (
          <div className="flex space-x-1 justify-center relative">
            <button
              data-tooltip="#update_tooltip"
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => handleOpenDetailModal(data)}
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            <div className="tooltip" id="update_tooltip">
              Detail
            </div>

            {data.status_id == 1 && (
              <>
                <button
                  data-tooltip="#delete_tooltip"
                  className="btn btn-sm btn-outline btn-danger"
                  onClick={() => handleOpenCancelTravelModal(data, "Canceled")}
                >
                  <i className="ki-outline ki-trash text-white"></i>
                </button>
                <div className="tooltip" id="delete_tooltip">
                  Cancel
                </div>
              </>
            )}

            {data.status_id === 14 && (
              <>
                {data.isDeclaration === false ? (
                  <>
                    <button
                      data-tooltip="#declaration_tooltip"
                      className="btn btn-sm btn-outline btn-success"
                      onClick={async () => {
                        await handleOpenDeclarationModal(data);
                        setDeclarationType("Create");
                      }}
                    >
                      <i className="ki-outline">
                        <IoIosList />
                      </i>
                    </button>
                    <div className="tooltip" id="declaration_tooltip">
                      Declaration
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      data-tooltip="#declaration_tooltip"
                      className="btn btn-sm btn-outline btn-success"
                      onClick={toggleDeclarationDropdown}
                    >
                      <i className="ki-outline">
                        <IoIosList />
                      </i>
                    </button>
                    <div className="tooltip" id="declaration_tooltip">
                      Declaration
                    </div>

                    {showDeclarationDropdown && (
                      <div className="absolute top-full mt-1 right-0 bg-white border rounded shadow-md w-40 z-10">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={async () => {
                            await handleOpenDeclarationModal(data);
                            setDeclarationType("Detail");
                            setShowDeclarationDropdown(false);
                          }}
                        >
                          Detail Declaration
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={async () => {
                            await handleOpenDeclarationModal(data);
                            setDeclarationType("Canceled");
                            setShowDeclarationDropdown(false);
                          }}
                        >
                          Cancel Declaration
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Official Travel</h1>
          <p className="text-gray-500 text-sm">Your Official Travel Record</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="btn btn-outline btn-primary"
            onClick={() => handleExportExcel()}
          >
            <i className="ki-filled ki-file-down"></i>
            Export
          </button>

          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="btn btn-outline btn-primary"
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

          <button
            className="btn btn-filled btn-primary"
            onClick={() => handleOpenChooseModal()}
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=officialTravel&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />
      <Modal isModalOpen={isChooseModalOpen}>
        <div className="modal-header justify-between items-center">
          <h3 className="modal-title text-lg font-semibold">
            Add Official Travel Submission
          </h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => handleOpenAddModal("domestic")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <IoIosPin size={20} />
            Domestic Travel
          </button>

          <button
            onClick={() => handleOpenAddModal("international")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <IoIosGlobe size={20} />
            International Travel
          </button>
        </div>
      </Modal>

      <Modal isModalOpen={isAddModalOpen}>
        <div className="modal-header">
          <h3 className="modal-title">Add Official Travel Submittion</h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit, (err) =>
            console.log("YUP VALIDATION ERROR:", err)
          )}
        >
          <div className="modal-body max-h-[65vh] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Destination Place
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="destination_place"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Input destination place"
                      className={clsx(
                        "input",
                        errors.destination_place
                          ? "border-red-500 hover:border-red-500"
                          : ""
                      )}
                    />
                  )}
                />
                {errors.destination_place && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.destination_place.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">
                  Transportation
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="transportation"
                  control={control}
                  render={({ field }) => {
                    const selectedValue =
                      transportOptions.find(
                        (opt) => opt.value === field.value
                      ) ||
                      (field.value
                        ? { label: field.value, value: field.value }
                        : null);

                    return (
                      <AsyncCreatableSelect
                        cacheOptions
                        defaultOptions={transportOptions}
                        loadOptions={createLoadOptions(transportOptions)}
                        onChange={(selected) => field.onChange(selected?.value)}
                        onCreateOption={(inputValue) => {
                          const newOption = {
                            label: inputValue,
                            value: inputValue,
                          };
                          transportOptions.push(newOption);
                          field.onChange(inputValue);
                        }}
                        value={selectedValue}
                        placeholder="Select transportation"
                        classNamePrefix="react-select"
                        className={clsx(
                          "react-select-container",
                          errors.transportation && "border-red-500"
                        )}
                      />
                    );
                  }}
                />
                {errors.transportation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.transportation.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">
                  Lodging
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="lodging"
                  control={control}
                  render={({ field }) => {
                    const selectedValue =
                      lodgingOptions.find((opt) => opt.value === field.value) ||
                      (field.value
                        ? { label: field.value, value: field.value }
                        : null);

                    return (
                      <AsyncCreatableSelect
                        cacheOptions
                        defaultOptions={lodgingOptions}
                        loadOptions={createLoadOptions(lodgingOptions)}
                        onChange={(selected) => field.onChange(selected?.value)}
                        onCreateOption={(inputValue) => {
                          const newOption = {
                            label: inputValue,
                            value: inputValue,
                          };
                          lodgingOptions.push(newOption);
                          field.onChange(inputValue);
                        }}
                        value={selectedValue}
                        placeholder="Select lodging"
                        classNamePrefix="react-select"
                        className={clsx(
                          "react-select-container",
                          errors.lodging && "border-red-500"
                        )}
                      />
                    );
                  }}
                />
                {errors.lodging && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lodging.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">
                  Work Status
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="work_status"
                  control={control}
                  render={({ field }) => {
                    const selectedValue =
                      workstatusOptions.find(
                        (opt) => opt.value === field.value
                      ) ||
                      (field.value
                        ? { label: field.value, value: field.value }
                        : null);

                    return (
                      <AsyncCreatableSelect
                        cacheOptions
                        defaultOptions={workstatusOptions}
                        loadOptions={createLoadOptions(workstatusOptions)}
                        onChange={(selected) => field.onChange(selected?.value)}
                        onCreateOption={(inputValue) => {
                          const newOption = {
                            label: inputValue,
                            value: inputValue,
                          };
                          workstatusOptions.push(newOption);
                          field.onChange(inputValue);
                        }}
                        value={selectedValue}
                        placeholder="Select work job"
                        classNamePrefix="react-select"
                        className={clsx(
                          "react-select-container",
                          errors.work_status && "border-red-500"
                        )}
                      />
                    );
                  }}
                />

                {errors.work_status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.work_status.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">
                  Office Activities
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="office_activities"
                  control={control}
                  render={({ field }) => {
                    const selectedValue =
                      officeActivitiesOptions.find(
                        (opt) => opt.value === field.value
                      ) ||
                      (field.value
                        ? { label: field.value, value: field.value }
                        : null);

                    return (
                      <AsyncCreatableSelect
                        cacheOptions
                        defaultOptions={officeActivitiesOptions}
                        loadOptions={createLoadOptions(officeActivitiesOptions)}
                        onChange={(selected) => field.onChange(selected?.value)}
                        onCreateOption={(inputValue) => {
                          const newOption = {
                            label: inputValue,
                            value: inputValue,
                          };
                          officeActivitiesOptions.push(newOption);
                          field.onChange(inputValue);
                        }}
                        value={selectedValue}
                        placeholder="Select office activities"
                        classNamePrefix="react-select"
                        className={clsx(
                          "react-select-container",
                          errors.office_activities && "border-red-500"
                        )}
                      />
                    );
                  }}
                />
                {errors.office_activities && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.office_activities.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">
                  Type Assignment
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => {
                    const selectedValue =
                      typeStOptions.find((opt) => opt.value === field.value) ||
                      (field.value
                        ? { label: field.value, value: field.value }
                        : null);

                    return (
                      <AsyncCreatableSelect
                        cacheOptions
                        defaultOptions={typeStOptions}
                        loadOptions={createLoadOptions(typeStOptions)}
                        onChange={(selected) => field.onChange(selected?.value)}
                        onCreateOption={(inputValue) => {
                          const newOption = {
                            label: inputValue,
                            value: inputValue,
                          };
                          typeStOptions.push(newOption);
                          field.onChange(inputValue);
                        }}
                        value={selectedValue}
                        placeholder="Select type assignment"
                        classNamePrefix="react-select"
                        className={clsx(
                          "react-select-container",
                          errors.type && "border-red-500"
                        )}
                      />
                    );
                  }}
                />
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">
                  Leave Date
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
                        setValue(
                          "start_date",
                          start
                            ? new Date(start).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : ""
                        );
                        setValue(
                          "end_date",
                          end
                            ? new Date(end).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : ""
                        );
                      }}
                      className={clsx(
                        "input w-full text-sm py-2 px-3 rounded-md border",
                        errors.start_date || errors.end_date
                          ? "border-red-500"
                          : "border-gray-300"
                      )}
                      placeholderText="Pick a date"
                      dateFormat="dd-MMM-yyyy"
                      isClearable={true}
                      locale={enGB}
                      minDate={
                        new Date(new Date().setDate(new Date().getDate() + 5))
                      }
                    />
                  )}
                />
                {(errors.start_date || errors.end_date) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date?.message || errors.end_date?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Destination City
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="destination_city"
                  control={control}
                  render={({ field }) => {
                    const handleCountryChange = async (
                      selectedOptions: CountryOption[] | null
                    ) => {
                      setSelectedCountries(selectedOptions || []);
                      const valuesOnly = selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : [];
                      field.onChange(valuesOnly);

                      if (!selectedOptions || selectedOptions.length === 0) {
                        setExchangeRates({});
                        return;
                      }

                      const uniqueCurrencies = Array.from(
                        new Set(
                          selectedOptions
                            .map((opt) => opt.currencyCode)
                            .filter(Boolean)
                        )
                      );

                      const newRates: Record<string, number | string> = {};

                      for (const code of uniqueCurrencies) {
                        try {
                          const res = await fetch(
                            `https://hexarate.paikama.co/api/rates/latest/${code}?target=IDR`
                          );
                          const data = await res.json();
                          newRates[code] = data.data?.mid ?? "N/A";
                        } catch (error) {
                          newRates[code] = "Error";
                        }
                      }

                      setExchangeRates(newRates);
                    };

                    return (
                      <AsyncSelect
                        isMulti
                        cacheOptions
                        defaultOptions
                        loadOptions={loadOptions}
                        onChange={handleCountryChange}
                        value={
                          Array.isArray(field.value)
                            ? selectedCountries.filter((c) =>
                                field.value.includes(c.value)
                              )
                            : []
                        }
                        placeholder={
                          travelType === "domestic"
                            ? "Select province destinations"
                            : "Select country destinations"
                        }
                        classNamePrefix="react-select"
                        className={clsx(
                          "react-select-container",
                          errors.destination_city && "border-red-500"
                        )}
                      />
                    );
                  }}
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 mt-4 text-sm">
              <h3 className="text-base font-semibold mb-4 text-gray-700">
                Travel Cost
              </h3>

              {travelType === "international" &&
                selectedCountries.length > 0 && (
                  <>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => <input type="hidden" {...field} />}
                    />
                    <Controller
                      name="symbol_currency"
                      control={control}
                      render={({ field }) => <input type="hidden" {...field} />}
                    />

                    <div className="bg-white rounded-md p-4 max-w-md mx-auto mt-6 shadow-sm text-sm">
                      <h4 className="text-base font-semibold text-gray-800 mb-3">
                        Currency Info
                      </h4>
                      <ul>
                        {selectedCountries.map((country) => (
                          <li
                            key={country.value}
                            className="flex justify-between py-2 border-b last:border-b-0 border-gray-200"
                          >
                            <span className="text-gray-700">
                              {country.label} ({country.currencyCode})
                            </span>
                            <span className="font-medium text-gray-900">
                              {exchangeRates[country.currencyCode]
                                ? `1 ${country.currencyCode} = ${Number(
                                    exchangeRates[country.currencyCode]
                                  ).toLocaleString("id-ID")} IDR`
                                : "Loading..."}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {costFields.map(({ label, name }) => (
                  <div key={name}>
                    <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                      {label}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Controller
                      name={name}
                      control={control}
                      rules={{ required: `${label} is required` }}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <input
                          {...rest}
                          type="text"
                          placeholder={`Enter ${label.toLowerCase()}`}
                          value={formatRupiah(value)}
                          onChange={(e) => {
                            const val = e.target.value;
                            const numberVal = parseRupiah(val);
                            onChange(numberVal);
                          }}
                          className={`input w-full rounded-lg border px-3 py-2 text-sm ${
                            errors[name] ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      )}
                    />
                    {errors[name] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[name]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                  Total Cost
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="total_cost"
                  control={control}
                  rules={{ required: "Total cost is required" }}
                  render={({ field: { value, ...rest } }) => (
                    <input
                      {...rest}
                      type="text"
                      placeholder="Total cost"
                      value={formatRupiah(value)}
                      readOnly
                      className={`input w-full rounded-lg border px-3 py-2 bg-gray-100 font-semibold text-gray-800 text-sm ${
                        errors.total_cost ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  )}
                />
                {errors.total_cost && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.total_cost.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 mt-6">
              <div>
                <label className="form-label">
                  Activity Agenda
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="activity_agenda"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className={clsx(
                        "w-full text-sm text-gray-700 p-3 rounded-md bg-white border border-gray-300",
                        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
                        "placeholder:text-gray-500",
                        errors.activity_agenda &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Your Agenda"
                      rows={4}
                    />
                  )}
                />
                {errors.activity_agenda && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.activity_agenda.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 mt-6">
              <div>
                <label className="form-label">
                  Official Travel Purpose
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                </label>
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className={clsx(
                        "w-full text-sm text-gray-700 p-3 rounded-md bg-white border border-gray-300",
                        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
                        "placeholder:text-gray-500",
                        errors.purpose &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Your purpose"
                      rows={4}
                    />
                  )}
                />
                {errors.purpose && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.purpose.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer justify-end flex-shrink-0">
            <div className="flex gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Discard
              </button>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </Modal>

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
                      <div className="font-semibold text-gray-600">{label}</div>
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
                    { label: "Hotel Cost", value: selectedData?.hotel_cost },
                    { label: "UPD Cost", value: selectedData?.upd_cost },
                    { label: "Fiskal Cost", value: selectedData?.fiskal_cost },
                    { label: "Other Cost", value: selectedData?.other_cost },
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

      <ActionModal
        isModalOpen={isCancelTravelModalOpen}
        onClose={onClose}
        title={`${selectedActionType} Official Travel Request`}
        onSubmit={handleSubmit(onCancel)}
        loading={loading}
        submitText={selectedActionType}
      >
        <form id="officialTravelForm" onSubmit={handleSubmit(onSubmit)}>
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
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Remarks
            </h3>
            <div>
              <label className="form-label">
                Canceled Remark{" "}
                <span style={{ color: "red", marginLeft: "5px" }}>*</span>
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
                  />
                )}
              />
              {errors.canceled_remark && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.canceled_remark.message}
                </p>
              )}
            </div>
          </section>
        </form>
      </ActionModal>

      <DeclarationModal
        isOpen={isDeclarationModalOpen}
        onClose={() => {
          setIsDeclarationModalOpen(false);
          setDeclarationData(null);
          setDeclarationType(null);
        }}
        declarationData={declarationData}
        officialTravelData={officialTravelData}
        type={declarationType}
      />
    </div>
  );
}