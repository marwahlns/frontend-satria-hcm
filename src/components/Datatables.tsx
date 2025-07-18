import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const DataTable = ({ columns, url, isRefetch, onSearchChange }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const token = Cookies.get("token");
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const requestUrl = new URL(url);
        requestUrl.searchParams.set("page", page.toString());
        requestUrl.searchParams.set("limit", limit.toString());
        requestUrl.searchParams.set("search", search);
        requestUrl.searchParams.set("sort", sort);
        requestUrl.searchParams.set("order", order);

        const res = await axios.get(requestUrl.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
  }, [token, page, limit, search, sort, order, url, isRefetch]);

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
            {/* Limit */}
            <div className="flex items-center gap-2 flex items-center gap-2 text-gray-700 text-2sm font-medium">
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
                {[5, 10, 25, 50, 100, 200].map((item) => {
                  return (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  );
                })}
              </select>
              <span>entries</span>
            </div>

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
                    const value = e.target.value;
                    setPage(1);
                    setSearch(e.target.value);
                    onSearchChange?.(value); // Kirim ke parent (index.jsx)
                  }}
                />
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="relative">
              {isLoading && (
                <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-70 z-10 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-white bg-slate-500 px-4 py-2 rounded">
                    <i className="ki-outline ki-setting-2 animate-spin text-md"></i>
                    <span>Loading...</span>
                  </div>
                </div>
              )}

              <div className="overflow-hidden max-h-[65vh]">
                <div className="overflow-x-auto">
                  <div className="max-h-[50vh] overflow-y-auto">
                    <table className="table table-border w-full border-collapse min-w-full">
                      <thead className="sticky top-0 bg-gray-50 z-10">
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
                            <tr key={row.id} className="font-normal hover:bg-gray-50">
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="border border-gray-300 p-2">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={columns.length} className="text-center p-4 border border-gray-300">
                              No results found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer justify-between items-center flex-col md:flex-row gap-3 text-gray-700 text-2sm font-medium">
            <div className="text-2sm font-medium">
              <span>
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalItems)} of {totalItems} entries
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm font-normal flex-wrap">
              <button
                disabled={isLoading || page === 1}
                onClick={() => setPage(1)}
                className="btn btn-sm hover:bg-slate-100"
              >
                <i className="ki-filled ki-double-left"></i>
              </button>
              <button
                disabled={isLoading || page === 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-sm hover:bg-slate-100"
              >
                <i className="ki-filled ki-left"></i>
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
                <i className="ki-filled ki-right"></i>
              </button>
              <button
                disabled={isLoading || page === totalPages}
                onClick={() => setPage(totalPages)}
                className="btn btn-sm hover:bg-slate-100"
              >
                <i className="ki-filled ki-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;