import { motion } from 'framer-motion';
import clsx from 'clsx';

type Props = {
  litCount: number;
};

export function LightGrid({ litCount }: Props) {
  return (
    <div className="light-grid">
      {Array.from({ length: 5 }, (_, i) => {
        const isLit = i < litCount;
        return (
          <motion.div
            key={i}
            className={clsx('light', { 'light--on': isLit })}
            animate={{ scale: isLit ? 1.08 : 1, opacity: isLit ? 1 : 0.25 }}
            transition={{ duration: 0.12 }}
          />
        );
      })}
    </div>
  );
}
