import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const DataTable = ({ columns, url, isRefetch, title }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const token = Cookies.get("token");
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${url}?page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(res.data.data.data);
        setTotalPages(res.data.data.totalPages);
        setTotalItems(res.data.data.totalItems);

        const numberedData = res.data.data.data.map((item, index: number) => ({
          ...item,
          number: (page - 1) * limit + index + 1,
        }));
        setData(numberedData);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    getData();
  }, [page, limit, search, sort, order, url, isRefetch]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderPagination = () => {
    const pageNumbers: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === page || i === totalPages) {
        pageNumbers.push(i);
      } else {
        if (i === page - 1 || i === page + 1) {
          pageNumbers.push(i);
        } else if (i === page - 2 || i === page + 2) {
          pageNumbers.push("...");
        }
      }
    }

    return pageNumbers;
  };

  return (
    <div>
      <div className="grid">
        <div className="card card-grid min-w-full">
          <div className="card-header py-5 flex-wrap">
            {/* Title */}
            <h3 className="card-title">{title}</h3>
            {/* Search */}
            <div className="flex gap-6">
              <div className="relative">
                <i className="ki-outline ki-magnifier leading-none text-md text-gray-500 absolute top-1/2 left-0 -translate-y-1/2 ml-3"></i>
                <input
                  className="input input-md pl-8"
                  placeholder="Search..."
                  type="text"
                  defaultValue={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="card-body">
            {/* Table */}
            <div className="relative">
              {isLoading && (
                <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-70 z-10 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-white bg-slate-500 px-4 py-2 rounded">
                    <i className="ki-outline ki-setting-2 animate-spin text-md"></i>
                    <span>Loading...</span>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="table table-border w-full border-collapse min-w-full">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="border border-gray-300 p-2 cursor-pointer select-none"
                            onClick={() => {
                              if (!header.column.getCanSort()) return;
                              setSort(header.column.id);
                              setOrder(order === "asc" ? "desc" : "asc");
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 text-center text-nowrap">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </div>
                              {header.column.getCanSort() && (
                                <i
                                  className={clsx(
                                    "ki-outline text-xs",
                                    header.column.getIsSorted() === "asc"
                                      ? "ki-arrow-up"
                                      : header.column.getIsSorted() === "desc"
                                      ? "ki-arrow-down"
                                      : "ki-arrow-up-down"
                                  )}
                                ></i>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="font-normal">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="border p-2">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center p-4"
                        >
                          No results found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="card-footer justify-center md:justify-between flex-col md:flex-row gap-3 text-gray-600 text-2sm font-medium">
            {/* Limit */}
            <div className="flex items-center gap-2">
              <label>Show:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setSort("");
                  setOrder("");
                  setPage(1);
                }}
                className={clsx("select select-sm w-16")}
              >
                {[10, 25, 50, 100, 200].map((item) => {
                  return (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  );
                })}
              </select>
              <span>entries</span>
            </div>
            {/* Pagination */}
            <div className="my-3 flex justify-between items-center">
              <div>
                <span>
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, totalItems)} of {totalItems} entries
                </span>
              </div>
              <div className="flex items-center text-sm font-normal">
                <button
                  disabled={isLoading || page === 1}
                  onClick={() => setPage(1)}
                  className="btn btn-sm hover:bg-slate-100"
                >
                  <i className="ki-solid ki-double-left-arrow"></i>
                </button>
                <button
                  disabled={isLoading || page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-sm hover:bg-slate-100"
                >
                  <i className="ki-solid ki-to-left"></i>
                </button>

                {renderPagination().map((number, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof number === "number" && setPage(number)
                    }
                    disabled={isLoading || typeof number === "string"}
                    className={clsx(
                      "btn btn-sm",
                      number === page && "bg-slate-300 font-bold",
                      "hover:bg-slate-100"
                    )}
                  >
                    {number}
                  </button>
                ))}

                <button
                  disabled={isLoading || page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-sm hover:bg-slate-100"
                >
                  <i className="ki-solid ki-to-right"></i>
                </button>
                <button
                  disabled={isLoading || page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="btn btn-sm hover:bg-slate-100"
                >
                  <i className="ki-solid ki-double-right-arrow"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
