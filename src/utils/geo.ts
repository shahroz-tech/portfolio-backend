/**
 * Best-effort, privacy-conscious geolocation.
 *
 * We deliberately do NOT run invasive fingerprinting or paid geo-IP lookups.
 * In production, plug in your preferred geo-IP provider (e.g. MaxMind
 * GeoLite2 as a local database) inside `resolveGeo`. Until configured this
 * safely resolves to "Unknown" rather than failing the request.
 */
export interface GeoResult {
  country: string;
  city: string;
}

export const resolveGeo = async (_ip: string): Promise<GeoResult> => {
  return { country: "Unknown", city: "Unknown" };
};
