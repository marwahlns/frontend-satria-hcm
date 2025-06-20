import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useRef } from "react";
import FilterData from "@/components/FilterData";
import Cookies from "js-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enGB } from "date-fns/locale";
import Modal from "@/components/Modal";
import AddModalOfficial from "@/components/Modals/AddOfficialTravelModal";
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
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isCancelTravelModalOpen, setIsCancelTravelModalOpen] = useState(false);
  const [isCancelDeclarationModalOpen, setIsCancelDeclarationModalOpen] =
    useState(false);
  const [declarationStatus, setDeclarationStatus] = useState<number | null>(
    null
  );
  const [formCount, setFormCount] = useState(1); // Mulai dari 1
  const [declarationType, setDeclarationType] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [selectedData, setSelectedData] = useState(null);
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
  const [isRefetch, setIsRefetch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const setTotalOfficialTravel = useOfficialTravelStore(
    (state) => state.setTotalOfficialTravels
  );
  const [travelType, setTravelType] = useState(null);
  const [selectedCountry1, setSelectedCountry1] = useState(null);
  const [selectedRegion1, setSelectedRegion1] = useState(null);
  const [regionOptions1, setRegionOptions1] = useState([]);

  const [selectedCountry2, setSelectedCountry2] = useState(null);
  const [selectedRegion2, setSelectedRegion2] = useState(null);
  const [regionOptions2, setRegionOptions2] = useState([]);

  const [selectedCountry3, setSelectedCountry3] = useState(null);
  const [selectedRegion3, setSelectedRegion3] = useState(null);
  const [regionOptions3, setRegionOptions3] = useState([]);

  const [exchangeRates, setExchangeRates] = useState<
    Record<string, number | string>
  >({});
  const [declarationData, setDeclarationData] = useState(null);
  const [officialTravelData, setOfficialTravelData] = useState(null);
  const [activeDropdownRow, setActiveDropdownRow] = useState(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const submitSchemaBase = yup.object({
    start_date: yup.string().required("Start date is required"),
    end_date: yup.string().required("End date is required"),
    destination_city1: yup.string().required("Destination City 1 is required"),
    destination_city2: yup.string().nullable(),
    destination_city3: yup.string().nullable(),
    destination_place1: yup.string().required("Destination place is required"),
    destination_place2: yup.string().nullable(),
    destination_place3: yup.string().nullable(),
    purpose: yup.string().required("Purpose official travel is required"),
    type: yup.string().required("Type is required"),
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
    destination_city1?: string;
    destination_city2?: string;
    destination_city3?: string;
    type?: string;
    destination_place1?: string;
    destination_place2?: string;
    destination_place3?: string;
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
      destination_city1: "",
      destination_city2: "",
      destination_city3: "",
      purpose: "",
      canceled_remark: "",
      type: "",
      symbol_currency: [],
      currency: [],
      destination_place1: "",
      destination_place2: "",
      destination_place3: "",
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

    const selectedAll = [
      selectedCountry1,
      selectedCountry2,
      selectedCountry3,
    ].filter(Boolean);

    if (travelType === "international" && selectedAll.length > 0) {
      const currencyCodes = selectedAll.map((c) => c.currencyCode);
      const currencyValues = selectedAll.map((c) =>
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
    selectedCountry1,
    selectedCountry2,
    selectedCountry3,
    travelType,
    setValue,
    exchangeRates,
    setIsRefetch,
  ]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownRow(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addForm = () => {
    if (formCount < 3) {
      setFormCount(formCount + 1);
    }
  };

  const removeForm = (index) => {
    if (index === 1) {
      setSelectedCountry2(null);
      setSelectedRegion2(null);
      setRegionOptions2([]);
    } else if (index === 2) {
      setSelectedCountry3(null);
      setSelectedRegion3(null);
      setRegionOptions3([]);
    }
    setFormCount(formCount - 1);
  };

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
    setSelectedCountry1(null);
    setSelectedCountry2(null);
    setSelectedCountry3(null);
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

  const loadProvinceOptions = async (inputValue) => {
    const provResponse = await fetch(
      "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
    );
    const provData = await provResponse.json();
    const provinceOptions = provData.map((item) => ({
      label: item.name.toUpperCase(),
      value: item.name.toUpperCase(),
      id: item.id,
    }));

    return provinceOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadRegionByProvinceCode = async (inputValue, provinceCode) => {
    try {
      if (!provinceCode) return [];

      const response = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceCode}.json`
      );
      if (!response.ok) throw new Error("Failed to fetch regions");

      const data = await response.json();

      const options = data.map((item) => ({
        label: item.name.toUpperCase(),
        value: item.name.toUpperCase(),
      }));

      return options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    } catch (error) {
      console.error("Error loading regions:", error);
      return [];
    }
  };

  const loadInternationalOptions = async (inputValue: string) => {
    const response = await fetch(
      `http://geodb-free-service.wirefreethought.com/v1/geo/countries?limit=10&namePrefix=${inputValue}`
    );

    const data = await response.json();

    const countryOptions = (data.data || [])
      .map((item: any) => ({
        label: item.name.toUpperCase(),
        value: item.name.toUpperCase(),
        wikiDataId: item.wikiDataId,
        currencyCode: item.currencyCodes?.[0] || "-",
      }))
      .filter((option: any) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );

    return countryOptions;
  };

  const fetchRegionsByCountryCode = async (
    countryCode: string,
    inputValue: string = ""
  ) => {
    console.log("Fetching regions for countryCode:", countryCode);

    const limit = 10;
    let offset = 0;
    let allRegions: any[] = [];
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await fetch(
          `http://geodb-free-service.wirefreethought.com/v1/geo/countries/${countryCode}/regions?limit=${limit}&offset=${offset}`
        );

        const result = await response.json();
        const data = result.data;

        if (!data || !Array.isArray(data)) {
          console.error("Invalid API response format:", result);
          return [];
        }

        allRegions = allRegions.concat(data);

        const totalCount = result.metadata?.totalCount;
        offset += limit;

        hasMore = totalCount
          ? allRegions.length < totalCount
          : data.length === limit;
      }

      let mappedRegions = allRegions.map((region: any) => ({
        label: region.name.toUpperCase(),
        value: region.name.toUpperCase(),
      }));

      // Filter berdasarkan inputValue
      if (inputValue) {
        mappedRegions = mappedRegions.filter((region) =>
          region.label.toLowerCase().includes(inputValue.toLowerCase())
        );
      }
      return mappedRegions;
    } catch (error) {
      return [];
    }
  };

  const loadOptions = (inputValue) => {
    if (travelType === "domestic") return loadProvinceOptions(inputValue);
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
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to submit this leave request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, submit it!`,
        cancelButtonText: "Discard",
        reverseButtons: true,
      });
      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }

      const token = Cookies.get("token");
      const destination_city1 =
        selectedCountry1 && selectedRegion1
          ? `${selectedCountry1.label}, ${selectedRegion1.label}`
          : "";

      const destination_city2 =
        selectedCountry2 && selectedRegion2
          ? `${selectedCountry2.label}, ${selectedRegion2.label}`
          : "";

      const destination_city3 =
        selectedCountry3 && selectedRegion3
          ? `${selectedCountry3.label}, ${selectedRegion3.label}`
          : "";
      console.log("destinasi1", destination_city1);
      console.log("destinasi2", destination_city2);
      console.log("destinasi3", destination_city3);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/?type=officialTravel`,
        {
          ...data,
          start_date: data.start_date,
          end_date: data.end_date,
          type: data.type,
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
          destination_city1,
          destination_city2,
          destination_city3,
          destination_place1: data.destination_place1,
          destination_place2: data.destination_place2,
          destination_place3: data.destination_place3,
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
        text: `Failed to export PDF.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setLoadingId(null);
    }
  };

  const handleExportPdfDeclaration = async (searchId) => {
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
            type: "declaration",
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
        throw new Error("Failed to export Excel file");
      }
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const fileName = `Data_Declaration_${yyyy}-${mm}-${dd}.pdf`;

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
        text: `Failed to export PDF.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setLoadingId(null);
    }
  };

  type IOffficialTravel = {
    id: number;
    code: string;
    status_id: number;
    status_submittion: string;
    destination_place1: string;
    destination_place2: string;
    destination_place3: string;
    isDeclaration: boolean;
    isDomestic: boolean;
  };

  const columns: ColumnDef<IOffficialTravel>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
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
    // {
    //   accessorKey: "total_leave_days",
    //   header: "Total Days",
    //   enableSorting: true,
    //   cell: ({ getValue }) => (
    //     <div className="text-right">{getValue() as number}</div>
    //   ),
    // },
    {
      accessorKey: "status_submittion",
      header: "Status",
      enableSorting: false,
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
        const isDropdownOpen = activeDropdownRow === data.id;

        const toggleDropdown = async () => {
          if (!isDropdownOpen) {
            const declaration = await fetchDeclarations(data.id);
            setDeclarationStatus(declaration?.status_id ?? null);
          }
          setActiveDropdownRow(isDropdownOpen ? null : data.id);
        };

        return (
          <div className="flex space-x-1 justify-center relative">
            {/* Tombol lainnya seperti Detail dan Export PDF */}
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

            {data.status_id === 1 && (
              <button
                className="btn btn-sm btn-outline btn-danger"
                onClick={() => handleOpenCancelTravelModal(data, "Canceled")}
              >
                <i className="ki-outline ki-arrow-circle-left text-white"></i>
              </button>
            )}

            {(data.status_id === 14 ||
              (data.status_id === 11 && data.isDomestic)) && (
              <>
                {!data.isDeclaration ? (
                  <button
                    className="btn btn-sm btn-outline btn-success"
                    onClick={async () => {
                      await handleOpenDeclarationModal(data);
                      setDeclarationType("Create");
                    }}
                  >
                    <IoIosList />
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      className="btn btn-sm btn-outline btn-success"
                      onClick={toggleDropdown}
                    >
                      <IoIosList />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-0 left-[-170px] bg-white border rounded shadow-md w-44 z-10">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={async () => {
                            await handleOpenDeclarationModal(data);
                            setDeclarationType("Detail");
                            setActiveDropdownRow(null);
                          }}
                        >
                          Detail Declaration
                        </button>

                        {declarationStatus === 1 && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                            onClick={async () => {
                              await handleOpenDeclarationModal(data);
                              setDeclarationType("Canceled");
                              setActiveDropdownRow(null);
                            }}
                          >
                            Cancel Declaration
                          </button>
                        )}

                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          disabled={loadingId === data.id}
                          onClick={async () => {
                            setLoadingId(data.id);
                            try {
                              const declaration = await fetchDeclarations(
                                data.id
                              );
                              await handleExportPdfDeclaration(data?.code);
                            } catch (error) {
                              console.error(
                                "Failed to export declaration:",
                                error
                              );
                            } finally {
                              setLoadingId(null);
                            }
                          }}
                        >
                          {loadingId === data.id ? (
                            <span className="flex items-center gap-1 text-gray-500">
                              <span className="loading loading-spinner loading-xs"></span>
                              Exporting...
                            </span>
                          ) : (
                            "Export Declaration"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
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
          <div className="relative">
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
          </div>

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

      <AddModalOfficial isModalOpen={isAddModalOpen}>
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
            <div className="max-w-[960px] w-full mx-auto">
              <div>
                {[0, 1, 2].slice(0, formCount).map((index) => {
                  const selectedCountry =
                    index === 0
                      ? selectedCountry1
                      : index === 1
                      ? selectedCountry2
                      : selectedCountry3;
                  const selectedRegion =
                    index === 0
                      ? selectedRegion1
                      : index === 1
                      ? selectedRegion2
                      : selectedRegion3;
                  const regionOptions =
                    index === 0
                      ? regionOptions1
                      : index === 1
                      ? regionOptions2
                      : regionOptions3;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 border p-4 rounded-lg relative"
                    >
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeForm(index)}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow"
                          title="Remove Destination"
                        >
                          <i className="ki-outline ki-cross-circle"></i>
                        </button>
                      )}

                      <div>
                        <label className="form-label">
                          {travelType === "international"
                            ? "Destination Country"
                            : "Destination Province"}{" "}
                          {index + 1}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Controller
                          control={control}
                          name={
                            index === 0
                              ? "destination_city1"
                              : index === 1
                              ? "destination_city2"
                              : "destination_city3"
                          }
                          render={({ field }) => (
                            <AsyncSelect
                              {...field}
                              isClearable
                              cacheOptions
                              defaultOptions
                              loadOptions={loadOptions}
                              value={selectedCountry}
                              onChange={async (selectedOption) => {
                                field.onChange(selectedOption?.value);

                                let regions = [];
                                let newSelectedCountries: any[] = [];

                                const isDomestic = travelType === "domestic";

                                const getRegions = async () => {
                                  if (isDomestic) {
                                    if (!selectedOption?.id) return [];
                                    return await loadRegionByProvinceCode(
                                      "",
                                      selectedOption.id
                                    );
                                  } else {
                                    if (!selectedOption?.wikiDataId) return [];
                                    return await fetchRegionsByCountryCode(
                                      selectedOption.wikiDataId
                                    );
                                  }
                                };

                                regions = await getRegions();

                                if (index === 0) {
                                  setSelectedCountry1(selectedOption);
                                  setSelectedRegion1(null);
                                  setRegionOptions1(regions);
                                  newSelectedCountries = [
                                    selectedOption,
                                    selectedCountry2,
                                    selectedCountry3,
                                  ];
                                } else if (index === 1) {
                                  setSelectedCountry2(selectedOption);
                                  setSelectedRegion2(null);
                                  setRegionOptions2(regions);
                                  newSelectedCountries = [
                                    selectedCountry1,
                                    selectedOption,
                                    selectedCountry3,
                                  ];
                                } else {
                                  setSelectedCountry3(selectedOption);
                                  setSelectedRegion3(null);
                                  setRegionOptions3(regions);
                                  newSelectedCountries = [
                                    selectedCountry1,
                                    selectedCountry2,
                                    selectedOption,
                                  ];
                                }

                                if (!isDomestic) {
                                  const filteredCountries =
                                    newSelectedCountries.filter(
                                      (country) =>
                                        country &&
                                        typeof country.currencyCode === "string"
                                    );

                                  const uniqueCurrencies = Array.from(
                                    new Set(
                                      filteredCountries.map(
                                        (opt) => opt.currencyCode
                                      )
                                    )
                                  );

                                  const newRates: Record<
                                    string,
                                    number | string
                                  > = {};

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
                                }
                              }}
                              placeholder={`Select country ${index + 1}`}
                              classNamePrefix="react-select"
                            />
                          )}
                        />

                        {errors[`destination_city${index + 1}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`destination_city${index + 1}`]?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">
                          Destination Region {index + 1}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <AsyncSelect
                          isClearable
                          cacheOptions
                          defaultOptions={regionOptions}
                          loadOptions={(inputValue) => {
                            const filtered = regionOptions.filter((option) =>
                              option.label
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                            );
                            return Promise.resolve(filtered);
                          }}
                          value={selectedRegion}
                          onChange={(selected) => {
                            if (index === 0) setSelectedRegion1(selected);
                            else if (index === 1) setSelectedRegion2(selected);
                            else setSelectedRegion3(selected);
                          }}
                          getOptionLabel={(e) => e.label}
                          getOptionValue={(e) => e.value}
                          placeholder={`Select region ${index + 1}`}
                          classNamePrefix="react-select"
                        />
                      </div>
                      <div>
                        <label className="form-label">
                          Destination Place {index + 1}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Controller
                          name={
                            index === 0
                              ? "destination_place1"
                              : index === 1
                              ? "destination_place2"
                              : "destination_place3"
                          }
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder={`Input destination place ${
                                index + 1
                              }`}
                              className={clsx(
                                "input",
                                errors[`destination_place_${index + 1}`]
                                  ? "border-red-500 hover:border-red-500"
                                  : ""
                              )}
                            />
                          )}
                        />
                        {errors[`destination_place${index + 1}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`destination_place${index + 1}`].message}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {formCount < 3 && (
                  <button
                    type="button"
                    onClick={addForm}
                    className="bg-blue-500 text-white text-sm px-2 py-1 mb-4 rounded hover:bg-blue-600"
                  >
                    <i className="ki-outline ki-plus-circle mr-3"></i>
                    Add Destination
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border p-4 rounded-lg relative">
                <div>
                  <label className="form-label">
                    Lodging<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Controller
                    name="lodging"
                    control={control}
                    render={({ field }) => {
                      const selectedValue =
                        lodgingOptions.find(
                          (opt) => opt.value === field.value
                        ) ||
                        (field.value
                          ? { label: field.value, value: field.value }
                          : null);
                      return (
                        <AsyncCreatableSelect
                          cacheOptions
                          defaultOptions={lodgingOptions}
                          loadOptions={createLoadOptions(lodgingOptions)}
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
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
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
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
                    Work Status<span className="text-red-500 ml-1">*</span>
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
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
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
                    <span className="text-red-500 ml-1">*</span>
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
                          loadOptions={createLoadOptions(
                            officeActivitiesOptions
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
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
                    Type Assignment<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => {
                      const selectedValue =
                        typeStOptions.find(
                          (opt) => opt.value === field.value
                        ) ||
                        (field.value
                          ? { label: field.value, value: field.value }
                          : null);
                      return (
                        <AsyncCreatableSelect
                          cacheOptions
                          defaultOptions={typeStOptions}
                          loadOptions={createLoadOptions(typeStOptions)}
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
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
                    Leave Date<span className="text-red-500 ml-1">*</span>
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
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 mt-4 text-sm">
              <h3 className="text-base font-semibold mb-4 text-gray-700">
                Travel Cost
              </h3>

              {travelType === "international" &&
                (selectedCountry1 || selectedCountry2 || selectedCountry3) && (
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

                    <div className="bg-white rounded-md p-4 max-w-full mx-auto mt-6 shadow-sm text-sm">
                      <h4 className="text-base font-semibold text-gray-800 mb-3">
                        Currency Info
                      </h4>
                      <ul>
                        {[selectedCountry1, selectedCountry2, selectedCountry3]
                          .filter(Boolean)
                          .map((country) => (
                            <li
                              key={country!.value}
                              className="flex justify-between py-2 border-b last:border-b-0 border-gray-200"
                            >
                              <span className="text-gray-700">
                                {country!.label} ({country!.currencyCode})
                              </span>
                              <span className="font-medium text-gray-900">
                                {exchangeRates[country!.currencyCode]
                                  ? `1 ${country!.currencyCode} = ${Number(
                                      exchangeRates[country!.currencyCode]
                                    ).toLocaleString("id-ID")} IDR`
                                  : "Loading..."}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
                          className={`input w-full rounded-lg border px-3 py-2 text-sm text-right placeholder:text-left ${
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

            <div className="grid grid-cols-2 gap-5 mt-6">
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
      </AddModalOfficial>

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

      <ActionModal
        isModalOpen={isCancelTravelModalOpen}
        onClose={onClose}
        title={`${selectedActionType} Official Travel Request`}
        onSubmit={handleSubmit(onCancel)}
        loading={loading}
        submitText={selectedActionType}
      >
        <form id="officialTravelForm" onSubmit={handleSubmit(onCancel)}>
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
            </div>
          </div>

          <section className="bg-gray-50 rounded-xl shadow-md p-6 mt-8">
            <h3 className="text-lg font-bold border-b pb-3 mb-4 text-gray-800">
              Remark
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="form-label mb-2">
                  Canceled Remark
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="canceled_remark"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={clsx(
                        "input",
                        errors.canceled_remark
                          ? "border-red-500 hover:border-red-500"
                          : ""
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
