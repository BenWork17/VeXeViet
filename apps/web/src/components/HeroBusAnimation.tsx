'use client';

import { motion } from 'framer-motion';

interface HeroBusAnimationProps {
  triggerExit?: boolean;
}

export function HeroBusAnimation({ triggerExit = false }: HeroBusAnimationProps) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-end pointer-events-none">
      {/* Con đường */}
      <div className="relative w-full h-40 flex items-center mb-[80px]">
        {/* Vạch kẻ đường chạy ngược chiều */}
        <div className="absolute w-full h-1 overflow-hidden">
          <motion.div
            animate={{ x: [0, -160] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
            className="flex gap-24 w-[200%]"
          >
            {[...Array(30)].map((_, i) => (
              <div key={i} className="w-16 h-full bg-white/20 shrink-0" />
            ))}
          </motion.div>
        </div>

        {/* Chiếc xe khách */}
        <motion.div
          initial={{ x: -300 }}
          animate={triggerExit ? { 
            x: '110vw',
            y: [0, -2, 0]
          } : { 
            x: '60vw', 
            y: [0, -2, 0] 
          }}
          transition={triggerExit ? { 
            x: { duration: 1.2, ease: "easeIn" },
            y: { duration: 0.15, repeat: Infinity, ease: "easeInOut" }
          } : { 
            x: { duration: 2.5, ease: "easeOut" },
            y: { duration: 0.15, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative z-10"
        >
          {/* Thân xe */}
          <div className="relative bg-[#FFD700] w-80 h-28 rounded-t-3xl border-b-[6px] border-black shadow-[0_20px_50px_rgba(255,215,0,0.3)]">
            {/* Cửa sổ */}
            <div className="flex gap-3 p-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-12 h-10 bg-slate-800 rounded-md border border-white/20" />
              ))}
            </div>
            {/* Đèn xe */}
            <div className="absolute left-0 bottom-6 w-3 h-10 bg-red-600 rounded-r-full" />
            <div className="absolute right-0 bottom-6 w-3 h-10 bg-white rounded-l-full shadow-[10px_0_20px_rgba(255,255,255,0.8)]" />
            <div className="absolute right-[-10px] bottom-6 w-32 h-16 bg-white/20 rounded-full blur-2xl" />
            
            {/* Logo VeXeViet trên xe */}
            <div className="absolute bottom-4 left-6 text-[12px] font-black text-black/80 tracking-tighter uppercase">
              VEXEVIET
            </div>
          </div>

          {/* Bánh xe */}
          <div className="flex justify-around px-12 -mt-5">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 bg-zinc-950 rounded-full border-[5px] border-zinc-800 flex items-center justify-center relative"
              >
                <div className="w-1 h-full bg-zinc-700" />
                <div className="absolute w-full h-1 bg-zinc-700" />
                <div className="w-4 h-4 bg-zinc-600 rounded-full z-10" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
