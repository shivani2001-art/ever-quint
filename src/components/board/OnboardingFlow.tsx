import { useState, useEffect, useCallback } from 'react';
import { OnboardingTooltip } from '../ui/OnboardingTooltip';
import { useOnboarding, type OnboardingStep } from '../../hooks/useOnboarding';

interface StepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  requiresTasks?: boolean;
}

const STEPS: StepConfig[] = [
  {
    id: 'create-task',
    title: 'Create a task',
    description: 'Start by creating your first task with a title, priority, and due date.',
    targetSelector: '[data-onboarding="new-task"]',
    position: 'auto',
  },
  {
    id: 'board-columns',
    title: 'Kanban columns',
    description: 'Your tasks flow through Backlog, In Progress, and Done. Drag cards between columns or click a card and use the quick action buttons to move it.',
    targetSelector: '[data-onboarding="first-column"]',
    position: 'auto',
  },
  {
    id: 'filters',
    title: 'Search & filter',
    description: 'Filter by status or priority, search by text, and sort your tasks. Filters are saved in the URL so you can bookmark or share a view.',
    targetSelector: '[data-onboarding="filters"]',
    position: 'auto',
  },
  {
    id: 'theme',
    title: 'Dark & light mode',
    description: 'Switch between themes anytime. Your preference is saved automatically.',
    targetSelector: '[data-onboarding="theme-toggle"]',
    position: 'auto',
  },
  {
    id: 'welcome',
    title: 'Replay this tour',
    description: 'Click this help button anytime to walk through the tour again. That\'s it — you\'re all set!',
    targetSelector: '[data-onboarding="help-button"]',
    position: 'auto',
  },
];

interface OnboardingFlowProps {
  hasTasks: boolean;
  active: boolean;
  onFinish: () => void;
}

function OnboardingFlow({ hasTasks, active, onFinish }: OnboardingFlowProps) {
  const { isCompleted, isDismissed, completeStep, dismissAll } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [targetRef, setTargetRef] = useState<React.RefObject<HTMLElement | null>>({ current: null });

  const findNextStep = useCallback((fromIndex: number) => {
    for (let i = fromIndex; i < STEPS.length; i++) {
      const s = STEPS[i]!;
      if (isCompleted(s.id)) continue;
      if (s.requiresTasks && !hasTasks) continue;
      // Check if target exists in DOM
      if (document.querySelector(s.targetSelector)) return i;
    }
    return -1;
  }, [isCompleted, hasTasks]);

  // Start tour when active
  useEffect(() => {
    if (!active || isDismissed) return;

    const timer = setTimeout(() => {
      const idx = findNextStep(0);
      if (idx === -1) {
        onFinish();
      } else {
        setCurrentIndex(idx);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [active, isDismissed, findNextStep, onFinish]);

  // Resolve target element when step changes
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= STEPS.length) {
      setTargetRef({ current: null });
      return;
    }

    const step = STEPS[currentIndex]!;
    const el = document.querySelector<HTMLElement>(step.targetSelector);
    setTargetRef({ current: el });
  }, [currentIndex]);

  if (!active || isDismissed || currentIndex < 0 || currentIndex >= STEPS.length) return null;

  const step = STEPS[currentIndex]!;
  const nextIdx = findNextStep(currentIndex + 1);
  const isLast = nextIdx === -1;
  const visibleIndex = STEPS.slice(0, currentIndex + 1).filter(
    (s, i) => !(s.requiresTasks && !hasTasks) || i <= currentIndex
  ).length;

  const handleNext = () => {
    completeStep(step.id);
    if (isLast) {
      setCurrentIndex(-1);
      onFinish();
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  const handleDismiss = () => {
    completeStep(step.id);
    setCurrentIndex(-1);
    onFinish();
  };

  const handleSkipAll = () => {
    dismissAll();
    setCurrentIndex(-1);
    onFinish();
  };

  return (
    <OnboardingTooltip
      targetRef={targetRef}
      title={step.title}
      description={step.description}
      step={String(visibleIndex)}
      totalSteps={STEPS.filter((s) => !(s.requiresTasks && !hasTasks)).length}
      position={step.position}
      visible={targetRef.current !== null}
      onDismiss={handleDismiss}
      onNext={isLast ? undefined : handleNext}
      onSkipAll={handleSkipAll}
    />
  );
}

export { OnboardingFlow };
