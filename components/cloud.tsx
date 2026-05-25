/**
 * Cloud — the single source of truth for the white cloud puff SVG used
 * across every sky-band hero in the product (catalogue, detail pages,
 * account, signin). Lifting one definition keeps the cloud shape,
 * fill colour, and proportions identical everywhere — see the user
 * directive about consistent "blue bg + clouds across pages".
 *
 * Shape is three overlapping ellipses inside a 240×100 viewBox; the
 * rendered height is always `size * 0.42` so it scales without
 * distortion. Default fill is solid white; the `opacity` prop lets a
 * page mute the cloud where it sits behind text or interactive
 * elements without changing its hue.
 */

import Svg, { Ellipse } from 'react-native-svg';

interface Props {
  /** Width in pixels — height is derived as `width * 0.42`. */
  size: number;
}

export function Cloud({ size }: Props) {
  return (
    <Svg width={size} height={size * 0.42} viewBox="0 0 240 100">
      <Ellipse cx={60} cy={65} rx={50} ry={32} fill="white" />
      <Ellipse cx={115} cy={50} rx={55} ry={38} fill="white" />
      <Ellipse cx={170} cy={60} rx={45} ry={32} fill="white" />
    </Svg>
  );
}
