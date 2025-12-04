'use client';

import React from 'react';
import { useOnboarding } from './OnboardingContext';
import { OnboardingSpotlight } from './OnboardingSpotlight';
import { OnboardingTooltip } from './OnboardingTooltip';
import { WelcomeModal } from './WelcomeModal';
import { getTourById } from './tours';

export function OnboardingTour() {
  const {
    state,
    nextStep,
    prevStep,
    skipStep,
    skipTour,
    completeTour,
    hideWelcomeScreen
  } = useOnboarding();

  const currentTour = state.currentTour ? getTourById(state.currentTour) : null;
  const currentStep = currentTour?.steps[state.currentStep];

  return (
    <>
      {/* Welcome Modal */}
      <WelcomeModal
        open={state.showWelcome}
        onOpenChange={(open) => {
          if (!open) hideWelcomeScreen();
        }}
      />

      {/* Active Tour */}
      {state.isActive && currentTour && currentStep && (
        <>
          {/* Spotlight Effect */}
          <OnboardingSpotlight
            target={currentStep.target || ''}
            isActive={!!currentStep.target && currentStep.position !== 'center'}
          />

          {/* Step Tooltip */}
          <OnboardingTooltip
            step={currentStep}
            isVisible={true}
            currentStepIndex={state.currentStep}
            totalSteps={currentTour.steps.length}
            onNext={() => {
              // Check if this is the last step
              if (state.currentStep === currentTour.steps.length - 1) {
                completeTour();
              } else {
                nextStep();
              }
            }}
            onPrev={prevStep}
            onSkip={() => {
              // Check if this is the last step after skipping
              if (state.currentStep === currentTour.steps.length - 1) {
                completeTour();
              } else {
                skipStep();
              }
            }}
            onSkipTour={skipTour}
            onAction={() => {
              // Optional: Add delay before next step for user to see the result
              setTimeout(() => {
                if (state.currentStep === currentTour.steps.length - 1) {
                  completeTour();
                } else {
                  nextStep();
                }
              }, 1000);
            }}
          />
        </>
      )}
    </>
  );
}