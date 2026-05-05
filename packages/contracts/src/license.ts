/**
 * License contract types.
 *
 * These are the shapes exchanged between the vendor control-panel and the
 * hospital client runtime (via the agent). They MUST NOT contain any logic
 * for generating or signing — that stays in packages/crypto-vendor on the
 * vendor side only.
 */

export type LicenseTier = "community" | "professional" | "enterprise";

// Feature flag strings
export const FEATURE_FLAGS = {
  // Community tier features
  PATIENTS: "patients",
  ENCOUNTERS: "encounters",
  BILLING: "billing",
  LAB: "lab",
  PHARMACY: "pharmacy",
  REPORTS: "reports",

  // Professional tier features
  APPOINTMENTS: "appointments",
  SCHEDULING: "scheduling",
  STAFF_HIERARCHY: "staff_hierarchy",
  PLUGIN_RUNTIME: "plugin_runtime",
  WORKFLOW_ENGINE: "workflow_engine",
  THEME_ENGINE: "theme_engine",

  // Enterprise tier features
  FHIR_EXPORT: "fhir_export",
  ADVANCED_REPORTS: "advanced_reports",
  CUSTOM_PLUGINS: "custom_plugins",
  ANALYTICS_EXPORT: "analytics_export",
} as const;

// Tier-to-features mapping
export const TIER_DEFAULT_FEATURES: Record<LicenseTier, string[]> = {
  community: [
    FEATURE_FLAGS.PATIENTS,
    FEATURE_FLAGS.ENCOUNTERS,
    FEATURE_FLAGS.BILLING,
    FEATURE_FLAGS.LAB,
    FEATURE_FLAGS.PHARMACY,
    FEATURE_FLAGS.REPORTS,
  ],
  professional: [
    // Community features
    FEATURE_FLAGS.PATIENTS,
    FEATURE_FLAGS.ENCOUNTERS,
    FEATURE_FLAGS.BILLING,
    FEATURE_FLAGS.LAB,
    FEATURE_FLAGS.PHARMACY,
    FEATURE_FLAGS.REPORTS,
    // Professional features
    FEATURE_FLAGS.APPOINTMENTS,
    FEATURE_FLAGS.SCHEDULING,
    FEATURE_FLAGS.STAFF_HIERARCHY,
    FEATURE_FLAGS.PLUGIN_RUNTIME,
    FEATURE_FLAGS.WORKFLOW_ENGINE,
    FEATURE_FLAGS.THEME_ENGINE,
  ],
  enterprise: [
    // Community + Professional features
    FEATURE_FLAGS.PATIENTS,
    FEATURE_FLAGS.ENCOUNTERS,
    FEATURE_FLAGS.BILLING,
    FEATURE_FLAGS.LAB,
    FEATURE_FLAGS.PHARMACY,
    FEATURE_FLAGS.REPORTS,
    FEATURE_FLAGS.APPOINTMENTS,
    FEATURE_FLAGS.SCHEDULING,
    FEATURE_FLAGS.STAFF_HIERARCHY,
    FEATURE_FLAGS.PLUGIN_RUNTIME,
    FEATURE_FLAGS.WORKFLOW_ENGINE,
    FEATURE_FLAGS.THEME_ENGINE,
    // Enterprise features
    FEATURE_FLAGS.FHIR_EXPORT,
    FEATURE_FLAGS.ADVANCED_REPORTS,
    FEATURE_FLAGS.CUSTOM_PLUGINS,
    FEATURE_FLAGS.ANALYTICS_EXPORT,
  ],
};

export interface PlanLimits {
  maxUsers: number;
  maxBeds: number;
  maxDepartments: number;
  maxStaff: number;
  maxAppointmentsPerDay?: number;
}

// Tier-to-limits mapping
export const TIER_DEFAULT_LIMITS: Record<LicenseTier, PlanLimits> = {
  community: {
    maxUsers: 10,
    maxBeds: 50,
    maxDepartments: 3,
    maxStaff: 20,
  },
  professional: {
    maxUsers: 50,
    maxBeds: 200,
    maxDepartments: 10,
    maxStaff: 100,
  },
  enterprise: {
    maxUsers: Infinity,
    maxBeds: Infinity,
    maxDepartments: Infinity,
    maxStaff: Infinity,
  },
};

export type LicenseLeaseStatus = "active" | "restricted" | "suspended" | "revoked";

/**
 * Signed license token payload — embedded in the License DB record and
 * verified by the client using the vendor public key.
 */
export interface LicenseTokenPayload {
  licenseId: string;
  instanceId: string;
  tier: LicenseTier;
  features: string[];
  limits: PlanLimits;
  issuedAt: string;   // ISO-8601
  expiresAt: string;  // ISO-8601
}

/**
 * Short-lived lease document written by the agent to the local MongoDB
 * after each successful heartbeat. The license-guard middleware reads this
 * instead of the raw license record so enforcement is always current.
 *
 * TTL index on expiresAt ensures automatic cleanup.
 */
export interface LicenseLeaseDocument {
  /** instanceId this lease belongs to */
  instanceId: string;
  tier: string;
  features: string[];
  limits: PlanLimits;
  /** ISO-8601 — when the lease expires (typically 2-4 hours from issuance) */
  expiresAt: string;
  /** ISO-8601 — when the underlying license token was issued by vendor */
  issuedAt: string;
  /** ISO-8601 — when the agent last wrote/refreshed this lease */
  refreshedAt: string;
  /** RSA-4096 signature (base64) from the vendor over the license payload */
  vendorSignature: string;
  status: LicenseLeaseStatus;
  /** Populated only when status === "restricted" — ISO-8601 deadline */
  restrictedSince?: string;
}

/**
 * What the license-guard middleware attaches to res.locals.license
 * for downstream middleware and route handlers to consume.
 */
export interface ActiveLicenseContext {
  instanceId: string;
  /** License tier (e.g. "community", "professional", "enterprise") */
  tier: string;
  features: string[];
  limits: PlanLimits;
  /** When the current lease expires */
  expiresAt: Date;
  /** True when status === "restricted" — read-only operations still allowed */
  isRestricted: boolean;
}
