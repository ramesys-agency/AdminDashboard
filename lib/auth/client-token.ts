/**
 * Utility to decode JWT on the client side without heavy libraries.
 * We only need the payload to check the expiration (exp).
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    // Use atob to decode base64 in the browser
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    if (!payload.exp) return false;

    // Date.now() is in milliseconds, payload.exp is in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return true; // Assume expired/invalid if decoding fails
  }
}
