import React from "react";

export const customStyles = {
  control: (base: any) => ({
    ...base,
    borderColor: "#e5e7eb",
    borderRadius: "0.5rem",
    padding: "2px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
  }),
  groupHeading: (base: any) => ({
    ...base,
    backgroundColor: "#f3f4f6",
    color: "#374151",
    fontWeight: "600",
    padding: "8px 12px",
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "500px",
  }),
  option: (base: any, state: { isFocused: boolean; isSelected: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#eff6ff"
      : state.isFocused
        ? "#f9fafb"
        : "white",
    color: state.isSelected ? "#1e40af" : "#1f2937",
    cursor: "pointer",
    padding: "8px 12px",
    fontSize: "0.875rem",
  }),
};

export const formatOptionLabel = (option: any, { context }: any) => {
  if (context === "menu") {
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{option.rawLabel}</span>
          <span className="text-xs text-gray-500 font-mono">
            {option.cuenta}
          </span>
        </div>
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          Sis: {option.sistema}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{option.rawLabel}</span>
      <span className="text-gray-500 text-sm">({option.cuenta})</span>
      <span className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded border border-blue-100">
        Sis: {option.sistema}
      </span>
    </div>
  );
};
