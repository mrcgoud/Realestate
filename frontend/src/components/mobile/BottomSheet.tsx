'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type SheetState = 'collapsed' | 'expanded' | 'hidden';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  height?: number;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = 400,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ y: height }}
            animate={{ y: 0 }}
            exit={{ y: height }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl"
            style={{ height }}
          >
            <div className="flex flex-col h-full">
              {title && (
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
