import React from "react";

type CustomDateInputProps = {
  value?: string;
  onClick?: () => void;
};

const CustomDateInput = React.forwardRef<
  HTMLInputElement,
  CustomDateInputProps
>(({ value, onClick }, ref) => (
  <input
    readOnly
    ref={ref}
    value={value}
    onClick={onClick}
    placeholder="Pick a date"
    className="w-full text-sm py-2 px-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
));

CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
