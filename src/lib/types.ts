export type AuctionPlatform = "COPART" | "IAAI";

export interface VehiclePhotoData {
  id?: string;
  url: string;
  alt?: string | null;
  position: number;
}

export interface VehicleData {
  id: string;
  externalId?: string | null;
  slug: string;
  vin?: string | null;
  lotNumber: string;
  platform: AuctionPlatform;
  title: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  vehicleType?: string | null;
  bodyStyle?: string | null;
  engine?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  drive?: string | null;
  color?: string | null;
  odometerMiles?: number | null;
  odometerKm?: number | null;
  primaryDamage?: string | null;
  secondaryDamage?: string | null;
  lossType?: string | null;
  keysAvailable?: boolean | null;
  runCondition?: string | null;
  currentBid?: number | null;
  buyNowPrice?: number | null;
  estimatedValue?: number | null;
  lastSoldPrice?: number | null;
  auctionDate?: Date | null;
  auctionStatus?: string | null;
  seller?: string | null;
  sellerType?: string | null;
  facility?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  saleDocument?: string | null;
  titleType?: string | null;
  sourceUrl?: string | null;
  videoUrl?: string | null;
  media360Url?: string | null;
  isDemo: boolean;
  isActive: boolean;
  rawData?: unknown;
  lastSyncedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  photos: VehiclePhotoData[];
}

export interface VehicleFilters {
  search?: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  odometerTo?: number;
  bodyStyle?: string;
  fuel?: string;
  drive?: string;
  damage?: string;
  platform?: AuctionPlatform;
  state?: string;
  buyNow?: boolean;
  runAndDrive?: boolean;
  page?: number;
  limit?: number;
}

export interface VehiclePageResult {
  vehicles: VehicleData[];
  total: number;
  page: number;
  pageSize: number;
  isDemo: boolean;
  lastSyncedAt: Date | null;
}

export interface ApiUsageData {
  plan: string | null;
  used: number | null;
  remaining: number | null;
  limit: number | null;
  updatedAt: Date | null;
}

export interface SyncResult {
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "SKIPPED";
  provider: string;
  apiRequests: number;
  receivedRecords: number;
  createdRecords: number;
  updatedRecords: number;
  errorMessage?: string;
}
