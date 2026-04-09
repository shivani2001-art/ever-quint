import { forwardRef, type ReactNode, type KeyboardEvent } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'article';
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className, onClick, as: Component = 'div' },
  ref,
) {
  const isClickable = Boolean(onClick);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Component
      ref={ref}
      className={`${styles.card} ${isClickable ? styles.clickable : ''} ${className ?? ''}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
    >
      {children}
    </Component>
  );
});

export { Card };
export type { CardProps };
