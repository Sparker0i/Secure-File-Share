import { motion } from 'framer-motion'

import { ReactNode, MouseEventHandler } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function AnimatedButton({ children, onClick }: AnimatedButtonProps) {
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {children}
    </motion.button>
  )
}
