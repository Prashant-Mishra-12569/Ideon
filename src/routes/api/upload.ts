import { createFileRoute } from "@tanstack/react-router";

const PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);

const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (b.count >= 10) return false;
  b.count += 1;
  return true;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/upload")({
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

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Invalid form data" }, { status: 400, headers: cors });
        }

        const file = form.get("file");
        if (!(file instanceof File)) {
          return Response.json({ error: "Missing file" }, { status: 400, headers: cors });
        }
        if (file.size > MAX_BYTES) {
          return Response.json({ error: "File too large (max 5 MB)" }, { status: 400, headers: cors });
        }
        if (file.type && !ALLOWED.has(file.type)) {
          return Response.json({ error: `Unsupported file type: ${file.type}` }, { status: 400, headers: cors });
        }

        const fwd = new FormData();
        fwd.append("file", file, file.name || "upload");
        fwd.append(
          "pinataMetadata",
          JSON.stringify({ name: `ideon-${Date.now()}-${file.name || "file"}` }),
        );
        fwd.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

        const res = await fetch(PINATA_PIN_FILE_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
          body: fwd,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return Response.json(
            { error: "Pinata upload failed", detail: text.slice(0, 300) },
            { status: 502, headers: cors },
          );
        }
        const json = (await res.json()) as { IpfsHash: string; PinSize: number; Timestamp: string };
        return Response.json(
          {
            cid: json.IpfsHash,
            uri: `ipfs://${json.IpfsHash}`,
            url: `https://gateway.pinata.cloud/ipfs/${json.IpfsHash}`,
            size: json.PinSize,
          },
          { headers: cors },
        );
      },
    },
  },
});
