import Color from "parsegraph-color";

import {
  MIN_BLOCK_WIDTH,
  MIN_BLOCK_HEIGHT,
  HORIZONTAL_SEPARATION_PADDING,
  VERTICAL_SEPARATION_PADDING,
  BUD_RADIUS,
} from "parsegraph-artist";

// Configures graphs to appear grid-like; I call it 'math-mode'.
const MIN_BLOCK_WIDTH_MATH = BUD_RADIUS * 40;
const MIN_BLOCK_HEIGHT_MATH = MIN_BLOCK_WIDTH_MATH;
const HORIZONTAL_SEPARATION_PADDING_MATH = 2;
const VERTICAL_SEPARATION_PADDING_MATH = 2;

type BlockStyle = {
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
  verticalSeparation: number;
  horizontalSeparation: number;
};

const BLOCK_STYLE: BlockStyle = {
  mathMode: false,
  minWidth: MIN_BLOCK_WIDTH,
  minHeight: MIN_BLOCK_HEIGHT,
  horizontalPadding: 3 * BUD_RADIUS,
  verticalPadding: 0.5 * BUD_RADIUS,
  borderColor: new Color(0.6, 1, 0.6, 1.0),
  backgroundColor: new Color(0.75, 1, 0.75, 1.0),
  selectedBorderColor: new Color(0.8, 0.8, 1, 1),
  selectedBackgroundColor: new Color(0.75, 0.75, 1, 1),
  brightness: 0.75,
  borderRoundness: BUD_RADIUS * 3,
  borderThickness: BUD_RADIUS * 2,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING,
};

const BLOCK_MATH_STYLE: BlockStyle = {
  mathMode: true,
  minWidth: MIN_BLOCK_WIDTH_MATH,
  minHeight: MIN_BLOCK_HEIGHT_MATH,
  horizontalPadding: 2 * BUD_RADIUS,
  verticalPadding: 0.5 * BUD_RADIUS,
  borderColor: new Color(0.6, 1, 0.6, 1),
  backgroundColor: new Color(0.75, 1, 0.75, 1),
  selectedBorderColor: new Color(0.8, 0.8, 1, 1),
  selectedBackgroundColor: new Color(0.75, 0.75, 1, 1),
  brightness: 0.75,
  borderRoundness: BUD_RADIUS * 3,
  borderThickness: BUD_RADIUS * 2,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING_MATH,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING_MATH,
};

const SLOT_STYLE: BlockStyle = {
  mathMode: false,
  minWidth: MIN_BLOCK_WIDTH,
  minHeight: MIN_BLOCK_HEIGHT,
  horizontalPadding: 3 * BUD_RADIUS,
  verticalPadding: 0.5 * BUD_RADIUS,
  borderColor: new Color(0.5, 0.5, 0.5, 0.5),
  backgroundColor: new Color(0.75, 0.75, 1, 0.5),
  selectedBorderColor: new Color(0.95, 1, 0.95, 1),
  selectedBackgroundColor: new Color(0.9, 1, 0.9, 1),
  brightness: 0.75,
  borderRoundness: BUD_RADIUS * 3,
  borderThickness: BUD_RADIUS * 2,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING,
};

const SLOT_MATH_STYLE = {
  mathMode: true,
  minWidth: MIN_BLOCK_WIDTH_MATH,
  minHeight: MIN_BLOCK_HEIGHT_MATH,
  horizontalPadding: 2 * BUD_RADIUS,
  verticalPadding: 0.5 * BUD_RADIUS,
  borderRoundness: BUD_RADIUS * 3,
  borderThickness: BUD_RADIUS * 2,
  borderColor: SLOT_STYLE.borderColor,
  backgroundColor: SLOT_STYLE.backgroundColor,
  selectedBorderColor: SLOT_STYLE.selectedBorderColor,
  selectedBackgroundColor: SLOT_STYLE.selectedBackgroundColor,
  brightness: SLOT_STYLE.brightness,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING_MATH,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING_MATH,
};
SLOT_MATH_STYLE.borderColor.setA(1);

export default BlockStyle;

export { BLOCK_STYLE, BLOCK_MATH_STYLE, SLOT_STYLE, SLOT_MATH_STYLE };
