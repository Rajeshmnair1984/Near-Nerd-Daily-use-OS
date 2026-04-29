import { useState, useCallback } from 'react';
import * as yup from 'yup';

interface UseFormValidationState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationSchema: yup.AnyObjectSchema;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useFormValidation<T extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [state, setState] = useState<UseFormValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const validateField = useCallback(
    async (name: keyof T, value: unknown) => {
      try {
        await validationSchema.validateAt(String(name), { [name]: value });
        return '';
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          return error.message;
        }
        return 'Validation error';
      }
    },
    [validationSchema]
  );

  const validateForm = useCallback(async (values: T) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      return {};
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path as keyof T] = err.message;
          }
        });
        return newErrors;
      }
      return {};
    }
  }, [validationSchema]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setState((prev) => ({
        ...prev,
        values: { ...prev.values, [name]: fieldValue },
      }));

      const error = await validateField(name as keyof T, fieldValue);
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
      }));
    },
    [validateField]
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setState((prev) => ({ ...prev, isSubmitting: true }));

      const newErrors = await validateForm(state.values);
      const touchedFields = Object.keys(state.values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );

      setState((prev) => ({
        ...prev,
        errors: newErrors,
        touched: touchedFields,
        isValid: Object.keys(newErrors).length === 0,
      }));

      if (Object.keys(newErrors).length === 0) {
        try {
          await onSubmit(state.values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setState((prev) => ({ ...prev, isSubmitting: false }));
    },
    [state.values, validateForm, onSubmit]
  );

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: value },
    }));
  }, []);

  return {
    ...state,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
}
