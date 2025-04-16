import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import ApprovedModal from "./AppovedModal";
import RejectedModal from "./RejectedModal";
import DetailModal from "../acc-work-travel/DetailModal";

export default function Home() {
  const [filter, setFilter] = useState<number>(0);
  const [isApprovedModalOpen, setIsApprovedModalOpen] = useState(false);
  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isRefetch, setIsRefetch] = useState(false);

  const handleOpenApprovedModal = (data) => {
    setSelectedData(data);
    setIsApprovedModalOpen(true);
  };

  const handleOpenRejectedModal = (data) => {
    setSelectedData(data);
    setIsRejectedModalOpen(true);
  };

  const handleOpenDetailModal = (data) => {
    setSelectedData(data);
    setIsDetailModalOpen(true);
  };

  const handleCloseApprovedModal = () => {
    setIsApprovedModalOpen(false);
    setSelectedData(null);
  };

  const handleCloseRejectedModal = () => {
    setIsRejectedModalOpen(false);
    setSelectedData(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedData(null);
  };

  type ITrWorkTravel = {
    user_name: number;
    dept_name: number;
    purpose: string;
    destination_city: string;
    start_date: string;
    end_date: string;
    status_id: number;
  };

  const columns: ColumnDef<ITrWorkTravel>[] = [
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
      accessorKey: "destination_city",
      header: "Destination City",
      enableSorting: true,
    },
    {
      accessorKey: "purpose",
      header: "Purpose Official Travel",
      enableSorting: true,
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
            {data.status_id === 1 && (
              <>
                <button
                  className={clsx(
                    "btn btn-icon bg-green-500 btn-xs transition-transform",
                    "hover:scale-[105%]",
                    "active:scale-[100%]"
                  )}
                  onClick={() => handleOpenApprovedModal(data)}
                >
                  <i className="ki-outline ki-check-squared text-white"></i>
                </button>
                <button
                  className={clsx(
                    "btn btn-icon bg-red-500 btn-xs transition-transform",
                    "hover:scale-[105%]",
                    "active:scale-[100%]"
                  )}
                  onClick={() => handleOpenRejectedModal(data)}
                >
                  <i className="ki-outline ki-cross-square text-white"></i>
                </button>
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
            Work travel submission data list (Approved)
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
                      <a className="menu-link" onClick={() => setFilter(2)}>
                        <span className="menu-title">Pending</span>
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

              {/* Tombol Export */}
              <button className="btn btn-filled btn-primary">
                <i className="ki-outline ki-plus-squared"></i>
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/trxOfficialTravel/getOfficialTravelToApproved?status=${filter}`}
        isRefetch={isRefetch}
      />

      <ApprovedModal
        isModalOpen={isApprovedModalOpen}
        onClose={handleCloseApprovedModal}
        selectedData={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />

      <RejectedModal
        isModalOpen={isRejectedModalOpen}
        onClose={handleCloseRejectedModal}
        selectedData={selectedData}
        setRefetch={setIsRefetch}
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
