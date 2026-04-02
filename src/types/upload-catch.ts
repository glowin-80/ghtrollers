export type GpsErrorKind =
  | "permission-denied"
  | "position-unavailable"
  | "timeout"
  | "unsupported"
  | "unknown";

export type GpsErrorState = {
  kind: GpsErrorKind;
  message: string;
};

export type MobileHelpPlatform = "iphone" | "android";