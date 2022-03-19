import Font from 'parsegraph-font';
import Size from 'parsegraph-size';
import {Projector} from 'parsegraph-projector';
import Color from 'parsegraph-color';
import {FONT_SIZE} from './BlockStyle'

let measureCanvas: HTMLCanvasElement = null;
let measureCtx: CanvasRenderingContext2D = null;
export function defaultCtx(font: Font) {
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
    measureCtx = measureCanvas.getContext("2d");
  }
  measureCtx.font = font.fontString();
  return measureCtx;
}

let DEFAULT_FONT: Font = null;
export function defaultFont() {
  if (!DEFAULT_FONT) {
    DEFAULT_FONT = new Font(FONT_SIZE, "sans-serif", "white");
  }
  return DEFAULT_FONT;
}

export default class Label {
  _x: number;
  _y: number;
  _scale: number;
  _text: string;
  _font: Font;
  _measuredSize: Size;
  _measured: boolean;

  constructor(font: Font = defaultFont(), text: string = "") {
    this._font = font;
    this._text = text;
    this._measuredSize = new Size();
    this._measured = false;
    this._x = 0;
    this._y = 0;
    this._scale = 1;
  }

  font() {
    return this._font;
  }

  private measure():void {
    if (this._measured) {
      return;
    }
    const ctx = defaultCtx(this.font());
    const bounds = ctx.measureText(this.getText());
    this._measuredSize.setSize(
      bounds.width,
      bounds.actualBoundingBoxAscent +
      bounds.actualBoundingBoxDescent);
    console.log(bounds.width);
    this._measured = true;
  }

  width() {
    this.measure();
    return this._measuredSize.width();
  }

  height() {
    this.measure();
    return this._measuredSize.height();
  }

  isEmpty() {
    return !this._text || this._text.length === 0;
  }

  getText() {
    return this._text;
  }

  setText(text: string) {
    this._text = text;
  }

  glyphCount(counts: any, pagesPerTexture: number): number {
    console.log(counts, pagesPerTexture);
    return this._text.length;
  }

  setPos(x: number, y: number, scale: number) {
    this._x = x;
    this._y = y;
    this._scale = scale;
  }

  paint(proj: Projector, fontColor: Color) {
    const ctx = proj.overlay();
    ctx.textBaseline = "middle";
    ctx.font = this.font().fontString();
    ctx.fillStyle = fontColor.asRGBA();
    ctx.fillText(this.getText(), this._x, this._y);
    console.log(this._x, this._y);
  }
}
