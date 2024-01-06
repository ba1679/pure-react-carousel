import PropTypes from 'prop-types';
import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import classNames from 'classnames';

import styles from './index.module.css';

function Carousel({ children }) {
  const [translateX, setTranslateX] = useState(
    window.innerWidth < 768 ? window.innerWidth : 500
  );
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [current, setCurrent] = useState(1);
  const containerRef = useRef();
  const startX = useRef(0);
  const endX = useRef(0);
  const intervalRef = useRef(null);
  const isDragging = useRef(false);

  const updateTranslateXandCurrent = (translateX, current) => {
    if (!containerRef.current) return;
    setTranslateX(translateX);
    setCurrent(current);
  };

  const actionHandler = useCallback(
    (mode) => {
      if (!containerRef.current) return;
      setTransitionDuration(400);
      if (mode === 'pre') {
        if (current === 1) {
          updateTranslateXandCurrent(0, children.length);
        } else {
          updateTranslateXandCurrent(
            containerRef.current.clientWidth * (current - 1),
            (prev) => prev - 1
          );
        }
      } else {
        if (current >= children.length) {
          updateTranslateXandCurrent(
            containerRef.current.clientWidth * (children.length + 1),
            1
          );
        } else {
          updateTranslateXandCurrent(
            containerRef.current.clientWidth * (current + 1),
            (prev) => prev + 1
          );
        }
      }
    },
    [current, children]
  );

  const onDragStart = (e) => {
    if (e.touches) {
      startX.current = e.touches[0].clientX;
    } else {
      isDragging.current = true;
      startX.current = e.clientX;
    }
  };

  const onDrag = (e) => {
    if (!containerRef.current) return;
    if (e.touches) {
      isDragging.current = true;
      endX.current = e.touches[0].clientX;
    } else {
      if (!isDragging.current) return;
      containerRef.current.style.cursor = 'grabbing';
      endX.current = e.clientX;
    }
    const maxDistance = 2;
    const scrolledDistance =
      current * containerRef.current.clientWidth +
      (startX.current - endX.current) / maxDistance;
    setTranslateX(scrolledDistance);
  };

  const onDragEnd = () => {
    if (!containerRef.current || !isDragging.current) return;
    const scrollDistance = Math.abs(endX.current - startX.current);
    const minDistance = 30;
    if (scrollDistance < minDistance) {
      setTranslateX(containerRef.current.clientWidth * current);
      return;
    }

    if (startX.current > endX.current) {
      actionHandler('next');
    } else if (startX.current < endX.current) {
      actionHandler('pre');
    }
    isDragging.current = false;
    containerRef.current.style.cursor = 'grab';
  };

  const slides = () => {
    if (children.length === 1) {
      return <div>{children}</div>;
    }

    // for infinite scroll
    return [
      <Fragment key={`slides-${children.length + 1}`}>
        {children[children.length - 1]}
      </Fragment>,
      ...children,
      <Fragment key={`slides-${children.length + 2}`}>{children[0]}</Fragment>,
    ];
  };

  // for infinite scroll smooth effect
  useEffect(() => {
    const transitionEnd = () => {
      if (!containerRef.current) return;
      if (current === 1 || current === children.length) {
        setTransitionDuration(0);
        const containerWidth = containerRef.current.clientWidth;
        setTranslateX(
          current === 1
            ? containerWidth * current
            : containerWidth * children.length
        );
      }
    };

    document.addEventListener('transitionend', transitionEnd);

    return () => {
      document.removeEventListener('transitionend', transitionEnd);
    };
  }, [current, children]);

  // for autoplay
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      actionHandler('next');
    }, 6000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [actionHandler]);

  return (
    <div className={styles.slideContainer}>
      <div
        ref={containerRef}
        className={styles.childrenContainer}
        onMouseDown={onDragStart}
        onMouseMove={onDrag}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDrag}
        onTouchEnd={onDragEnd}
        style={{
          transform: `translateX(-${translateX}px)`,
          transitionDuration: `${transitionDuration}ms`,
        }}>
        {slides()}
      </div>
      <div className={styles.dotContainer}>
        {children.map((_, index) => {
          return (
            <div
              key={`dot-${index}`}
              className={classNames(styles.dot, {
                [styles.active]: index + 1 === current,
              })}
            />
          );
        })}
      </div>
    </div>
  );
}

Carousel.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
};

export default Carousel;
