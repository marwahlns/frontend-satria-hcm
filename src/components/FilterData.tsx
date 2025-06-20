import React, { useState } from "react";

interface RoleFilterProps {
  onSelect: (filter: { month: string; year: string; status?: number }) => void;
  mode?: "general" | "officialTravel";
  disableStatus?: boolean;
}

const FilterData: React.FC<RoleFilterProps> = ({
  onSelect,
  mode = "general",
  disableStatus = false,
}) => {
  const generalStatusMap: Record<number, string> = {
    0: "All",
    1: "Opened",
    2: "Partial Approved",
    3: "Fully Approved",
    6: "Rejected",
    7: "Canceled",
  };

  const officialTravelStatusMap: Record<number, string> = {
    0: "All",
    1: "Opened",
    6: "Rejected",
    7: "Canceled",
    8: "Approved By Dept Head",
    9: "Approved By Div Head",
    10: "Approved By DIC Division",
    11: "Approved By Dept Head HC",
    12: "Approved By Div Head HC",
    13: "Approved By DIC HC",
    14: "Approved By President Director",
  };

  const statusMap =
    mode === "officialTravel" ? officialTravelStatusMap : generalStatusMap;

  const statusOptions = Object.entries(statusMap).map(([status, label]) => ({
    label,
    value: parseInt(status),
  }));

  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(0);

  const handleApply = () => {
    const [year = "", month = ""] = selectedMonthYear.split("-");

    const filter: { month: string; year: string; status?: number } = {
      month,
      year,
    };

    if (!disableStatus) {
      filter.status = selectedStatus;
    }

    onSelect(filter);
  };

  const handleReset = () => {
    setSelectedMonthYear("");
    setSelectedStatus(0);

    const filter: { month: string; year: string; status?: number } = {
      month: "",
      year: "",
    };

    if (!disableStatus) {
      filter.status = 0;
    }

    onSelect(filter);
  };

  return (
    <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg p-4 w-80 z-50">
      <h3 className="text-lg font-semibold mb-4">Filter Options</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Month:</label>
        <input
          type="month"
          value={selectedMonthYear}
          onChange={(e) => setSelectedMonthYear(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {!disableStatus && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={handleReset} className="btn btn-filled btn-secondary">
          Reset
        </button>
        <button onClick={handleApply} className="btn btn-filled btn-primary">
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterData;