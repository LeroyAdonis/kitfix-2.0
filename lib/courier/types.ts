export interface Locker {
  id: string;
  name: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  hours: string;
}

export type ShippingMode = 'L2L' | 'D2D' | 'D2L' | 'L2D';

export interface RateRequest {
  fromPostalCode: string;
  toPostalCode: string;
  mode: ShippingMode;
  weightKg: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
}

export interface Rate {
  mode: ShippingMode;
  amountCents: number;
  estimatedDays: number;
  description: string;
}

export interface RateResponse {
  rates: Rate[];
}

export interface ShipmentRequest {
  fromName: string;
  fromPhone: string;
  fromLockerId?: string;
  fromAddress?: string;
  fromPostalCode: string;
  toName: string;
  toPhone: string;
  toLockerId?: string;
  toAddress?: string;
  toPostalCode: string;
  mode: ShippingMode;
  weightKg: number;
  dimensions: { height: number; width: number; length: number };
  description: string;
  reference: string;
}

export interface ShipmentResponse {
  id: string;
  barcode: string;
  status: string;
  labelUrl?: string;
  trackingUrl?: string;
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingResponse {
  barcode: string;
  status: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
}

export class CourierError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'CourierError';
  }
}
