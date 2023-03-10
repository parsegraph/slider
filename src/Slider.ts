import Artist, { BasicPainted } from "parsegraph-artist";
import Color from "parsegraph-color";
import Size from "parsegraph-size";
import { Axis, DirectionNode } from "parsegraph-direction";

import SliderStyle from "./SliderStyle";
import Method from "parsegraph-method";

export default class Slider extends BasicPainted<Slider> {
  _style: SliderStyle;

  _min: number;
  _max: number;
  _value: number;
  _steps: number;
  _onChange: Method;

  constructor(
    node: DirectionNode<Slider>,
    style: SliderStyle,
    artist: Artist<Slider>
  ) {
    super(node, artist);
    this._style = style;

    this._min = 0;
    this._max = 1;
    this._value = this.mid();
    this._steps = 10;

    this._onChange = new Method();

    this.interact().setDragListener((x, y) => {
      this.updateFromWorld(x, y);
      return true;
    });
  }

  setOnChange(onChange: (val: number) => void) {
    this._onChange.set(onChange);
  }

  setVal(val: number) {
    val = Math.min(this.max(), Math.max(this.min(), val));
    if (this._value === val) {
      return;
    }
    this._value = val;
    this._onChange.call(this._value);
  }

  pct(): number {
    return (this.val() - this.min()) / this.range();
  }

  val(): number {
    return this._value;
  }

  max(): number {
    return this._max;
  }

  setMin(min: number) {
    this._min = min;
    this.setVal(this.val());
  }

  setMax(max: number) {
    this._max = max;
    this.setVal(this.val());
  }

  setSteps(steps: number) {
    this._steps = steps;
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

  lineColor() {
    return this.style().lineColor;
  }

  isVertical() {
    return this.style().isVertical;
  }

  getSeparation(axis: Axis) {
    switch (axis) {
      case Axis.VERTICAL:
        return this.verticalSeparation();
      case Axis.HORIZONTAL:
        return this.horizontalSeparation();
      case Axis.Z:
        return 0;
    }
  }

  size(bodySize?: Size): Size {
    if (!bodySize) {
      bodySize = new Size();
    }

    // Find the size of this node's drawing area.
    const style = this.style();

    const thumbSize = style.thickness;
    bodySize[0] = style.length + thumbSize;
    bodySize[1] = style.thickness;

    if (this.isVertical()) {
      const swp = bodySize[0];
      bodySize[0] = bodySize[1];
      bodySize[1] = swp;
    }
    return bodySize;
  }

  borderThickness(): number {
    return this.style().borderThickness;
  }

  style(): SliderStyle {
    return this._style;
  }

  steps(): number {
    return this._steps;
  }

  updateFromWorld(worldX: number, worldY: number) {
    const cx = this.getLayout().absoluteX();
    const cy = this.getLayout().absoluteY();
    const localX = worldX - cx;
    const localY = worldY - cy;
    if (this.isVertical()) {
      const hh = (this.getLayout().absoluteScale() * this.size().height()) / 2;
      if (localY > hh) {
        this.setVal(this.max());
      } else if (localY < -hh) {
        this.setVal(this.min());
      } else {
        let rawVal = this.min() + (this.range() * (localY + hh)) / (2 * hh);
        if (this.steps() > 0) {
          const stepRange = this.range() / this.steps();
          rawVal =
            this.min() +
            stepRange * Math.round((rawVal - this.min()) / stepRange);
        }
        this.setVal(rawVal);
      }
      return;
    } else {
      const hw = (this.getLayout().absoluteScale() * this.size().width()) / 3;
      if (localX > hw) {
        this.setVal(this.max());
      } else if (localX < -hw) {
        this.setVal(this.min());
      } else {
        let rawVal = this.min() + (this.range() * (localX + hw)) / (2 * hw);
        if (this.steps() > 0) {
          const stepRange = this.range() / this.steps();
          rawVal =
            this.min() +
            stepRange * Math.round((rawVal - this.min()) / stepRange);
        }
        this.setVal(rawVal);
      }
    }
  }

  setStyle(style: SliderStyle): void {
    if (this._style == style) {
      // Ignore idempotent style changes.
      return;
    }
    this._style = style;
    this.invalidateLayout();
  }

  backdropColor(): Color {
    return this.style().backgroundColor;
  }

  verticalSeparation(): number {
    return this.style().verticalSeparation;
  }

  horizontalSeparation(): number {
    const style = this.style();
    return style.horizontalSeparation;
  }
}
