'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { OnboardingState, OnboardingContextType, OnboardingTour } from './types';
import { onboardingTours } from './tours';

// Initial state
const initialState: OnboardingState = {
  isActive: false,
  currentTour: null,
  currentStep: 0,
  completedTours: [],
  skippedSteps: [],
  isFirstTime: true,
  showWelcome: false,
};

// Actions
type OnboardingAction =
  | { type: 'START_TOUR'; tourId: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SKIP_STEP' }
  | { type: 'SKIP_TOUR' }
  | { type: 'COMPLETE_TOUR' }
  | { type: 'RESTART_TOUR'; tourId: string }
  | { type: 'MARK_COMPLETED'; tourId: string }
  | { type: 'SHOW_WELCOME' }
  | { type: 'HIDE_WELCOME' }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'LOAD_STATE'; state: Partial<OnboardingState> };

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'START_TOUR':
      return {
        ...state,
        isActive: true,
        currentTour: action.tourId,
        currentStep: 0,
        showWelcome: false,
      };

    case 'NEXT_STEP': {
      const tour = onboardingTours.find(t => t.id === state.currentTour);
      if (!tour) return state;

      const nextStep = state.currentStep + 1;
      if (nextStep >= tour.steps.length) {
        // Tour completed
        return {
          ...state,
          isActive: false,
          currentTour: null,
          currentStep: 0,
          completedTours: [...state.completedTours, tour.id],
        };
      }

      return {
        ...state,
        currentStep: nextStep,
      };
    }

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      };

    case 'SKIP_STEP': {
      const tour = onboardingTours.find(t => t.id === state.currentTour);
      if (!tour) return state;

      const currentStepId = tour.steps[state.currentStep]?.id;
      const nextStep = state.currentStep + 1;

      if (nextStep >= tour.steps.length) {
        // Tour completed
        return {
          ...state,
          isActive: false,
          currentTour: null,
          currentStep: 0,
          skippedSteps: currentStepId ? [...state.skippedSteps, currentStepId] : state.skippedSteps,
          completedTours: [...state.completedTours, tour.id],
        };
      }

      return {
        ...state,
        currentStep: nextStep,
        skippedSteps: currentStepId ? [...state.skippedSteps, currentStepId] : state.skippedSteps,
      };
    }

    case 'SKIP_TOUR':
      return {
        ...state,
        isActive: false,
        currentTour: null,
        currentStep: 0,
        showWelcome: false,
        completedTours: state.currentTour ? [...state.completedTours, state.currentTour] : state.completedTours,
      };

    case 'COMPLETE_TOUR':
      return {
        ...state,
        isActive: false,
        currentTour: null,
        currentStep: 0,
        completedTours: state.currentTour ? [...state.completedTours, state.currentTour] : state.completedTours,
      };

    case 'RESTART_TOUR':
      return {
        ...state,
        isActive: true,
        currentTour: action.tourId,
        currentStep: 0,
        showWelcome: false,
        completedTours: state.completedTours.filter(id => id !== action.tourId),
      };

    case 'MARK_COMPLETED':
      return {
        ...state,
        completedTours: [...state.completedTours.filter(id => id !== action.tourId), action.tourId],
      };

    case 'SHOW_WELCOME':
      return {
        ...state,
        showWelcome: true,
      };

    case 'HIDE_WELCOME':
      return {
        ...state,
        showWelcome: false,
        isFirstTime: false,
      };

    case 'RESET_ONBOARDING':
      return {
        ...initialState,
        isFirstTime: true,
        showWelcome: true,
      };

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.state,
      };

    default:
      return state;
  }
}

// Context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider
interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('marketpro-onboarding');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', state: parsedState });
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      }
    } else {
      // First time user
      dispatch({ type: 'SHOW_WELCOME' });
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('marketpro-onboarding', JSON.stringify(state));
  }, [state]);

  const contextValue: OnboardingContextType = {
    state,
    startTour: (tourId: string) => dispatch({ type: 'START_TOUR', tourId }),
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    skipStep: () => dispatch({ type: 'SKIP_STEP' }),
    skipTour: () => dispatch({ type: 'SKIP_TOUR' }),
    completeTour: () => dispatch({ type: 'COMPLETE_TOUR' }),
    restartTour: (tourId: string) => dispatch({ type: 'RESTART_TOUR', tourId }),
    markAsCompleted: (tourId: string) => dispatch({ type: 'MARK_COMPLETED', tourId }),
    showWelcomeScreen: () => dispatch({ type: 'SHOW_WELCOME' }),
    hideWelcomeScreen: () => dispatch({ type: 'HIDE_WELCOME' }),
    resetOnboarding: () => dispatch({ type: 'RESET_ONBOARDING' }),
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook
export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}