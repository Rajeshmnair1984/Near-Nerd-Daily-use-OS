import { useFormValidation } from "@/hooks/useFormValidation";
import { TextInput } from "./ui/TextInput";
import { DateInput } from "./ui/DateInput";
import { SelectInput } from "./ui/SelectInput";
import { Button } from "./ui/Button";
import { billValidationSchema } from "@/schemas/validation";
import { Bill, CreateBillInput } from "@/types/bill";
import { Location } from "@/types/location";

interface BillFormProps {
  locations: Location[];
  onSubmit: (bill: CreateBillInput) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<Bill>;
  submitLabel?: string;
}

const initialBillValues: CreateBillInput = {
  charge_name: "",
  amount: 0,
  date: "",
  location_id: "",
  category: "Rent",
  status: "Pending",
  is_recurring: false,
};

export function BillForm({
  locations,
  onSubmit,
  onCancel,
  initialValues,
  submitLabel = "Save Bill",
}: BillFormProps) {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({
    initialValues: { ...initialBillValues, ...initialValues },
    validationSchema: billValidationSchema,
    onSubmit,
  });

  const categoryOptions = [
    { value: "Rent", label: "Rent" },
    { value: "Utilities", label: "Utilities" },
    { value: "Insurance", label: "Insurance" },
    { value: "Other", label: "Other" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <TextInput
        label="Bill Name"
        name="charge_name"
        required
        value={values.charge_name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.charge_name}
        touched={touched.charge_name}
      />

      <div className="form-row">
        <TextInput
          label="Amount (CAD)"
          name="amount"
          type="number"
          step="0.01"
          required
          value={values.amount}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.amount}
          touched={touched.amount}
        />

        <DateInput
          label="Due Date"
          name="date"
          required
          value={values.date}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.date}
          touched={touched.date}
        />
      </div>

      <SelectInput
        label="Location"
        name="location_id"
        required
        options={locations.map((l) => ({ value: l.id, label: l.name }))}
        value={values.location_id}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.location_id}
        touched={touched.location_id}
      />

      <SelectInput
        label="Category"
        name="category"
        required
        options={categoryOptions}
        value={values.category}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.category}
        touched={touched.category}
      />

      <SelectInput
        label="Status"
        name="status"
        required
        options={[
          { value: "Pending", label: "Pending" },
          { value: "Paid", label: "Paid" },
          { value: "Overdue", label: "Overdue" },
        ]}
        value={values.status}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.status}
        touched={touched.status}
      />

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.95rem 1rem",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-soft)",
          cursor: "pointer",
        }}
      >
        <span>
          <span style={{ display: "block", fontWeight: 700 }}>
            Monthly recurring
          </span>
          <span
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "0.82rem",
            }}
          >
            Create the next payment when this one is marked paid.
          </span>
        </span>
        <input
          type="checkbox"
          name="is_recurring"
          checked={Boolean(values.is_recurring)}
          onChange={handleChange}
          style={{
            width: "20px",
            height: "20px",
            accentColor: "var(--primary)",
          }}
        />
      </label>

      <div className="form-actions">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          style={{ flex: 1 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          style={{ flex: 1 }}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
