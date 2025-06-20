import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Cookies from "js-cookie";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [isRefetch, setIsRefetch] = useState(false);
  const [filter, setFilter] = useState({ month: "", year: "", status: 0 });
  const [showFilter, setShowFilter] = useState(false);
  const api = `${process.env.NEXT_PUBLIC_API_URL}`;
  const [searchValue, setSearchValue] = useState("");
  const schema = yup.object().shape({
    remark: yup.string().required("Please fill out remark"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      remark: "",
    },
  });

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleOpenActionModal = (data, actionType) => {
    setSelectedData(data);
    setSelectedActionType(actionType);
    setIsActionModalOpen(true);
  };

  const handleOpenDetailModal = (data) => {
    setSelectedData(data);
    setIsDetailModalOpen(true);
  };

  const onClose = () => {
    setIsActionModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedData(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${selectedActionType} this leave request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${selectedActionType} it!`,
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }
      const token = Cookies.get("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/${selectedData.id}`,
        {
          remark: data.remark,
          actionType: selectedActionType,
          trxType: "leave",
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
          text: `Leave has been successfully ${selectedActionType}.`,
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
        text: `Failed to ${selectedActionType} leave. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
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
            type: "leave",
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

  type ITrLeave = {
    user_name: string;
    user_departement: string;
    status_id: number;
    actionType: string;
    modalType: string;
    status_submittion: string;
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
      accessorKey: "user_departement",
      header: "Departement",
      enableSorting: true,
    },
    {
      accessorKey: "shift_code",
      header: "Shift Code",
      enableSorting: true,
    },
    {
      accessorKey: "in_time",
      header: "In Time",
      enableSorting: true,
    },
    {
      accessorKey: "out_time",
      header: "Out Time",
      enableSorting: true,
    },

    {
      accessorKey: "subcont",
      header: "Subcont",
      enableSorting: true,
    },
  ];

  return (
    <Main>
      <div className="mb-6">
        <div className="flex flex-col gap-4 mt-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Attendace employee data list
          </h1>

          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex gap-3 items-center">
              <button
                className="btn btn-filled btn-success"
                onClick={() => handleExportExcel()}
              >
                <i className="ki-filled ki-file-down"></i>
                Export to Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance`}
        isRefetch={isRefetch}
        onSearchChange={handleSearchChange}
      />
    </Main>
  );
}
