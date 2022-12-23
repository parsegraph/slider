import Color from "parsegraph-color";
import {style} from 'parsegraph-block';

const BUD_RADIUS = style('u').minWidth;
const MIN_BLOCK_WIDTH = style('b').minWidth;
const HORIZONTAL_SEPARATION_PADDING = style('b').horizontalSeparation;
const VERTICAL_SEPARATION_PADDING = style('b').verticalSeparation;

export const FONT_SIZE = 18;

/**
 * The separation between leaf buds and their parents.
 */
export const BUD_LEAF_SEPARATION = 1;

export const BUD_TO_BUD_VERTICAL_SEPARATION = VERTICAL_SEPARATION_PADDING / 2; // BUD_RADIUS * 4.5;

type SliderStyle = {
  length: number;
  thickness: number;
  isVertical: boolean;
  borderColor: Color;
  backgroundColor: Color;
  borderRoundness: number;
  borderThickness: number;
  verticalSeparation: number;
  horizontalSeparation: number;
  lineColor: Color;
  thumbColor: Color;
  thumbBackgroundColor: Color;
  trackThickness: number;
  markThickness: number;
};

export const LINE_COLOR = style('b').lineColor;//new Color(0.4, 0.4, 0.4, 0.5);
export const THUMB_COLOR = style('b').lineColor;
export const THUMB_BACKGROUND_COLOR = style('b').backgroundColor;
export const SELECTED_LINE_COLOR = new Color(0.8, 0.8, 0.8, 1);
export const LINE_THICKNESS = BUD_RADIUS / 8;

const BACKGROUND_COLOR = new Color(100/ 255, 100/ 255, 100/ 255, 0.2);

const lineColor = LINE_COLOR;
const borderColor = lineColor;

const BORDER_THICKNESS = 0.05;

const DEFAULT_STYLE: SliderStyle = {
  length: 3 * MIN_BLOCK_WIDTH,
  thickness: 2 * BUD_RADIUS,
  isVertical: false,
  borderColor: borderColor,
  backgroundColor: BACKGROUND_COLOR,
  borderRoundness: BUD_RADIUS * 4,
  borderThickness: BORDER_THICKNESS,
  trackThickness: LINE_THICKNESS,
  markThickness: LINE_THICKNESS/2,
  lineColor: lineColor,
  thumbColor: THUMB_COLOR,
  thumbBackgroundColor: THUMB_BACKGROUND_COLOR,
  verticalSeparation: VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: HORIZONTAL_SEPARATION_PADDING,
};

const VERTICAL_STYLE: SliderStyle = {
  length: DEFAULT_STYLE.length,
  thickness: DEFAULT_STYLE.thickness,
  isVertical: true,
  borderColor: borderColor,
  backgroundColor: BACKGROUND_COLOR,
  borderRoundness: DEFAULT_STYLE.borderRoundness,
  borderThickness: BORDER_THICKNESS,
  trackThickness: DEFAULT_STYLE.trackThickness,
  markThickness: DEFAULT_STYLE.markThickness,
  lineColor: lineColor,
  thumbColor: THUMB_COLOR,
  thumbBackgroundColor: DEFAULT_STYLE.thumbBackgroundColor,
  verticalSeparation: VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: HORIZONTAL_SEPARATION_PADDING,
};

export default SliderStyle;

export { DEFAULT_STYLE, VERTICAL_STYLE };
