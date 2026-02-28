/**
 * Compute SHA-256 hash and return as base64 string.
 * Uses the Web Crypto API (available in all modern browsers).
 */
export async function sha256Base64(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  // Convert to base64
  let binary = "";
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  return btoa(binary);
}

/**
 * Build canonical string for integrity token.
 */
export function buildIntegrityInput(
  analysisId: string,
  I: number,
  R: number,
  impactScore: number,
  rarity: string,
  level: number,
  hp: number,
  atk: number,
  def: number,
  spd: number,
): string {
  return JSON.stringify({
    analysis_id: analysisId,
    inconvenience: I,
    risk: R,
    impact_score: impactScore,
    rarity,
    level,
    hp,
    atk,
    def,
    spd,
  });
}
