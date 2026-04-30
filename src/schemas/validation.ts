import * as yup from "yup";

export const billValidationSchema = yup.object().shape({
  charge_name: yup
    .string()
    .required("Bill name is required")
    .min(2, "Bill name must be at least 2 characters")
    .max(100, "Bill name must be at most 100 characters"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be greater than 0")
    .typeError("Amount must be a number"),
  date: yup
    .date()
    .required("Due date is required")
    .test("not-past", "Due date cannot be in the past", function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateVal = new Date(value);
      dateVal.setHours(0, 0, 0, 0);
      return dateVal >= today;
    }),
  location_id: yup.string().required("Location is required"),
  category: yup.string().required("Category is required"),
  status: yup.string().oneOf(["Paid", "Pending", "Overdue"], "Invalid status"),
});

export const locationValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Location name is required")
    .min(2, "Location name must be at least 2 characters")
    .max(100, "Location name must be at most 100 characters"),
  address: yup
    .string()
    .max(255, "Address must be at most 255 characters")
    .optional(),
  contact: yup
    .string()
    .max(50, "Contact must be at most 50 characters")
    .optional(),
});

export const userValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  role: yup.string().required("Role is required"),
});

export const passwordSchema = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[0-9]/, "Password must contain at least one number");
