const FALLBACK_USD_TO_INR = 85.0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedRate: number | null = null;
let cachedAt = 0;

/**
 * USD→INR rate, cached in-memory for 1 hour. Never throws: falls back to the
 * last known rate, then to a static constant, so payment recording is never
 * blocked by an FX API outage.
 */
export async function getUsdToInrRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedRate;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal,
    });
    if (res.ok) {
      const json = await res.json();
      const rate = json?.rates?.INR;
      if (typeof rate === "number" && rate > 0) {
        cachedRate = rate;
        cachedAt = now;
        return rate;
      }
    }
    throw new Error(`Exchange rate service returned status ${res.status}`);
  } catch (error) {
    console.error("[exchange] Failed to fetch USD→INR rate:", error);
    return cachedRate ?? FALLBACK_USD_TO_INR;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve a price in the requested currency from a list of pricing rows.
 * Prefers an explicit price in that currency; otherwise converts the USD
 * price (whole rupees, matching the storefront's display logic).
 */
export function resolvePrice(
  pricing: { currency: string; amount: number }[],
  currency: string,
  usdToInrRate: number
): number | null {
  const direct = pricing.find((p) => p.currency.toUpperCase() === currency);
  if (direct) return direct.amount;
  const usd = pricing.find((p) => p.currency.toUpperCase() === "USD");
  if (!usd) return null;
  return currency === "INR" ? Math.round(usd.amount * usdToInrRate) : usd.amount;
}
