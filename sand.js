// References:
// Fast set pixel: https://stackoverflow.com/a/56822194/8094047
// Events: http://www.java2s.com/Tutorials/HTML_CSS/HTML5_Canvas/0630__HTML5_Canvas_Event.htm
// Game loop: https://spicyyoghurt.com/tutorials/html5-javascript-game-development/create-a-proper-game-loop-with-requestanimationframe

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const brushSize = 10;

canvas.width = 400;
canvas.height = 400;

const colorPicker = document.getElementById("color_picker");
colorPicker.value = "#cdaa6d";

// https://www.designcise.com/web/tutorial/how-to-get-html-color-input-element-value-in-rgb-using-javascript
function getPickedColorRGB() {
  let color = colorPicker.value;
  const red = parseInt(color.substring(1, 3), 16);
  const green = parseInt(color.substring(3, 5), 16);
  const blue = parseInt(color.substring(5, 7), 16);
  return [red, green, blue];
}

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
  return data[4 * (x + y * canvas.width) + 2] <= 0;
}

function swapRGB(x0, y0, x1, y1) {
  let rgb0 = getRGB(x0, y0);
  let rgb1 = getRGB(x1, y1);
  setRGB(x0, y0, rgb1[0], rgb1[1], rgb1[2]);
  setRGB(x1, y1, rgb0[0], rgb0[1], rgb0[2]);
}

function stepPerPixel(i, j) {
  // Skip empty pixels, helps with large canvases, should help too with small ones
  if (isEmpty(i, j)) return;
  // Handle collision with ground
  if (j + 1 >= canvas.height) return;
  let downI = i;
  let downJ = j + 1;
  if (isEmpty(downI, downJ)) {
    swapRGB(i, j, downI, downJ);
    return;
  }
  // Randomize choosing sliding direction (left or right)
  if (Math.random() > 0.5) {
    let downLeftI = i - 1;
    let downLeftJ = j + 1;
    if (isEmpty(downLeftI, downLeftJ) && i - 1 >= 0) {
      swapRGB(i, j, downLeftI, downLeftJ);
      return;
    }
    let downRightI = i + 1;
    let downRightJ = j + 1;
    if (isEmpty(downRightI, downRightJ) && i + 1 < canvas.width) {
      swapRGB(i, j, downRightI, downRightJ);
      return;
    }
  } else {
    let downRightI = i + 1;
    let downRightJ = j + 1;
    if (isEmpty(downRightI, downRightJ) && i + 1 < canvas.width) {
      swapRGB(i, j, downRightI, downRightJ);
      return;
    }
    let downLeftI = i - 1;
    let downLeftJ = j + 1;
    if (isEmpty(downLeftI, downLeftJ) && i - 1 >= 0) {
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

// Initialize canvas down state to false
canvas.down = false;

function mouseDown(e) {
  canvas.down = true;
  canvas.X = e.clientX;
  canvas.Y = e.clientY;
}

function mouseUp(e) {
  canvas.down = false;
}

function mouseMove(e) {
  canvas.X = e.clientX;
  canvas.Y = e.clientY;
}

addEventListener("mousedown", mouseDown, false);
addEventListener("mouseup", mouseUp, false);
addEventListener("mousemove", mouseMove, false);

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

canvas.addEventListener("touchstart", touchStart, { passive: false });
canvas.addEventListener("touchmove", touchMove, { passive: false });
canvas.addEventListener("touchcancel", touchCancel, { passive: false });
canvas.addEventListener("touchend", touchEnd, { passive: false });

clearScreen();

// Start the first frame request
window.requestAnimationFrame(gameLoop);

function pourSand(x, y, r, g, b) {
  for (let i = -brushSize; i < brushSize; i++) {
    for (let j = -brushSize; j < brushSize; j++) {
      if (x + i < 0 || x + i >= canvas.width) continue;
      if (y + j < 0 || y + j >= canvas.height) continue;
      //   if (!isEmpty(x + i, y + j)) continue;
      setRGB(x + i, y + j, r, g, b);
    }
  }
}

function gameLoop(timeStamp) {
  if (canvas.down) {
    let rect = canvas.getBoundingClientRect();
    let x = canvas.X - rect.left;
    let y = canvas.Y - rect.top;
    let [r, g, b] = getPickedColorRGB();
    pourSand(x, y, r, g, b);
  }
  step();
  context.putImageData(imageData, 0, 0);
  // Keep requesting new frames
  window.requestAnimationFrame(gameLoop);
}
