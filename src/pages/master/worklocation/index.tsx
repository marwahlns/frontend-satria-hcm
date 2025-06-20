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
  const [searchValue, setSearchValue] = useState("");

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

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this worklocation?",
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/worklocation/${id}`
        );
        Swal.fire("Deleted!", "The worklocation has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the worklocation.", "error");
      }
      setIsRefetch(!isRefetch);
    }
  };

  type IWorklocation = {
    worklocation_id: string;
    worklocation_code: string;
    worklocation_name: string;
    worklocation_lat_long: string;
  };

  const columns: ColumnDef<IWorklocation>[] = [
    {
      accessorKey: "number",
      header: "No",
      enableSorting: false,
    },
    {
      accessorKey: "worklocation_code",
      header: "Code",
      enableSorting: true,
    },
    {
      accessorKey: "worklocation_name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "worklocation_lat_long",
      header: "Latitude, Longitude",
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
              data-tooltip="#update_tooltip"
              className="btn btn-sm btn-outline btn-warning"
              onClick={() => handleOpenUpdateModal(data)}
            >
              <i className="ki-outline ki-pencil text-white"></i>
            </button>
            <div className="tooltip" id="update_tooltip">
              Update
            </div>
            <button
              data-tooltip="#delete_tooltip"
              className="btn btn-sm btn-outline btn-danger"
              onClick={() => handleDelete(data.worklocation_id)}
            >
              <i className="ki-outline ki-trash text-white"></i>
            </button>
            <div className="tooltip" id="delete_tooltip">
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Main>
      <div className="mb-6">
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-bold text-gray-800">Master Worklocation</h1>
          {/* Button */}
          <button className="btn btn-filled btn-primary" onClick={() => handleOpenCreateModal()}>
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/worklocation`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
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
