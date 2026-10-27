export interface SiteZone {
  zoneId: string;
  name: string;
  securityLevel?: string;
}

export interface Site {
  siteId: string;
  name: string;
  timezone: string;
  country: string;
  city: string;
  zones: SiteZone[];
}

export interface AnalyticsRequest {
  siteId: string;
  fromUtc: number;
  toUtc: number;
}

export interface FootfallResponse extends AnalyticsRequest {
  footfall: number;
}

export interface DwellResponse extends AnalyticsRequest {
  avgDwellMinutes: number;
  dwellRecords: number;
}

export interface OccupancyBucket {
  utc: number;
  local: string;
  avg: number;
}

export interface OccupancyResponse extends AnalyticsRequest {
  timezone: string;
  buckets: OccupancyBucket[];
}

export interface DemographicsBucket {
  utc: number;
  local: string;
  male: number;
  female: number;
}

export interface DemographicsResponse extends AnalyticsRequest {
  timezone: string;
  buckets: DemographicsBucket[];
}

export interface EntryExitRecord {
  personId: string;
  personName: string;
  zoneId: string;
  zoneName: string;
  severity: string;
  entryUtc: number;
  entryLocal: string;
  exitUtc: number;
  exitLocal: string;
  dwellMinutes: number;
}

export interface EntryExitRequest extends AnalyticsRequest {
  pageSize: number;
  pageNumber: number;
}

export interface EntryExitResponse extends EntryExitRequest {
  totalRecords: number;
  totalPages: number;
  records: EntryExitRecord[];
}
