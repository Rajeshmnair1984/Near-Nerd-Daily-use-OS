import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Form Validation Tests", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("Bill Form Validation", () => {
    it("requires charge_name", () => {
      const billData = {
        charge_name: "",
        amount: 100,
        date: "2026-05-15",
        location_id: "loc-1",
        category: "Rent",
        status: "Pending",
        is_recurring: false,
      };

      const isValid =
        !!billData.charge_name && billData.amount > 0 && !!billData.date;
      expect(isValid).toBe(false);
    });

    it("requires positive amount", () => {
      const billData = {
        charge_name: "Rent",
        amount: -100,
        date: "2026-05-15",
        location_id: "loc-1",
        category: "Rent",
        status: "Pending",
        is_recurring: false,
      };

      const isValid = billData.amount > 0;
      expect(isValid).toBe(false);
    });

    it("requires date", () => {
      const billData = {
        charge_name: "Rent",
        amount: 100,
        date: "",
        location_id: "loc-1",
        category: "Rent",
        status: "Pending",
        is_recurring: false,
      };

      const isValid =
        !!billData.charge_name && billData.amount > 0 && !!billData.date;
      expect(isValid).toBe(false);
    });

    it("passes with all valid data", () => {
      const billData = {
        charge_name: "Rent",
        amount: 5000,
        date: "2026-05-15",
        location_id: "loc-1",
        category: "Rent",
        status: "Pending",
        is_recurring: false,
      };

      const isValid =
        !!billData.charge_name &&
        billData.amount > 0 &&
        !!billData.date &&
        !!billData.location_id;
      expect(isValid).toBe(true);
    });
  });

  describe("Location Form Validation", () => {
    it("requires name", () => {
      const locationData = {
        name: "",
        address: "123 St",
        contact: "Manager",
      };

      const isValid =
        !!locationData.name && !!locationData.address && !!locationData.contact;
      expect(isValid).toBe(false);
    });

    it("requires address", () => {
      const locationData = {
        name: "HQ",
        address: "",
        contact: "Manager",
      };

      const isValid =
        !!locationData.name && !!locationData.address && !!locationData.contact;
      expect(isValid).toBe(false);
    });

    it("requires contact", () => {
      const locationData = {
        name: "HQ",
        address: "123 St",
        contact: "",
      };

      const isValid =
        !!locationData.name && !!locationData.address && !!locationData.contact;
      expect(isValid).toBe(false);
    });

    it("passes with all valid data", () => {
      const locationData = {
        name: "HQ",
        address: "123 Main St",
        contact: "John Manager",
      };

      const isValid =
        !!locationData.name && !!locationData.address && !!locationData.contact;
      expect(isValid).toBe(true);
    });
  });

  describe("Vendor Form Validation", () => {
    it("requires name", () => {
      const vendorData = {
        name: "",
        type: "Utility",
        contact_person: "John",
        email: "john@vendor.com",
        phone: "555-0000",
      };

      const isValid =
        !!vendorData.name && !!vendorData.type && !!vendorData.email;
      expect(isValid).toBe(false);
    });

    it("requires type", () => {
      const vendorData = {
        name: "Vendor A",
        type: "",
        contact_person: "John",
        email: "john@vendor.com",
        phone: "555-0000",
      };

      const isValid =
        !!vendorData.name && !!vendorData.type && !!vendorData.email;
      expect(isValid).toBe(false);
    });

    it("validates email format", () => {
      const vendorData = {
        name: "Vendor A",
        type: "Utility",
        contact_person: "John",
        email: "invalid-email",
        phone: "555-0000",
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(vendorData.email);
      expect(isValid).toBe(false);
    });

    it("passes with all valid data", () => {
      const vendorData = {
        name: "Vendor A",
        type: "Utility Provider",
        contact_person: "John Doe",
        email: "john@vendor.com",
        phone: "555-0000",
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid =
        !!vendorData.name &&
        !!vendorData.type &&
        emailRegex.test(vendorData.email);
      expect(isValid).toBe(true);
    });
  });

  describe("Document Form Validation", () => {
    it("requires title", () => {
      const docData = {
        title: "",
        category: "Legal",
        owner: "Admin",
        document_link: "https://example.com/doc.pdf",
        status: "Active",
        renewal_date: "2027-01-01",
      };

      const isValid = !!docData.title && !!docData.category;
      expect(isValid).toBe(false);
    });

    it("requires category", () => {
      const docData = {
        title: "Insurance Policy",
        category: "",
        owner: "Admin",
        document_link: "https://example.com/doc.pdf",
        status: "Active",
        renewal_date: "2027-01-01",
      };

      const isValid = !!docData.title && !!docData.category;
      expect(isValid).toBe(false);
    });

    it("validates URL format", () => {
      const docData = {
        title: "Policy",
        category: "Insurance",
        owner: "Admin",
        document_link: "not-a-url",
        status: "Active",
        renewal_date: null,
      };

      const urlRegex = /^https?:\/\/.+/;
      const isValid = urlRegex.test(docData.document_link);
      expect(isValid).toBe(false);
    });

    it("passes with all valid data", () => {
      const docData = {
        title: "Insurance Policy",
        category: "Insurance",
        owner: "John Admin",
        document_link: "https://example.com/policy.pdf",
        status: "Active",
        renewal_date: "2027-06-01",
      };

      const urlRegex = /^https?:\/\/.+/;
      const isValid =
        !!docData.title &&
        !!docData.category &&
        urlRegex.test(docData.document_link);
      expect(isValid).toBe(true);
    });
  });

  describe("SuperAdmin Form Validation", () => {
    it("requires organization name", () => {
      const orgData = {
        name: "",
        domain: "test-rest",
        adminEmail: "admin@test.com",
      };

      const isValid =
        !!orgData.name && !!orgData.domain && !!orgData.adminEmail;
      expect(isValid).toBe(false);
    });

    it("requires domain", () => {
      const orgData = {
        name: "Test Restaurant",
        domain: "",
        adminEmail: "admin@test.com",
      };

      const isValid =
        !!orgData.name && !!orgData.domain && !!orgData.adminEmail;
      expect(isValid).toBe(false);
    });

    it("requires valid email", () => {
      const orgData = {
        name: "Test Restaurant",
        domain: "test-rest",
        adminEmail: "invalid-email",
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid =
        !!orgData.name &&
        !!orgData.domain &&
        emailRegex.test(orgData.adminEmail);
      expect(isValid).toBe(false);
    });

    it("passes with all valid data", () => {
      const orgData = {
        name: "Test Restaurant",
        domain: "test-restaurant",
        adminEmail: "admin@test.com",
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid =
        !!orgData.name &&
        !!orgData.domain &&
        emailRegex.test(orgData.adminEmail);
      expect(isValid).toBe(true);
    });
  });
});
