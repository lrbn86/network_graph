const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg')
const svgWidth = 500;
const svgHeight = 500;
const gridBoxSize = 50;
const nodeRadius = 50;
let numNodes = 0;
let zoomLevel = 1250;

const zoomSlider = document.querySelector('#zoom-slider');

function startApp() {
  initialize();
}
startApp();

function initialize() {
  zoomSlider.value = zoomLevel;
  svg.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
  main.appendChild(svg);
  toggleMousePanningZooming();
  toggleDrag();
  for (let i = 0; i < 100; i++) {
    drawNode(150, 150);
  }
  // drawGrid();
  buttonEvents();
}

function drawNode(x, y) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  node.setAttribute('class', 'node');
  node.setAttribute('r', nodeRadius);
  node.setAttribute('fill', 'transparent');
  node.setAttribute('stroke', 'black');
  node.setAttribute('stroke-width', 5);
  node.setAttribute('cx', x);
  node.setAttribute('cy', y);
  svg.appendChild(node);
}

function drawGrid() {
  // TODO: Make this better.
  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  grid.setAttribute('id', 'grid');
  const maxSize = 50;
  const boxSize = 50; 
  let inc = -boxSize;
  for (let i = 0; i < 50; i++) {
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', '-1000');
    horizontalLine.setAttribute('x2', '1000');
    horizontalLine.setAttribute('y1', inc)
    horizontalLine.setAttribute('y2', inc);
    horizontalLine.setAttribute('stroke', 'black');
    horizontalLine.setAttribute('stroke-width', '5');
    inc += boxSize;
    grid.appendChild(horizontalLine);
  }
  inc = -boxSize;
  for (let i = 0; i < 50; i++) {
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', inc);
    horizontalLine.setAttribute('x2', inc);
    horizontalLine.setAttribute('y1', '-1000')
    horizontalLine.setAttribute('y2', '1000');
    horizontalLine.setAttribute('stroke', 'black');
    horizontalLine.setAttribute('stroke-width', '5');
    inc += boxSize;
    grid.appendChild(horizontalLine);
  }
  svg.appendChild(grid);
}

let toggleMousePanningZoomingFlag = false;
function toggleMousePanningZooming() {
  // source: https://css-tricks.com/creating-a-panning-effect-for-svg/
  let drag = false;
  let pointerOrigin = {
    x: 0,
    y: 0
  };
  let currentViewBox = {
    x: 0,
    y: 0,
    width: zoomLevel,
    height: zoomLevel
  };
  let newViewBox = {
    x: 0,
    y: 0
  };
  svg.addEventListener('mousedown', (event) => {
    drag = true;
    pointerOrigin.x = event.x;
    pointerOrigin.y = event.y;
  });
  svg.addEventListener('mouseup', (event) => {
    drag = false;
    currentViewBox.x = newViewBox.x;
    currentViewBox.y = newViewBox.y;
  });
  svg.addEventListener('mouseleave', (event) => {
    drag = false;
  });
  svg.addEventListener('mousemove', (event) => {
    if (drag && toggleMousePanningZoomingFlag) {
      newViewBox.x = currentViewBox.x - (event.x - pointerOrigin.x);
      newViewBox.y = currentViewBox.y - (event.y - pointerOrigin.y);
      svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${zoomLevel} ${zoomLevel}`);
    }
  });
  const zoomLevelLabel = document.querySelector('#zoom-level');
  zoomSlider.addEventListener('input', (event) => {
    const value = event.target.value;
    zoomLevel = value;
    // TODO: Calculate zoom percentage
    zoomLevelLabel.textContent = zoomLevel + '%';
    svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`);
  });
  // Detect mouse wheel for zooming
  svg.addEventListener('wheel', (event) => {
    const deltaY = event.deltaY;
    if (deltaY < 0) {
      zoomSlider.value = parseInt(zoomSlider.value) - 10;
    } else if (deltaY > 0) {
      zoomSlider.value = parseInt(zoomSlider.value) + 10; 
    }
    zoomSlider.dispatchEvent(new Event('input'));
  });
}

let toggleDragFlag = true;
function toggleDrag() {
  let selected = null;
  function dragStart(event) {
    let target = event.target;
    if (target.getAttribute('class') === 'node') {
      selected = target;
    }
  }
  function dragEnd(event) {
    selected = null;
  }
  const svgPoint = svg.createSVGPoint();
  function drag(event) {
    let x = event.x;
    let y = event.y; 
    svgPoint.x = x;
    svgPoint.y = y;
    if (selected && toggleDragFlag) {
      // source: https://bl.ocks.org/danasilver/cc5f33a5ba9f90be77d96897768802ca
      // TODO: Toggle gridlike movements
      // let gridX = round(Math.max(nodeRadius, Math.min(svgWidth - nodeRadius, x)), gridBoxSize);
      // let gridY = round(Math.max(nodeRadius, Math.min(svgHeight - nodeRadius, y)), gridBoxSize);
      // Convert screen coordinates to SVG coordinates
      const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
      let cx = matrix.x;
      let cy = matrix.y;
      selected.setAttribute('cx', cx);
      selected.setAttribute('cy', cy);
    }
  }
  // source: https://bl.ocks.org/danasilver/cc5f33a5ba9f90be77d96897768802ca
  function round(p, n) {
    return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
  }
  svg.addEventListener('mousedown', dragStart);
  svg.addEventListener('mouseup', dragEnd);
  svg.addEventListener('mousemove', drag);
}

function buttonEvents() {
  // The pointer button will be the default select.
  // TODO: There's def a better way to do this...
  document.querySelectorAll('.btn-function')[0].classList.add('btn-selected');
  document.querySelectorAll('.btn-function').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-function').forEach((btn) => {
        btn.classList.remove('btn-selected');
      });
      btn.classList.add('btn-selected');
      switch (btn.id) {
        case 'pointer-btn':
          toggleDragFlag = true;
          toggleMousePanningZoomingFlag = false;
          break;
        case 'pan-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = true;
          break;
        case 'create-node-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          break;
        case 'create-line-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          break;
        case 'create-text-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          break;
        case 'create-comment-btn':
          toggleNodeDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          break;
      }
    });
  });
}
