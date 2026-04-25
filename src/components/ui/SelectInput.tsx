import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  touched?: boolean;
}

export function SelectInput({
  label,
  options,
  error,
  hint,
  touched,
  className,
  ...props
}: SelectInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select
        className={`form-select ${error && touched ? 'form-error-input' : ''} ${className || ''}`}
        {...props}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && touched && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}
