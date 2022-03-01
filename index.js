const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg')

const nodeRadius = 50;
let numNodes = 1;
let zoomLevel = 1250;

const zoomSlider = document.querySelector('#zoom-slider');

// Everything begins here.
function startApp() {
  initialize();
}
startApp();
///////////////////////////

// Initialization
function initialize() {
  zoomSlider.value = zoomLevel;
  svg.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
  main.appendChild(svg);
  toggleMousePanningZooming();
  toggleDrag();
  drawGrid();
  for (let i = 0; i < numNodes; i++) {
    drawNode(350, 350);
  }
  buttonEvents();
}

// Draw a node at a point 
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

// Draw a grid
function drawGrid() {
  const boxSize = 50;
  const opacity = .5;
  const strokeWidth = 4;
  const strokeColor = 'black';
  const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  box.setAttribute('width', boxSize);
  box.setAttribute('height', boxSize);
  box.setAttribute('x', '0');
  box.setAttribute('y', '0');
  box.setAttribute('fill', 'transparent');
  box.setAttribute('stroke', strokeColor);
  box.setAttribute('stroke-width', strokeWidth);
  box.setAttribute('opacity', opacity);
  const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
  pattern.setAttribute('id', 'pattern');
  pattern.setAttribute('x', '0');
  pattern.setAttribute('y', '0');
  pattern.setAttribute('width', boxSize);
  pattern.setAttribute('height', boxSize);
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  pattern.appendChild(box);
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('fill', 'url(#pattern)');
  rect.setAttribute('x', '-10000');
  rect.setAttribute('y', '-10000');
  rect.setAttribute('width', '100000');
  rect.setAttribute('height', '100000');
  svg.appendChild(pattern);
  svg.appendChild(rect);
}

// This function controls the panning and zooming functionalities.
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
  // Control zoom
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

// This function controls the dragging functionality.
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
    const x = event.x;
    const y = event.y; 
    svgPoint.x = x;
    svgPoint.y = y;
    if (selected && toggleDragFlag) {
      // Convert screen coordinates to SVG coordinates
      const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
      const cx = matrix.x;
      const cy = matrix.y;
      const currentCX = parseInt(selected.getAttribute('cx'));
      const currentCY = parseInt(selected.getAttribute('cy'));
      const roundedMoveX = (cx - currentCX) / 2;
      const roundedMoveY = (cy - currentCY) / 2;
      if (roundedMoveX >= 15) {
        selected.setAttribute('cx', currentCX + 50);
      } else if (roundedMoveX <= -15) {
        selected.setAttribute('cx', currentCX - 50);
      }
      if (roundedMoveY >= 15) {
        selected.setAttribute('cy', currentCY + 50);
      } else if (roundedMoveY <= -15) {
        selected.setAttribute('cy', currentCY - 50);
      }
    }
  }
  svg.addEventListener('mousedown', dragStart);
  svg.addEventListener('mouseup', dragEnd);
  svg.addEventListener('mousemove', drag);
}

// This function handles all buttons interactivity on the UI.
function buttonEvents() {
  // The pointer button will be the default select.
  document.querySelectorAll('.btn-function')[0].classList.add('btn-selected');

  document.querySelectorAll('.btn-function').forEach((btn) => {
    // Add an click event listener for each button
    btn.addEventListener('click', () => {
      // Deselect all buttons, reset
      document.querySelectorAll('.btn-function').forEach((btn) => {
        btn.classList.remove('btn-selected');
      });
      // The button that was clicked will be selected
      btn.classList.add('btn-selected');
      // Determine which button was actually clicked and toggle the appropriate functionality
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
