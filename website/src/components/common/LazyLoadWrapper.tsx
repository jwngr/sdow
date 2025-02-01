import React, {Suspense, useEffect, useRef, useState} from 'react';

export const LazyLoadWrapper: React.FC<{
  readonly children: React.ReactNode;
  readonly fallback: React.ReactNode;
  readonly rootMargin?: string;
}> = (args) => {
  const {children, fallback, rootMargin = '200px'} = args;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {rootMargin}
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};
