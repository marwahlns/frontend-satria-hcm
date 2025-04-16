import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isRefetch, setIsRefetch] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenUpdateModal = (data) => {
    setSelectedData(data);
    setIsUpdateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedData(null);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this leave type?",
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/leave-type/${id}`
        );
        Swal.fire("Deleted!", "The leaveType has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the leaveType.", "error");
      }
      setIsRefetch(!isRefetch);
    }
  };

  type ILeaveType = {
    id: string;
    title: string;
    days: number;
  };

  const columns: ColumnDef<ILeaveType>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
    },
    {
      accessorKey: "days",
      header: "Days",
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
                "btn btn-icon bg-orange-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
              onClick={() => handleOpenUpdateModal(data)}
            >
              <i className="ki-outline ki-pencil text-white"></i>
            </button>
            <button
              className={clsx(
                "btn btn-icon bg-red-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
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
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-bold text-gray-800">Leave Type List</h1>
          {/* Button */}
          <button
            className="btn btn-filled btn-primary"
            onClick={() => handleOpenCreateModal()}>
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/leave-type`}
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
    </Main>
  );
}
