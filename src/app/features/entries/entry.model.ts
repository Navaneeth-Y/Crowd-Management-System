export interface EntryRecord {
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

export interface EntryExitResponse {
  siteId: string;
  fromUtc: number;
  toUtc: number;
  pageSize: number;
  pageNumber: number;
  totalRecords: number;
  totalPages: number;
  records: EntryRecord[];
}
