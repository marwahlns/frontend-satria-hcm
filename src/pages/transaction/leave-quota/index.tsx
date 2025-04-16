import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";
import DetailModal from "./DetailModal";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isRefetch, setIsRefetch] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenUpdateModal = (data) => {
    setSelectedData(data);
    setIsUpdateModalOpen(true);
  };

  const handleOpenDetailModal = (data) => {
    setSelectedData(data);
    setIsDetailModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedData(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedData(null);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this transaction leave quota?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/leave-quota/${id}`
        );
        Swal.fire(
          "Deleted!",
          "The transaction leave quota has been deleted.",
          "success"
        );
      } catch (error) {
        Swal.fire("Error!", "Failed to delete leave quota.", "error");
      }
      setIsRefetch(!isRefetch);
    }
  };

  type ITrxShift = {
    id: number;
    code: number;
    user_name: string;
    leaves_type: string;
    valid_from: string;
    valid_to: string;
    leaves_quota: number;
  };

  const columns: ColumnDef<ITrxShift>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "id_user",
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => row.original.user_name || "Unknown",
    },
    {
      accessorKey: "leave_type_id",
      header: "Leave Type",
      enableSorting: true,
      cell: ({ row }) => row.original.leaves_type || "Unknown",
    },
    {
      accessorKey: "valid_from",
      header: "Valid From",
      enableSorting: true,
    },
    {
      accessorKey: "valid_to",
      header: "Valid To",
      enableSorting: true,
    },
    {
      accessorKey: "leaves_quota",
      header: "Leave Quota",
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
              className="btn btn-icon bg-blue-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
              onClick={() => handleOpenDetailModal(data)}>
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            <button
              className="btn btn-icon bg-orange-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
              onClick={() => handleOpenUpdateModal(data)}
            >
              <i className="ki-outline ki-pencil text-white"></i>
            </button>
            <button
              className="btn btn-icon bg-red-500 btn-xs transition-transform hover:scale-[105%] active:scale-[100%]"
              onClick={() => handleDelete(data.id)}
            >
              <i className="ki-outline ki-trash text-white"></i>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <Main>
      <div className="mb-6">
        {/* Title */}
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Transaction Leave Quota
          </h1>
          {/* Button */}
          <div className="flex justify-start mt-4">
            <button
              className="btn btn-filled btn-primary"
              onClick={() => handleOpenCreateModal()}
            >
              <i className="ki-outline ki-plus-squared"></i>
              Add Data
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/leave-quota`}
        isRefetch={isRefetch}
      />

      <CreateModal
        isModalOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />

      <UpdateModal
        isModalOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        selectedData={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        selectedData={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />
    </Main>
  );
}