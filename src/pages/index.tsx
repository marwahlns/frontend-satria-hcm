import Main from "../main-layouts/main";
import DataTable from "../components/Datatables";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";

export default function Home() {
  type IMakanan = {
    id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    stok: number;
  };

  const columns: ColumnDef<IMakanan>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: false,
    },
    {
      accessorKey: "nama",
      header: "Nama",
      enableSorting: true,
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
      enableSorting: true,
    },
    {
      accessorKey: "harga",
      header: "Harga",
      enableSorting: true,
    },
    {
      accessorKey: "stok",
      header: "Stok",
      enableSorting: true,
    },
    {
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        console.log(data);
        return (
          <div className="flex space-x-1 justify-center">
            <button
              className={clsx(
                "btn btn-icon bg-blue-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
            >
              <i className="ki-outline ki-eye text-white"></i>
            </button>
            <button
              className={clsx(
                "btn btn-icon bg-orange-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
            >
              <i className="ki-outline ki-pencil text-white"></i>
            </button>
            <button
              className={clsx(
                "btn btn-icon bg-red-500 btn-xs transition-transform",
                "hover:scale-[105%]",
                "active:scale-[100%]"
              )}
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
      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/makanan`}
      />
    </Main>
  );
}
