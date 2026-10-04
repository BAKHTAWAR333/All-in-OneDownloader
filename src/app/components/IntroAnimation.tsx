import { motion } from "motion/react";
import profileImg from "../../imports/WhatsApp_Image_2026-06-07_at_2.53.20_AM.jpeg";

interface IntroAnimationProps { onComplete: () => void }

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#0d0c0a]" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.45 } }}>
      <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="relative flex flex-col items-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border border-[#d1aa50]/80 p-1 sm:h-32 sm:w-32">
          <img src={profileImg} alt="MBK" className="h-full w-full rounded-full object-cover object-top" />
          <motion.span initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 2.7, ease: "linear" }} className="absolute -inset-1 rounded-full border border-dashed border-[#d1aa50]/50" />
        </div>
        <motion.div initial={{ opacity: 0, y: 12, letterSpacing: "0.42em" }} animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }} transition={{ delay: 0.42, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-7 pl-[0.18em] font-['DM_Mono'] text-4xl font-medium text-[#f3eee2]">MBK</motion.div>
        <motion.div className="mt-7 h-px w-28 overflow-hidden bg-[#d1aa50]/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}><motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ delay: 0.92, duration: 1.35, ease: "easeInOut" }} onAnimationComplete={onComplete} className="h-full w-full bg-[#d1aa50]" /></motion.div>
      </motion.div>
    </motion.div>
  );
}
