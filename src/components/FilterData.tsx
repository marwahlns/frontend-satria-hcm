interface RoleFilterProps {
  role: string | number;
  onSelect: (filter: number) => void;
}

const FilterData: React.FC<RoleFilterProps> = ({ role, onSelect }) => {
  const statusOptions = [
    { label: "All", filter: 0 },
    ...(role === "Superior"
      ? [
          { label: "Pending", filter: 1 },
          { label: "Accepted", filter: 2 },
          { label: "Reject Accepted", filter: 4 },
        ]
      : role === "DeptHead"
      ? [
          { label: "Approved", filter: 3 },
          { label: "Accept Accepted", filter: 2 },
          { label: "Reject Approved", filter: 5 },
        ]
      : role === "Admin"
      ? [
          { label: "Pending", filter: 1 },
          { label: "Accepted", filter: 2 },
          { label: "Approved", filter: 3 },
          { label: "Reject Accepted", filter: 4 },
          { label: "Reject Approved", filter: 5 },
        ]
      : [
          { label: "Pending", filter: 1 },
          { label: "Accepted", filter: 2 },
          { label: "Approved", filter: 3 },
          { label: "Reject Accepted", filter: 4 },
          { label: "Reject   Approved", filter: 5 },
        ]),
  ];

  return (
    <div
      className="dropdown"
      data-dropdown="true"
      data-dropdown-trigger="click"
    >
      <button className="dropdown-toggle btn btn-light">
        <i className="ki-filled ki-filter-tablet"></i> Filter Data
      </button>
      <div className="dropdown-content w-full max-w-56 py-2">
        <div className="menu menu-default flex flex-col w-full">
          {statusOptions.map((option) => (
            <div className="menu-item" key={option.filter}>
              <a className="menu-link" onClick={() => onSelect(option.filter)}>
                <span className="menu-title">{option.label}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterData;
