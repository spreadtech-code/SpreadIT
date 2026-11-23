// PROTOTYPE ONLY: a simple scramble so the demo doesn't keep the password and
// PIN as plain text on the phone. This is NOT real security. The engineer must
// replace sign-in with the real server's (PRD 4.1 Security).
export function prototypeHash(secret: string): string {
  let h = 5381;
  const salted = `spreadit-demo:${secret}`;
  for (let i = 0; i < salted.length; i++) h = ((h * 33) ^ salted.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

/** A random 6-digit code for the pretend SMS (S3). */
export function sixDigitCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}
