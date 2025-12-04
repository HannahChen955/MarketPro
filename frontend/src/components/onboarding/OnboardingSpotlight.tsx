'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightProps } from './types';

interface ElementBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingSpotlight({
  target,
  isActive,
  borderRadius = 8,
  padding = 8
}: SpotlightProps) {
  const [elementBounds, setElementBounds] = useState<ElementBounds | null>(null);

  useEffect(() => {
    if (!isActive || !target) {
      setElementBounds(null);
      return;
    }

    const updateBounds = () => {
      const element = document.querySelector(target) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        setElementBounds({
          top: rect.top + scrollTop - padding,
          left: rect.left + scrollLeft - padding,
          width: rect.width + (padding * 2),
          height: rect.height + (padding * 2),
        });

        // Scroll element into view if needed
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    };

    // Initial bounds calculation
    updateBounds();

    // Update bounds on scroll and resize
    const handleScroll = () => updateBounds();
    const handleResize = () => updateBounds();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for more accurate element size changes
    let resizeObserver: ResizeObserver | null = null;
    const element = document.querySelector(target);
    if (element && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateBounds);
      resizeObserver.observe(element);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [target, isActive, padding]);

  if (!isActive || !elementBounds) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998 }}
      >
        {/* Background overlay with cutout */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 9998 }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White background */}
              <rect width="100%" height="100%" fill="white" />

              {/* Black cutout for the highlighted element */}
              <rect
                x={elementBounds.left}
                y={elementBounds.top}
                width={elementBounds.width}
                height={elementBounds.height}
                rx={borderRadius}
                ry={borderRadius}
                fill="black"
              />
            </mask>
          </defs>

          {/* Overlay with mask applied */}
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Animated spotlight border */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="absolute"
          style={{
            top: elementBounds.top - 2,
            left: elementBounds.left - 2,
            width: elementBounds.width + 4,
            height: elementBounds.height + 4,
            borderRadius: borderRadius + 2,
            zIndex: 9999,
          }}
        >
          {/* Animated border */}
          <div className="absolute inset-0 rounded-lg">
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-indigo-500"
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-indigo-500"
            style={{ opacity: 0.1 }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}