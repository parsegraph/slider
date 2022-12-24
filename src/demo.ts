import { Pizza } from "parsegraph-artist";
import { WorldTransform } from "parsegraph-scene";
import { BasicProjector } from "parsegraph-projector";
import Camera from "parsegraph-camera";
import { showInCamera } from "parsegraph-showincamera";

import { WorldLabels } from "parsegraph-scene";
import { Direction } from "parsegraph-direction";

import SliderNode, { VerticalSliderNode } from "./SliderNode";
import { BlockNode } from "parsegraph-block";

const buildGraph = (): [BlockNode, SliderNode[]] => {
  let bud = new BlockNode("u");
  const root = bud;
  const sliders = [];
  for (let i = 0; i < 8; ++i) {
    const root = new BlockNode("b");
    root.value().setLabel("Slider");
    const slider = i % 2 === 0 ? new SliderNode() : new VerticalSliderNode();
    root.connectNode(Direction.FORWARD, slider);
    sliders.push(slider);
    slider.connectNode(Direction.FORWARD, new BlockNode("s"));
    bud.connectNode(Direction.FORWARD, root);
    const child = new BlockNode("u");
    bud.connectNode(Direction.DOWNWARD, child);
    bud = child;
  }
  return [root, sliders];
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("demo");
  root.style.position = "relative";

  const proj = new BasicProjector();
  root.appendChild(proj.container());

  const labels = new WorldLabels();

  setTimeout(() => {
    proj.glProvider().canvas();
    proj.overlay();
    proj.render();
    proj.glProvider().gl().viewport(0, 0, proj.width(), proj.height());
    proj.overlay().resetTransform();
    proj.overlay().translate(proj.width() / 2, proj.height() / 2);
    cam.setSize(proj.width(), proj.height());
    const wt = WorldTransform.fromCamera(pizza.root(), cam);
    wt.setLabels(labels);
    pizza.setWorldTransform(wt);
  }, 0);

  const pizza = new Pizza(proj);

  const cam = new Camera();
  let [graph, sliders] = buildGraph();
  pizza.populate(graph);

  const redraw = () => {
    labels.clear();
    cam.setSize(proj.width(), proj.height());
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    proj.overlay().scale(cam.scale(), cam.scale());
    proj.overlay().translate(cam.x(), cam.y());
    const wt = WorldTransform.fromCamera(pizza.root(), cam);
    wt.setLabels(labels);
    pizza.setWorldTransform(wt);
    pizza.paint();
    pizza.render();
    labels.render(proj, cam.scale());
    const ctx = proj.overlay();
    ctx.resetTransform();
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "black";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(
      `x=${Math.round(cam.x())} y=${Math.round(cam.y())} scale=${Math.round(
        100 * cam.scale()
      )}%`,
      0,
      0
    );
  };

  const refresh = () => {
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    [graph, sliders] = buildGraph();
    pizza.populate(graph);
    showInCamera(graph, cam, false);
    redraw();
    // const rand = () => Math.floor(Math.random() * 255);
    // document.body.style.backgroundColor = `rgb(${rand()}, ${rand()}, ${rand()})`;
    // document.body.style.backgroundColor = `rgb(233, 204, 164)`;
    // Pine cone
    // document.body.style.backgroundColor = `rgb(221, 210, 186)`;
    // document.body.style.backgroundColor = `rgb(177, 156, 149)`;
    document.body.style.backgroundColor = `rgb(149, 149, 149)`;
    // document.body.style.backgroundColor = `rgb(221, 210, 186)`;
  };

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.right = "8px";
  dot.style.top = "8px";
  dot.style.width = "16px";
  dot.style.height = "16px";
  dot.style.borderRadius = "8px";
  dot.style.transition = "background-color 400ms";
  dot.style.backgroundColor = "#222";
  root.appendChild(dot);

  document.body.style.transition = "background-color 2s";
  const timer: any = null;
  const dotTimer: any = null;
  let dotIndex = 0;
  const dotState = ["#f00", "#c00"];
  const refreshDot = () => {
    dotIndex = (dotIndex + 1) % dotState.length;
    dot.style.backgroundColor = dotState[dotIndex];
  };
  const interval = 3000;
  const dotInterval = 500;
  root.tabIndex = 0;
  root.focus();

  const touchLength = (e: TouchEvent) => {
    let [minX, minY, maxX, maxY] = [NaN, NaN, NaN, NaN];
    for (let i = 0; i < e.touches.length; ++i) {
      const [x, y] = [e.touches[i].clientX, e.touches[i].clientY];
      if (isNaN(minX)) {
        minX = x;
        minY = y;
        maxX = x;
        maxY = y;
      }
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return Math.sqrt(Math.pow(maxY - minY, 2) + Math.pow(maxX - maxY, 2));
  };

  let clicked = false;
  let lastTouch = [NaN, NaN];
  let lastTouchLength = NaN;
  root.addEventListener("touchmove", (e) => {
    const oldTouch = lastTouch;
    lastTouch = getTouchCenter(e);
    const [worldX, worldY] = cam.transform(lastTouch[0], lastTouch[1]);
    if (focusedGraph) {
      focusedGraph.value().mousemove(worldX, worldY);
      redraw();
      return;
    }
    if (!clicked) {
      return;
    }
    if (e.touches.length > 1) {
      const delta = touchLength(e) - lastTouchLength;
      cam.zoomToPoint(1 + delta * 0.01, lastTouch[0], lastTouch[1]);
      lastTouchLength = touchLength(e);
    } else {
      const dx = lastTouch[0] - oldTouch[0];
      const dy = lastTouch[1] - oldTouch[1];
      cam.adjustOrigin(dx / cam.scale(), dy / cam.scale());
    }
    redraw();
  });

  root.addEventListener("touchend", (e) => {
    lastTouch = getTouchCenter(e);
    lastTouchLength = touchLength(e);
    if (e.touches.length === 0) {
      clicked = false;
      focusedGraph = null;
    }
  });

  const average = (vals: number[]) => {
    const sum = vals.reduce((curr, val) => curr + val, 0);
    return sum / vals.length;
  };

  const getTouchCenter = (e: TouchEvent) => {
    const x = [];
    const y = [];
    for (let i = 0; i < e.touches.length; ++i) {
      x.push(e.touches[i].clientX);
      y.push(e.touches[i].clientY);
    }
    return [average(x), average(y)];
  };

  let focusedGraph: SliderNode = null;
  root.addEventListener("touchstart", (e) => {
    const [worldX, worldY] = cam.transform(
      e.touches[0].clientX,
      e.touches[0].clientY
    );
    lastTouch = getTouchCenter(e);
    lastTouchLength = touchLength(e);
    focusedGraph = null;
    sliders.forEach((slider) => {
      if (!slider.value().getLayout().inNodeBody(worldX, worldY, 1, null)) {
        return;
      }
      if (!slider.value().mousedown(worldX, worldY)) {
        return;
      }
      focusedGraph = slider;
      redraw();
    });
    if (!focusedGraph) {
      clicked = true;
    }
  });
  root.addEventListener("mousedown", (e) => {
    const [worldX, worldY] = cam.transform(e.clientX, e.clientY);
    focusedGraph = null;
    sliders.forEach((slider) => {
      if (!slider.value().getLayout().inNodeBody(worldX, worldY, 1, null)) {
        return;
      }
      if (!slider.value().mousedown(worldX, worldY)) {
        return;
      }
      focusedGraph = slider;
      redraw();
    });
    if (!focusedGraph) {
      clicked = true;
    }
  });
  root.addEventListener("mousemove", (e) => {
    const [worldX, worldY] = cam.transform(e.clientX, e.clientY);
    if (focusedGraph) {
      focusedGraph.value().mousemove(worldX, worldY);
      redraw();
      return;
    }
    if (!clicked) {
      return;
    }
    cam.adjustOrigin(e.movementX / cam.scale(), e.movementY / cam.scale());
    redraw();
  });
  root.addEventListener("mouseup", (e) => {
    if (focusedGraph) {
      focusedGraph = null;
      return;
    }
    if (e.button === 0) {
      clicked = false;
    }
  });
  root.addEventListener("wheel", (e) => {
    const zoomIn = (e as WheelEvent).deltaY < 0;
    cam.zoomToPoint(zoomIn ? 1.1 : 0.9, e.clientX, e.clientY);
    redraw();
  });
  /* root.addEventListener("click", () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      clearInterval(dotTimer);
      dotTimer = null;
      dot.style.transition = "background-color 3s";
      dot.style.backgroundColor = "#222";
    } else {
      refresh();
      dot.style.transition = "background-color 400ms";
      refreshDot();
      timer = setInterval(refresh, interval);
      dotTimer = setInterval(refreshDot, dotInterval);
    }
  });*/
  setTimeout(() => refresh(), 0);

  document.addEventListener("touchmove", (e) => e.preventDefault());
});
