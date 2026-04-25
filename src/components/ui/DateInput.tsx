import { InputHTMLAttributes } from 'react';

interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  touched?: boolean;
}

export function DateInput({
  label,
  error,
  hint,
  touched,
  className,
  ...props
}: DateInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type="date"
        className={`form-input ${error && touched ? 'form-error-input' : ''} ${className || ''}`}
        {...props}
      />
      {error && touched && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}
