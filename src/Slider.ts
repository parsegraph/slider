import Artist, { PaintedNode, BasicPainted } from "parsegraph-artist";
import Color from "parsegraph-color";
import Size from "parsegraph-size";
import Direction, { Axis, Alignment } from "parsegraph-direction";

import SliderStyle, {
  BUD_LEAF_SEPARATION,
  BUD_TO_BUD_VERTICAL_SEPARATION,
  copyStyle,
} from "./SliderStyle";
import Font from "parsegraph-font";
import Label, { defaultFont } from "./Label";

export type SliderNode = PaintedNode<Slider>;

export default class Slider extends BasicPainted<Slider> {
  _focused: boolean;
  _label: Label;
  _selected: boolean;
  _style: SliderStyle;
  _labelWeight: number;

  _min: number;
  _max: number;
  _value: number;

  constructor(node: SliderNode, style: SliderStyle, artist: Artist<Slider>) {
    super(node, artist);
    this._focused = false;
    this.interact().setFocusListener(this.onFocus, this);
    this._style = style;
    this._label = null;
    this._selected = false;
    this._labelWeight = 1;

    this._min = 0;
    this._max = 100;
    this._value = this.mid();
  }

  max(): number {
    return this._max;
  }

  min(): number {
    return this._min;
  }

  range(): number {
    return this.max() - this.min();
  }

  mid(): number {
    return this.min() + this.range() / 2;
  }

  horizontalPadding(): number {
    return this.blockStyle().horizontalPadding;
  }

  verticalPadding(): number {
    return this.blockStyle().verticalPadding;
  }

  lineColor() {
    return this.isSelected()
      ? this.blockStyle().selectedLineColor
      : this.blockStyle().lineColor;
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

  getSeparation(axis: Axis, dir: Direction) {
    switch (axis) {
      case Axis.VERTICAL:
        return this.verticalSeparation(dir);
      case Axis.HORIZONTAL:
        return this.horizontalSeparation(dir);
      case Axis.Z:
        switch (this.node().nodeAlignmentMode(Direction.INWARD)) {
          case Alignment.INWARD_VERTICAL:
            return this.verticalPadding() + this.borderThickness();
          default:
            return this.horizontalPadding() + this.borderThickness();
        }
    }
  }

  size(bodySize?: Size): Size {
    bodySize = this.sizeWithoutPadding(bodySize);
    bodySize[0] += 2 * this.horizontalPadding() + 2 * this.borderThickness();
    bodySize[1] += 2 * this.verticalPadding() + 2 * this.borderThickness();
    // console.log("Calculated node size of (" + bodySize[0] + ", " +
    // bodySize[1] + ")");
    return bodySize;
  }

  borderThickness(): number {
    return this.blockStyle().borderThickness;
  }

  blockStyle(): any {
    return this._style;
  }

  setBlockStyle(style: BlockStyle | string): void {
    if (typeof style === "string") {
      style = copyStyle(style);
    }
    if (this._style == style) {
      // Ignore idempotent style changes.
      return;
    }
    this._style = style as BlockStyle;
    this.invalidateLayout();
  }

  backdropColor(): Color {
    return this.isSelected()
      ? this.blockStyle().selectedBackgroundColor
      : this.blockStyle().backgroundColor;
  }

  label(): string {
    const l = this.realLabel();
    if (!l) {
      return null;
    }
    return l.getText();
  }

  glyphCount(counts: any, pagesPerTexture: number): number {
    const l = this.realLabel();
    if (!l) {
      return 0;
    }
    return l.glyphCount(counts, pagesPerTexture);
  }

  realLabel(): Label {
    return this._label;
  }

  setLabel(text: string, font?: Font): void {
    if (!font) {
      font = defaultFont();
    }
    if (!this._label) {
      this._label = new Label(font);
    }
    this._label.setText(text);
    this.invalidateLayout();
  }

  labelWeight(): number {
    return this._labelWeight;
  }

  setLabelWeight(labelWeight: number) {
    this._labelWeight = labelWeight;
  }

  isSelected(): boolean {
    return this._selected;
  }

  setSelected(selected: boolean): void {
    // console.log(new Error("setSelected(" + selected + ")"));
    this._selected = selected;
  }

  sizeWithoutPadding(bodySize?: Size): Size {
    if (!bodySize) {
      // console.log(new Error("Creating size"));
      bodySize = new Size();
    }

    // Find the size of this node's drawing area.
    const style = this.blockStyle();

    const label = this.realLabel();
    if (label && !label.isEmpty()) {
      const scaling = style.fontSize / label.font().fontSize();
      bodySize[0] = label.width() * scaling;
      bodySize[1] = label.height() * scaling;
      if (isNaN(bodySize[0]) || isNaN(bodySize[1])) {
        throw new Error("Label returned a NaN size.");
      }
    } else if (!bodySize) {
      // console.log(new Error("Creating size"));
      bodySize = new Size(style.minWidth, style.minHeight);
    } else {
      bodySize[0] = style.minWidth;
      bodySize[1] = style.minHeight;
    }

    const node = this.node();
    if (node.hasNode(Direction.INWARD)) {
      const nestedNode = node.nodeAt(Direction.INWARD);
      const nestedSize = nestedNode.value().getLayout().extentSize();
      const scale = nestedNode.state().scale();

      if (
        node.nodeAlignmentMode(Direction.INWARD) == Alignment.INWARD_VERTICAL
      ) {
        // Align vertical.
        bodySize.setWidth(
          Math.max(bodySize.width(), scale * nestedSize.width())
        );

        if (this.label()) {
          // Allow for the content's size.
          bodySize.setHeight(
            Math.max(
              style.minHeight,
              bodySize.height() +
                this.verticalPadding() +
                scale * nestedSize.height()
            )
          );
        } else {
          bodySize.setHeight(
            Math.max(
              bodySize.height(),
              scale * nestedSize.height() + 2 * this.verticalPadding()
            )
          );
        }
      } else {
        // Align horizontal.
        if (this.label()) {
          // Allow for the content's size.
          bodySize.setWidth(
            bodySize.width() +
              this.horizontalPadding() +
              scale * nestedSize.width()
          );
        } else {
          bodySize.setWidth(
            Math.max(bodySize.width(), scale * nestedSize.width())
          );
        }

        bodySize.setHeight(
          Math.max(
            bodySize.height(),
            scale * nestedSize.height() + 2 * this.verticalPadding()
          )
        );
      }
    }

    // Buds appear circular
    if (this.isBud()) {
      const aspect = bodySize.width() / bodySize.height();
      if (aspect < 2 && aspect > 1 / 2) {
        bodySize.setWidth(Math.max(bodySize.width(), bodySize.height()));
        bodySize.setHeight(bodySize.width());
      }
    }

    bodySize[0] = Math.max(style.minWidth, bodySize[0]);
    bodySize[1] = Math.max(style.minHeight, bodySize[1]);
    return bodySize;
  }

  isBud() {
    return this.blockStyle().bud;
  }

  verticalSeparation(direction: Direction): number {
    const node = this.node();
    if (
      this.isBud() &&
      node.nodeAt(direction)?.value() instanceof Block &&
      node.nodeAt(direction).value().isBud()
    ) {
      return (
        this.blockStyle().verticalSeparation + BUD_TO_BUD_VERTICAL_SEPARATION
      );
    }
    return this.blockStyle().verticalSeparation;
  }

  horizontalSeparation(direction: Direction): number {
    const node = this.node();
    const style = this.blockStyle();

    if (
      node.hasNode(direction) &&
      node.nodeAt(direction).value() instanceof Block &&
      node.nodeAt(direction).value().isBud() &&
      !node.nodeAt(direction).hasAnyNodes()
    ) {
      return BUD_LEAF_SEPARATION * style.horizontalSeparation;
    }
    return style.horizontalSeparation;
  }
}
