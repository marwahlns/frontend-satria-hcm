import DataTable from "@/components/Datatables";
import FilterData from "@/components/FilterData";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import FsLightbox from 'fslightbox-react';
import Cookies from "js-cookie";
import axios from "axios";

export default function Home() {
    const [isRefetch, setIsRefetch] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [filter, setFilter] = useState<{ month: string; year: string; status?: number }>({
        month: "",
        year: "",
        status: 0,
    });
    const [lightboxToggler, setLightboxToggler] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string>("");

    const openLightbox = (src: string) => {
        setLightboxSrc(src);
        setLightboxToggler(!lightboxToggler);
        console.log("Lightbox Source:", lightboxSrc);
    };

    const handleSearchChange = (value) => {
        setSearchValue(value);
    };

    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString || dateTimeString === "-") {
            return { date: "-", day: "-", time: "-" };
        }

        const date = new Date(dateTimeString);

        // Indonesian day names
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        // Indonesian month names
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        const day = dayNames[date.getUTCDay()];
        const dateNum = date.getUTCDate();
        const month = monthNames[date.getUTCMonth()];
        const year = date.getUTCFullYear();
        const time = date.toISOString().slice(11, 16);

        return {
            date: `${dateNum} ${month} ${year}`,
            day: day,
            time: time
        };
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const month = filter.month || currentMonth;
    const year = filter.year || currentYear;

    const handleExportExcel = async () => {
        const token = Cookies.get("token");
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        month: month,
                        year: year,
                        export: true,
                    },
                    responseType: "blob",
                }
            );

            if (response.status !== 200) {
                throw new Error("Failed to export Excel file");
            }

            const fileName = `Attendance_Report.xlsx`;
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

    type IAttendance = {
        id: string;
        in_time: string;
        out_time: string;
        foto_in: string;
        foto_out: string;
    };

    const columns: ColumnDef<IAttendance>[] = [
        {
            accessorKey: "number",
            header: "No",
            enableSorting: false,
        },
        {
            accessorKey: "",
            header: "Clock In",
            cell: ({ row }) => {
                const { in_time, foto_in } = row.original;
                const imageUrl =
                    !foto_in || foto_in === "-"
                        ? "/no-profile-2.png"
                        : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${foto_in}`;
                const formattedTime = formatDateTime(in_time);

                return (
                    <div className="flex items-center space-x-3 min-w-[150px]">
                        <img
                            src={imageUrl}
                            alt="Clock In"
                            onClick={() => openLightbox(imageUrl)}
                            className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                            {!in_time || in_time === "-" ? (
                                <p className="font-bold text-sm">-</p>
                            ) : (
                                <>
                                    <p className="font-bold text-sm">{formattedTime.date}</p>
                                    <span className="badge badge-outline badge-success">
                                        {formattedTime.day}, {formattedTime.time}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "",
            header: "Clock Out",
            cell: ({ row }) => {
                const { out_time, foto_out } = row.original;
                const imageUrl =
                    !foto_out || foto_out === "-"
                        ? "/no-profile-2.png"
                        : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${foto_out}`;
                const formattedTime = formatDateTime(out_time);

                return (
                    <div className="flex items-center space-x-3 min-w-[150px]">
                        <img
                            src={imageUrl}
                            alt="Clock Out"
                            onClick={() => openLightbox(imageUrl)}
                            className="w-12 h-12 rounded object-cover cursor-pointer"
                        />
                        <div>
                            {!out_time || out_time === "-" ? (
                                <p className="font-bold text-sm">-</p>
                            ) : (
                                <>
                                    <p className="font-bold text-sm">{formattedTime.date}</p>
                                    <span className="badge badge-outline badge-success">
                                        {formattedTime.day}, {formattedTime.time}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
                    <p className="text-gray-500 text-sm">Your Attendance Record</p>
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
                        className="btn btn-outline btn-primary"
                        onClick={() => setShowFilter((prev) => !prev)}
                    >
                        <i className="ki-filled ki-filter-tablet mr-1" />
                        Filter
                    </button>
                </div>
            </div>

            {showFilter && (
                <FilterData
                    disableStatus
                    onSelect={(selectedFilter) => {
                        setFilter(selectedFilter);
                        setShowFilter(false);
                    }}
                />
            )}{" "}

            <DataTable
                columns={columns}
                url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance?month=${month}&year=${year}`}
                isRefetch={isRefetch}
                onSearchChange={handleSearchChange}
            />

            <FsLightbox toggler={lightboxToggler} sources={[lightboxSrc]} />
        </div>
    )
}