'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export default function LoadingOverlay({ show, message }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-6 py-4 shadow-lg border border-[#E0DAD0]"
          >
            <div className="h-6 w-6 rounded-full border-2 border-[#4CAF50] border-t-transparent animate-spin" />
            {message && (
              <p className="text-sm text-[#4B5563]">{message}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


