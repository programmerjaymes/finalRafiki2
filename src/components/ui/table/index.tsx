import React, { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

// Props for Table
interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
}

// Props for TableCell
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string; // Optional className for styling
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
  return <table className={`min-w-full ${className}`} {...props}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => {
  return <thead className={className} {...props}>{children}</thead>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className, ...props }) => {
  return <tbody className={className} {...props}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => {
  return <tr className={className} {...props}>{children}</tr>;
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  ...props
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={`${className}`} {...props}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
