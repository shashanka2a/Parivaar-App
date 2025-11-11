'use client';

import { motion } from 'framer-motion';
import { TreePine } from 'lucide-react';

export default function LoadingScreen() {

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col items-center justify-center p-6">
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        className="mb-12"
      >
        <div className="bg-[#3D5A3A] p-6 rounded-3xl shadow-lg">
          <TreePine className="size-16 text-white" />
        </div>
      </motion.div>

      {/* App Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl mb-2 text-[#2C3E2A]">
          Parivaar
        </h1>
        <p className="text-[#5A6B57]">Your Family, Your Legacy</p>
      </motion.div>

      {/* Loading Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Loading Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -12, 0],
                backgroundColor: ['#4CAF50', '#3D9141', '#4CAF50'],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut"
              }}
              className="size-3 rounded-full bg-[#4CAF50] shadow-md"
            />
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-[#5A6B57] mt-2"
        >
          Loading your family tree...
        </motion.p>
      </motion.div>

      {/* Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-xs text-[#5A6B57]"
      >
        Version 1.0.0
      </motion.div>
    </div>
  );
}