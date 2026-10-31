import { LOGO_DARK, LOGO_LIGHT } from '../brand/BrandMark';

/**
 * Square crops of the MQ crest from the official artwork, in source pixels.
 * Each square stops above the wordmark, and the artwork is only ever scaled
 * uniformly, so the crest keeps its original proportions.
 */
export const CREST = {
  dark: { src: LOGO_DARK, w: 1600, h: 1067, cx: 815, cy: 362, size: 556, bg: '#060b1a' },
  light: { src: LOGO_LIGHT, w: 1451, h: 1084, cx: 752, cy: 462, size: 880, bg: '#ffffff' },
};
