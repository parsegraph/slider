import Artist, { NodeValues } from "parsegraph-artist";
import { Projector } from "parsegraph-projector";
import Slider from "./Slider";
import SliderScene from "./SliderScene";

export default class SliderArtist implements Artist<Slider, SliderScene> {
  _creator: (projector: Projector) => SliderScene;

  constructor(creator: (projector: Projector) => SliderScene) {
    this._creator = creator;
  }

  protected create(projector: Projector) {
    return this._creator(projector);
  }

  make(projector: Projector, sliders: NodeValues<Slider>) {
    const scene = this.create(projector);
    scene.setSliders(sliders);
    return scene;
  }

  patch(view: SliderScene, sliders: NodeValues<Slider>): boolean {
    view.setSliders(sliders);
    return true;
  }
}
