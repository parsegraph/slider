import { NodeValues } from "parsegraph-artist";
import { WorldTransform, WorldRenderable } from "parsegraph-scene";
import { Projector } from "parsegraph-projector";
import Slider from "./Slider";
import Method from "parsegraph-method";

export default abstract class SliderScene implements WorldRenderable {
  _projector: Projector;
  _sliders: NodeValues<Slider>;
  _world: WorldTransform;
  private _onUpdate: Method;

  constructor(projector: Projector) {
    this._projector = projector;
    this._sliders = null;
    this._onUpdate = new Method();
  }

  projector() {
    return this._projector;
  }

  markDirty() {
    this._onUpdate.call();
  }

  setOnScheduleUpdate(listener: () => void, listenerObj?: object): void {
    this._onUpdate.set(listener, listenerObj);
  }

  setSliders(sliders: NodeValues<Slider>) {
    this._sliders = sliders;
  }

  sliders() {
    return this._sliders;
  }

  setWorldTransform(world: WorldTransform) {
    this._world = world;
  }

  worldTransform() {
    return this._world;
  }

  tick() {
    return false;
  }

  paint() {
    return false;
  }

  abstract render(): boolean;

  unmount() {}
}
