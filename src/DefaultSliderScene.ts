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

const LABEL_WEIGHT_MULTIPLIER = 12;

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

  constructor(projector: Projector, blockType: BlockType = BlockType.ROUNDED) {
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

    // One for the block.
    ++counts.numBlocks;
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
    const selectedColor = block
      .style()
      .selectedLineColor.premultiply(this.backgroundColor());
    const color = block.style().lineColor.premultiply(this.backgroundColor());

    const layout = block.getLayout();

    const painter = this._blockPainter;
    if (block.isSelected() && node.nodeAt(direction).value().isSelected()) {
      painter.setBorderColor(selectedColor);
      painter.setBackgroundColor(selectedColor);
    } else {
      // Not selected.
      painter.setBorderColor(color);
      painter.setBackgroundColor(color);
    }

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

    /* // Set colors if selected.
        if(node.isSelected()) {
            painter.setBorderColor(
                style.selectedBorderColor.premultiply(
                    node.backdropColor()
                )
            );
            painter.setBackgroundColor(
                style.selectedBackgroundColor.premultiply(
                    node.backdropColor()
                )
            );
        } else */ {
      painter.setBorderColor(
        style.borderColor // .premultiply(node.backdropColor())
      );
      console.log(style.backgroundColor);
      painter.setBackgroundColor(
        style.backgroundColor // .premultiply(node.backdropColor())
      );
    }

    // Draw the block.
    const size = layout.groupSize(this.bodySize);
    painter.drawBlock(
      layout.groupX(),
      layout.groupY(),
      size.width(),
      size.height(),
      layout.groupScale() * style.borderRoundness,
      layout.groupScale() * style.borderThickness
    );

    // Draw the label.
    const label = block.realLabel();
    if (!label) {
      return;
    }
    const fontScale =
      (style.fontSize * layout.groupScale()) / label.font().fontSize();
    let labelX;
    let labelY;
    if (node.hasNode(Direction.INWARD)) {
      const nodeSize = block.sizeWithoutPadding(this.bodySize);
      if (
        node.nodeAlignmentMode(Direction.INWARD) == Alignment.INWARD_VERTICAL
      ) {
        // Align vertical.
        labelX = layout.groupX() - (fontScale * label.width()) / 2;
        labelY =
          layout.groupY() - (layout.groupScale() * nodeSize.height()) / 2;
      } else {
        // Align horizontal.
        labelX = layout.groupX() - (layout.groupScale() * nodeSize.width()) / 2;
        labelY = layout.groupY();
      }
    } else {
      labelX = layout.groupX() - (fontScale * label.width()) / 2;
      labelY = layout.groupY();
    }
    const l = block.realLabel();
    l.setPos(labelX, labelY, fontScale);
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

    if (this.forceSimple() || !this.isTextRenderingEnabled()) {
      return false;
    }

    // Draw each block.
    this.sliders().forEach((node) => {
      const block = node.value();
      const label = block.realLabel();
      const weight = block.labelWeight();
      const style = block.style();
      if (label) {
        const fontColor = block.isSelected()
          ? style.selectedFontColor
          : style.fontColor;
        label.paint(this.projector(), fontColor);
        this.worldTransform()
          .labels()
          ?.draw(
            block.label(),
            block.getLayout().absoluteX(),
            block.getLayout().absoluteY(),
            weight * LABEL_WEIGHT_MULTIPLIER,
            block.getLayout().absoluteScale() * 0.5,
            block.style().backgroundColor
          );
      }
    });

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

  enableTextRendering(): void {
    this._renderText = true;
  }

  disableTextRendering(): void {
    this._renderText = false;
  }

  isTextRenderingEnabled(): boolean {
    return this._renderText;
  }
}
