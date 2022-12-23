import Color from "parsegraph-color";

import {
  MIN_BLOCK_WIDTH,
  MIN_BLOCK_HEIGHT,
  HORIZONTAL_SEPARATION_PADDING,
  VERTICAL_SEPARATION_PADDING,
  BUD_RADIUS,
} from "parsegraph-artist";

export const HORIZONTAL_SEPARATION_PADDING_MATH = 2;
export const VERTICAL_SEPARATION_PADDING_MATH = 2;

export const FONT_SIZE = 18;

/**
 * The separation between leaf buds and their parents.
 */
export const BUD_LEAF_SEPARATION = 1;

export const BUD_TO_BUD_VERTICAL_SEPARATION = VERTICAL_SEPARATION_PADDING / 2; // BUD_RADIUS * 4.5;

type SliderStyle = {
  mathMode: boolean;
  minWidth: number;
  minHeight: number;
  horizontalPadding: number;
  verticalPadding: number;
  borderColor: Color;
  backgroundColor: Color;
  selectedBorderColor: Color;
  selectedBackgroundColor: Color;
  brightness: number;
  borderRoundness: number;
  borderThickness: number;
  fontColor: Color;
  selectedFontColor: Color;
  fontSize: number;
  letterWidth: number;
  verticalSeparation: number;
  horizontalSeparation: number;
  lineColor: Color;
  selectedLineColor: Color;
};

export const LINE_COLOR = new Color(0.5, 0.4, 0.4, 0.5);
export const SELECTED_LINE_COLOR = new Color(0.8, 0.8, 0.8, 1);
export const LINE_THICKNESS = BUD_RADIUS / 4;

const BACKGROUND_COLOR = new Color(250 / 255, 244 / 255, 236 / 255, 0.2);
const FONT_COLOR = new Color(0.125, 0.125, 0.125, 1);

const lineColor = LINE_COLOR;
const selectedLineColor = lineColor;
const borderColor = lineColor;
const selectedBorderColor = lineColor;

const BORDER_THICKNESS = 0.05;

const DEFAULT_STYLE: SliderStyle = {
  mathMode: false,
  minWidth: MIN_BLOCK_WIDTH,
  minHeight: MIN_BLOCK_HEIGHT,
  horizontalPadding: 4 * BUD_RADIUS,
  verticalPadding: BUD_RADIUS,
  borderColor: borderColor,
  backgroundColor: BACKGROUND_COLOR,
  selectedBorderColor: selectedBorderColor,
  selectedBackgroundColor: new Color(0.75, 0.75, 1, 1),
  brightness: 0.75,
  borderRoundness: BUD_RADIUS * 3,
  borderThickness: BORDER_THICKNESS,
  fontColor: FONT_COLOR,
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  lineColor: lineColor,
  selectedLineColor: selectedLineColor,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: 1 * HORIZONTAL_SEPARATION_PADDING,
};

export default SliderStyle;

export { DEFAULT_STYLE };
