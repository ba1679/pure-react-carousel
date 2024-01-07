export const carouselReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CAROUSEL':
      return {
        ...state,
        translateX: action.payload.translateX,
        current: action.payload.current
      };
    case 'NEXT_CAROUSEL':
      return {
        ...state,
        translateX: action.payload.translateX,
        current: state.current + 1
      };
    case 'PREV_CAROUSEL':
      return {
        ...state,
        translateX: action.payload.translateX,
        current: state.current - 1
      };
    case 'UPDATE_TRANSITION_DURATION':
      return {
        ...state,
        transitionDuration: action.payload
      };
    case 'UPDATE_TRANSLATE_X':
      return {
        ...state,
        translateX: action.payload
      };
    default:
      return state;
  }
}