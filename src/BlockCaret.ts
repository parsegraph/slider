import { PaintedCaret } from "parsegraph-artist";
import Block from "./Block";
import Font from "parsegraph-font";

export default class BlockCaret extends PaintedCaret<Block> {
  label(label?: string, font?: Font) {
    if (arguments.length === 0) {
      return this.node().value().label();
    }
    return this.node().value().setLabel(label, font);
  }

  id(val?: string | number) {
    if (arguments.length === 0) {
      return this.node().state().id();
    }
    this.node().state().setId(val);
  }
}
