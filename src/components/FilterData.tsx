import React, { useState } from "react";

interface RoleFilterProps {
  onSelect: (filter: { month: string; year: string; status: number }) => void;
}

const FilterData: React.FC<RoleFilterProps> = ({ onSelect }) => {
  const statusMap: Record<number, string> = {
    0: "All",
    1: "Opened",
    2: "Partial Approved",
    3: "Fully Approved",
    6: "Rejected",
    7: "Canceled",
  };

  const statusOptions = Object.entries(statusMap).map(([status, label]) => ({
    label,
    value: parseInt(status),
  }));

  const [selectedMonthYear, setSelectedMonthYear] = useState(""); // Format YYYY-MM
  const [selectedStatus, setSelectedStatus] = useState(0);

  const handleApply = () => {
    if (selectedMonthYear) {
      const [year, month] = selectedMonthYear.split("-");

      onSelect({
        month,
        year,
        status: selectedStatus,
      });
    } else {
      onSelect({
        month: "",
        year: "",
        status: selectedStatus,
      });
    }
  };

  const handleReset = () => {
    setSelectedMonthYear("");
    setSelectedStatus(0);
    onSelect({ month: "", year: "", status: 0 });
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
