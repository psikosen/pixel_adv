/**
 * Easing functions for animation
 */

/**
 * Linear easing (no easing)
 * @param t Progress (0-1)
 * @returns Progress with linear easing applied
 */
export const linear = (t: number): number => t;

/**
 * Ease-in function (slow start, fast end)
 * @param t Progress (0-1)
 * @returns Progress with ease-in applied
 */
export const easeIn = (t: number): number => t * t;

/**
 * Ease-out function (fast start, slow end)
 * @param t Progress (0-1)
 * @returns Progress with ease-out applied
 */
export const easeOut = (t: number): number => t * (2 - t);

/**
 * Ease-in-out function (slow start, fast middle, slow end)
 * @param t Progress (0-1)
 * @returns Progress with ease-in-out applied
 */
export const easeInOut = (t: number): number => 
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/**
 * Apply easing to a time value
 * @param easing Easing type to apply
 * @param t Time value (0-1)
 * @returns Modified time value with easing applied
 */
export const applyEasing = (
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out',
  t: number
): number => {
  switch (easing) {
    case 'linear':
      return linear(t);
    case 'ease-in':
      return easeIn(t);
    case 'ease-out':
      return easeOut(t);
    case 'ease-in-out':
      return easeInOut(t);
    default:
      return t;
  }
};

/**
 * Apply easing to frame timings
 * @param easing Easing type to apply
 * @param duration Base duration (ms)
 * @param frameCount Total number of frames
 * @param frameIndex Current frame index
 * @returns Modified duration for the current frame
 */
export const getFrameDuration = (
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out',
  baseDuration: number,
  frameCount: number,
  frameIndex: number
): number => {
  if (easing === 'linear' || frameCount <= 1) {
    return baseDuration;
  }
  
  // Calculate normalized position in the animation (0-1)
  const t = frameIndex / (frameCount - 1);
  
  // Calculate the easing multiplier (0.5 - 1.5 range for reasonable timing variations)
  const easingValue = applyEasing(easing, t);
  const multiplier = 0.5 + easingValue;
  
  return baseDuration * multiplier;
};
