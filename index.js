const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg')

const nodeRadius = 50;
let numNodes = 5;

const zoomSlider = document.querySelector('#zoom-slider');
const zoomLevelLabel = document.querySelector('#zoom-level');
let zoomLevel = 1250;

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
  EventListeners();
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

// Draw a text at a point
function drawText(x, y) {
  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  const text = document.createElementNS('http://www.w3.org/1999/xhtml', 'textarea');
  foreignObject.setAttribute('width', '900');
  foreignObject.setAttribute('height', '900');
  foreignObject.setAttribute('x', x);
  foreignObject.setAttribute('y', y);
  foreignObject.appendChild(text);
  svg.appendChild(foreignObject);
}

const svgPoint = svg.createSVGPoint();
const svgSize = 1000;
let togglePanningFlag = false;
let toggleDragObjectFlag = true;
let toggleDrawNodeFlag = false;
let toggleDrawTextFlag = false;
let isTextSelected = true;

function EventListeners() {
  
  let isDragging = false;
  let selectedObject = null;
  
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
    if (event.target.getAttribute('class') === 'node' ||
        event.target.getAttribute('class') === 'text') {
      selectedObject = event.target;
    }

    // Convert screen coordinates to SVG coordinate
    svgPoint.x = event.x;
    svgPoint.y = event.y;
    const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

    // Handle node creation
    if (toggleDrawNodeFlag) {
      drawNode(matrix.x, matrix.y);
    }

    // Handle text creation
    if (toggleDrawTextFlag) {
      console.log("Creating text")
      drawText(matrix.x, matrix.y);
    }
  });
  
  svg.addEventListener('mouseup', (event) => {
    isDragging = false;
    currentViewBox.x = newViewBox.x;
    currentViewBox.y = newViewBox.y;

    selectedObject = null;
  });
  
  svg.addEventListener('mouseleave', (event) => {
    isDragging = false;
  });


  svg.addEventListener('mousemove', (event) => {
    // Handle panning
    if (isDragging && togglePanningFlag) {
      newViewBox.x = currentViewBox.x - (event.x - pointerOrigin.x);
      newViewBox.y = currentViewBox.y - (event.y - pointerOrigin.y);
      svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${zoomLevel} ${zoomLevel}`)
    }
    
    // Handle object dragging
    if (selectedObject && toggleDragObjectFlag) {
      // Convert screen coordinates to SVG coordinate
      svgPoint.x = event.x;
      svgPoint.y = event.y;
      const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
      selectedObject.setAttribute('cx', matrix.x);
      selectedObject.setAttribute('cy', matrix.y);
    }

  });
  
  // Handle zooming with the mouse
  svg.addEventListener('wheel', (event) => {
    if (!isTextSelected) {
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
    }
  });

  // Handle zooming on the UI
  zoomSlider.addEventListener('input', (event) => {
    const value = event.target.value;
    zoomLevel = value;
    zoomLevelLabel.textContent = zoomLevel + '%';
    svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`)
  })
}


function offFlag() {
  togglePanningFlag = false;
  toggleDragObjectFlag = false;
  toggleDrawNodeFlag = false;
  toggleDrawTextFlag = false;
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
          break;
        case 'create-line-btn':
          offFlag();
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
