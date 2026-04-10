/**
 * Google Earth Engine Authentication Module (REST API)
 * Uses OAuth 2.0 service account JWT flow to get access tokens
 * No browser-only dependencies—works server-side
 */

import crypto from "crypto";

interface TokenCache {
  token: string;
  expiresAt: number;
}

const tokenCache: Map<string, TokenCache> = new Map();

/**
 * Generate a JWT token for service account authentication
 */
function generateJWT(
  privateKey: string,
  clientEmail: string,
  projectId: string
): string {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/earthengine",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    iat: Math.floor(Date.now() / 1000),
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const message = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message);
  const signature = signer.sign(privateKey, "base64url");

  return `${message}.${signature}`;
}

/**
 * Get access token from Google OAuth using service account
 */
export async function getAccessToken(
  privateKey: string,
  clientEmail: string,
  projectId: string
): Promise<string> {
  const cacheKey = clientEmail;
  const cached = tokenCache.get(cacheKey);

  // Return cached token if still valid
  if (cached && cached.expiresAt > Date.now()) {
    console.log("✅ Using cached GEE access token");
    return cached.token;
  }

  console.log("🔐 Generating new GEE access token (OAuth 2.0 JWT)...");

  const jwt = generateJWT(privateKey, clientEmail, projectId);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth token error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as any;
  const accessToken = data.access_token;
  const expiresIn = data.expires_in || 3600;

  // Cache token
  tokenCache.set(cacheKey, {
    token: accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  });

  console.log("✅ GEE access token obtained (valid for ~1 hour)");
  return accessToken;
}
