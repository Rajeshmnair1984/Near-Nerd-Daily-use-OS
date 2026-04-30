import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Dashboard from "../Dashboard";
import { Bill } from "@/types/bill";

const mockBills: Bill[] = [
  {
    id: "1",
    charge_name: "Rent",
    amount: 5000,
    date: "2026-05-01",
    status: "Paid",
    category: "Rent",
    vendor_id: "v1",
    location_id: "HQ",
  },
  {
    id: "2",
    charge_name: "Utilities",
    amount: 500,
    date: "2026-05-05",
    status: "Pending",
    category: "Utilities",
    vendor_id: "v1",
    location_id: "HQ",
  },
];

const mockStats = {
  totalPaid: 5000,
  totalPending: 500,
  totalOverdue: 0,
  overdueCount: 0,
};

describe("Dashboard", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <Dashboard stats={mockStats} bills={mockBills} />,
    );
    expect(container).toBeTruthy();
  });

  it("renders stat cards", () => {
    const { container } = render(
      <Dashboard stats={mockStats} bills={mockBills} />,
    );
    const statCards = container.querySelectorAll(".glass-card");
    expect(statCards.length).toBeGreaterThan(0);
  });
});
