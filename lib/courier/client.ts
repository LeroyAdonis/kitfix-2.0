import { CourierError, type Locker, type RateRequest, type RateResponse, type ShipmentRequest, type ShipmentResponse, type TrackingResponse } from './types';

const BASE_URL = 'https://wqvdmjybt6.execute-api.af-south-1.amazonaws.com/';

export function createClient() {
  const apiKey: string = process.env.TCG_API_KEY ?? '';
  if (!apiKey) throw new CourierError('TCG_API_KEY environment variable is not set');

  const MAX_RETRIES = 1;

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL.replace(/\/+$/, '')}${path}`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            ...options?.headers,
          },
        });
        if (!response.ok) {
          throw new CourierError(`API request failed with status ${response.status}`, response.status);
        }
        return response.json() as Promise<T>;
      } catch (error) {
        if (error instanceof CourierError) throw error;
        lastError = error as Error;
      }
    }

    throw lastError;
  }

  return {
    getLockers: () => request<Locker[]>('/lockers'),
    getRates: (req: RateRequest) =>
      request<RateResponse>('/rates', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
    createShipment: (req: ShipmentRequest) =>
      request<ShipmentResponse>('/shipments', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
    getTracking: (barcode: string) =>
      request<TrackingResponse>(`/tracking/parcel/${barcode}`),
    getLabelUrl: (shipmentId: string) =>
      request<{ url: string }>(`/shipments/${shipmentId}/label`).then(res => res.url),
  };
}
