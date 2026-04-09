import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import styles from './OnboardingTooltip.module.css';

type Position = 'top' | 'bottom' | 'left' | 'right' | 'auto';

interface OnboardingTooltipProps {
  targetRef: React.RefObject<HTMLElement | null>;
  title: string;
  description: string;
  step: string;
  totalSteps?: number;
  position?: Position;
  visible: boolean;
  onDismiss: () => void;
  onNext?: () => void;
  onSkipAll?: () => void;
}

function resolvePosition(rect: DOMRect, tw: number, th: number): 'top' | 'bottom' | 'right' | 'left' {
  const gap = 14;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = window.innerWidth - rect.right;

  // Prefer right for narrow elements, bottom/top for wide ones
  if (rect.width < 200 && spaceRight > tw + gap) return 'right';
  if (spaceBelow > th + gap) return 'bottom';
  if (spaceAbove > th + gap) return 'top';
  if (spaceRight > tw + gap) return 'right';
  return 'bottom';
}

function OnboardingTooltip({
  targetRef,
  title,
  description,
  step,
  totalSteps,
  position = 'auto',
  visible,
  onDismiss,
  onNext,
  onSkipAll,
}: OnboardingTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Elevate target element above backdrop
  useEffect(() => {
    const el = targetRef.current;
    if (!visible || !el) return;

    const prev = {
      position: el.style.position,
      zIndex: el.style.zIndex,
      boxShadow: el.style.boxShadow,
      borderRadius: el.style.borderRadius,
    };

    const computed = getComputedStyle(el);
    if (computed.position === 'static') {
      el.style.position = 'relative';
    }
    el.style.zIndex = '8001';
    el.style.boxShadow = '0 0 0 5px var(--color-bg), 0 0 0 7px var(--color-primary)';
    el.style.borderRadius = 'var(--radius-md)';

    return () => {
      el.style.position = prev.position;
      el.style.zIndex = prev.zIndex;
      el.style.boxShadow = prev.boxShadow;
      el.style.borderRadius = prev.borderRadius;
    };
  }, [visible, targetRef]);

  // Position the tooltip
  useEffect(() => {
    if (!visible || !targetRef.current) {
      setCoords(null);
      return;
    }

    function update() {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      const tw = tooltip?.offsetWidth ?? 290;
      const th = tooltip?.offsetHeight ?? 130;
      const gap = 14;

      const resolved = position === 'auto' ? resolvePosition(rect, tw, th) : position;

      let top = 0;
      let left = 0;

      switch (resolved) {
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case 'top':
          top = rect.top - th - gap;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case 'right':
          top = rect.top + Math.min(rect.height / 2, 60) - th / 2;
          left = rect.right + gap;
          break;
        case 'left':
          top = rect.top + Math.min(rect.height / 2, 60) - th / 2;
          left = rect.left - tw - gap;
          break;
      }

      // Clamp to viewport
      left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
      top = Math.max(12, Math.min(top, window.innerHeight - th - 12));

      setCoords({ top, left });
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [visible, targetRef, position]);

  if (!visible || !coords) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onDismiss} />
      <div
        ref={tooltipRef}
        className={styles.tooltip}
        style={{ top: coords.top, left: coords.left }}
        role="tooltip"
      >
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button type="button" className={styles.closeBtn} onClick={onDismiss} aria-label="Dismiss tip">
            <X size={12} />
          </button>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          {totalSteps && <span className={styles.stepCount}>{step}/{totalSteps}</span>}
          <div className={styles.actions}>
            {onSkipAll && (
              <button type="button" className={styles.skipBtn} onClick={onSkipAll}>
                Skip all
              </button>
            )}
            {onNext ? (
              <button type="button" className={styles.nextBtn} onClick={onNext}>
                Next <ChevronRight size={12} />
              </button>
            ) : (
              <button type="button" className={styles.nextBtn} onClick={onDismiss}>
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export { OnboardingTooltip };
