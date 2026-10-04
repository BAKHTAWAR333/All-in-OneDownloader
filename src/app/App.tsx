import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ShieldCheck } from "lucide-react";
import { AdminPage } from "./components/AdminPage";
import { IntroAnimation } from "./components/IntroAnimation";
import { VideoDownloader } from "./components/VideoDownloader";
import { VideoPlayer } from "./components/VideoPlayer";
import profileImg from "../imports/WhatsApp_Image_2026-06-07_at_2.53.20_AM.jpeg";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) return <AdminPage onBack={() => setShowAdmin(false)} />;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#10131a] text-[#f5f0e7] selection:bg-[#d8a846] selection:text-[#11141b]">
      <AnimatePresence>{showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}</AnimatePresence>

      <header className="border-b border-white/10 bg-[#10131a]">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="flex items-center gap-3">
            <span className="font-['DM_Mono'] text-[13px] font-medium tracking-[0.22em] text-[#f5f0e7]">MBK</span>
            <span className="h-3 w-px bg-white/25" />
            <span className="font-['DM_Mono'] text-[9px] uppercase tracking-[0.18em] text-[#a9afba]">All-in-One Downloader</span>
          </motion.div>
          <button onClick={() => setShowAdmin(true)} aria-label="Open administrator profile" className="group flex items-center gap-2 border border-[#d8a846]/40 bg-[#d8a846]/5 p-1 pr-3 font-['DM_Mono'] text-[9px] uppercase tracking-[0.14em] text-[#d8a846] transition hover:border-[#d8a846] hover:bg-[#d8a846] hover:text-[#16140d]">
            <img src={profileImg} alt="Admin profile" className="h-7 w-7 rounded-full object-cover object-top" />
            <ShieldCheck size={13} />
            <span className="hidden sm:block">Admin</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-12">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="relative">
          <div className="border border-white/10 bg-black shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
            <VideoPlayer />
          </div>
        </motion.section>

        <motion.section id="download" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.65 }} className="mx-auto mt-10 max-w-4xl">
          <div className="mb-4 flex items-center justify-between"><span className="font-['DM_Mono'] text-[9px] uppercase tracking-[0.2em] text-[#d8a846]">Quick download</span><ArrowDown size={15} className="text-[#a9afba]" /></div>
          <VideoDownloader />
        </motion.section>
      </main>

      <footer className="mt-4 border-t border-white/10 bg-[#0d1016] px-5 py-7 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 font-['DM_Mono'] text-[9px] uppercase tracking-[0.15em] text-[#8d96a5] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
          <span className="text-[#f5f0e7]">Created by <span className="text-[#d8a846]">MBK</span> · © 2026</span>
          <a href="tel:03200276941" className="transition hover:text-[#d8a846]">03200276941</a>
          <a href="mailto:Bakhtawark085@gmail.com" className="normal-case transition hover:text-[#d8a846]">Bakhtawark085@gmail.com</a>
        </div>
      </footer>
    </div>
  );
}
