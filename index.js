const root = document.querySelector('#root');
const svg = document.querySelector('#svg');

const nodeRadius = 45;
const normalColor = '#2F3B47';
const criticalColor = '#FF7353';
const lineStrokeWidth = 10;
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


function startApp() {
  initialize();
}
startApp();

// Initialization
function initialize() {
  zoomSlider.value = zoomLevel;
  svg.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
  root.appendChild(svg);
  EventListeners();
  UIButtonEvents();
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
  nodesContainer.appendChild(node);
  return node;
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


// This element appears when placing a node
const nodeBackdrop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
nodeBackdrop.setAttribute('id', 'node-backdrop');
nodeBackdrop.setAttribute('r', nodeRadius);
nodeBackdrop.setAttribute('fill', normalColor);
nodeBackdrop.setAttribute('opacity', '.5');
nodeBackdrop.setAttribute('visibility', 'hidden');
svg.appendChild(nodeBackdrop);

// This element appears when placing a line
const visualPolyLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
visualPolyLine.setAttribute('id', 'visual-polyline');
visualPolyLine.setAttribute('stroke', criticalColor);
visualPolyLine.setAttribute('stroke-width', lineStrokeWidth);
visualPolyLine.setAttribute('fill', 'none');
visualPolyLine.setAttribute('points', '');
svg.appendChild(visualPolyLine);

let polyLinePoints = '';

// This element appears when placing a line
const visualLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
visualLine.setAttribute('id', 'visual-line')
visualLine.setAttribute('stroke', normalColor);
visualLine.setAttribute('stroke-width', lineStrokeWidth);
visualLine.setAttribute('opacity', '.5');
visualLine.setAttribute('visibility', 'hidden');
svg.appendChild(visualLine);

const polylinesContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
polylinesContainer.setAttribute('id', 'polylines-container')
svg.appendChild(polylinesContainer);

const nodesContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
nodesContainer.setAttribute('id', 'nodes-container')
svg.appendChild(nodesContainer);

let isPlacingNodes = false;

let nodes = [];
let nodesGroups = [];

// TODO: We can relate the poly points with the nodes, by keeping track of all the nodes' cx/cy in its own array
//       we would loop thru each polylines on mousemove and update according to all of the nodes' cx/cy
//       since we can assume that nodesPositions[0] = 'points of the first polyline' and the loop thru polylinesContainer to get each polyline
//       and update accordingly
let nodesPointsMap = {};

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
  
  // Handle MOUSE DOWN event
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
      showVisualLines();

      isPlacingNodes = true;
      const node = drawNode(nodeBackdrop.getAttribute('cx'), nodeBackdrop.getAttribute('cy'), currentNumNodes);
      nodes.push(node);
      nodesPointsMap[node.getAttribute('id')] = `${node.getAttribute('cx')},${node.getAttribute('cy')}`;
      currentNumNodes++;

      setVisualLineToNodeBackdrop();
      
      polyLinePoints += `${node.getAttribute('cx')},${node.getAttribute('cy')} `;
      visualPolyLine.setAttribute('points', polyLinePoints);
    }
    
    // Handle text creation
    if (toggleDrawTextFlag) {
      // TODO:
    }
  });
  
  // Handle MOUSE UP event
  svg.addEventListener('mouseup', (event) => {
    isDragging = false;
    currentViewBox.x = newViewBox.x;
    currentViewBox.y = newViewBox.y;
    if (selectedObject && toggleDragObjectFlag) {
      selectedObject.setAttribute('stroke', 'none');
      selectedObject = null;
    }
  });
  
  // Handle MOUSE MOVE event
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
      visualLine.setAttribute('x2', matrix.x);
      visualLine.setAttribute('y2', matrix.y);
    }
    
    // Check if we are currently holding an object
    if (selectedObject) {
      // Handle object dragging
      if (toggleDragObjectFlag) {
        selectedObject.setAttribute('cx', matrix.x);
        selectedObject.setAttribute('cy', matrix.y);

        // Update the points on the polyline
        const selectedObjectID = selectedObject.getAttribute('id');
        nodesPointsMap[selectedObjectID] = `${selectedObject.getAttribute('cx')},${selectedObject.getAttribute('cy')}`;

        // TODO: We need to get information on the specific polyline that is currently connecting the nodes
        let newPoints = Object.values(nodesPointsMap).join(' ');
        // visualPolyLine.setAttribute('points', newPoints);

      }
    }
  });

  svg.addEventListener('mouseover', (event) => {
    if (event.target.getAttribute('class', 'node') === 'node') {
      if (event.getModifierState('Shift')) {
        console.log('Another node detected.')
        nodesContainer.removeChild(event.target);
        // If we hold down shift and mouse over a node, we should ...
      }
    }
  })
  
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
  
  // Listen for any key presses
  document.addEventListener('keydown', (event) => {
    // TODO: Do we want to implement hotkey shortcuts?
    const key = event.code;
    if (key === 'Escape') {
      // If we are currently in drawing nodes/line mode when we press ESC
      if (toggleDrawNodeFlag) {
        // We want to append the newly created polyline
        if (nodes.length === 1) {
          alert('Warning: Must create at least two nodes connected by a line.')
          nodesContainer.removeChild(nodesContainer.lastChild);
        }
        createNewPolyLine(polyLinePoints);
        polyLinePoints = '';
        nodesGroups.push(nodes);
        nodes = [];
        // We are no longer placing nodes/lines
        isPlacingNodes = false;
        hideVisualLines();
      }
    }
  });
}

function createNewPolyLine(points) {
  if (nodes.length > 1) {
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('class', 'polyline');
    polyline.setAttribute('stroke', criticalColor);
    polyline.setAttribute('stroke-width', lineStrokeWidth);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('points', points);
    // svg.insertBefore(polyline, visualLine);
    polylinesContainer.appendChild(polyline);
    visualPolyLine.setAttribute('points', '');
  }
}

function setVisualLineToNodeBackdrop() {
  visualLine.setAttribute('x1', nodeBackdrop.getAttribute('cx'));
  visualLine.setAttribute('y1', nodeBackdrop.getAttribute('cy'));
  visualLine.setAttribute('x2', nodeBackdrop.getAttribute('cx'));
  visualLine.setAttribute('y2', nodeBackdrop.getAttribute('cy'));
}

function showVisualLines() {
  visualLine.setAttribute('visibility', 'visible');
}

function hideVisualLines() {
  visualLine.setAttribute('visibility', 'hidden');
}


function offFlag() {
  if (isPlacingNodes) {
    alert('Warning: Cancel placing nodes by pressing ESC before changing modes');
    return;
  }
  togglePanningFlag = false;
  toggleDragObjectFlag = false;
  toggleDrawNodeFlag = false;
  toggleDrawTextFlag = false;
  selectedObject = null;
  hideVisualLines();
  nodeBackdrop.setAttribute('visibility', 'hidden');
}

// This function handles all buttons interactivity on the UI.
function UIButtonEvents() {
  // TODO: The 'Present' button will clear all the UI, the user can only pan the SVG.
  
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
              nodeBackdrop.setAttribute('visibility', 'visible');
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
