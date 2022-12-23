import Slider from "./Slider";
import SliderArtist from "./SliderArtist";
import { Projector } from "parsegraph-projector";
import { DEFAULT_STYLE } from "./SliderStyle";
import DefaultSliderScene from "./DefaultSliderScene";
import { DirectionNode } from "parsegraph-direction";

const defaultArtist = new SliderArtist((proj: Projector) => {
  return new DefaultSliderScene(proj);
});

export default class SliderNode extends DirectionNode<Slider> {
  constructor() {
    super(null);
    this.setValue(new Slider(this, DEFAULT_STYLE, defaultArtist));
  }
}
