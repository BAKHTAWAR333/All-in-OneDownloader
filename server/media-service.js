const UPSTREAM = "https://ahm7xmakki.com/api/alldl";

export class DownloadError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function safeHttpUrl(value) {
  if (typeof value !== "string" || value.length > 4096) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password &&
      !url.port && host.includes(".") && !host.includes(":") &&
      !/^\d+\.\d+\.\d+\.\d+$/.test(host) &&
      !["localhost", "local", "internal", "test", "invalid"].some(suffix => host === suffix || host.endsWith(`.${suffix}`));
  } catch {
    return false;
  }
}

export function validateMediaUrl(value) {
  if (!safeHttpUrl(value)) throw new DownloadError(400, "Enter a complete public http or https media URL.");
  return value;
}

export function validateResult(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new DownloadError(502, "The media service returned an unreadable response. Try again later.");
  if (data.success !== true && data.status !== "success") throw new DownloadError(422, "This media could not be extracted. Check that the link is public and supported by the media service.");
  const info = data.video_info;
  if (!info || typeof info !== "object" || Array.isArray(info)) throw new DownloadError(502, "The media service did not return video information.");
  // The supplied provider returns `video_info` and `available_formats` as
  // sibling fields. Keep the nested read only for older provider responses.
  const formats = Array.isArray(data.available_formats)
    ? data.available_formats
    : Array.isArray(info.available_formats)
      ? info.available_formats
      : null;
  if (!formats) throw new DownloadError(502, "The media service did not return available formats.");
  if (!formats.length) throw new DownloadError(422, "No downloadable formats are available for this media.");
  if (!formats.some(format => format && safeHttpUrl(format.download_url))) {
    throw new DownloadError(422, "The media service did not return a usable download link.");
  }
  return data;
}

export async function extractMedia(value) {
  const url = validateMediaUrl(value);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${UPSTREAM}?url=${encodeURIComponent(url)}`, {
      headers: { Accept: "application/json" }, signal: controller.signal, redirect: "error",
    });
    if (!response.body) throw new DownloadError(502, "The media service returned an empty response.");
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      size += chunk.byteLength;
      if (size > 2 * 1024 * 1024) {
        await reader.cancel();
        throw new DownloadError(502, "The media service response could not be processed.");
      }
      chunks.push(chunk);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const body = new TextDecoder().decode(bytes);
    if (!body.trim()) throw new DownloadError(502, "The media service returned an empty response.");
    let data;
    try { data = JSON.parse(body); } catch { throw new DownloadError(502, "The media service returned an unreadable response. Try again later."); }
    // A number of provider failures (for example an unsupported platform)
    // arrive as JSON with a non-2xx HTTP status. Parse that real payload so
    // the caller receives the appropriate friendly 422 state instead of a
    // misleading generic availability error.
    if (!response.ok && (!data || typeof data !== "object" || (data.success !== false && data.status !== "error"))) {
      throw new DownloadError(502, "The media service is temporarily unavailable. Please try again later.");
    }
    return validateResult(data);
  } catch (error) {
    if (error instanceof DownloadError) throw error;
    if (controller.signal.aborted) throw new DownloadError(504, "The media service took too long. Please try again.");
    throw new DownloadError(502, "Could not connect to the media service. Please try again later.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleDownload(request) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  };
  const origin = request.headers.get("origin");
  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean);
  if (origin && (origin === new URL(request.url).origin || allowed.includes(origin))) headers["Access-Control-Allow-Origin"] = origin;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "GET") return Response.json({ status: "error", message: "Use GET to fetch a public media link." }, { status: 405, headers: { ...headers, Allow: "GET, OPTIONS" } });
  try {
    const values = new URL(request.url).searchParams.getAll("url");
    if (values.length !== 1) throw new DownloadError(400, "Provide one public media URL.");
    return Response.json(await extractMedia(values[0]), { headers });
  } catch (error) {
    return Response.json({ status: "error", message: error instanceof DownloadError ? error.message : "The download service is temporarily unavailable." }, { status: error instanceof DownloadError ? error.status : 500, headers });
  }
}
