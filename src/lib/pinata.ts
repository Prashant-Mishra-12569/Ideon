export const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

export type PinResult = { cid: string; uri: string; url: string; size?: number };

export async function uploadFile(file: File): Promise<PinResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

export async function pinJSON(payload: unknown): Promise<PinResult> {
  const res = await fetch("/api/pin-json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Pin failed" }));
    throw new Error(err.error || "Pin failed");
  }
  return res.json();
}

export function ipfsToHttp(uri?: string | null) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return IPFS_GATEWAY + uri.replace("ipfs://", "");
  return uri;
}
