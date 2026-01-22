import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

function Select({ className = '', onValueChange, onChange, children, ...props }: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  return (
    <select
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  )
}

function SelectTrigger({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return children;
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  return null;
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <>{children}</>;
}

function SelectItem({ children, value, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option value={value} {...props}>{children}</option>;
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }