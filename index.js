const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg');

const nodeRadius = 45;
const normalColor = '#2F3B47';
const criticalColor = '#FF7353';
let currentNumNodes = 0;

const zoomSlider = document.querySelector('#zoom-slider');
const zoomLevelLabel = document.querySelector('#zoom-level');
// Get attributes from the zoomSlider element
// Purpose: If the html attributes are changed, there's no need to update this JS file.
let maxRange = parseInt(zoomSlider.getAttribute('max'));
let minRange = parseInt(zoomSlider.getAttribute('min'));
let stepRange = parseInt(zoomSlider.getAttribute('step'));
let zoomLevel = (maxRange + minRange) / 2; // Get the middle number
let zoomPercentage = 100; // Default percentage is 100%

const nodeBackdrop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
nodeBackdrop.setAttribute('r', nodeRadius);
nodeBackdrop.setAttribute('fill', normalColor);
nodeBackdrop.setAttribute('opacity', '0');
svg.appendChild(nodeBackdrop);

function startApp() {
  initialize();
}
startApp();

// Initialization
function initialize() {
  zoomSlider.value = zoomLevel;
  svg.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
  main.appendChild(svg);
  EventListeners();
  UIButtonEvents();
  let inc = 50;
  for (let i = 0; i < 2; i++) {
    drawNode(inc, 350, currentNumNodes);
    currentNumNodes++;
    inc += 750;
  }
}

// Draw a node at a point 
function drawNode(x, y, nodeID) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  node.setAttribute('id', `node${nodeID}`);
  node.setAttribute('class', 'node');
  node.setAttribute('r', nodeRadius);
  node.setAttribute('fill', normalColor);
  node.setAttribute('cx', x);
  node.setAttribute('cy', y);
  svg.appendChild(node);
}

// Draw a text at a point
function drawText(x, y, matrixX, matrixY) {
}

const svgPoint = svg.createSVGPoint();
let togglePanningFlag = false;
let toggleDragObjectFlag = true;
let toggleDrawNodeFlag = false;
let toggleDrawTextFlag = false;
let selectedObject = null;

const polyLines = [];

function EventListeners() {
  let isDragging = false;
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
    // Handle panning
    isDragging = true;
    pointerOrigin.x = event.x;
    pointerOrigin.y = event.y;
    
    // Handle object dragging
    // Objects will be identified by their class name
    if (event.target.getAttribute('class') === 'node') {
      selectedObject = event.target;
      if (toggleDragObjectFlag) {
        selectedObject.setAttribute('stroke', normalColor);
        selectedObject.setAttribute('stroke-width', '45');
        selectedObject.setAttribute('stroke-opacity', '.2');
      }
    }
    
    // Convert screen coordinates to SVG coordinate
    svgPoint.x = event.x;
    svgPoint.y = event.y;
    const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
    
    // Handle node creation
    if (toggleDrawNodeFlag) {
      drawNode(matrix.x, matrix.y, currentNumNodes);
      currentNumNodes++;
    }
    
    // Handle text creation
    if (toggleDrawTextFlag) {
      // TODO:
    }
  });
  
  svg.addEventListener('mouseup', (event) => {
    isDragging = false;
    currentViewBox.x = newViewBox.x;
    currentViewBox.y = newViewBox.y;
    if (selectedObject && toggleDragObjectFlag) {
      selectedObject.setAttribute('stroke', 'none');
      selectedObject = null;
    }
  });
  
  svg.addEventListener('mouseleave', (event) => {
    isDragging = false;
  });
  
  svg.addEventListener('mousemove', (event) => {
    // Handle panning
    if (isDragging && togglePanningFlag) {
      newViewBox.x = currentViewBox.x - (event.x - pointerOrigin.x);
      newViewBox.y = currentViewBox.y - (event.y - pointerOrigin.y);
      svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${zoomLevel} ${zoomLevel}`);
    }

    // Convert screen coordinates to SVG coordinate
    svgPoint.x = event.x;
    svgPoint.y = event.y;
    const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
    nodeBackdrop.setAttribute('cx', matrix.x);
    nodeBackdrop.setAttribute('cy', matrix.y);

    if (toggleDrawNodeFlag) {
    }
    
    // Check if we are currently holding an object
    if (selectedObject) {
      // Handle object dragging
      if (toggleDragObjectFlag) {
        selectedObject.setAttribute('cx', matrix.x);
        selectedObject.setAttribute('cy', matrix.y);
      }
      // If we are holding down CTRL while dragging the object
      // While we are creating the node, if we hold down CTRL, it will create a diagonal line
      // If that's the case, we wouldn't need a create a line functionality
      if (event.getModifierState('Control')) {
        console.log('CTRL is held.');
      }
    }
  });
  
  // Handle zooming with the mouse
  svg.addEventListener('wheel', (event) => {
    const deltaY = event.deltaY;
    if (deltaY < 0) { // Zooming in
      zoomSlider.value = parseInt(zoomSlider.value) - stepRange;
      if (zoomLevel > minRange) {
        zoomPercentage += 1;
      }
    } else if (deltaY > 0) { // Zooming out
      zoomSlider.value = parseInt(zoomSlider.value) + stepRange;
      if (zoomLevel < maxRange) {
        zoomPercentage -=1;
      }
    }
    // This dispatch is required so that if the user uses the wheel on the mouse, it will trigger the slider
    // to change accordingly. Without this, the slider will not be in the appropriate position.
    zoomSlider.dispatchEvent(new Event('input'));
  });
  // Hacky way of keeping zoom percentages consistent with UI and mouse wheel control
  let zoomLevelsPercentageMap = {};
  let percent = 25;
  for (let i = maxRange; i >= minRange; i -= stepRange) {
    zoomLevelsPercentageMap[i] = percent;
    percent += 1;
  }
  // Handle zooming on the UI
  zoomSlider.addEventListener('input', (event) => {
    const value = event.target.value;
    zoomLevel = value;
    zoomLevelLabel.textContent = zoomLevelsPercentageMap[zoomLevel] + '%';
    svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`);
  });

  document.addEventListener('keydown', (event) => {
    // TODO: Do we want to implement hotkey shortcuts?
    const key = event.code;
    if (key === 'Escape') {
    }
  });
}

// This function handles all buttons interactivity on the UI.
function UIButtonEvents() {
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
          offFlag();
          toggleDragObjectFlag = true;
          break;
        case 'pan-btn':
          offFlag();
          togglePanningFlag = true;
          break;
        case 'create-node-btn':
          offFlag();
          toggleDrawNodeFlag = true;
          nodeBackdrop.setAttribute('opacity', '.5');
          break;
        case 'create-text-btn':
          offFlag();
          toggleDrawTextFlag = true;
          break;
        case 'create-comment-btn':
          offFlag();
          break;
        }
    });
  });
}

function offFlag() {
  togglePanningFlag = false;
  toggleDragObjectFlag = false;
  toggleDrawNodeFlag = false;
  toggleDrawTextFlag = false;
  selectedObject = null;
  nodeBackdrop.setAttribute('opacity', '0');
}
