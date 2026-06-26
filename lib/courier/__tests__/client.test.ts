import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '../client';
import { CourierError, type RateRequest } from '../types';

const API_KEY = 'test-api-key-123';

function mockFetch(data: unknown, status = 200) {
  return vi.mocked(fetch).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

describe('CourierClient', () => {
  beforeEach(() => {
    vi.stubEnv('TCG_API_KEY', API_KEY);
    vi.spyOn(globalThis, 'fetch').mockReset();
  });

  describe('getLockers()', () => {
    it('returns parsed locker array', async () => {
      const mockLockers = [
        {
          id: 'LKR-001',
          name: 'Menlyn Maine',
          address: 'Menlyn Maine Shopping Centre',
          suburb: 'Menlyn',
          city: 'Pretoria',
          province: 'Gauteng',
          lat: -25.782,
          lng: 28.275,
          hours: 'Mon-Fri 07:00-19:00',
        },
      ];
      mockFetch(mockLockers);

      const client = createClient();
      const result = await client.getLockers();

      expect(result).toEqual(mockLockers);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/lockers'),
        expect.anything()
      );
    });
  });

  describe('getRates()', () => {
    it('sends correct payload and returns RateResponse', async () => {
      const mockResponse = {
        rates: [
          {
            mode: 'L2L',
            amountCents: 8500,
            estimatedDays: 3,
            description: 'Locker to Locker',
          },
        ],
      };
      mockFetch(mockResponse);

      const request: RateRequest = {
        fromPostalCode: '0081',
        toPostalCode: '2000',
        mode: 'L2L',
        weightKg: 2.5,
        heightCm: 10,
        widthCm: 20,
        lengthCm: 30,
      };

      const client = createClient();
      const result = await client.getRates(request);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rates'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('handles API error gracefully', async () => {
      mockFetch({ message: 'Internal Server Error' }, 500);

      const client = createClient();
      await expect(client.getRates({
        fromPostalCode: '0081',
        toPostalCode: '2000',
        mode: 'L2L',
        weightKg: 2.5,
        heightCm: 10,
        widthCm: 20,
        lengthCm: 30,
      })).rejects.toThrow(CourierError);
    });
  });

  describe('createShipment()', () => {
    it('sends correct payload for L2L mode', async () => {
      const mockResponse = {
        id: 'SHIP-001',
        barcode: 'TCG123456789',
        status: 'created',
        labelUrl: 'https://api.courier.guy/labels/TCG123456789.pdf',
        trackingUrl: 'https://track.courier.guy/TCG123456789',
      };
      mockFetch(mockResponse);

      const client = createClient();
      const result = await client.createShipment({
        fromName: 'John Doe',
        fromPhone: '+27123456789',
        fromLockerId: 'LKR-001',
        fromPostalCode: '0081',
        toName: 'Jane Smith',
        toPhone: '+27987654321',
        toLockerId: 'LKR-100',
        toPostalCode: '2000',
        mode: 'L2L',
        weightKg: 3.0,
        dimensions: { height: 15, width: 25, length: 35 },
        description: 'Jersey repair return',
        reference: 'REP-001',
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shipments'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('sends correct payload for D2D mode', async () => {
      const mockResponse = {
        id: 'SHIP-002',
        barcode: 'TCG987654321',
        status: 'created',
      };
      mockFetch(mockResponse);

      const client = createClient();
      const result = await client.createShipment({
        fromName: 'KitFix Shop',
        fromPhone: '+27111111111',
        fromAddress: '123 Main St',
        fromPostalCode: '0081',
        toName: 'Customer',
        toPhone: '+27222222222',
        toAddress: '456 Oak Ave',
        toPostalCode: '2000',
        mode: 'D2D',
        weightKg: 1.5,
        dimensions: { height: 10, width: 15, length: 20 },
        description: 'Direct delivery',
        reference: 'ORD-001',
      });

      expect(result).toEqual(mockResponse);
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const sentBody = JSON.parse(fetchCall[1]?.body as string);
      expect(sentBody.mode).toBe('D2D');
      expect(sentBody.fromAddress).toBe('123 Main St');
      expect(sentBody.fromLockerId).toBeUndefined();
    });
  });

  describe('getTracking()', () => {
    it('returns parsed tracking events', async () => {
      const mockResponse = {
        barcode: 'TCG123456789',
        status: 'in_transit',
        events: [
          {
            timestamp: '2024-06-01T08:00:00Z',
            location: 'Pretoria Hub',
            status: 'collected',
            description: 'Parcel collected from locker',
          },
          {
            timestamp: '2024-06-02T14:00:00Z',
            location: 'Johannesburg Hub',
            status: 'in_transit',
            description: 'Parcel in transit to destination',
          },
        ],
        estimatedDelivery: '2024-06-04',
      };
      mockFetch(mockResponse);

      const client = createClient();
      const result = await client.getTracking('TCG123456789');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tracking/parcel/TCG123456789'),
        expect.anything()
      );
    });
  });

  describe('getLabelUrl()', () => {
    it('returns the label PDF URL', async () => {
      mockFetch({ url: 'https://api.courier.guy/labels/TCG123456789.pdf' });

      const client = createClient();
      const result = await client.getLabelUrl('SHIP-001');

      expect(result).toBe('https://api.courier.guy/labels/TCG123456789.pdf');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shipments/SHIP-001/label'),
        expect.anything()
      );
    });
  });

  describe('retry logic', () => {
    it('retries at least once on network timeout', async () => {
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);

      const client = createClient();
      const result = await client.getLockers();

      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('missing API key', () => {
    it('throws CourierError when TCG_API_KEY is not set', () => {
      vi.stubEnv('TCG_API_KEY', undefined);

      expect(() => createClient()).toThrow(CourierError);
      expect(() => createClient()).toThrow('TCG_API_KEY');
    });
  });
});
