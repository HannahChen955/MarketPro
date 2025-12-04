// Onboarding System
export { OnboardingProvider, useOnboarding } from './OnboardingContext';
export { OnboardingTour } from './OnboardingTour';
export { WelcomeModal } from './WelcomeModal';
export { OnboardingSpotlight } from './OnboardingSpotlight';
export { OnboardingTooltip } from './OnboardingTooltip';
export { CompletionModal } from './CompletionModal';

// Types
export type {
  OnboardingStep,
  OnboardingTour as OnboardingTourType,
  OnboardingState,
  OnboardingContextType,
  SpotlightProps
} from './types';

// Tour configurations
export { onboardingTours, getTourById, getAvailableTours } from './tours';