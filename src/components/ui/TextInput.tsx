import { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  touched?: boolean;
}

export function TextInput({
  label,
  error,
  hint,
  touched,
  className,
  ...props
}: TextInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className={`form-input ${error && touched ? 'form-error-input' : ''} ${className || ''}`}
        {...props}
      />
      {error && touched && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}
