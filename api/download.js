import { handleDownload } from "../server/media-service.js";

export default async function download(request, response) {
  const base = `https://${request.headers.host || "localhost"}`;
  const result = await handleDownload(new Request(new URL(request.url, base), {
    method: request.method,
    headers: { ...(request.headers.origin ? { origin: request.headers.origin } : {}) },
  }));
  for (const [key, value] of result.headers) response.setHeader(key, value);
  response.status(result.status).send(await result.text());
}
