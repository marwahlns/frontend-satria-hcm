import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import FilterData from "@/components/FilterData";
import Swal from "sweetalert2";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import DeclarationModal from "@/components/Modals/DeclarationModal";
import { IoMdPaper } from "react-icons/io";

export default function Home() {
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [declarationData, setDeclarationData] = useState(null);
  const [declarationType, setDeclarationType] = useState(null);
  const [isRefetch, setIsRefetch] = useState(false);
  const [filter, setFilter] = useState<{ month: string; year: string; status?: number }>({
    month: "",
    year: "",
    status: 0,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleOpenDeclarationModal = async (data) => {
    console.log("data", data);
    setDeclarationData(data);
    setIsDeclarationModalOpen(true);
  };

  const handleShowFile = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
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
            type: "declaration",
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

  type ITrDeclaration = {
    user_name: string;
    user_departement: string;
    status_id: number;
    actionType: string;
    modalType: string;
    status_submittion: string;
    evidence_file: string;
  };

  const columns: ColumnDef<ITrDeclaration>[] = [
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
      accessorKey: "user_department",
      header: "Departement",
      enableSorting: true,
    },
    {
      accessorKey: "code",
      header: "Code Official Travel",
      enableSorting: true,
    },
    {
      accessorKey: "total_cost_detail",
      header: "Total Cost Detail",
      enableSorting: true,
    },
    {
      accessorKey: "down_payment",
      header: "Down Payment",
      enableSorting: true,
    },
    {
      accessorKey: "total_money_change",
      header: "Money Change",
      enableSorting: true,
    },
    {
      accessorKey: "evidence_file",
      header: "File",
      cell: ({ row }) => {
        const file = row.original.evidence_file;
        if (file) {
          const fileUrl = `http://localhost:3000/uploads/file_declaration/${file}`;
          return (
            <div className="flex justify-center cursor-pointer">
              <IoMdPaper
                size={24}
                color="#E53E3E"
                onClick={() => handleShowFile(fileUrl)}
                title="View PDF"
              />
            </div>
          );
        } else {
          return <span>No File</span>;
        }
      },
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
            {(data.modalType === "detail" || data.modalType === "action") && (
              <button
                className="btn btn-sm btn-outline btn-primary"
                onClick={async () => {
                  handleOpenDeclarationModal(data);
                  setDeclarationType("Detail");
                }}
              >
                <i className="ki-outline ki-eye text-white"></i>
              </button>
            )}

            {data.modalType === "action" && (
              <>
                <button
                  className="btn btn-sm btn-outline btn-success"
                  onClick={async () => {
                    handleOpenDeclarationModal(data);
                    if (data.actionType === "Approved") {
                      setDeclarationType("Approved");
                    } else if (data.actionType === "Accepted") {
                      setDeclarationType("Accepted");
                    }
                  }}
                >
                  <i className="ki-outline ki-check-squared text-white"></i>
                </button>

                <button
                  className="btn btn-sm btn-outline btn-danger"
                  data-tooltip="#reject_tooltip"
                  onClick={async () => {
                    handleOpenDeclarationModal(data);
                    setDeclarationType("Rejected");
                  }}
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
            Declaration submission data list
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

          <DeclarationModal
            isOpen={isDeclarationModalOpen}
            onClose={() => {
              setIsDeclarationModalOpen(false);
              setDeclarationData(null);
              setDeclarationType(null);
            }}
            declarationData={declarationData}
            type={declarationType}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=declaration&status=${filter.status}&month=${filter.month}&year=${filter.year}&`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />
    </Main>
  );
}
