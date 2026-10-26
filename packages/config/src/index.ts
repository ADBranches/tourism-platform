/**
 * @tourism/config
 * Shared configuration schemas, constants, and environment definitions.
 * Framework-independent and application-independent.
 */

export interface PlatformEnvironmentConfig {
  readonly appEnv: "development" | "staging" | "production" | "test";
  readonly appPort: number;
  readonly appUrl: string;
  readonly apiBaseUrl: string;
  readonly defaultCurrency: string;
  readonly supportedCurrencies: readonly string[];
  readonly features: {
    readonly enableAIAssistance: boolean;
    readonly enableLiveDriverTracking: boolean;
    readonly enableInstantBooking: boolean;
  };
}

export const DEFAULT_CONFIG: PlatformEnvironmentConfig = {
  appEnv: "development",
  appPort: 3000,
  appUrl: "http://localhost:3000",
  apiBaseUrl: "http://localhost:3000/api",
  defaultCurrency: "USD",
  supportedCurrencies: [
    "USD",
    "EUR",
    "GBP",
    "KES",
    "UGX",
    "TZS",
    "RWF",
  ] as const,
  features: {
    enableAIAssistance: true,
    enableLiveDriverTracking: false,
    enableInstantBooking: true,
  },
};

export function loadEnvironmentConfig(
  env: Record<string, string | undefined>,
): PlatformEnvironmentConfig {
  const nodeEnv = env["NODE_ENV"];
  const appEnv: PlatformEnvironmentConfig["appEnv"] =
    nodeEnv === "production" || nodeEnv === "staging" || nodeEnv === "test"
      ? nodeEnv
      : "development";

  const port = env["PORT"]
    ? Number.parseInt(env["PORT"], 10)
    : DEFAULT_CONFIG.appPort;

  return {
    appEnv,
    appPort: Number.isNaN(port) ? DEFAULT_CONFIG.appPort : port,
    appUrl: env["APP_URL"] ?? DEFAULT_CONFIG.appUrl,
    apiBaseUrl: env["API_BASE_URL"] ?? DEFAULT_CONFIG.apiBaseUrl,
    defaultCurrency: env["DEFAULT_CURRENCY"] ?? DEFAULT_CONFIG.defaultCurrency,
    supportedCurrencies: DEFAULT_CONFIG.supportedCurrencies,
    features: {
      enableAIAssistance: env["FEATURE_AI_ASSISTANCE"] !== "false",
      enableLiveDriverTracking: env["FEATURE_LIVE_DRIVER_TRACKING"] === "true",
      enableInstantBooking: env["FEATURE_INSTANT_BOOKING"] !== "false",
    },
  };
}
