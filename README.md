# MBK media downloader

The restored React/Vite UI is preserved in `src/`, with its existing entry point in `index.html`. It is not moved into a second `frontend/` tree, which would break the existing Figma project. Manual `.npmrc`, `.gitattributes`, imported prompts, fonts, tokens, uploaded media and profile UI are untouched.

## Architecture

Browser → `GET /api/download?url=ENCODED_PUBLIC_URL` → server → **only** `https://ahm7xmakki.com/api/alldl?url=ENCODED_PUBLIC_URL` → validated original JSON → existing download UI.

`api/download.js` is the Vercel function; `server/media-service.js` shares validation and provider access with local Vite development and the existing Netlify function. No public CORS relay, alternate API, sample media, fabricated links, or fallback success results are used. This backend integrates the supplied extraction service; it is not an independent extractor and cannot repair that service's outages or unsupported response schemas.

Successful responses must have `status: "success"`, `video_info` and `video_info.available_formats`. Each usable format must contain an absolute HTTP(S) `download_url`. The original JSON and its metadata/format fields are returned without synthesizing qualities or converting files. Invalid individual links are not offered as downloads. MP3 appears only when actually returned; other audio formats retain their real extensions. Title, uploader, thumbnail and original link use the provider's values when present.

## Install and run locally

Requirements: Node.js 22 LTS and pnpm.

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open the URL printed by Vite. Vite includes the real local `/api/download` handler, so development does not need a public CORS proxy. For local cross-origin testing, set `ALLOWED_ORIGINS` in your shell before starting Vite; the server does not load `.env.local` into Node environment variables. Same-origin usage needs no environment variables or API key.

To check the production frontend build use `pnpm build`. A static `dist/` server alone has no API function. Figma/static preview may display the UI but cannot execute the Vercel/Netlify serverless API.

## Environment variables

`ALLOWED_ORIGINS` is optional: a comma-separated list of exact frontend origins, such as `https://your-own-domain.example`. Same-origin calls work without it. Cross-origin browsers are only granted access for explicitly listed origins. No API credentials are required by the supplied provider; never put secrets into `VITE_*` variables. CORS is a browser boundary, not authentication or rate limiting.

## Deploy to Vercel

1. Upload/push the **complete source project**, not only `dist/`, into your own Git repository.
2. Import the repository into Vercel. Select the project root and Vite preset. `vercel.json` sets `pnpm build`, output `dist`, and a 30-second function duration. Use Node.js 22 and the lockfile's pnpm package manager.
3. Leave environment variables empty for the standard same-origin deployment. Set `ALLOWED_ORIGINS` only if a separate frontend must access the function.
4. Deploy. Vercel discovers `api/download.js` and serves the frontend and API from the same domain.
5. Verify `/api/download` without a URL returns a friendly JSON error. Then paste a public media URL that you own or are authorized to download. Confirm metadata and every offered format comes from the real response; click a format and check that the media URL actually opens/downloads.

Alternatively use `npx vercel` from the project root, then `npx vercel --prod`. For Vercel runtime testing locally, use `npx vercel dev`.

Existing Netlify deployment remains supported through the `/api/download` rewrite to `/.netlify/functions/alldl`. Deploy the full source with its build and function, not a `dist/` drag-and-drop upload.

## Safety and operational limitations

- Only explicitly listed platform hostnames and their subdomains are accepted. Credential URLs, custom ports, IP literals, local hosts, unsafe protocols, and unsupported platforms are rejected before any provider request.
- The server contacts a fixed upstream host, refuses redirects, limits response size to 2 MiB, and times out after 25 seconds. The frontend times out after 30 seconds. Responses are not cached because signed media links expire.
- Download buttons use exactly the selected API `download_url` in the user's click event, avoiding async popup blocking and accidental selection by duplicate quality labels. Cross-origin servers may ignore the HTML `download` attribute and open a player instead; saving behavior is controlled by the media host. No unbounded media proxy or transcoding is included.
- Only use public content you own or have permission to download, and where platform rules permit it. No cookies, login tokens, DRM workarounds, paywall bypasses or private-content extraction are implemented. Public visibility alone does not grant download permission, and provider behavior/rights cannot be guaranteed by this proxy.
- Configure Vercel firewall/rate limiting for your production traffic before exposing a high-volume public service. This function intentionally has no process-local limiter that would falsely claim protection across serverless instances.
- Live extraction and media-host downloads depend on provider availability, its actual schema, platform policies and expiring URLs. A successful build is **not** proof of live end-to-end downloads. No deployed end-to-end success is claimed without testing an authorized real media URL.

## Error contract

Errors return `{ "status": "error", "message": "User-friendly explanation" }`: 400 for invalid/missing URL, 405 for unsupported method, 422 for unsupported platforms/extraction failure/no usable formats, 502 for upstream/network/empty or malformed response, and 504 for timeout. Raw upstream error messages, stack traces and credentials are never forwarded.
"# All-in-OneDownloader" 
