import Direction from "parsegraph-direction";
import { Pizza } from "parsegraph-artist";
import { WorldTransform } from "parsegraph-scene";
import Block from "./Block";
import { DirectionCaret } from "parsegraph-direction";
import { BasicProjector } from "parsegraph-projector";
import Camera from "parsegraph-camera";
import { showInCamera } from "parsegraph-showincamera";
import DefaultBlockPalette from "./DefaultBlockPalette";

import { WorldLabels } from "parsegraph-scene";

const palette = new DefaultBlockPalette();

const buildGraph = () => {
  const car = new DirectionCaret<Block>("u", palette);

  const root = car.root();

  const dirs = [
    Direction.FORWARD,
    Direction.DOWNWARD,
    Direction.INWARD,
    Direction.UPWARD,
    Direction.BACKWARD,
  ];
  for (let i = 0; i < 20; ++i) {
    let dir = Direction.NULL;
    while (dir === Direction.NULL || car.has(dir)) {
      dir = dirs[Math.floor(Math.random() * dirs.length)];
    }
    car.spawn(dir, "b");
    car.node().value().setLabel("parsegraph");
    car.pull(dir);
    car.move(dir);
  }
  return root;
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
  const n = palette.spawn();
  n.value().setLabel("No time");
  pizza.populate(n);

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
    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'black'
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(`scale=${cam.scale()}`, 0, 0)
  };

  const refresh = () => {
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    const n = buildGraph();
    pizza.populate(n);
    showInCamera(n, cam, false);
    redraw();
    //const rand = () => Math.floor(Math.random() * 255);
    //document.body.style.backgroundColor = `rgb(${rand()}, ${rand()}, ${rand()})`;
    // document.body.style.backgroundColor = `rgb(233, 204, 164)`;
    // Pine cone
    //document.body.style.backgroundColor = `rgb(221, 210, 186)`;
    //document.body.style.backgroundColor = `rgb(177, 156, 149)`;
    document.body.style.backgroundColor = `rgb(149, 149, 149)`;
    //document.body.style.backgroundColor = `rgb(221, 210, 186)`;
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
  let timer: any = null;
  let dotTimer: any = null;
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

  let clicked = false;
  root.addEventListener("touchstart", (e) => {
    clicked = true;
  });
  let lastTouch = [0, 0]
  root.addEventListener("touchmove", (e) => {
    const [movementX, movementY] = [
      e.touches[0].clientX - lastTouch[0],
      e.touches[0].clientY - lastTouch[1],
    ];
    lastTouch = [e.touches[0].clientX, e.touches[0].clientY]
    cam.adjustOrigin(movementX / cam.scale(), movementY / cam.scale());
  });
  root.addEventListener("touchend", (e) => {
    clicked = false;
  });
  root.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      clicked = true;
    }
  });
  root.addEventListener("mousemove", (e) => {
    if (!clicked) {
      return;
    }
    console.log(e.movementX);
    cam.adjustOrigin(e.movementX / cam.scale(), e.movementY / cam.scale());
    redraw();
  });
  root.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      clicked = false;
    }
  });
  root.addEventListener("wheel", (e) => {
    const zoomIn = (e as WheelEvent).deltaY < 0;
    console.log(e);
    cam.zoomToPoint(zoomIn ? 1.1 : 0.9, e.clientX, e.clientY);
    redraw();
  });
  root.addEventListener("click", () => {
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
  });
});
