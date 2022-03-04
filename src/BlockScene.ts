import Artist, {
  WorldTransform,
  WorldRenderable,
  NodeValues,
} from "parsegraph-artist";
import { Projector } from "parsegraph-projector";
import Block from "./Block";
import Method from "parsegraph-method";

export default class Scene implements WorldRenderable {
  _projector: Projector;
  _blocks: NodeValues<Block>;
  _world: WorldTransform;
  private _onUpdate: Method;

  constructor(projector: Projector) {
    this._projector = projector;
    this._blocks = null;
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

  setBlocks(blocks: NodeValues<Block>) {
    this._blocks = blocks;
  }

  blocks() {
    return this._blocks;
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

  render() {
    return false;
  }

  unmount() {}
}

export class BlockArtist implements Artist<Block, Scene> {
  _creator: (projector: Projector) => Scene;

  constructor(creator: (projector: Projector) => Scene) {
    this._creator = creator;
  }

  protected create(projector: Projector) {
    return this._creator(projector);
  }

  make(projector: Projector, blocks: NodeValues<Block>) {
    const scene = this.create(projector);
    scene.setBlocks(blocks);
    return scene;
  }

  patch(view: Scene, blocks: NodeValues<Block>): boolean {
    view.setBlocks(blocks);
    return true;
  }
}
