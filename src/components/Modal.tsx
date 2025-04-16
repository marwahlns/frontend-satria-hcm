import { motion, AnimatePresence } from "framer-motion";
import React, { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  isModalOpen: boolean;
  longContent?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  children,
  isModalOpen,
  longContent = false,
}) => {
  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 z-[90] p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`modal-content bg-white p-6 rounded-lg shadow-lg max-w-[600px] w-full ${
              longContent ? "max-h-[90vh] overflow-auto" : "h-fit"
            }`}
          >
            <div className="grid grid-cols-1 md:grid gap-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
