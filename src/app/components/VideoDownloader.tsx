import { useRef, useState } from "react";
import { AlertCircle, ArrowUpRight, Download, Link2, LoaderCircle, Music2, Play, Square, Video } from "lucide-react";

interface Quality { quality: string; url: string; extension: string; type: string }
interface MediaInfo {
  title?: string;
  platform?: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnail?: string;
  qualities?: Quality[];
  audioFormats?: Quality[];
  uploader?: string;
  originalUrl?: string;
}
type Status = "idle" | "loading" | "success" | "error";

const platforms = ["YouTube", "TikTok", "Instagram", "Facebook", "Twitter/X", "Snapchat", "SoundCloud", "Reddit", "CapCut", "SnackVideo", "Douyin"];

function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const parsed = new URL(value);
    if (["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password) return value;
  } catch { return; }
}

function normaliseResponse(payload: unknown): { success: boolean; mediaInfo?: MediaInfo; message?: string } {
  if (!payload || typeof payload !== "object") return { success: false, message: "The service returned an unreadable response." };
  const data = payload as Record<string, unknown>;
  if ((data.success !== true && data.status !== "success") || !data.video_info || typeof data.video_info !== "object") return { success: false, message: "No video information was returned. Check that the link is public and supported." };
  const candidate = data.video_info as Record<string, unknown>;
  // `available_formats` belongs to the provider response, alongside
  // `video_info`. Do not create fallback qualities: every displayed option
  // must carry the API's real download_url.
  const availableFormats = Array.isArray(data.available_formats)
    ? data.available_formats
    : Array.isArray(candidate.available_formats)
      ? candidate.available_formats
      : null;
  if (!availableFormats) return { success: false, message: "No download formats were returned for this media." };
  const formats = availableFormats
    .map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const format = item as Record<string, unknown>;
      const url = safeUrl(format.download_url);
      return url ? { quality: typeof format.quality === "string" ? format.quality : "Available format", url, extension: typeof format.extension === "string" ? format.extension : "", type: typeof format.type === "string" ? format.type : "" } : null;
    })
    .filter((item): item is Quality => Boolean(item));
  const isAudio = (format: Quality) => format.type.toLowerCase() === "audio" || format.extension.toLowerCase() === "mp3";
  const qualities = formats.filter(format => !isAudio(format));
  const audioFormats = formats.filter(isAudio);
  const mediaInfo: MediaInfo = {
    title: typeof candidate.title === "string" ? candidate.title : undefined,
    uploader: typeof candidate.uploader === "string" ? candidate.uploader : undefined,
    originalUrl: safeUrl(candidate.original_url),
    platform: typeof candidate.platform === "string" ? candidate.platform : undefined,
    videoUrl: qualities[0]?.url,
    audioUrl: audioFormats[0]?.url,
    audioFormats,
    thumbnail: safeUrl(candidate.thumbnail),
    qualities,
  };
  return { success: formats.length > 0, mediaInfo, message: formats.length ? undefined : "No usable download links were returned for this media." };
}

async function requestMedia(videoUrl: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`/api/download?url=${encodeURIComponent(videoUrl)}`, { headers: { Accept: "application/json" }, signal: controller.signal, cache: "no-store" });
    let data;
    try { data = await response.json(); } catch {
      if (controller.signal.aborted) throw new Error("The request took too long. Please try again.");
      throw new Error("The download service is unavailable on this host. Please use the deployed website.");
    }
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: "Enter a complete public http or https media URL.",
        422: "This link has no usable formats. Check that the platform is supported and the media is public and permitted for downloading.",
        504: "The media service took too long. Please try again.",
      };
      throw new Error(messages[response.status] || "The media service is temporarily unavailable. Please try again later.");
    }
    return normaliseResponse(data);
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The request took too long. Please try again.");
    if (error instanceof TypeError) throw new Error("Unable to connect. Check your internet connection and try again.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function VideoPreview({ src, poster, title, onDownload, preparing }: { src: string; poster?: string; title: string; onDownload: () => void; preparing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = async () => {
    try {
      await videoRef.current?.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stop = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  };

  return (
    <div className="border-b border-[#d5af4d]/15 bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        controls
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="aspect-video w-full bg-black object-contain"
        aria-label={`Video preview: ${title}`}
      />
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#0c0b09] p-3">
        <button onClick={play} className="inline-flex h-9 items-center gap-2 bg-[#d5af4d] px-3 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.1em] text-[#161108] transition hover:bg-[#e5c36b]">
          <Play size={14} fill="currentColor" /> {isPlaying ? "Playing" : "Play"}
        </button>
        <button onClick={stop} className="inline-flex h-9 items-center gap-2 border border-[#d5af4d]/30 px-3 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.1em] text-[#e6dcc4] transition hover:border-[#d5af4d]">
          <Square size={13} fill="currentColor" /> Stop
        </button>
        <button onClick={onDownload} disabled={preparing} className="ml-auto inline-flex h-9 items-center gap-2 border border-[#d5af4d]/30 px-3 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.1em] text-[#d5af4d] transition hover:border-[#d5af4d] hover:bg-[#d5af4d]/5 disabled:cursor-wait disabled:opacity-50">
          {preparing ? <LoaderCircle className="animate-spin" size={14} /> : <Download size={14} />} {preparing ? "Preparing" : "Download"}
        </button>
      </div>
    </div>
  );
}

export function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const [preparing, setPreparing] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const submit = async (submittedUrl?: string) => {
    const currentRequest = ++requestId.current;
    const value = (submittedUrl ?? url).trim();
    if (!value) {
      setError("Paste a public video link to continue.");
      setStatus("error");
      return;
    }
    if (!safeUrl(value)) {
      setError("Please enter a complete public URL, including https://.");
      setStatus("error");
      return;
    }
    setStatus("loading"); setMedia(null); setError("");
    try {
      const result = await requestMedia(value);
      if (currentRequest !== requestId.current) return;
      if (!result.success || !result.mediaInfo) throw new Error(result.message || "No downloadable file was found for this link.");
      setMedia(result.mediaInfo); setStatus("success");
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(err instanceof Error ? err.message : "The link could not be processed. Please try another public video.");
      setStatus("error");
    }
  };

  const prepareDownload = (format?: Quality) => {
    setPreparing(true);
    setDownloadError("");
    try {
      const fileUrl = safeUrl(format?.url ?? media?.videoUrl ?? media?.audioUrl);
      if (!fileUrl) throw new Error("This format is not available for this video.");
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Could not prepare the download. Please try again.");
    } finally {
      setPreparing(false);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = event.clipboardData.getData("text").trim();
    if (!pastedUrl) return;
    setUrl(pastedUrl);
    window.setTimeout(() => submit(pastedUrl), 30);
  };

  const qualities = media?.qualities ?? [];

  return (
    <section aria-labelledby="download-title" className="border border-[#d5af4d]/25 bg-[#12110d] shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-5 border-b border-[#d5af4d]/15 px-5 py-5 sm:px-7">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#d5af4d]">Downloader / 01</p>
          <h2 id="download-title" className="mt-2 font-['Rajdhani'] text-3xl font-bold tracking-[0.03em] text-[#f5f0e1]">Get your file</h2>
        </div>
        <span className="mt-1 hidden border border-[#d5af4d]/25 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#a89c84] sm:block">No API key</span>
      </div>
      <div className="p-5 sm:p-7">
        <label htmlFor="video-link" className="font-['Manrope'] text-sm font-medium text-[#e6dcc4]">Public video URL</label>
        <div className={`mt-3 flex items-center border bg-[#090908] transition ${status === "error" ? "border-red-400/60" : "border-[#d5af4d]/30 focus-within:border-[#d5af4d]"}`}>
          <Link2 className="ml-4 shrink-0 text-[#a89c84]" size={17} />
          <input id="video-link" value={url} onChange={(event) => { setUrl(event.target.value); if (status === "error") setStatus("idle"); }} onPaste={handlePaste} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder="Paste a link from YouTube, TikTok, Instagram..." className="h-14 min-w-0 flex-1 bg-transparent px-3 font-['Manrope'] text-sm text-[#f5f0e1] outline-none placeholder:text-[#766d5b]" />
          <button onClick={() => submit()} disabled={status === "loading"} className="m-1 inline-flex h-12 shrink-0 items-center gap-2 bg-[#d5af4d] px-4 font-['Manrope'] text-xs font-bold uppercase tracking-[0.1em] text-[#161108] transition hover:bg-[#e5c36b] disabled:cursor-wait disabled:opacity-75 sm:px-5">
            {status === "loading" ? <LoaderCircle className="animate-spin" size={16} /> : <Download size={16} />}
            <span className="hidden sm:inline">Fetch</span>
          </button>
        </div>
        {status === "loading" && <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#a89c84]">Checking available formats…</p>}
        {status === "error" && <div className="mt-4 flex gap-3 border-l-2 border-red-400 bg-red-400/5 p-3 text-sm text-red-200"><AlertCircle className="mt-0.5 shrink-0" size={16} /><p>{error}</p></div>}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#d5af4d]/10 pt-4 font-mono text-[9px] uppercase tracking-[0.13em] text-[#8f856f]">
          {platforms.map((platform) => <span key={platform} className="inline-flex items-center gap-1.5"><span className="h-1 w-1 bg-[#d5af4d]" />{platform}</span>)}
        </div>
        {status === "success" && media && (
          <div className="mt-7 overflow-hidden border border-[#d5af4d]/25 bg-[#0d0c0a]">
            {media.videoUrl ? <VideoPreview src={media.videoUrl} poster={media.thumbnail} title={media.title || "Media preview"} onDownload={() => prepareDownload()} preparing={preparing} /> : <audio src={media.audioUrl} controls className="w-full" />}
            <div className="p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d5af4d]">{media.platform}</p>
              <h3 className="mt-2 line-clamp-2 font-['Manrope'] text-sm font-semibold leading-6 text-[#f5f0e1]">{media.title}</h3>
              {media.uploader && <p className="mt-2 text-xs text-[#a89c84]">{media.uploader}</p>}
              {media.originalUrl && <a href={media.originalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#d5af4d]">Original link</a>}
              <p className="mt-2 font-['Manrope'] text-xs text-[#a89c84]">Preview the file before downloading, or select a different available quality.</p>
            </div>
            <div className="border-t border-[#d5af4d]/15 p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {qualities.map((quality, index) => <button key={`${quality.quality}-${index}`} onClick={() => prepareDownload(quality)} disabled={preparing} className={`flex h-11 items-center justify-between px-4 font-['Manrope'] text-xs font-bold uppercase tracking-[0.08em] transition disabled:cursor-wait disabled:opacity-50 ${index === 0 ? "bg-[#d5af4d] text-[#161108] hover:bg-[#e5c36b]" : "border border-[#d5af4d]/25 text-[#e6dcc4] hover:border-[#d5af4d]"}`}><span className="flex items-center gap-2">{preparing ? <LoaderCircle className="animate-spin" size={14} /> : <Video size={14} />}{quality.quality} {quality.extension}</span><ArrowUpRight size={15} /></button>)}
              </div>
              {media.audioFormats?.map((format, index) => <button key={`audio-${index}`} onClick={() => prepareDownload(format)} disabled={preparing} className="mt-2 flex h-10 w-full items-center justify-center gap-2 border border-white/10 font-['Manrope'] text-xs font-semibold text-[#c7baa0] transition hover:border-[#d5af4d]/45 hover:text-[#f5f0e1] disabled:cursor-wait disabled:opacity-50">{preparing ? <LoaderCircle className="animate-spin" size={14} /> : <Music2 size={14} />}Download {format.extension.toUpperCase()} audio · {format.quality}</button>)}
              {downloadError && <p className="mt-3 border-l-2 border-red-400 pl-3 font-['Manrope'] text-xs leading-5 text-red-200">{downloadError}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
