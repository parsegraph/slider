import Color from "parsegraph-color";
import { Type, readType } from "./BlockType";

import {
  MIN_BLOCK_WIDTH,
  MIN_BLOCK_HEIGHT,
  HORIZONTAL_SEPARATION_PADDING,
  VERTICAL_SEPARATION_PADDING,
  BUD_RADIUS,
} from "parsegraph-artist";

// Configures graphs to appear grid-like; I call it 'math-mode'.
export const MIN_BLOCK_WIDTH_MATH = BUD_RADIUS * 40;
export const MIN_BLOCK_HEIGHT_MATH = MIN_BLOCK_WIDTH_MATH;
export const HORIZONTAL_SEPARATION_PADDING_MATH = 2;
export const VERTICAL_SEPARATION_PADDING_MATH = 2;

export const FONT_SIZE = 12;

/**
 * The separation between leaf buds and their parents.
 */
export const BUD_LEAF_SEPARATION = 1;

export const BUD_TO_BUD_VERTICAL_SEPARATION = VERTICAL_SEPARATION_PADDING / 2; // BUD_RADIUS * 4.5;

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
  fontColor: Color;
  selectedFontColor: Color;
  fontSize: number;
  letterWidth: number;
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
  fontColor: new Color(0, 0, 0, 1),
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
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
  fontColor: new Color(0, 0, 0, 1),
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
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
  fontColor: new Color(0, 0, 0, 1),
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
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
  fontColor: new Color(0, 0, 0, 1),
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING_MATH,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING_MATH,
};
SLOT_MATH_STYLE.borderColor.setA(1);

const BUD_STYLE = {
  minWidth: BUD_RADIUS * 3,
  minHeight: BUD_RADIUS * 3,
  horizontalPadding: BUD_RADIUS / 2,
  verticalPadding: BUD_RADIUS / 2,
  borderColor: new Color(0.8, 0.8, 0.8, 0.7),
  backgroundColor: new Color(0.9, 0.9, 0.9, 0.9),
  selectedBorderColor: new Color(1, 1, 0, 1),
  selectedBackgroundColor: new Color(1, 1, 0.7, 1),
  brightness: 1.5,
  borderRoundness: BUD_RADIUS * 8,
  borderThickness: BUD_RADIUS * 2,
  fontColor: new Color(0, 0, 0, 1),
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  verticalSeparation: 10.5 * VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING,
};

export function cloneStyle(style: any): any {
  const rv: any = {};
  for (const styleName in style) {
    if (Object.prototype.hasOwnProperty.call(style, styleName)) {
      rv[styleName] = style[styleName];
    }
  }
  return rv;
}

export function copyStyle(type: any): any {
  const rv: any = {};
  const copiedStyle: any = style(type);

  for (const styleName in copiedStyle) {
    if (Object.prototype.hasOwnProperty.call(copiedStyle, styleName)) {
      rv[styleName] = copiedStyle[styleName];
    }
  }

  return rv;
}

export function style(type: Type | string, mathMode?: boolean): any {
  if (typeof type === "string") {
    type = readType(type);
  }
  switch (type as Type) {
    case Type.BUD: {
      return BUD_STYLE;
    }
    case Type.SLOT: {
      return mathMode ? SLOT_MATH_STYLE : SLOT_STYLE;
    }
    case Type.BLOCK: {
      return mathMode ? BLOCK_MATH_STYLE : BLOCK_STYLE;
    }
  }
}

export default BlockStyle;

export {
  BLOCK_STYLE,
  BLOCK_MATH_STYLE,
  SLOT_STYLE,
  SLOT_MATH_STYLE,
  BUD_STYLE,
};
