import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { tokens } from '@/theme/tokens';

interface BaseSceneProps {
  children: ReactNode;
  id?: string;
}

/**
 * Standard shell for every scene: absolute-positioned, bottom-to-top
 * stacking, unified crossfade timing. Scenes render inside this wrapper.
 */
export function BaseScene({ children, id }: BaseSceneProps) {
  return (
    <motion.div
      key={id}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: tokens.motion.sceneTransition, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
