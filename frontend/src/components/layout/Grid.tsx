'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Grid Container
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  };
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12'
};

const responsiveColsClasses = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    7: 'sm:grid-cols-7',
    8: 'sm:grid-cols-8',
    9: 'sm:grid-cols-9',
    10: 'sm:grid-cols-10',
    11: 'sm:grid-cols-11',
    12: 'sm:grid-cols-12'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
    9: 'md:grid-cols-9',
    10: 'md:grid-cols-10',
    11: 'md:grid-cols-11',
    12: 'md:grid-cols-12'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    7: 'lg:grid-cols-7',
    8: 'lg:grid-cols-8',
    9: 'lg:grid-cols-9',
    10: 'lg:grid-cols-10',
    11: 'lg:grid-cols-11',
    12: 'lg:grid-cols-12'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    7: 'xl:grid-cols-7',
    8: 'xl:grid-cols-8',
    9: 'xl:grid-cols-9',
    10: 'xl:grid-cols-10',
    11: 'xl:grid-cols-11',
    12: 'xl:grid-cols-12'
  }
};

const gapClasses = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12'
};

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    className,
    cols = 1,
    gap = 'md',
    responsive,
    children,
    ...props
  }, ref) => {
    const responsiveClasses = responsive ? [
      responsive.sm ? responsiveColsClasses.sm[responsive.sm] : '',
      responsive.md ? responsiveColsClasses.md[responsive.md] : '',
      responsive.lg ? responsiveColsClasses.lg[responsive.lg] : '',
      responsive.xl ? responsiveColsClasses.xl[responsive.xl] : ''
    ].filter(Boolean).join(' ') : '';

    return (
      <div
        className={cn(
          'grid',
          colsClasses[cols],
          gapClasses[gap],
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item
export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  end?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  responsive?: {
    sm?: {
      span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
      start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
      end?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    };
    md?: {
      span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
      start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
      end?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    };
    lg?: {
      span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
      start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
      end?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    };
    xl?: {
      span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
      start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
      end?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    };
  };
}

const spanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
  full: 'col-span-full'
};

const startClasses = {
  1: 'col-start-1',
  2: 'col-start-2',
  3: 'col-start-3',
  4: 'col-start-4',
  5: 'col-start-5',
  6: 'col-start-6',
  7: 'col-start-7',
  8: 'col-start-8',
  9: 'col-start-9',
  10: 'col-start-10',
  11: 'col-start-11',
  12: 'col-start-12',
  13: 'col-start-13'
};

const endClasses = {
  1: 'col-end-1',
  2: 'col-end-2',
  3: 'col-end-3',
  4: 'col-end-4',
  5: 'col-end-5',
  6: 'col-end-6',
  7: 'col-end-7',
  8: 'col-end-8',
  9: 'col-end-9',
  10: 'col-end-10',
  11: 'col-end-11',
  12: 'col-end-12',
  13: 'col-end-13'
};

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({
    className,
    span,
    start,
    end,
    responsive,
    children,
    ...props
  }, ref) => {
    const getResponsiveClass = (breakpoint: string, property: string, value: any) => {
      if (property === 'span') {
        return `${breakpoint}:col-span-${value === 'full' ? 'full' : value}`;
      } else if (property === 'start') {
        return `${breakpoint}:col-start-${value}`;
      } else if (property === 'end') {
        return `${breakpoint}:col-end-${value}`;
      }
      return '';
    };

    const responsiveClasses = responsive ? [
      responsive.sm?.span ? getResponsiveClass('sm', 'span', responsive.sm.span) : '',
      responsive.sm?.start ? getResponsiveClass('sm', 'start', responsive.sm.start) : '',
      responsive.sm?.end ? getResponsiveClass('sm', 'end', responsive.sm.end) : '',
      responsive.md?.span ? getResponsiveClass('md', 'span', responsive.md.span) : '',
      responsive.md?.start ? getResponsiveClass('md', 'start', responsive.md.start) : '',
      responsive.md?.end ? getResponsiveClass('md', 'end', responsive.md.end) : '',
      responsive.lg?.span ? getResponsiveClass('lg', 'span', responsive.lg.span) : '',
      responsive.lg?.start ? getResponsiveClass('lg', 'start', responsive.lg.start) : '',
      responsive.lg?.end ? getResponsiveClass('lg', 'end', responsive.lg.end) : '',
      responsive.xl?.span ? getResponsiveClass('xl', 'span', responsive.xl.span) : '',
      responsive.xl?.start ? getResponsiveClass('xl', 'start', responsive.xl.start) : '',
      responsive.xl?.end ? getResponsiveClass('xl', 'end', responsive.xl.end) : ''
    ].filter(Boolean).join(' ') : '';

    return (
      <div
        className={cn(
          span ? spanClasses[span] : '',
          start ? startClasses[start] : '',
          end ? endClasses[end] : '',
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

// Flex utilities
export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const directionClasses = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse'
};

const wrapClasses = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse'
};

const justifyClasses = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

const alignClasses = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch'
};

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({
    className,
    direction = 'row',
    wrap = 'nowrap',
    justify = 'start',
    align = 'start',
    gap = 'none',
    children,
    ...props
  }, ref) => {
    return (
      <div
        className={cn(
          'flex',
          directionClasses[direction],
          wrapClasses[wrap],
          justifyClasses[justify],
          alignClasses[align],
          gapClasses[gap],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

export { Grid, GridItem, Flex };