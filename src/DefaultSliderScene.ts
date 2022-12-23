import Direction, {
  Alignment,
  forEachCardinalDirection,
  isVerticalDirection,
  directionSign,
} from "parsegraph-direction";

import BlockPainter, {
  CanvasBlockPainter,
  BlockType,
} from "parsegraph-blockpainter";
import SliderNode from "./SliderNode";
import { LINE_THICKNESS } from "./SliderStyle";
import Size from "parsegraph-size";
import Rect from "parsegraph-rect";
import Color from "parsegraph-color";
import log, { logEnterc, logLeave } from "parsegraph-log";
import { Projector } from "parsegraph-projector";
import SliderScene from "./SliderScene";

export default class DefaultSliderScene extends SliderScene {
  _backgroundColor: Color;
  _blockPainter: BlockPainter;
  _renderBlocks: boolean;
  _renderText: boolean;
  _mass: number;
  _consecutiveRenders: number;
  _renderLines: boolean;
  _forceSimple: boolean;
  bodySize: Size;

  consecutiveRenders(): number {
    return this._consecutiveRenders;
  }

  constructor(projector: Projector, blockType: BlockType = BlockType.SQUARE) {
    super(projector);

    this._backgroundColor = new Color(0, 0, 0, 0);
    this._forceSimple = false;

    this._blockPainter = new CanvasBlockPainter(projector.overlay(), blockType);
    this._renderBlocks = true;

    this._renderText = true;

    this.bodySize = new Size();
  }

  bounds(): Rect {
    return this._blockPainter.bounds();
  }

  projector(): Projector {
    return this._projector;
  }

  gl() {
    return this.projector().glProvider()?.gl();
  }

  setBackground(r: any, ...args: any[]): void {
    if (args.length > 0) {
      return this.setBackground(new Color(r, ...args));
    }
    this._backgroundColor = r;
  }

  backgroundColor(): Color {
    return this._backgroundColor;
  }

  clear(): void {
    this._blockPainter.clear();
  }

  weight(): number {
    return this._mass * this._consecutiveRenders;
  }

  initBlockBuffer(counts: any) {
    this._consecutiveRenders = 0;
    this._mass = counts.numBlocks;
    this._blockPainter.clear();
    this._blockPainter.initBuffer(counts.numBlocks);
  }

  countNode(node: SliderNode, counts: any): void {
    if (!counts.numBlocks) {
      counts.numBlocks = 0;
    }

    forEachCardinalDirection((direction: Direction) => {
      if (node.parentDirection() == direction) {
        return;
      }
      if (node.hasChild(direction)) {
        // Count one for the line
        ++counts.numBlocks;
      }
    });

    // Count the slider BG, track, the thumb, and the steps
    counts.numBlocks += 3;
    if (node.value().steps() > 0) {
      counts.numBlocks += node.value().steps() + 1;
    }
  }

  paint(): boolean {
    logEnterc("DefaultNodePainter paints", "Painting paint group");
    const counts: { [key: string]: number } = {};
    this.sliders().forEach((node) => {
      log("Counting node {0}", node);
      this.countNode(node, counts);
    });
    log("Glyphs: {0}", counts.numGlyphs);
    this.initBlockBuffer(counts);
    this.sliders().forEach((node) => {
      this.drawNode(node);
    });

    logLeave();
    return false;
  }

  drawNode(node: SliderNode) {
    // const gl = this.gl();
    // if (gl.isContextLost()) {
    // return;
    // }
    // checkGLError(gl, "Before Node drawNode");
    log("Drawing node {0}", node);

    this.paintLines(node);
    this.paintBlock(node);
    // checkGLError(gl, "After Node drawNode");
  }

  drawLine(direction: Direction, node: SliderNode) {
    if (node.parentDirection() == direction) {
      return;
    }
    if (!node.hasChild(direction)) {
      // Do not draw lines unless there is a node.
      return;
    }
    const directionData = node.neighborAt(direction);

    const block = node.value();
    const color = block.style().lineColor.premultiply(this.backgroundColor());

    const layout = block.getLayout();

    const painter = this._blockPainter;
    painter.setBorderColor(color);
    painter.setBackgroundColor(color);

    const parentScale = layout.groupScale();
    const scale = directionData.getNode().value().getLayout().groupScale();
    if (typeof scale !== "number" || isNaN(scale)) {
      throw new Error(
        directionData.node + "'s groupScale must be a number but was " + scale
      );
    }

    const thickness =
      LINE_THICKNESS * scale * directionData.getNode().state().scale();
    if (isVerticalDirection(direction)) {
      const length =
        directionSign(direction) *
        parentScale *
        (directionData.lineLength - layout.size().height() / 2);
      painter.drawBlock(
        layout.groupX(),
        layout.groupY() +
          length / 2 +
          (parentScale * directionSign(direction) * layout.size().height()) / 2,
        thickness,
        Math.abs(length),
        0,
        0
      );
    } else {
      // Horizontal line.
      const length =
        directionSign(direction) *
        parentScale *
        (directionData.lineLength - layout.size().width() / 2);
      painter.drawBlock(
        layout.groupX() +
          length / 2 +
          (parentScale * directionSign(direction) * layout.size().width()) / 2,
        layout.groupY(),
        Math.abs(length),
        thickness,
        0,
        0
      );
    }
  }

  paintLines(node: SliderNode) {
    forEachCardinalDirection((dir: Direction) => {
      this.drawLine(dir, node);
    });
  }

  paintBlock(node: SliderNode): void {
    const block = node.value();
    const layout = block.getLayout();
    const style = block.style();
    const painter = this._blockPainter;
    if (!style) {
      throw new Error("Block has no style");
    }

    painter.setBorderColor(
      style.borderColor // .premultiply(node.backdropColor())
    );
    painter.setBackgroundColor(
      style.backgroundColor // .premultiply(node.backdropColor())
    );

    const size = layout.groupSize(this.bodySize);
    const color = block.style().lineColor;
    painter.setBorderColor(color);
    painter.setBackgroundColor(color);

    const thumbSize = block.style().thickness;

    // Draw the BG
    painter.setBorderColor(color);
    painter.setBackgroundColor(
      new Color(
        style.backgroundColor.r(),
        style.backgroundColor.g(),
        style.backgroundColor.b(),
        style.backgroundColor.a()
      )
    );
    painter.drawBlock(
      layout.groupX(),
      layout.groupY(),
      size.width(),
      size.height(),
      layout.groupScale() * style.borderRoundness,
      layout.groupScale() * 0
    );

    if (block.isVertical()) {
      // Draw the slider track
      painter.setBorderColor(color);
      painter.setBackgroundColor(color);
      painter.drawBlock(
        layout.groupX(),
        layout.groupY(),
        block.style().trackThickness,
        size.height() - thumbSize - style.markThickness / 2,
        layout.groupScale() * 0,
        layout.groupScale() * style.borderThickness
      );
      if (block.steps() > 0) {
        const markLength = thumbSize / 2;
        for (let i = 0; i <= block.steps(); ++i) {
          painter.drawBlock(
            layout.groupX(),
            layout.groupY() -
              size.height() / 2 +
              thumbSize / 2 +
              (size.height() - thumbSize) * (i / block.steps()),
            i === 0 || i === block.steps() || i === block.steps() / 2
              ? markLength
              : markLength / 2,
            block.style().markThickness,
            layout.groupScale() * style.borderRoundness,
            layout.groupScale() * style.borderThickness
          );
        }
      }
      // Draw the slider thumb
      painter.setBorderColor(style.thumbColor);
      painter.setBackgroundColor(style.thumbBackgroundColor);
      painter.drawBlock(
        layout.groupX(),
        layout.groupY() -
          size.height() / 2 +
          thumbSize / 2 +
          (size.height() - thumbSize) * block.pct(),
        thumbSize,
        thumbSize,
        layout.groupScale() * style.borderRoundness,
        layout.groupScale() * LINE_THICKNESS
      );
    } else {
      // Draw the slider track
      painter.setBorderColor(color);
      painter.setBackgroundColor(color);
      painter.drawBlock(
        layout.groupX(),
        layout.groupY(),
        size.width() - thumbSize - style.markThickness / 2,
        style.trackThickness,
        layout.groupScale() * 0,
        layout.groupScale() * style.borderThickness
      );
      if (block.steps() > 0) {
        const markLength = size.height() / 2;
        for (let i = 0; i <= block.steps(); ++i) {
          painter.drawBlock(
            layout.groupX() -
              size.width() / 2 +
              thumbSize / 2 +
              (size.width() - thumbSize) * (i / block.steps()),
            layout.groupY(),
            style.markThickness,
            i === 0 || i === block.steps() || i === block.steps() / 2
              ? markLength
              : markLength / 2,
            layout.groupScale() * style.borderRoundness,
            layout.groupScale() * style.borderThickness
          );
        }
      }
      // Draw the slider thumb
      painter.setBorderColor(style.thumbColor);
      painter.setBackgroundColor(style.thumbBackgroundColor);
      painter.drawBlock(
        layout.groupX() -
          size.width() / 2 +
          thumbSize / 2 +
          (size.width() - thumbSize) * block.pct(),
        layout.groupY(),
        thumbSize,
        thumbSize,
        layout.groupScale() * style.borderRoundness,
        layout.groupScale() * LINE_THICKNESS
      );
    }
  }

  forceSimple() {
    return this._forceSimple;
  }

  setForceSimple(forceSimple: boolean) {
    this._forceSimple = forceSimple;
  }

  render() {
    ++this._consecutiveRenders;
    if (this.isBlockRenderingEnabled()) {
      const gl = this.gl();
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this._blockPainter.render(
        this.worldTransform().matrix(),
        this.worldTransform().scale()
      );
    }

    return false;
  }

  enableBlockRendering(): void {
    this._renderBlocks = true;
  }

  disableBlockRendering(): void {
    this._renderBlocks = false;
  }

  isBlockRenderingEnabled(): boolean {
    return this._renderBlocks;
  }

  enableLineRendering(): void {
    this._renderLines = true;
  }

  disableLineRendering(): void {
    this._renderLines = false;
  }

  isLineRenderingEnabled(): boolean {
    return this._renderLines;
  }
}
