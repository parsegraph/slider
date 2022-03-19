import checkGLError from "parsegraph-checkglerror";
import Direction, {
  Alignment,
  forEachCardinalDirection,
  isVerticalDirection,
  directionSign,
} from "parsegraph-direction";

import { Matrix3x3 } from "parsegraph-matrix";

import BlockPainter from "parsegraph-blockpainter";
import {
  BlockNode,
  SELECTED_LINE_COLOR,
  LINE_COLOR,
  LINE_THICKNESS,
} from "./Block";
import Size from "parsegraph-size";
import GlyphPainter from "parsegraph-glyphPainter";
import Rect from "parsegraph-rect";
import Color from "parsegraph-color";
import Font from "parsegraph-font";
import log, { logEnterc, logLeave } from "parsegraph-log";
import { Projector } from "parsegraph-projector";
import BlockScene from "./BlockScene";

export default class DefaultBlockScene extends BlockScene {
  _node: BlockNode;
  _backgroundColor: Color;
  _blockPainter: BlockPainter;
  _renderBlocks: boolean;
  _fontPainters: { [key: string]: GlyphPainter };
  _renderText: boolean;
  _pagesPerGlyphTexture: number;
  _mass: number;
  _consecutiveRenders: number;
  _renderLines: boolean;
  _forceSimple: boolean;
  bodySize: Size;

  consecutiveRenders(): number {
    return this._consecutiveRenders;
  }

  constructor(projector: Projector) {
    super(projector);

    this._backgroundColor = new Color(0, 0, 0, 0);
    this._forceSimple = false;

    this._blockPainter = new BlockPainter(window);
    this._renderBlocks = true;

    this._fontPainters = {};

    this._renderText = true;

    this._pagesPerGlyphTexture = NaN;

    this.bodySize = new Size();
  }

  bounds(): Rect {
    return this._blockPainter.bounds();
  }

  getFontPainter(font: Font): GlyphPainter {
    const fullFontName: string = font.fullName();
    let painter: GlyphPainter = this._fontPainters[fullFontName];
    if (!painter) {
      painter = new GlyphPainter(this.projector(), font);
      this._fontPainters[fullFontName] = painter;
    }
    return painter;
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
    for (const fontName in this._fontPainters) {
      if (Object.prototype.hasOwnProperty.call(this._fontPainters, fontName)) {
        const fontPainter: GlyphPainter = this._fontPainters[fontName];
        fontPainter.clear();
      }
    }
  }

  weight(): number {
    return this._mass * this._consecutiveRenders;
  }

  initBlockBuffer(counts: any) {
    this._consecutiveRenders = 0;
    this._mass = counts.numBlocks;
    this._blockPainter.initBuffer(counts.numBlocks);
    if (counts.numGlyphs) {
      for (const fullFontName in counts.numGlyphs) {
        if (
          Object.prototype.hasOwnProperty.call(counts.numGlyphs, fullFontName)
        ) {
          const numGlyphs = counts.numGlyphs[fullFontName];
          let fontPainter = this._fontPainters[fullFontName];
          if (!fontPainter) {
            fontPainter = new GlyphPainter(this.projector(), numGlyphs.font);
            this._fontPainters[fullFontName] = fontPainter;
          }
          fontPainter.initBuffer(numGlyphs);
        }
      }
    }
  }

  countNode(node: BlockNode, counts: any): void {
    if (!counts.numBlocks) {
      counts.numBlocks = 0;
    }

    forEachCardinalDirection(function (direction: Direction) {
      if (node.parentDirection() == direction) {
        return;
      }
      if (node.hasChild(direction)) {
        // Count one for the line
        ++counts.numBlocks;
      }
    }, this);

    // One for the block.
    ++counts.numBlocks;

    if (!node.realLabel()) {
      return;
    }

    const font = node.realLabel().font();
    const fontPainter = this.getFontPainter(font);

    if (isNaN(this._pagesPerGlyphTexture)) {
      const glTextureSize = this.projector().textureSize();
      if (this.gl().isContextLost()) {
        return;
      }
      const pagesPerRow = glTextureSize / fontPainter.font().pageTextureSize();
      this._pagesPerGlyphTexture = Math.pow(pagesPerRow, 2);
    }
    if (isNaN(this._pagesPerGlyphTexture)) {
      return;
    }

    if (!counts.numGlyphs) {
      counts.numGlyphs = {};
    }

    let numGlyphs = counts.numGlyphs[font.fullName()];
    if (!numGlyphs) {
      numGlyphs = { font: font };
      counts.numGlyphs[font.fullName()] = numGlyphs;
    }

    node.glyphCount(numGlyphs, this._pagesPerGlyphTexture);
    // console.log(node + " Count=" + counts.numBlocks);
  }

  paint(): boolean {
    const paintGroup = this._node;
    logEnterc(
      "DefaultNodePainter paints",
      "Painting paint group {0}",
      paintGroup
    );
    const counts: { [key: string]: number } = {};
    paintGroup.forEachNode((node: BlockNode) => {
      log("Counting node {0}", node);
      this.countNode(node, counts);
    });
    log("Glyphs: {0}", counts.numGlyphs);
    this.initBlockBuffer(counts);
    paintGroup.forEachNode((node: BlockNode) => {
      this.drawNode(node);
    });

    logLeave();
    return false;
  }

  drawNode(node: BlockNode) {
    const gl = this.gl();
    if (gl.isContextLost()) {
      return;
    }
    checkGLError(gl, "Before Node drawNode");
    log("Drawing node {0}", node);

    this.paintLines(node);
    this.paintBlock(node);
    checkGLError(gl, "After Node drawNode");
  }

  drawLine(direction: Direction, node: BlockNode) {
    if (node.parentDirection() == direction) {
      return;
    }
    if (!node.hasChild(direction)) {
      // Do not draw lines unless there is a node.
      return;
    }
    const directionData = node.neighborAt(direction);

    const selectedColor = SELECTED_LINE_COLOR.premultiply(
      this.backgroundColor()
    );
    const color = LINE_COLOR.premultiply(this.backgroundColor());

    const block = node.value();
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
      console.log(directionData.node);
      throw new Error(
        directionData.node + "'s groupScale must be a number but was " + scale
      );
    }

    const thickness =
      LINE_THICKNESS * scale * directionData.getNode().state().scale();
    // console.log(thickness, scale);
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

  paintLines(node: BlockNode) {
    forEachCardinalDirection((dir: Direction) => {
      this.drawLine(dir, node);
    });
  }

  paintBlock(node: BlockNode): void {
    const block = node.value();
    const layout = block.getLayout();
    const style = block.blockStyle();
    const painter = this._blockPainter;

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
      painter.setBackgroundColor(
        style.backgroundColor // .premultiply(node.backdropColor())
      );
    }

    // Draw the block.
    const size = layout.groupSize(this.bodySize);
    // console.log(nameType(node.type()) +
    //   " x=" +
    //   node.groupX() +
    //   ", " +
    //   node.groupY());
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
    const fontScale = (style.fontSize * layout.groupScale()) / label.fontSize();
    let labelX;
    let labelY;
    const fontPainter = this.getFontPainter(label.font());
    fontPainter.setColor(
      block.isSelected() ? style.selectedFontColor : style.fontColor
    );
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
        labelY = layout.groupY() - (fontScale * label.height()) / 2;
      }
    } else {
      labelX = layout.groupX() - (fontScale * label.width()) / 2;
      labelY = layout.groupY();
    }
    const l = block.realLabel();
    l._x = labelX;
    l._y = labelY;
    l._scale = fontScale;
    label.paint(fontPainter, labelX, labelY, fontScale);
  }

  forceSimple() {
    return this._forceSimple;
  }

  setForceSimple(forceSimple: boolean) {
    this._forceSimple = forceSimple;
  }

  render() {
    // console.log("RENDERING THE NODE from nodepainter");
    ++this._consecutiveRenders;
    const gl = this.gl();
    gl.disable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    if (this._renderBlocks) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this._blockPainter.setWorldTransform(this.worldTransform());
      this._blockPainter.render();
    }

    if (!this.forceSimple() && this.isTextRenderingEnabled()) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for (const fontName in this._fontPainters) {
        if (
          Object.prototype.hasOwnProperty.call(this._fontPainters, fontName)
        ) {
          const fontPainter = this._fontPainters[fontName];
          fontPainter.setWorldTransform(this.worldTransform());
          fontPainter.render();
        }
      }
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
