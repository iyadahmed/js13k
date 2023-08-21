// References:
// Fast set pixel: https://stackoverflow.com/a/56822194/8094047
// Events: http://www.java2s.com/Tutorials/HTML_CSS/HTML5_Canvas/0630__HTML5_Canvas_Event.htm
// Game loop: https://spicyyoghurt.com/tutorials/html5-javascript-game-development/create-a-proper-game-loop-with-requestanimationframe

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const brushSize = 10;

canvas.width = 500;
canvas.height = 500;

let imageData = context.createImageData(canvas.width, canvas.height);
let data = imageData.data;

function clearScreen() {
  let i = 0;
  while (i < data.length) {
    data[i++] = 0; // Red value
    data[i++] = 0; // Green value
    data[i++] = 0; // Blue value
    data[i++] = 255; // Alpha (opacity)
  }
  context.putImageData(imageData, 0, 0);
}

function getRGB(x, y) {
  return [
    data[4 * (x + y * canvas.width) + 0],
    data[4 * (x + y * canvas.width) + 1],
    data[4 * (x + y * canvas.width) + 2],
  ];
}

function setRGB(x, y, r, g, b) {
  data[4 * (x + y * canvas.width) + 0] = r;
  data[4 * (x + y * canvas.width) + 1] = g;
  data[4 * (x + y * canvas.width) + 2] = b;
}

function isEmpty(x, y) {
  if (data[4 * (x + y * canvas.width) + 0] > 0) return false;
  if (data[4 * (x + y * canvas.width) + 1] > 0) return false;
  return !(data[4 * (x + y * canvas.width) + 2] > 0);
}

function swapRGB(x0, y0, x1, y1) {
  let rgb0 = getRGB(x0, y0);
  let rgb1 = getRGB(x1, y1);
  setRGB(x0, y0, rgb1[0], rgb1[1], rgb1[2]);
  setRGB(x1, y1, rgb0[0], rgb0[1], rgb0[2]);
}

function stepPerPixel(i, j) {
  // Handle collision with ground
  if (j + 1 >= canvas.height) return;
  let downI = i;
  let downJ = j + 1;
  if (isEmpty(downI, downJ)) {
    swapRGB(i, j, downI, downJ);
    return;
  }
  // Prevent sand from going through left and right walls
  if (i - 1 < 0) return;
  if (i + 1 >= canvas.width) return;
  // Randomize choosing sliding direction (left or right)
  if (Math.random() > 0.5) {
    let downLeftI = i - 1;
    let downLeftJ = j + 1;
    if (isEmpty(downLeftI, downLeftJ)) {
      swapRGB(i, j, downLeftI, downLeftJ);
      return;
    }
    let downRightI = i + 1;
    let downRightJ = j + 1;
    if (isEmpty(downRightI, downRightJ)) {
      swapRGB(i, j, downRightI, downRightJ);
      return;
    }
  } else {
    let downRightI = i + 1;
    let downRightJ = j + 1;
    if (isEmpty(downRightI, downRightJ)) {
      swapRGB(i, j, downRightI, downRightJ);
      return;
    }
    let downLeftI = i - 1;
    let downLeftJ = j + 1;
    if (isEmpty(downLeftI, downLeftJ)) {
      swapRGB(i, j, downLeftI, downLeftJ);
      return;
    }
  }
}

function step() {
  for (let i = 0; i < canvas.width; i++) {
    // Processing simulation from bottom to top is very important!
    for (let j = canvas.height; j >= 0; j--) {
      stepPerPixel(i, j);
    }
  }
}

canvas.down = false;

// from www.java2s.com
this.addEventListener(
  "mousedown",
  function (e) {
    canvas.down = true;
    canvas.X = e.clientX;
    canvas.Y = e.clientY;
  },
  0
);
this.addEventListener(
  "mouseup",
  function () {
    canvas.down = false;
  },
  0
);
this.addEventListener(
  "mousemove",
  function (e) {
    canvas.X = e.clientX;
    canvas.Y = e.clientY;
  },
  0
);

// Touch events: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
// note that touch location can be float, so we should floor or round it
function touchStart(e) {
  e.preventDefault();
  canvas.down = true;
  canvas.X = Math.floor(e.touches[0].clientX);
  canvas.Y = Math.floor(e.touches[0].clientY);
}

function touchMove(e) {
  e.preventDefault();
  canvas.X = Math.floor(e.touches[0].clientX);
  canvas.Y = Math.floor(e.touches[0].clientY);
}

function touchCancel(e) {
  e.preventDefault();
  canvas.down = false;
}

function touchEnd(e) {
  e.preventDefault();
  canvas.down = false;
}

addEventListener("touchstart", touchStart, false);
addEventListener("touchmove", touchMove, false);
addEventListener("touchcancel", touchCancel, false);
addEventListener("touchend", touchEnd, false);

clearScreen();

// Start the first frame request
window.requestAnimationFrame(gameLoop);

function pourSand(x, y) {
  for (let i = -brushSize; i < brushSize; i++) {
    for (let j = -brushSize; j < brushSize; j++) {
      if (x + i < 0 || x + i >= canvas.width) continue;
      if (y + j < 0 || y + j >= canvas.height) continue;
      if (!isEmpty(x + i, y + j)) continue;
      setRGB(x + i, y + j, 205, 170, 109);
    }
  }
}

function gameLoop(timeStamp) {
  if (canvas.down) {
    let rect = canvas.getBoundingClientRect();
    let x = canvas.X - rect.left;
    let y = canvas.Y - rect.top;
    pourSand(x, y);
  }
  step();
  context.putImageData(imageData, 0, 0);
  // Keep requesting new frames
  window.requestAnimationFrame(gameLoop);
}
