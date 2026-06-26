import { createClient } from "@/lib/courier/client";
import type { Locker } from "@/lib/courier/types";

let lockersCache: Locker[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 300_000;

export async function getLockers(): Promise<Locker[]> {
  const now = Date.now();
  if (lockersCache && now - lastFetch < CACHE_TTL) {
    return lockersCache;
  }
  const client = createClient();
  const lockers = await client.getLockers();
  lockersCache = lockers;
  lastFetch = now;
  return lockers;
}

export function getLockerById(lockers: Locker[], id: string): Locker | undefined {
  return lockers.find((l) => l.id === id);
}

export function formatLockerAddress(locker: Locker): string {
  return `${locker.name}, ${locker.address}, ${locker.suburb}, ${locker.city}, ${locker.province}`;
}

export function lockersByCity(lockers: Locker[]): Map<string, Locker[]> {
  const grouped = new Map<string, Locker[]>();
  for (const locker of lockers) {
    const city = locker.city;
    if (!grouped.has(city)) {
      grouped.set(city, []);
    }
    grouped.get(city)!.push(locker);
  }
  return grouped;
}
