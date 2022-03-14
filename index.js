const root = document.querySelector('#root');
const svg = document.querySelector('#svg');
const statusMsg = document.querySelector('#status-message');

const nodeRadius = 45;
const normalColor = '#2F3B47';
const criticalColor = '#FF7353';
const lineStrokeWidth = 10;
let currentNumNodes = 0;
let currentNumLines = 0;

const zoomSlider = document.querySelector('#zoom-slider');
const zoomLevelLabel = document.querySelector('#zoom-level');
// Get attributes from the zoomSlider element
// Purpose: If the html attributes are changed, there's no need to update this JS file.
let maxRange = parseInt(zoomSlider.getAttribute('max'));
let minRange = parseInt(zoomSlider.getAttribute('min'));
let stepRange = parseInt(zoomSlider.getAttribute('step'));
let zoomLevel = 1250; // Get the middle number
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

const linesContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
linesContainer.setAttribute('id', 'lines-container')
svg.appendChild(linesContainer);

const nodesContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
nodesContainer.setAttribute('id', 'nodes-container')
svg.appendChild(nodesContainer);

let isPlacingNodes = false;

let nodePoints = [];
let linePoints = [];

let graph = {};
let nodesLines = [];

let nodesSVGGroup = [];
let linesSVGGroup = [];

let selectedNodes = [];

const svgPoint = svg.createSVGPoint();
let togglePanningFlag = false;
let toggleDragObjectFlag = true;
let toggleDrawNodeFlag = false;
let toggleDrawTextFlag = false;
let selectedObject = null;

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
      if (event.target.getAttribute('class') === 'line') {
        event.target.setAttribute('stroke-opacity', '.5');
        selectedObject = event.target;
        isPlacingNodes = false;
      } else if (event.target.getAttribute('class') === 'node') {
        event.target.setAttribute('stroke', normalColor);
        event.target.setAttribute('stroke-width', '45');
        event.target.setAttribute('stroke-opacity', '.2');
        isPlacingNodes = false;
        if (!isPlacingNodes) {
          selectedObject = event.target;
          selectedNodes.push(event.target.getAttribute('id'));
          if (selectedNodes.length > 1) {
            const nodeA = parseInt(selectedNodes[0]);
            const nodeB = parseInt(selectedNodes[1]);
            if (graph[nodeA].includes(nodeB) && graph[nodeB].includes(nodeA)) {
              setStatus(`Node ${nodeA} and Node ${nodeB} are already connected`);
            }
            if (nodeA !== nodeB) {
              if (!graph[nodeA].includes(nodeB)) {
                graph[nodeA].push(nodeB);
                const node1 = document.getElementById(nodeA);
                const node2 = document.getElementById(nodeB);
                const nodeAx = node1.getAttribute('cx');
                const nodeAy = node1.getAttribute('cy');
                const nodeBx = node2.getAttribute('cx');
                const nodeBy = node2.getAttribute('cy');
                const edge = createLine(nodeAx, nodeAy, nodeBx, nodeBy);
                linesContainer.appendChild(edge);
                linesSVGGroup.push(edge);
                nodesLines.push([document.getElementById(nodeA), document.getElementById(nodeB), edge]);
                setStatus(`Node ${nodeA} and Node ${nodeB} are now connected`);
              }
              if (!graph[nodeB].includes(nodeA)) {
                graph[nodeB].push(nodeA);
              }
              
            } else {
              setStatus(`Node ${nodeA} cannot connect itself`);
            }
            setTimeout(() => {
              document.getElementById(nodeA).setAttribute('stroke', 'none');
              document.getElementById(nodeB).setAttribute('stroke', 'none');
            }, 500);
            reset();
          }
        }
      } else {
        // Make sure that we are not holding an object before we draw a node
        if (!selectedObject) {
          isPlacingNodes = true;
          setStatus('Placing nodes');
          nodesSVGGroup.push(drawNode(matrix.x, matrix.y));
          graph[currentNumNodes] = [];
        }
        // Clear selections
        for (const node of nodesSVGGroup) {
          node.setAttribute('stroke', 'none');
        }
        for (const line of linesSVGGroup) {
          line.setAttribute('stroke-opacity', '');
        }
        reset();
      }
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
    
    if (toggleDrawNodeFlag) {
    }
    
    // Check if we are currently holding an object
    if (selectedObject) {
      // Handle object dragging
      if (toggleDragObjectFlag) {
        selectedObject.setAttribute('cx', matrix.x);
        selectedObject.setAttribute('cy', matrix.y);
        
        // Update the positions
        if (nodesLines) {
          for (let group of nodesLines) {
            const nodeA = group[0];
            const nodeB = group[1];
            const edge = group[2];
            edge.setAttribute('x1', nodeA.getAttribute('cx'));
            edge.setAttribute('y1', nodeA.getAttribute('cy'));
            edge.setAttribute('x2', nodeB.getAttribute('cx'));
            edge.setAttribute('y2', nodeB.getAttribute('cy'));
          }
        }
      }
    }
  });

  svg.addEventListener('mouseover', (event) => {
  });
  
  // Handle zooming with the mouse
  svg.addEventListener('wheel', (event) => {
    const deltaY = event.deltaY;
    if (deltaY < 0) { // Zooming in
      zoomSlider.value = parseInt(zoomSlider.value) - stepRange;
      // if (zoomLevel > minRange) {
      //   zoomPercentage += 1;
      // }
    } else if (deltaY > 0) { // Zooming out
      zoomSlider.value = parseInt(zoomSlider.value) + stepRange;
      // if (zoomLevel < maxRange) {
      //   zoomPercentage -=1;
      // }
    }
    // This dispatch is required so that if the user uses the wheel on the mouse, it will trigger the slider
    // to change accordingly. Without this, the slider will not be in the appropriate position.
    zoomSlider.dispatchEvent(new Event('input'));
  });
  // // Hacky way of keeping zoom percentages consistent with UI and mouse wheel control
  // let zoomLevelsPercentageMap = {};
  // let percent = 25;
  // for (let i = maxRange; i >= minRange; i -= stepRange) {
  //   zoomLevelsPercentageMap[i] = percent;
  //   percent += 1;
  // }
  // Handle zooming on the UI
  zoomSlider.addEventListener('input', (event) => {
    const value = event.target.value;
    zoomLevel = value;
    // zoomLevelLabel.textContent = zoomLevel;
    // zoomLevelLabel.textContent = zoomLevelsPercentageMap[zoomLevel] + '%';
    svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`);
  });
  
  // Listen for any key presses
  document.addEventListener('keydown', (event) => {
    // TODO: Do we want to implement hotkey shortcuts?
    const key = event.code;
    if (key === 'Escape') {
      if (toggleDrawNodeFlag) {
        for (const node of selectedNodes) {
          document.getElementById(node).setAttribute('stroke', 'none');
        }
        reset();
        isPlacingNodes = false;
      }
    }
    if (key === 'Delete' || key === 'Backspace') {
      if (toggleDrawNodeFlag) {
        console.log('Deleting this object', selectedObject);
        const className = selectedObject.getAttribute('class');
        if (className === 'line') {
          linesContainer.removeChild(selectedObject);
          setStatus('Deleted an edge');
        } else if (className === 'node') {
          // TODO: Also delete all the edges that were connected to this deleted node
          nodesContainer.removeChild(selectedObject);
          setStatus(`Deleted Node ${selectedObject.getAttribute('id')}`);
        }
        reset();
      }
    }
  });
}

// Draw a node at a point 
function drawNode(x, y) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  currentNumNodes++;
  node.setAttribute('id', `${currentNumNodes}`);
  node.setAttribute('class', 'node');
  node.setAttribute('r', nodeRadius);
  node.setAttribute('fill', normalColor);
  node.setAttribute('cx', x);
  node.setAttribute('cy', y);
  nodesContainer.appendChild(node);
  return node;
}

function createLine(x1, y1, x2, y2) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  currentNumLines++;
  line.setAttribute('id', `line${currentNumLines}`);
  line.setAttribute('class', 'line');
  line.setAttribute('stroke', normalColor);
  line.setAttribute('stroke-width', lineStrokeWidth);
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  linesContainer.appendChild(line);
  return line;
}

// Draw a text at a point
function drawText(x, y, matrixX, matrixY) {
}

function reset() {
  selectedObject = null;
  selectedNodes = [];
}

function offFlag() {
  isPlacingNodes = false;
  togglePanningFlag = false;
  toggleDragObjectFlag = false;
  toggleDrawNodeFlag = false;
  toggleDrawTextFlag = false;
  reset();
}

function getNodeDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function setStatus(message) {
  statusMsg.innerHTML = message;
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
          setStatus('Moving mode selected');
          break;
        case 'pan-btn':
          offFlag();
          togglePanningFlag = true;
          setStatus('Panning mode selected');
          break;
        case 'create-node-btn':
          offFlag();
          setStatus('Create node mode selected');
          toggleDrawNodeFlag = true;
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
