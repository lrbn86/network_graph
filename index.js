const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg');

const nodeRadius = 45;
const normalColor = '#2F3B47';
const criticalColor = '#FF7353';
let currentNumNodes = 0;

const zoomSlider = document.querySelector('#zoom-slider');
const zoomLevelLabel = document.querySelector('#zoom-level');
let zoomLevel = 1250;

// Everything begins here.
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
  let inc = 50;
  for (let i = 0; i < 2; i++) {
    drawNode(inc, 350, currentNumNodes);
    currentNumNodes++;
    inc += 750;
  }
  buttonEvents();
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

function drawLineBetweenNodes(nodeA, nodeB) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', '5');
  line.setAttribute('x1', nodeA.getAttribute('cx'));
  line.setAttribute('y1', nodeA.getAttribute('cy'));
  line.setAttribute('x2', nodeB.getAttribute('cx'));
  line.setAttribute('y2', nodeB.getAttribute('cy'));
  svg.appendChild(line);
}

function drawLineBetweenNodeAndMouse(node, mouseX, mouseY) {
  const line = document.c
}

const svgPoint = svg.createSVGPoint();
let togglePanningFlag = false;
let toggleDragObjectFlag = true;
let toggleDrawNodeFlag = false;
let toggleDrawTextFlag = false;
let toggleDrawLineFlag = false;

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

  const polyLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyLine.setAttribute('fill', 'none');
  polyLine.setAttribute('stroke', normalColor);
  polyLine.setAttribute('stroke-width', '5');
  svg.appendChild(polyLine);

  const visualHorizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  visualHorizontalLine.setAttribute('stroke', normalColor);
  visualHorizontalLine.setAttribute('stroke-width', '5');

  svg.addEventListener('mousedown', (event) => {
    // Handle panning
    isDragging = true;
    pointerOrigin.x = event.x;
    pointerOrigin.y = event.y;
    
    // Handle object dragging
    // Objects will be identified by their class name
    if (event.target.getAttribute('class') === 'node') {
      selectedObject = event.target;
      if (toggleDragObjectFlag || toggleDrawLineFlag) {
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
      drawText(event.x, event.y, matrix.x, matrix.y);
    }
    
    // Handle connecting nodes with line
    if (toggleDrawLineFlag) {
      // TODO:
      const targetCX = selectedObject.getAttribute('cx');
      const targetCY = selectedObject.getAttribute('cy');
      // const mousePoint = svg.createSVGPoint();
      // mousePoint.x = targetCX;
      // mousePoint.y = targetCY;
      // polyLine.points.appendItem(mousePoint);
      visualHorizontalLine.setAttribute('x1', targetCX);
      visualHorizontalLine.setAttribute('y1', targetCY);
      visualHorizontalLine.setAttribute('x2', targetCX);
      visualHorizontalLine.setAttribute('y2', targetCY);
      svg.appendChild(visualHorizontalLine);

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

    // console.log(selectedObject);

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
    
    if (selectedObject) {
      // Convert screen coordinates to SVG coordinate
      svgPoint.x = event.x;
      svgPoint.y = event.y;
      const matrix = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
      // Handle object dragging
      if (toggleDragObjectFlag) {
        selectedObject.setAttribute('cx', matrix.x);
        selectedObject.setAttribute('cy', matrix.y);
      }
      if (toggleDrawLineFlag) {
        visualHorizontalLine.setAttribute('x2', matrix.x);
        visualHorizontalLine.setAttribute('y2', selectedObject.getAttribute('cy'));
      }
    }
  });
  
  // Handle zooming with the mouse
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

  document.addEventListener('keydown', (event) => {
    // TODO: Do we want to implement hotkey shortcuts?
    const key = event.code;
    if (key === 'Escape' && toggleDrawLineFlag) {
      svg.removeChild(visualHorizontalLine);
      selectedObject.setAttribute('stroke', 'none');
      selectedObject = null;
    }
  });

  // Handle zooming on the UI
  zoomSlider.addEventListener('input', (event) => {
    const value = event.target.value;
    zoomLevel = value;
    zoomLevelLabel.textContent = zoomLevel + '%';
    svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`);
  });
}

function offFlag() {
  togglePanningFlag = false;
  toggleDragObjectFlag = false;
  toggleDrawNodeFlag = false;
  toggleDrawTextFlag = false;
  toggleDrawLineFlag = false;
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
          toggleDrawLineFlag = true;
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
