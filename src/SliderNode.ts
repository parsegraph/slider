import Slider from "./Slider";
import SliderArtist from "./SliderArtist";
import { Projector } from "parsegraph-projector";
import { DEFAULT_STYLE, VERTICAL_STYLE } from "./SliderStyle";
import DefaultSliderScene from "./DefaultSliderScene";
import { DirectionNode } from "parsegraph-direction";

const defaultArtist = new SliderArtist((proj: Projector) => {
  return new DefaultSliderScene(proj);
});

export default class SliderNode extends DirectionNode<Slider> {
  constructor() {
    super();
    this.setValue(new Slider(this, DEFAULT_STYLE, defaultArtist));
  }
}

export class VerticalSliderNode extends DirectionNode<Slider> {
  constructor() {
    super();
    this.setValue(new Slider(this, VERTICAL_STYLE, defaultArtist));
  }
}
