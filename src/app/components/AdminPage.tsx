import { motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import profileImg from "../../imports/WhatsApp_Image_2026-06-07_at_2.53.20_AM.jpeg";

interface AdminPageProps { onBack: () => void }



export function AdminPage({ onBack }: AdminPageProps) {
  return (
    <div className="min-h-screen bg-[#0d0c0a] text-[#f3eee2]">
      <header className="fixed inset-x-0 top-0 z-20"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-9"><button onClick={onBack} className="inline-flex items-center gap-2 font-['DM_Mono'] text-[10px] uppercase tracking-[0.16em] text-[#d1aa50] transition hover:gap-3"><ArrowLeft size={14} /> Return</button><span className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.18em] text-[#b8aa90]">MBK / Direct desk</span></div></header>
      <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-24 sm:px-9 sm:pt-32">
        <section className="grid min-h-[680px] overflow-hidden border border-[#d1aa50]/20 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0 0)" }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative min-h-[470px] bg-[#1e180e] lg:min-h-0">
            <img src={profileImg} alt="Muhammad Bakhtawar Khan" className="absolute inset-0 h-full w-full object-cover object-[52%_50%] grayscale-[15%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0a] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 font-['DM_Mono'] text-[10px] uppercase tracking-[0.19em] text-[#f3eee2]/80">MBK / Portrait / 2026</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22, duration: 0.75 }} className="flex flex-col justify-between bg-[#e7dfcf] p-7 text-[#171208] sm:p-12">
            <div><p className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.18em] text-[#8c691d]">The person behind the desk</p><h1 className="mt-8 font-['Bodoni_Moda'] text-5xl font-semibold leading-[0.86] tracking-[-0.06em] sm:text-7xl">Muhammad<br />Bakhtawar<br /><i>Khan.</i></h1></div>
            <div className="mt-12 grid max-w-lg gap-5"><p className="font-['Manrope'] text-sm leading-6 text-[#625846]">If something needs an answer, it should be easy to find one. Reach out directly.</p><div className="grid gap-0 border-y border-[#171208]/20 sm:grid-cols-2"><a href="tel:03200276941" className="group flex items-center justify-between border-b border-[#171208]/20 py-4 font-['Manrope'] text-sm font-semibold sm:mr-6 sm:border-b-0"><span><span className="block font-['DM_Mono'] text-[9px] uppercase tracking-[0.15em] text-[#887b65]">Phone</span>03200276941</span><Phone size={15} className="text-[#8c691d]" /></a><a href="mailto:Bakhtawark085@gmail.com" className="group flex items-center justify-between py-4 font-['Manrope'] text-sm font-semibold"><span><span className="block font-['DM_Mono'] text-[9px] uppercase tracking-[0.15em] text-[#887b65]">Email</span>Bakhtawark085@gmail.com</span><Mail size={15} className="text-[#8c691d]" /></a><a href="https://chat.whatsapp.com/E78geSMJuAZEve5PmNZwIA" target="_blank" rel="noreferrer" className="group col-span-full flex items-center justify-between border-t border-[#171208]/20 py-4 font-['Manrope'] text-sm font-semibold"><span><span className="block font-['DM_Mono'] text-[9px] uppercase tracking-[0.15em] text-[#887b65]">WhatsApp Group</span>Open WhatsApp group</span><MessageCircle size={16} className="text-[#3c9b7b]" /></a></div></div>
          </motion.div>
        </section>
        <div className="mt-16 flex justify-end"><button onClick={onBack} className="inline-flex items-center gap-3 border-b border-[#d1aa50] pb-2 font-['DM_Mono'] text-[10px] uppercase tracking-[0.16em] text-[#f3eee2] transition hover:gap-5">Return to utility <ArrowUpRight size={14} /></button></div>
      </main>
    </div>
  );
}
