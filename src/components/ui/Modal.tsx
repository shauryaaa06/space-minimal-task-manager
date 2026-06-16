import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, fullHeight }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-backdrop"
          onPointerDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={contentRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="modal-sheet"
            style={{ maxHeight: fullHeight ? '95vh' : '80vh' }}
          >
            {title && (
              <div
                className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0"
                style={{ background: 'var(--bg-primary)', zIndex: 10 }}
              >
                <div className="w-10 h-1 rounded-full mx-auto absolute top-3 left-1/2 -translate-x-1/2"
                  style={{ background: 'var(--border-strong)' }} />
                <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center mt-2"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            )}
            {!title && (
              <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'var(--border-strong)' }} />
            )}
            <div className="overflow-y-auto" style={{ maxHeight: fullHeight ? 'calc(95vh - 70px)' : 'calc(80vh - 70px)' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
