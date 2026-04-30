import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  MapPin,
  ShieldCheck,
  FileText,
  User,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Scale,
  Clock,
  Flame,
  Users,
  Wifi,
  ChevronRight,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CreateLocationInput } from "@/types/location";

interface InfrastructureMatrixFormProps {
  onSave: (data: CreateLocationInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type TabType = "identity" | "location" | "lease" | "insurance" | "ops";

const IntelSyncBadge = ({
  active,
  onClick,
  section,
}: {
  active: boolean;
  onClick: () => void;
  section: string;
}) => (
  <button
    type="button"
    className={`intel-sync-toggle ${active ? "active" : ""}`}
    onClick={onClick}
    aria-pressed={active}
    aria-label={`Toggle AI Intelligence Sync for ${section}`}
  >
    <div className="pulse-ring" aria-hidden="true"></div>
    <Wifi size={14} aria-hidden="true" />
    <span>{active ? "AI SYNC ACTIVE" : "AI SYNC DISABLED"}</span>
  </button>
);

const InfrastructureMatrixForm: React.FC<InfrastructureMatrixFormProps> = ({
  onSave,
  onCancel,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [formData, setFormData] = useState<CreateLocationInput>({
    name: "",
    store_code: "",
    brand_name: "",
    opening_date: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    operational_status: "Active",
    is_store_master: false,

    // Landlord
    landlord_company: "",
    landlord_name: "",
    landlord_email: "",
    landlord_phone: "",
    primary_contact_person: "",
    contact_person_name: "",
    contact_email: "",
    contact_phone: "",
    property_mgmt_involved: false,
    emergency_contact_name: "",
    emergency_phone: "",
    landlord_intel_sync: false,

    // Lease
    lease_start: "",
    lease_expiry: "",
    lease_term_years: 0,
    lease_notice_months: 0,
    renewal_option: false,
    renewal_terms: "",
    base_rent: 0,
    additional_rent_cam: 0,
    deposit_amount: 0,
    lease_intel_sync: false,

    // Insurance
    insurance_company: "",
    insurance_broker_name: "",
    policy_number: "",
    coverage_type: "",
    premium_amount: 0,
    premium_frequency: "Monthly",
    insurance_start_date: "",
    insurance_expiry_date: "",
    broker_contact_name: "",
    broker_phone: "",
    broker_email: "",
    insurance_intel_sync: false,

    // Compliance
    biz_license_expiry: "",
    fire_inspection_due: "",
    fire_extinguisher_expiry: "",
    compliance_intel_sync: false,

    // Ops
    store_manager_name: "",
    staff_count: 0,
    manager_phone: "",
    manager_email: "",
    ops_intel_sync: false,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "identity",
      label: "Identity",
      icon: <Building2 size={18} aria-hidden="true" />,
    },
    {
      id: "location",
      label: "Landlord",
      icon: <User size={18} aria-hidden="true" />,
    },
    {
      id: "lease",
      label: "Lease & Legal",
      icon: <Scale size={18} aria-hidden="true" />,
    },
    {
      id: "insurance",
      label: "Compliance",
      icon: <ShieldCheck size={18} aria-hidden="true" />,
    },
    {
      id: "ops",
      label: "Operations",
      icon: <Activity size={18} aria-hidden="true" />,
    },
  ];

  const completionPercentage = useMemo(() => {
    // Simplified calculation for demo
    const sections = ["identity", "location", "lease", "insurance", "ops"];
    const currentIndex = sections.indexOf(activeTab);
    return Math.round(((currentIndex + 1) / sections.length) * 100);
  }, [activeTab]);

  return (
    <div className="matrix-form-overlay" role="presentation" onClick={onCancel}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="matrix-form-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matrix-title"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          .matrix-form-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            backdrop-filter: blur(12px);
          }

          .matrix-form-container {
            background: var(--bg-card);
            border-radius: 24px;
            width: 100%;
            max-width: 1100px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
          }

          .matrix-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .matrix-header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .matrix-header-icon-wrap {
            padding: 0.5rem;
            background: var(--primary);
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
          }

          .matrix-body {
            display: grid;
            grid-template-columns: 240px 1fr;
            flex: 1;
            overflow: hidden;
          }

          .matrix-sidebar {
            padding: 1.5rem 1rem;
            background: var(--bg-main);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .tab-button {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            transition: var(--transition);
            text-align: left;
            width: 100%;
            border: none;
            background: none;
            cursor: pointer;
          }

          .tab-button:hover {
            background: var(--surface-soft);
            color: var(--text-primary);
          }

          .tab-button.active {
            background: var(--primary);
            color: white;
          }

          .matrix-sidebar-footer {
            margin-top: auto;
            padding: 1rem;
            background: var(--surface);
            border-radius: 12px;
            border: 1px solid var(--border);
          }

          .progress-label {
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
          }

          .progress-track {
            height: 6px;
            background: var(--surface-soft);
            border-radius: 3px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: var(--primary);
            transition: width 0.3s ease;
          }

          .progress-text {
            font-size: 0.65rem;
            font-weight: 700;
            color: var(--primary);
            margin-top: 0.4rem;
          }

          .matrix-content {
            padding: 2.5rem;
            overflow-y: auto;
          }

          .matrix-section-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
          }

          .matrix-section-title h2 {
            font-size: 1.5rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .form-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }

          .form-grid-compact {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          .matrix-master-asset-banner {
            margin-top: 2rem;
            padding: 1.25rem;
            background: var(--surface-soft);
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
          }

          .matrix-master-asset-banner label {
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
          }

          .matrix-master-asset-banner input {
            width: 22px;
            height: 22px;
            accent-color: var(--primary);
          }

          .banner-title {
            font-weight: 700;
            font-size: 0.9rem;
          }

          .banner-sub {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }

          .matrix-sub-header {
            font-size: 0.8rem;
            font-weight: 800;
            color: var(--text-secondary);
            margin-bottom: 1.25rem;
            letter-spacing: 0.05em;
          }

          .currency-input-wrap {
            position: relative;
          }

          .currency-symbol {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-weight: 700;
            color: var(--text-secondary);
          }

          .currency-input {
            padding-left: 2rem;
          }

          .textarea-matrix {
            min-height: 100px;
            margin-top: 1.5rem;
          }

          .upload-zone-matrix {
            margin-top: 2rem;
            padding: 2rem;
            border: 2px dashed var(--border);
            border-radius: 16px;
            text-align: center;
            background: var(--surface-soft);
          }

          .upload-icon-matrix {
            margin-bottom: 1rem;
            opacity: 0.5;
            margin-inline: auto;
          }

          .upload-title-matrix {
            font-weight: 800;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
          }

          .upload-sub-matrix {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }

          .upload-btn-matrix {
            margin-top: 1rem;
            margin-inline: auto;
          }

          .compliance-icon-wrap {
            position: relative;
          }

          .compliance-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-secondary);
          }

          .matrix-info-box {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
            background: var(--surface-soft);
            border-radius: 12px;
            margin-top: 1.5rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .matrix-info-box-danger {
            margin-top: 2.5rem;
            background: rgba(217, 45, 32, 0.03);
            border: 1px solid rgba(217, 45, 32, 0.1);
            color: var(--error);
          }

          .staff-input-wrap {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .ops-finalize-banner {
            margin-top: 3rem;
            padding: 1.5rem;
            background: var(--surface);
            border-radius: 16px;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }

          .ops-finalize-icon-wrap {
            width: 60px;
            height: 60px;
            background: rgba(0, 113, 227, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
          }

          .ops-finalize-title {
            font-weight: 800;
            margin-bottom: 0.25rem;
          }

          .ops-finalize-sub {
            font-size: 0.8rem;
            color: var(--text-secondary);
          }

          .matrix-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-btn-group {
            display: flex;
            gap: 1rem;
          }

          .footer-commit-btn {
            padding-inline: 3rem;
            background: var(--success);
          }
          
          .intel-sync-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0.8rem;
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 800;
            cursor: pointer;
            border: 1px solid var(--border);
            background: var(--surface);
            transition: var(--transition);
          }
          
          .intel-sync-toggle.active {
            background: rgba(0, 113, 227, 0.1);
            color: var(--primary);
            border-color: var(--primary);
          }
          
          .pulse-ring {
            width: 6px;
            height: 6px;
            background: currentColor;
            border-radius: 50%;
          }
        `}</style>

        <div className="matrix-header">
          <div className="matrix-header-left">
            <div className="matrix-header-icon-wrap" aria-hidden="true">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h1 id="matrix-title">Asset Initialization Matrix</h1>
              <p>
                Define core infrastructure parameters and operational
                coordinates.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="icon-button"
            aria-label="Abort and close matrix"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="matrix-body">
          <aside
            className="matrix-sidebar"
            role="tablist"
            aria-label="Matrix sections"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`section-${tab.id}`}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            <div
              className="matrix-sidebar-footer"
              aria-label="Completion progress"
            >
              <p className="progress-label">Completion</p>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {completionPercentage}% Coordinates Locked
              </p>
            </div>
          </aside>

          <main className="matrix-content">
            <form id="matrix-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeTab === "identity" && (
                  <motion.div
                    key="identity"
                    id="section-identity"
                    role="tabpanel"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2>
                        <Building2
                          size={22}
                          className="text-primary"
                          aria-hidden="true"
                        />{" "}
                        Store Master Identity
                      </h2>
                    </div>

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="matrix-loc-name">
                          LOCATION NAME
                        </label>
                        <input
                          id="matrix-loc-name"
                          name="name"
                          required
                          aria-required="true"
                          className="form-input"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Near Nerd Global HQ"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-store-code"
                        >
                          STORE CODE
                        </label>
                        <input
                          id="matrix-store-code"
                          name="store_code"
                          className="form-input"
                          value={formData.store_code}
                          onChange={handleChange}
                          placeholder="NN-XXX"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-brand-name"
                        >
                          BRAND NAME
                        </label>
                        <input
                          id="matrix-brand-name"
                          name="brand_name"
                          className="form-input"
                          value={formData.brand_name}
                          onChange={handleChange}
                          placeholder="Official Brand Identity"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-opening-date"
                        >
                          OPENING DATE
                        </label>
                        <input
                          id="matrix-opening-date"
                          name="opening_date"
                          type="date"
                          className="form-input"
                          value={formData.opening_date}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-ops-status"
                        >
                          OPERATIONAL STATUS
                        </label>
                        <select
                          id="matrix-ops-status"
                          name="operational_status"
                          className="form-select"
                          value={formData.operational_status}
                          onChange={handleChange}
                        >
                          <option value="Active">Active</option>
                          <option value="Under Construction">
                            Under Construction
                          </option>
                          <option value="Closed">Closed</option>
                          <option value="Planned">Planned</option>
                        </select>
                      </div>
                    </div>

                    <div className="matrix-master-asset-banner">
                      <label htmlFor="matrix-store-master">
                        <input
                          id="matrix-store-master"
                          type="checkbox"
                          name="is_store_master"
                          checked={formData.is_store_master}
                          onChange={handleChange}
                        />
                        <div>
                          <p className="banner-title">
                            MARK AS STORE MASTER ASSET
                          </p>
                          <p className="banner-sub">
                            Designates this location as a primary administrative
                            hub.
                          </p>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {activeTab === "location" && (
                  <motion.div
                    key="location"
                    id="section-location"
                    role="tabpanel"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2>
                        <MapPin size={22} aria-hidden="true" /> Geographic &
                        Landlord
                      </h2>
                      <IntelSyncBadge
                        active={!!formData.landlord_intel_sync}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            landlord_intel_sync: !p.landlord_intel_sync,
                          }))
                        }
                        section="Landlord Intelligence"
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="matrix-street">
                          STREET ADDRESS
                        </label>
                        <input
                          id="matrix-street"
                          name="street_address"
                          className="form-input"
                          value={formData.street_address}
                          onChange={handleChange}
                          placeholder="Unit #, Street Address"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="matrix-city">
                          CITY
                        </label>
                        <input
                          id="matrix-city"
                          name="city"
                          className="form-input"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-compact">
                        <div className="form-group">
                          <label
                            className="form-label"
                            htmlFor="matrix-province"
                          >
                            PROVINCE
                          </label>
                          <input
                            id="matrix-province"
                            name="province"
                            className="form-input"
                            value={formData.province}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="matrix-postal">
                            POSTAL CODE
                          </label>
                          <input
                            id="matrix-postal"
                            name="postal_code"
                            className="form-input"
                            value={formData.postal_code}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="spacer-sm"></div>
                    <h3 className="matrix-sub-header">
                      LANDLORD & PROPERTY MANAGEMENT
                    </h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-landlord-co"
                        >
                          LANDLORD COMPANY
                        </label>
                        <input
                          id="matrix-landlord-co"
                          name="landlord_company"
                          className="form-input"
                          value={formData.landlord_company}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-landlord-name"
                        >
                          PRIMARY CONTACT NAME
                        </label>
                        <input
                          id="matrix-landlord-name"
                          name="landlord_name"
                          className="form-input"
                          value={formData.landlord_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-landlord-email"
                        >
                          EMAIL ADDRESS
                        </label>
                        <input
                          id="matrix-landlord-email"
                          name="landlord_email"
                          type="email"
                          className="form-input"
                          value={formData.landlord_email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-landlord-phone"
                        >
                          PHONE NUMBER
                        </label>
                        <input
                          id="matrix-landlord-phone"
                          name="landlord_phone"
                          className="form-input"
                          value={formData.landlord_phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="matrix-info-box" role="note">
                      <Info size={16} aria-hidden="true" />
                      <p>
                        Enabling AI Sync will automatically monitor landlord
                        communications and lease updates if integrated with NN
                        Intelligence Hub.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "lease" && (
                  <motion.div
                    key="lease"
                    id="section-lease"
                    role="tabpanel"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2>
                        <Scale size={22} aria-hidden="true" /> Lease &
                        Financials
                      </h2>
                      <IntelSyncBadge
                        active={!!formData.lease_intel_sync}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            lease_intel_sync: !p.lease_intel_sync,
                          }))
                        }
                        section="Lease Intelligence"
                      />
                    </div>

                    <div className="form-grid-3">
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-lease-start"
                        >
                          LEASE START
                        </label>
                        <input
                          id="matrix-lease-start"
                          name="lease_start"
                          type="date"
                          className="form-input"
                          value={formData.lease_start}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-lease-expiry"
                        >
                          LEASE EXPIRY
                        </label>
                        <input
                          id="matrix-lease-expiry"
                          name="lease_expiry"
                          type="date"
                          className="form-input"
                          value={formData.lease_expiry}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-grid-compact">
                        <div className="form-group">
                          <label
                            className="form-label"
                            htmlFor="matrix-lease-term"
                          >
                            TERM (YRS)
                          </label>
                          <input
                            id="matrix-lease-term"
                            name="lease_term_years"
                            type="number"
                            className="form-input"
                            value={formData.lease_term_years}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="form-label"
                            htmlFor="matrix-lease-notice"
                          >
                            NOTICE (MOS)
                          </label>
                          <input
                            id="matrix-lease-notice"
                            name="lease_notice_months"
                            type="number"
                            className="form-input"
                            value={formData.lease_notice_months}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="spacer-md"></div>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-base-rent"
                        >
                          BASE RENT ($)
                        </label>
                        <div className="currency-input-wrap">
                          <span className="currency-symbol" aria-hidden="true">
                            $
                          </span>
                          <input
                            id="matrix-base-rent"
                            name="base_rent"
                            type="number"
                            className="form-input currency-input"
                            value={formData.base_rent}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="matrix-cam-rent">
                          CAM / TAX ($)
                        </label>
                        <div className="currency-input-wrap">
                          <span className="currency-symbol" aria-hidden="true">
                            $
                          </span>
                          <input
                            id="matrix-cam-rent"
                            name="additional_rent_cam"
                            type="number"
                            className="form-input currency-input"
                            value={formData.additional_rent_cam}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="matrix-deposit">
                          DEPOSIT ($)
                        </label>
                        <div className="currency-input-wrap">
                          <span className="currency-symbol" aria-hidden="true">
                            $
                          </span>
                          <input
                            id="matrix-deposit"
                            name="deposit_amount"
                            type="number"
                            className="form-input currency-input"
                            value={formData.deposit_amount}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="matrix-renewal-terms"
                      >
                        RENEWAL TERMS
                      </label>
                      <textarea
                        id="matrix-renewal-terms"
                        name="renewal_terms"
                        className="form-textarea textarea-matrix"
                        value={formData.renewal_terms}
                        onChange={handleChange}
                        placeholder="Outline renewal options, indexation, and special conditions..."
                      />
                    </div>

                    <div className="upload-zone-matrix">
                      <FileText
                        size={32}
                        color="var(--text-secondary)"
                        className="upload-icon-matrix"
                        aria-hidden="true"
                      />
                      <p className="upload-title-matrix">
                        Upload Signed Lease Agreement
                      </p>
                      <p className="upload-sub-matrix">
                        PDF or Scan required for Intelligence Sync validation.
                      </p>
                      <button
                        type="button"
                        className="button-secondary upload-btn-matrix"
                      >
                        Select File
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "insurance" && (
                  <motion.div
                    key="insurance"
                    id="section-insurance"
                    role="tabpanel"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2>
                        <ShieldCheck size={22} aria-hidden="true" /> Insurance &
                        Compliance
                      </h2>
                      <IntelSyncBadge
                        active={!!formData.insurance_intel_sync}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            insurance_intel_sync: !p.insurance_intel_sync,
                          }))
                        }
                        section="Compliance Intelligence"
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-ins-carrier"
                        >
                          INSURANCE CARRIER
                        </label>
                        <input
                          id="matrix-ins-carrier"
                          name="insurance_company"
                          className="form-input"
                          value={formData.insurance_company}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-policy-num"
                        >
                          POLICY NUMBER
                        </label>
                        <input
                          id="matrix-policy-num"
                          name="policy_number"
                          className="form-input"
                          value={formData.policy_number}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="spacer-md"></div>
                    <h3 className="matrix-sub-header">
                      CRITICAL COMPLIANCE MONITORING
                    </h3>

                    <div className="form-grid-3">
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-license-expiry"
                        >
                          BIZ LICENSE EXPIRY
                        </label>
                        <div className="compliance-icon-wrap">
                          <Clock
                            size={16}
                            className="compliance-icon"
                            aria-hidden="true"
                          />
                          <input
                            id="matrix-license-expiry"
                            name="biz_license_expiry"
                            type="date"
                            className="form-input"
                            value={formData.biz_license_expiry}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-fire-inspect"
                        >
                          FIRE INSPECTION DUE
                        </label>
                        <div className="compliance-icon-wrap">
                          <Flame
                            size={16}
                            className="compliance-icon"
                            aria-hidden="true"
                          />
                          <input
                            id="matrix-fire-inspect"
                            name="fire_inspection_due"
                            type="date"
                            className="form-input"
                            value={formData.fire_inspection_due}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="matrix-fire-ext">
                          FIRE EXT. EXPIRY
                        </label>
                        <input
                          id="matrix-fire-ext"
                          name="fire_extinguisher_expiry"
                          type="date"
                          className="form-input"
                          value={formData.fire_extinguisher_expiry}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div
                      className="matrix-info-box matrix-info-box-danger"
                      role="alert"
                    >
                      <AlertCircle size={16} aria-hidden="true" />
                      <p>
                        Missing compliance dates will trigger "High Risk" status
                        in the Master Operations Dashboard.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "ops" && (
                  <motion.div
                    key="ops"
                    id="section-ops"
                    role="tabpanel"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2>
                        <Activity size={22} aria-hidden="true" /> Internal
                        Operations
                      </h2>
                      <IntelSyncBadge
                        active={!!formData.ops_intel_sync}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            ops_intel_sync: !p.ops_intel_sync,
                          }))
                        }
                        section="Ops Intelligence"
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="matrix-mgr-name">
                          STORE MANAGER NAME
                        </label>
                        <input
                          id="matrix-mgr-name"
                          name="store_manager_name"
                          className="form-input"
                          value={formData.store_manager_name}
                          onChange={handleChange}
                          placeholder="Full Legal Name"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-mgr-email"
                        >
                          MANAGER EMAIL
                        </label>
                        <input
                          id="matrix-mgr-email"
                          name="manager_email"
                          type="email"
                          className="form-input"
                          value={formData.manager_email}
                          onChange={handleChange}
                          placeholder="nn.manager@nearnerd.com"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-mgr-phone"
                        >
                          MANAGER PHONE
                        </label>
                        <input
                          id="matrix-mgr-phone"
                          name="manager_phone"
                          className="form-input"
                          value={formData.manager_phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="matrix-staff-count"
                        >
                          STAFF COMPLEMENT (HC)
                        </label>
                        <div className="staff-input-wrap">
                          <Users
                            size={20}
                            color="var(--text-secondary)"
                            aria-hidden="true"
                          />
                          <input
                            id="matrix-staff-count"
                            name="staff_count"
                            type="number"
                            className="form-input"
                            value={formData.staff_count}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ops-finalize-banner" role="complementary">
                      <div
                        className="ops-finalize-icon-wrap"
                        aria-hidden="true"
                      >
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <h4 className="ops-finalize-title">
                          Finalize Asset Matrix
                        </h4>
                        <p className="ops-finalize-sub">
                          Review all coordinates across tabs before committing
                          to the core system.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </main>
        </div>

        <div className="matrix-footer">
          <button
            type="button"
            className="button-secondary footer-abort-btn"
            onClick={onCancel}
          >
            ABORT
          </button>

          <div className="footer-btn-group">
            {activeTab !== "identity" && (
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  const currentIndex = tabs.findIndex(
                    (t) => t.id === activeTab,
                  );
                  setActiveTab(tabs[currentIndex - 1].id);
                }}
              >
                PREVIOUS
              </button>
            )}

            {activeTab !== "ops" ? (
              <button
                type="button"
                className="button-primary footer-next-btn"
                onClick={() => {
                  const currentIndex = tabs.findIndex(
                    (t) => t.id === activeTab,
                  );
                  setActiveTab(tabs[currentIndex + 1].id);
                }}
              >
                NEXT STEP <ChevronRight size={18} aria-hidden="true" />
              </button>
            ) : (
              <button
                form="matrix-form"
                type="submit"
                className="button-primary footer-commit-btn"
                disabled={loading}
              >
                {loading ? "SYNCHRONIZING..." : "COMMIT MATRIX"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InfrastructureMatrixForm;
