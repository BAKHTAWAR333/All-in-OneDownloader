import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Play, Square } from "lucide-react";
import videoSrc from "../../imports/WhatsApp_Video_2026-06-04_at_1.03.54_AM.mp4";

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsSoundGesture, setNeedsSoundGesture] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = 1;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().then(() => setNeedsSoundGesture(true)).catch(() => undefined);
    });
  }, []);

  const enableSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => undefined);
    setNeedsSoundGesture(false);
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isStopped) {
      video.play().catch(() => undefined);
      setIsStopped(false);
      return;
    }
    video.pause();
    video.currentTime = 0;
    setIsStopped(true);
  };

  return (
    <div className="group relative aspect-video overflow-hidden border border-[#d5af4d]/25 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
      <video ref={videoRef} src={videoSrc} className="h-full w-full object-cover" autoPlay loop playsInline onClick={enableSound} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />
      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="absolute bottom-4 left-4">
        <span aria-label={isStopped ? "Video stopped" : "Video playing"} className={`block h-2 w-2 rounded-full ring-4 ring-black/30 ${isStopped ? "bg-[#a89c84]" : "animate-pulse bg-[#d1aa50]"}`} />
      </motion.div>
      <button
        onClick={togglePlayback}
        aria-label={isStopped ? "Play featured video" : "Stop featured video"}
        className="absolute right-4 top-4 inline-flex h-9 items-center gap-2 border border-[#d5af4d]/45 bg-black/70 px-3 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.12em] text-[#f5f0e1] backdrop-blur transition hover:border-[#d5af4d] hover:bg-[#181308]"
      >
        {isStopped ? <Play size={13} fill="currentColor" /> : <Square size={12} fill="currentColor" />}
        {isStopped ? "Play" : "Stop"}
      </button>
      {needsSoundGesture && (
        <button onClick={enableSound} className="absolute bottom-4 right-4 inline-flex items-center gap-2 border border-[#d5af4d]/50 bg-black/70 px-3 py-2 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.12em] text-[#f5f0e1] backdrop-blur transition hover:border-[#d5af4d] hover:text-[#d5af4d]">
          Enable sound
        </button>
      )}
    </div>
  );
}
