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
      <form action="#" className="w-full" method="post">
        <div data-stepper="true">
          <div className="card">
            <div className="card-header flex flex-col gap-y-6 py-8">
              <div className="active flex gap-2.5 items-center" data-stepper-item="#stepper_1">
                <div className="rounded-full size-10 flex items-center justify-center text-md font-semibold bg-primary-light text-primary stepper-item-active:bg-primary stepper-item-active:text-primary-inverse stepper-item-completed:bg-success stepper-item-completed:text-success-inverse">
                  <span className="stepper-item-completed:hidden" data-stepper-number="true">1</span>
                  <i className="ki-outline ki-check text-xl hidden stepper-item-completed:inline"></i>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-sm font-medium text-gray-900 stepper-item-completed:text-gray-600">Step 1</h4>
                  <span className="text-2sm text-gray-700 stepper-item-completed:text-gray-400">Description</span>
                </div>
              </div>

              <div className="flex gap-2.5 items-center" data-stepper-item="#stepper_2">
                <div className="rounded-full size-10 flex items-center justify-center text-md font-semibold bg-primary-light text-primary stepper-item-active:bg-primary stepper-item-active:text-primary-inverse stepper-item-completed:bg-success stepper-item-completed:text-success-inverse">
                  <span className="stepper-item-completed:hidden" data-stepper-number="true">2</span>
                  <i className="ki-outline ki-check text-xl hidden stepper-item-completed:inline"></i>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-sm font-medium text-gray-900 stepper-item-completed:text-gray-600">Step 2</h4>
                  <span className="text-2sm text-gray-700 stepper-item-completed:text-gray-400">Description</span>
                </div>
              </div>

              <div className="flex gap-2.5 items-center" data-stepper-item="#stepper_3">
                <div className="rounded-full size-10 flex items-center justify-center text-md font-semibold bg-primary-light text-primary stepper-item-active:bg-primary stepper-item-active:text-primary-inverse stepper-item-completed:bg-success stepper-item-completed:text-success-inverse">
                  <span className="stepper-item-completed:hidden" data-stepper-number="true">2</span>
                  <i className="ki-outline ki-check text-xl hidden stepper-item-completed:inline"></i>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-sm font-medium text-gray-900 stepper-item-completed:text-gray-600">Step 2</h4>
                  <span className="text-2sm text-gray-700 stepper-item-completed:text-gray-400">Description</span>
                </div>
              </div>

              <div className="flex gap-2.5 items-center" data-stepper-item="#stepper_4">
                <div className="rounded-full size-10 flex items-center justify-center text-md font-semibold bg-primary-light text-primary stepper-item-active:bg-primary stepper-item-active:text-primary-inverse stepper-item-completed:bg-success stepper-item-completed:text-success-inverse">
                  <span className="stepper-item-completed:hidden" data-stepper-number="true">2</span>
                  <i className="ki-outline ki-check text-xl hidden stepper-item-completed:inline"></i>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-sm font-medium text-gray-900 stepper-item-completed:text-gray-600">Step 2</h4>
                  <span className="text-2sm text-gray-700 stepper-item-completed:text-gray-400">Description</span>
                </div>
              </div>
            </div>

            <div className="card-body py-16">
              <div id="stepper_1">
                <div className="flex items-center justify-center text-3xl font-semibold text-gray-900">Step 1</div>
              </div>
              <div className="hidden" id="stepper_2">
                <div className="flex items-center justify-center text-3xl font-semibold text-gray-900">Step 2</div>
              </div>
              <div className="hidden" id="stepper_3">
                <div className="flex items-center justify-center text-3xl font-semibold text-gray-900">Step 3</div>
              </div>
              <div className="hidden" id="stepper_4">
                <div className="flex items-center justify-center text-3xl font-semibold text-gray-900">Step 4</div>
              </div>
            </div>

            <div className="card-footer py-8 flex justify-between">
              <button className="btn btn-light stepper-first:hidden" data-stepper-back="true">Back</button>
              <div>
                <button className="btn btn-light stepper-last:hidden" data-stepper-next="true">Next</button>
                <button className="btn btn-primary hidden stepper-last:inline-flex">Submit</button>
              </div>
            </div>
          </div>
        </div>
      </form>

    </Main>
  );
}
