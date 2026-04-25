import * as yup from 'yup';

const today = new Date();
today.setHours(0, 0, 0, 0);

export const billValidationSchema = yup.object().shape({
  charge_name: yup
    .string()
    .required('Bill name is required')
    .min(2, 'Bill name must be at least 2 characters')
    .max(100, 'Bill name must be at most 100 characters'),
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be greater than 0')
    .typeError('Amount must be a number'),
  date: yup
    .date()
    .required('Due date is required')
    .min(today, 'Due date cannot be in the past'),
  location_id: yup.string().required('Location is required'),
  category: yup.string().required('Category is required'),
  status: yup
    .string()
    .oneOf(['Paid', 'Pending', 'Overdue'], 'Invalid status'),
});

export const locationValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Location name is required')
    .min(2, 'Location name must be at least 2 characters')
    .max(100, 'Location name must be at most 100 characters'),
  address: yup.string().max(255, 'Address must be at most 255 characters').optional(),
  contact: yup.string().max(50, 'Contact must be at most 50 characters').optional(),
});

export const userValidationSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
});
