// In-memory OTP store (works fine for serverless — OTP is short-lived)
const store = new Map<string, { otp: string; expires: number }>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function setOtp(key: string, otp: string) {
  store.set(key, { otp, expires: Date.now() + 10 * 60 * 1000 });
}

export function verifyOtp(key: string, otp: string): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expires) { store.delete(key); return false; }
  if (entry.otp !== otp) return false;
  store.delete(key);
  return true;
}
