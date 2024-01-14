import PropTypes from 'prop-types';
import { useRef, useEffect, useCallback, useReducer, Fragment } from 'react';
import classNames from 'classnames';
import { carouselReducer } from './reducer';

import styles from './index.module.css';

function ArrowBtn({ onClick, direction = 'left' }) {
  return (
    <button
      className={classNames(styles.arrowBtn, {
        [styles.right]: direction !== 'left',
      })}
      onClick={onClick}>
      {direction === 'left' ? '<' : '>'}
    </button>
  );
}
const initialState = {
  translateX: window.innerWidth < 768 ? window.innerWidth : 500,
  current: 1,
  transitionDuration: 0,
};
function Carousel({ children, autoPlay = false, arrow = false }) {
  const [state, dispatch] = useReducer(carouselReducer, initialState);
  const containerRef = useRef();
  const startX = useRef(0);
  const endX = useRef(0);
  const intervalRef = useRef(null);
  const isDragging = useRef(false);

  const handleDragEnd = () => {
    isDragging.current = false;
    containerRef.current.style.cursor = 'grab';
    endX.current = 0;
  };

  const actionHandler = useCallback(
    (mode) => {
      if (!containerRef.current) return;
      dispatch({ type: 'UPDATE_TRANSITION_DURATION', payload: 400 });
      if (mode === 'pre') {
        if (state.current === 1) {
          dispatch({
            type: 'UPDATE_CAROUSEL',
            payload: { translateX: 0, current: children.length },
          });
        } else {
          dispatch({
            type: 'PREV_CAROUSEL',
            payload: {
              translateX:
                containerRef.current.clientWidth * (state.current - 1),
            },
          });
        }
      } else {
        if (state.current >= children.length) {
          dispatch({
            type: 'UPDATE_CAROUSEL',
            payload: {
              translateX:
                containerRef.current.clientWidth * (children.length + 1),
              current: 1,
            },
          });
        } else {
          dispatch({
            type: 'NEXT_CAROUSEL',
            payload: {
              translateX:
                containerRef.current.clientWidth * (state.current + 1),
            },
          });
        }
      }
      handleDragEnd();
    },
    [state, children]
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
      state.current * containerRef.current.clientWidth +
      (startX.current - endX.current) / maxDistance;
    dispatch({ type: 'UPDATE_TRANSLATE_X', payload: scrolledDistance });
  };

  const onDragEnd = () => {
    if (startX.current === endX.current || endX.current === 0) {
      return handleDragEnd();
    }
    if (!containerRef.current || !isDragging.current) return;
    const scrollDistance = Math.abs(endX.current - startX.current);
    const minDistance = 30;
    if (scrollDistance < minDistance) {
      dispatch({
        type: 'UPDATE_TRANSLATE_X',
        payload: containerRef.current.clientWidth * state.current,
      });
      handleDragEnd();
      return;
    }
    if (startX.current > endX.current) {
      actionHandler('next');
    } else if (startX.current < endX.current) {
      actionHandler('pre');
    }
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
      if (state.current === 1 || state.current === children.length) {
        dispatch({ type: 'UPDATE_TRANSITION_DURATION', payload: 0 });
        const containerWidth = containerRef.current.clientWidth;
        dispatch({
          type: 'UPDATE_TRANSLATE_X',
          payload:
            state.current === 1
              ? containerWidth * state.current
              : containerWidth * children.length,
        });
      }
    };

    document.addEventListener('transitionend', transitionEnd);

    return () => {
      document.removeEventListener('transitionend', transitionEnd);
    };
  }, [state, children]);

  // for autoplay
  useEffect(() => {
    if (!autoPlay) return;
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
  }, [actionHandler, autoPlay]);

  return (
    <div className={styles.slideContainer} style={{ position: 'relative' }}>
      {arrow && (
        <>
          <ArrowBtn onClick={() => actionHandler('pre')} />
          <ArrowBtn onClick={() => actionHandler('next')} direction='right' />
        </>
      )}
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
          transform: `translateX(-${state.translateX}px)`,
          transitionDuration: `${state.transitionDuration}ms`,
        }}>
        {slides()}
      </div>
      <div className={styles.dotContainer}>
        {children.map((_, index) => {
          return (
            <div
              key={`dot-${index}`}
              className={classNames(styles.dot, {
                [styles.active]: index + 1 === state.current,
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
  autoPlay: PropTypes.bool,
  arrow: PropTypes.bool,
};

ArrowBtn.propTypes = {
  onClick: PropTypes.func.isRequired,
  direction: PropTypes.string,
};

export default Carousel;
