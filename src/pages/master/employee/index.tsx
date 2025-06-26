import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";
import DetailModal from "./DetailModal";
import Cookies from "js-cookie";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Discard",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const token = Cookies.get("token");
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/user/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("Deleted!", "The employee has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the employee.", "error");
        console.log("ERROR : ", error);
      }
      setIsRefetch(!isRefetch);
    }
  };

  type IEmployee = {
    id: number;
    name: string;
    email: string;
  };

  const columns: ColumnDef<IEmployee>[] = [
    {
      accessorKey: "number",
      header: "No",
      enableSorting: false,
    },
    {
      accessorKey: "personal_number",
      header: "NRP",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      accessorKey: "department",
      header: "Department",
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
              data-tooltip="#detail_tooltip"
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => handleOpenDetailModal(data)}
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            <div className="tooltip" id="detail_tooltip">
              Detail
            </div>
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
              onClick={() => handleDelete(data.id)}
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Master Employee</h1>
          {/* Button */}
          <button
            className="btn btn-filled btn-primary"
            data-modal-toggle="#modal_employee"
            onClick={() => handleOpenCreateModal()}
          >
            <i className="ki-outline ki-plus-squared"></i>
            Add Data
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/master/user`}
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

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        selectedData={selectedData}
      />
    </Main>
  );
}
