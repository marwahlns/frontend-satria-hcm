import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import DetailModal from "./DetailModal";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

export default function Home() {
  const [filter, setFilter] = useState<number>(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isRefetch, setIsRefetch] = useState(false);
  const api = `${process.env.NEXT_PUBLIC_API_URL}`;

  const handleOpenDetailModal = (data) => {
    setSelectedData(data);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedData(null);
  };

  const handleExportExcel = async () => {
    const token = localStorage.getItem("authToken");
    try {
      // Panggil API untuk mendapatkan data Excel
      const response = await fetch(`${api}/api/trx/trxLeave/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data dari API");
      }

      // Tangani file biner (Excel) dari response
      const blob = await response.blob();
      const link = document.createElement("a");
      const url = window.URL.createObjectURL(blob);

      link.href = url;
      link.download = "Data_Peminjaman_Buku.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Gagal mengekspor data.");
    }
  };

  type ITrLeave = {
    user: number;
    dept: number;
    status_leave: string;
  };

  const columns: ColumnDef<ITrLeave>[] = [
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
      accessorKey: "leave_type_name",
      header: "Leave Type",
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
      accessorKey: "total_leave_days",
      header: "Total Leave Days",
      enableSorting: true,
    },
    {
      accessorKey: "leave_reason",
      header: "Leave Reason",
      enableSorting: true,
    },
    {
      accessorKey: "status_leave",
      header: "Status Leave",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status_leave;

        let badgeClass = "badge badge-sm badge-outline";
        if (status === "Pending") badgeClass += " badge-warning";
        else if (status === "Accepted") badgeClass += " badge-primary";
        else if (status === "Approved") badgeClass += " badge-success";
        else if (status === "Rejected") badgeClass += " badge-danger";

        return <span className={badgeClass}>{status}</span>;
      },
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
              onClick={() => handleOpenDetailModal(data)}
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>
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
            Leave submission data list
          </h1>

          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex gap-3 items-center">
              <div
                className="dropdown"
                data-dropdown="true"
                data-dropdown-trigger="click"
              >
                <button className="dropdown-toggle btn btn-light">
                  <i className="ki-filled ki-filter-tablet"></i>
                  Filter Data
                </button>
                <div className="dropdown-content w-full max-w-56 py-2">
                  <div className="menu menu-default flex flex-col w-full">
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(0)}>
                        <span className="menu-title">All</span>
                      </a>
                    </div>
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(1)}>
                        <span className="menu-title">Pending</span>
                      </a>
                    </div>
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(2)}>
                        <span className="menu-title">Accepted</span>
                      </a>
                    </div>
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(3)}>
                        <span className="menu-title">Approved</span>
                      </a>
                    </div>
                    <div className="menu-item">
                      <a className="menu-link" onClick={() => setFilter(4)}>
                        <span className="menu-title">Rejected</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="btn btn-filled btn-primary"
                onClick={handleExportExcel}
              >
                <i className="ki-outline ki-plus-squared"></i>
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxLeave?status=${filter}`}
        isRefetch={isRefetch}
      />

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        selectedData={selectedData}
      />
    </Main>
  );
}
