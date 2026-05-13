import { createFileRoute } from "@tanstack/react-router";

const PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (b.count >= 20) return false;
  b.count += 1;
  return true;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/pin-json")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const jwt = process.env.PINATA_JWT;
        if (!jwt) {
          return Response.json({ error: "PINATA_JWT not configured" }, { status: 500, headers: cors });
        }
        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          "anon";
        if (!rateLimit(ip)) {
          return Response.json({ error: "Rate limit exceeded" }, { status: 429, headers: cors });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
        }
        const json = JSON.stringify(body);
        if (json.length > 100_000) {
          return Response.json({ error: "Payload too large" }, { status: 400, headers: cors });
        }

        const res = await fetch(PINATA_PIN_JSON_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pinataContent: body,
            pinataMetadata: { name: `ideon-meta-${Date.now()}` },
            pinataOptions: { cidVersion: 1 },
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return Response.json(
            { error: "Pinata pin failed", detail: text.slice(0, 300) },
            { status: 502, headers: cors },
          );
        }
        const data = (await res.json()) as { IpfsHash: string };
        return Response.json(
          {
            cid: data.IpfsHash,
            uri: `ipfs://${data.IpfsHash}`,
            url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
          },
          { headers: cors },
        );
      },
    },
  },
});
