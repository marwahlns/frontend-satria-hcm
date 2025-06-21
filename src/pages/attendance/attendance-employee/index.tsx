import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import FsLightbox from 'fslightbox-react';
import Link from "next/link";
import Image from "next/image";
import Swal from 'sweetalert2';

export default function Home() {
  const [isRefetch, setIsRefetch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showMonthlyInput, setShowMonthlyInput] = useState(false);
  const [showDailyInput, setShowDailyInput] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const day = pad(date.getUTCDate());
    const month = pad(date.getUTCMonth() + 1);
    const year = date.getUTCFullYear();
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());

    return `${hours}:${minutes}`;
  }

  const [lightboxToggler, setLightboxToggler] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string>("");
  const openLightbox = (src: string) => {
    setLightboxSrc(src);
    setLightboxToggler(!lightboxToggler);
  };

  const handleExportExcel = async (exportType: 'daily' | 'monthly') => {
    const token = Cookies.get("token");
    let params: any = {};
    let fileName = "Attendance_Report";

    if (exportType === "daily") {
      if (!selectedDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'Please select a date for daily export.'
        });
        return;
      }
      params = { date: selectedDate, export: "daily" };
      fileName = `Attendance_Report_${selectedDate}.xlsx`;
    } else if (exportType === "monthly") {
      if (!selectedMonth) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'Please select a month for monthly export.'
        });
        return;
      }
      params = { date: `${selectedMonth}-01`, export: "monthly" };
      fileName = `Attendance_Report_${selectedMonth}.xlsx`;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid export type.'
      });
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance/daily`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        if (response.status === 204) {
          Swal.fire({
            icon: 'info',
            title: 'No Data',
            text: 'No data available for the selected period.'
          });
        } else {
          throw new Error(`Failed to export Excel file. Status: ${response.status}`);
        }
        return;
      }

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
      console.warn("Gagal mengekspor Excel.");
    }
  };

  useEffect(() => {
    setIsRefetch(true);
  }, [selectedDate]);

  type ITrLeave = {
    in_time: string;
    out_time: string;
    foto_in: string;
    foto_out: string;
    longitude_in: string;
    latitude_in: string;
    longitude_out: string;
    latitude_out: string;
    is_late: number;
    MsUser: {
      id: number,
      photo: string,
      name: string,
      personal_number: string,
      division: string,
      department: string,
      company_name: string
    };
    MsShift: {
      id: number;
      name: string;
      in_time: string;
      out_time: string;
    };
  };

  const columns: ColumnDef<ITrLeave>[] = [
    {
      accessorKey: "number",
      header: "No",
      enableSorting: false,
    },
    {
      accessorKey: "",
      header: "User",
      enableSorting: false,
      cell: ({ row }) => {
        const { MsUser } = row.original;

        const photoUrl = !MsUser?.photo || MsUser?.photo === "-"
          ? "/no-profile-2.png"
          : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${MsUser.photo}`;

        return (
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={photoUrl}
                  alt={MsUser?.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/no-profile-2.png";
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-gray-600">
                {MsUser?.name || "-"}
              </span>
              <span className="font-bold text-xs text-gray-500">
                {MsUser?.personal_number || "-"}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "",
      header: "Shift",
      cell: ({ row }) => {
        const { MsShift } = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-bold text-sm text-gray-600">
                {MsShift?.name || "-"}
              </span>
              <span className="font-bold text-xs text-gray-500">
                {formatTime(MsShift?.in_time) || "-"} - {formatTime(MsShift?.out_time) || "-"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "",
      header: "Picture In",
      cell: ({ row }) => {
        const { foto_in } = row.original;
        const imageUrl =
          !foto_in || foto_in === "-"
            ? "/no-profile-2.png"
            : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${foto_in}`;

        return (
          <Image
            src={imageUrl}
            alt="Picture In"
            width={48}
            height={48}
            onClick={() => openLightbox(imageUrl)}
            className="w-12 h-12 rounded object-cover cursor-pointer"
          />
        );
      },
    },
    {
      accessorKey: "",
      header: "User In",
      cell: ({ row }) => {
        const { in_time, latitude_in, longitude_in, is_late } = row.original;

        return (
          <div className="flex items-center">
            <div>
              {!in_time || in_time === "-" ? (
                <p className="font-bold text-sm">-</p>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className={`badge badge-pill badge-outline ${is_late === 1 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                    {formatDateTime(in_time)}
                  </span>
                  <span className="badge badge-pill badge-outline badge-warning">
                    {latitude_in}, {longitude_in}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "",
      header: "Picture Out",
      cell: ({ row }) => {
        const { foto_out } = row.original;
        const imageUrl =
          !foto_out || foto_out === "-"
            ? "/no-profile-2.png"
            : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${foto_out}`;

        return (
          <Image
            src={imageUrl}
            alt="Picture Out"
            width={48}
            height={48}
            onClick={() => openLightbox(imageUrl)}
            className="w-12 h-12 rounded object-cover cursor-pointer"
          />
        );
      }
    },
    {
      accessorKey: "",
      header: "User Out",
      cell: ({ row }) => {
        const { out_time, latitude_out, longitude_out } = row.original;

        return (
          <div className="flex items-center">
            <div>
              {!out_time || out_time === "-" ? (
                <p className="font-bold text-sm">-</p>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="badge badge-pill badge-outline bg-blue-100 text-blue-800 border-blue-200">
                      {formatDateTime(out_time)}
                    </span>
                    <span className="badge badge-pill badge-outline badge-warning text-gray-800">
                      {latitude_out}, {longitude_out}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        const userId = data.MsUser?.personal_number;
        return (
          <div className="flex space-x-1 justify-center">
            <Link href={`/attendance/attendance-detail?date=${selectedDate}&user_id=${userId}`}>
              <button className="btn btn-sm btn-outline btn-primary">
                <i className="ki-outline ki-eye text-white"></i>
              </button>
            </Link>
            <div className="tooltip" id="detail_tooltip">
              Detail
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Main>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance List</h1>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            className="px-3 py-2 bg-blue-100 border border-gray-300 rounded-lg text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <div className="dropdown" data-dropdown="true" data-dropdown-trigger="click">
            <button className="dropdown-toggle btn btn-filled btn-success">
              <i className="ki-filled ki-file-down"></i>
              Export to Excel
            </button>
            <div className="dropdown-content w-full max-w-56 py-2">
              <div className="menu menu-default flex flex-col w-full">
                {/* Export Harian */}
                <div className="menu-item">
                  <button
                    className="menu-link"
                    onClick={() => {
                      setShowDailyInput(!showDailyInput);
                      if (!showDailyInput) {
                        setShowMonthlyInput(false);
                      }
                    }}
                  >
                    <span className="menu-icon">
                      <i className="ki-filled ki-calendar-8"></i>
                    </span>
                    <span className="menu-title">Export Harian</span>
                  </button>
                </div>

                {showDailyInput && (
                  <div className="flex flex-col gap-2 px-4 py-2">
                    <input
                      type="date"
                      className="form-input border border-gray-300 rounded px-2 py-1"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button
                      onClick={() => handleExportExcel("daily")}
                      className="btn btn-sm btn-primary"
                    >
                      Export
                    </button>
                  </div>
                )}

                {/* Export Bulanan */}
                <div className="menu-item">
                  <button
                    className="menu-link"
                    onClick={() => {
                      setShowMonthlyInput(!showMonthlyInput);
                      if (!showMonthlyInput) {
                        setShowDailyInput(false);
                      }
                    }}
                  >
                    <span className="menu-icon">
                      <i className="ki-filled ki-calendar"></i>
                    </span>
                    <span className="menu-title">Export Bulanan</span>
                  </button>
                </div>

                {/* Input Bulan dan Tombol Export */}
                {showMonthlyInput && (
                  <div className="flex flex-col gap-2 px-4 py-2">
                    <input
                      type="month"
                      className="form-input border border-gray-300 rounded px-2 py-1"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    <button
                      onClick={() => handleExportExcel("monthly")}
                      className="btn btn-sm btn-primary"
                    >
                      Export
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance/daily?date=${selectedDate}`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />

      <FsLightbox toggler={lightboxToggler} sources={[lightboxSrc]} />
    </Main>
  );
}
