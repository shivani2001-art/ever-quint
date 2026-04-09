import type { ReactNode } from 'react';
import styles from './Tag.module.css';

type TagSize = 'sm' | 'md';

interface TagProps {
  children: ReactNode;
  color?: string;
  onRemove?: () => void;
  size?: TagSize;
}

function Tag({ children, color, onRemove, size = 'md' }: TagProps) {
  const style = color
    ? ({ '--tag-color': color, '--tag-bg': `${color}1a` } as React.CSSProperties)
    : undefined;

  return (
    <span className={`${styles.tag} ${styles[size]}`} style={style}>
      <span className={styles.text}>{children}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={`Remove ${String(children)}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}

export { Tag };
export type { TagProps };
