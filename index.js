const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg')

const nodeRadius = 50;
const svgSize = 1000;
let numNodes = 5;
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
  toggleDrawNode();
  let inc = 350;
  for (let i = 0; i < numNodes; i++) {
    drawNode(inc, 350);
    inc += 150;
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

// TODO: The toggleMousePanningZooming() and toggleDrag() both share the same eventlisteners.
//       we may consider combining them...or just seperate..? 
// This function controls the panning and zooming functionalities.
// The zooming is always active.
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
    // Set the current mouse position in pointerOrigin
    pointerOrigin.x = event.x;
    pointerOrigin.y = event.y;
  });
  svg.addEventListener('mouseup', (event) => {
    drag = false;
    // If the user is no longer holding the mouse down,
    // set the current view to the new view
    currentViewBox.x = newViewBox.x;
    currentViewBox.y = newViewBox.y;
  });
  svg.addEventListener('mouseleave', (event) => {
    // The user can no longer pan if the mouse is not in the SVG view
    drag = false;
  });
  svg.addEventListener('mousemove', (event) => {
    if (drag && toggleMousePanningZoomingFlag) {
      // If we are in panning/dragging mode, then calculate the new view position
      // the zoom level will remain consistent with the zoom slider
      newViewBox.x = currentViewBox.x - (event.x - pointerOrigin.x);
      newViewBox.y = currentViewBox.y - (event.y - pointerOrigin.y);
      console.log(newViewBox.x, newViewBox.y)
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
    const inc = 10;
    if (deltaY < 0) { // Zooming in
      zoomSlider.value = parseInt(zoomSlider.value) - inc;
    } else if (deltaY > 0) { // Zooming out
      zoomSlider.value = parseInt(zoomSlider.value) + inc; 
    }

    // This dispatch is required so that if the user uses the wheel on the mouse, it will trigger the slider
    // to change accordingly. Without this, the slider will not be in the appropriate position.
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
    selected = null; // Deselect object
  }
  const svgPoint = svg.createSVGPoint();
  function drag(event) {
    if (selected && toggleDragFlag) {
      // Convert screen coordinates to SVG coordinates
      const x = event.x; // The screen mouse X position
      const y = event.y; // The screen mouse Y position
      // Store the screen mouse's x and y and convert them using matrixTransform
      svgPoint.x = x;
      svgPoint.y = y;
      const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
      const cx = matrix.x; // The SVG-coordinate mouse X position
      const cy = matrix.y; // The SVG-coordinate mouse Y position
      selected.setAttribute('cx', cx);
      selected.setAttribute('cy', cy);
    }
  }
  // The SVG object will be listening to the following mouse events
  svg.addEventListener('mousedown', dragStart);
  svg.addEventListener('mouseup', dragEnd);
  svg.addEventListener('mousemove', drag);
}

// This function controls the create node functionality
let toggleDrawNodeFlag = false;
function toggleDrawNode() {
  const svgPoint = svg.createSVGPoint();
  svg.addEventListener('mousedown', (event) => {
    if (toggleDrawNodeFlag) {
      // Convert screen coordinates to SVG coordinate
      svgPoint.x = event.x;
      svgPoint.y = event.y;
      const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
      drawNode(matrix.x, matrix.y);
    }
  });
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
          toggleDrawNodeFlag = false;
          break;
        case 'pan-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = true;
          toggleDrawNodeFlag = false;
          break;
        case 'create-node-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          toggleDrawNodeFlag = true;
          break;
        case 'create-line-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          toggleDrawNodeFlag = false;
          break;
        case 'create-text-btn':
          toggleDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          toggleDrawNodeFlag = false;
          break;
        case 'create-comment-btn':
          toggleNodeDragFlag = false;
          toggleMousePanningZoomingFlag = false;
          toggleDrawNodeFlag = false;
          break;
      }
    });
  });
}
