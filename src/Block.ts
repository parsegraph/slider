import Artist, { BUD_RADIUS, PaintedNode, BasicPainted } from "parsegraph-artist";
import Color from "parsegraph-color";
import Size from "parsegraph-size";
import Direction from "parsegraph-direction";

export const LINE_COLOR = new Color(0.8, 0.8, 0.8, 0.6);
export const SELECTED_LINE_COLOR = new Color(0.8, 0.8, 0.8, 1);
export const LINE_THICKNESS = (12 * BUD_RADIUS) / 8;

export default class Block extends BasicPainted<Block> {
  _color: Color;
  _borderColor: Color;
  _focused: boolean;

  constructor(
    color: Color,
    borderColor: Color,
    node: PaintedNode<Block>,
    artist: Artist<Block>
  ) {
    super(node, artist);
    this._focused = false;
    this.interact().setFocusListener(this.onFocus, this);
    this._color = color;
    this._borderColor = borderColor;
  }

  color() {
    return this._color;
  }

  borderColor() {
    return this._borderColor;
  }

  lineColor() {
    return LINE_COLOR;
  }

  borderRoundness() {
    return 10;
  }

  borderThickness() {
    return 5;
  }

  focused() {
    return this._focused;
  }

  onFocus(focus: boolean): boolean {
    // console.log("FOCUSED");
    this._focused = focus;
    this.scheduleRepaint();
    return true;
  }

  getSeparation() {
    return 10;
  }

  size(size?: Size): Size {
    if (!size) {
      size = new Size();
    }
    size.setWidth(100);
    size.setHeight(100);
    if (this.node().hasNode(Direction.INWARD)) {
      const innerSize = this.node()
        .nodeAt(Direction.INWARD)
        .value()
        .getLayout()
        .extentSize();
      size.setWidth(
        Math.max(size.width(), this.getSeparation() * 2 + innerSize.width())
      );
      size.setHeight(
        Math.max(size.width(), this.getSeparation() * 2 + innerSize.height())
      );
    }
    return size;
  }
}
