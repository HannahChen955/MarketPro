// Onboarding Types and Interfaces
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  content?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  validation?: () => boolean; // Check if step can be completed
  skipable?: boolean;
}

export interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
}

export interface OnboardingState {
  isActive: boolean;
  currentTour: string | null;
  currentStep: number;
  completedTours: string[];
  skippedSteps: string[];
  isFirstTime: boolean;
  showWelcome: boolean;
}

export interface OnboardingContextType {
  state: OnboardingState;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  restartTour: (tourId: string) => void;
  markAsCompleted: (tourId: string) => void;
  showWelcomeScreen: () => void;
  hideWelcomeScreen: () => void;
  resetOnboarding: () => void;
}

export interface SpotlightProps {
  target: string;
  isActive: boolean;
  borderRadius?: number;
  padding?: number;
}