const root = document.querySelector('#root');
const svg = document.querySelector('#svg');
const statusMsg = document.querySelector('#status-message');

const nodeRadius = 45;
const normalColor = '#2F3B47';
const criticalColor = '#FF7353';
const lineStrokeWidth = 10;
let currentNumNodes = 0;
let currentNumEdges = 0;

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
  drawGridPoints();
  EventListeners();
  UIButtonEvents();
}

// These containers help control what should be drawn first since SVG is based on the painter-model
// e.g. the nodes will be drawn on top of the edges
const edgesContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
edgesContainer.setAttribute('id', 'edges-container');
svg.appendChild(edgesContainer);

const nodesContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
nodesContainer.setAttribute('id', 'nodes-container');
svg.appendChild(nodesContainer);

const commentContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
commentContainer.setAttribute('id', 'comment-container');
svg.appendChild(commentContainer);

const datesTextContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
datesTextContainer.setAttribute('id', 'dates-text-container');
svg.appendChild(datesTextContainer);

let graph = {};
let connectedNodes = [];
let nodesEdges = {};
let selectedNodes = [];

const svgPoint = svg.createSVGPoint();

let togglePanningFlag = false;
let toggleDragObjectFlag = true;
let toggleDrawNodeFlag = false;
let toggleDrawCommentFlag = false;
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
      // Make sure that we are not holding an object before we draw a node
      if (!selectedObject) {
        setStatus('Placing nodes');
        drawNode(matrix.x, matrix.y);
        graph[`node${currentNumNodes}`] = [];
        nodesEdges[`node${currentNumNodes}`] = [];
      }
      if (event.target.getAttribute('class') === 'node') {
        event.target.setAttribute('stroke', normalColor);
        event.target.setAttribute('stroke-width', '45');
        event.target.setAttribute('stroke-opacity', '.2');
        selectedNodes.push(event.target.getAttribute('id'));
        if (selectedNodes.length > 1) {
          const nodeA = selectedNodes[0];
          const nodeB = selectedNodes[1];
          if (nodeA !== nodeB) {
            connectNodes(nodeA, nodeB);
          } else {
            // TODO: If we click on the same node again, we will edit the date
            console.log('Same node');
          }
        }
      }
      if (event.target.getAttribute('id') === 'svg' && selectedNodes.length === 1) {
        document.getElementById(selectedNodes[0]).setAttribute('stroke', 'none');
        selectedNodes = [];
        selectedObject = null;
      }
    }
    // TODO: Handle comment creation
    if (toggleDrawCommentFlag) {
      drawComment(matrix.x, matrix.y);
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
    
    // Check if we are currently holding an object
    if (selectedObject) {
      // Handle object dragging
      if (toggleDragObjectFlag) {
        selectedObject.setAttribute('cx', matrix.x);
        selectedObject.setAttribute('cy', matrix.y);
        
        // Update the positions of the nodes and edges
        if (connectedNodes) {
          connectedNodes.forEach((group) => {
            const nodeA = group[0];
            const nodeB = group[1];
            const edge = group[2];
            edge.setAttribute('x1', nodeA.getAttribute('cx'));
            edge.setAttribute('y1', nodeA.getAttribute('cy'));
            edge.setAttribute('x2', nodeB.getAttribute('cx'));
            edge.setAttribute('y2', nodeB.getAttribute('cy'));
          });
        }
      }
    }
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
        selectedNodes.forEach((nodeID) => document.getElementById(nodeID).setAttribute('stroke', 'none'));
        selectedNodes = [];
        selectedObject = null;
      }
    }
    if (key === 'Delete' || key === 'Backspace') {
      if (toggleDrawNodeFlag) {
        const className = selectedObject.getAttribute('class');
        if (className === 'node') {
          const targetID = selectedObject.getAttribute('id');
          deleteNode(targetID);
        }
      }
    }
  });
}

// TODO:
function drawComment(x, y) {
  const object = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('style', 'width: 500px; height:50px; font-size:40px;');
  input.setAttribute('autofocus', true);
  object.setAttribute('x', x);
  object.setAttribute('y', y);
  object.setAttribute('height', 50);
  object.setAttribute('width', 500);
  object.appendChild(input);
  commentContainer.appendChild(object);
  return object;
}

// Draw a node at a point
function drawNode(x, y) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  currentNumNodes++;
  node.setAttribute('id', `node${currentNumNodes}`);
  node.setAttribute('class', 'node');
  node.setAttribute('r', nodeRadius);
  node.setAttribute('fill', normalColor);
  node.setAttribute('cx', x);
  node.setAttribute('cy', y);
  nodesContainer.appendChild(node);
  return node;
}

// Delete a specific node
function deleteNode(targetID) {
  // Remove the deleted node references in graph
  for (const id in graph) {
    const arr = graph[id];
    const index = arr.indexOf(targetID);
    if (index > -1) arr.splice(index, 1);
  }
  // Remove the node from graph
  delete graph[targetID];
  // Remove the node from the DOM
  nodesContainer.removeChild(document.getElementById(targetID));

  // Delete all the edges that were connected to that deleted node
  const edgesToDelete = nodesEdges[targetID];
  for (const id in nodesEdges) nodesEdges[id] = nodesEdges[id].filter((edgeID) => !edgesToDelete.includes(edgeID));
  // Remove the reference to the deleted node in nodesEdges
  delete nodesEdges[targetID];
  // Remove the edges from the DOM
  edgesToDelete.forEach((edgeID) => edgesContainer.removeChild(document.getElementById(edgeID)));
  
  selectedNodes = [];
  selectedObject = null;
}

// Connect two nodes with an edge/line
function connectNodes(nodeA, nodeB) {
  if (!graph[nodeA].includes(nodeB) && !graph[nodeB].includes(nodeA)) {
    graph[nodeA].push(nodeB);
    graph[nodeB].push(nodeA);
    const x1 = document.getElementById(nodeA).getAttribute('cx');
    const y1 = document.getElementById(nodeA).getAttribute('cy');
    const x2 = document.getElementById(nodeB).getAttribute('cx');
    const y2 = document.getElementById(nodeB).getAttribute('cy');
    const edge = drawEdge(x1, y1, x2, y2);
    nodesEdges[nodeA].push(edge.getAttribute('id'));
    nodesEdges[nodeB].push(edge.getAttribute('id'));
    connectedNodes.push([document.getElementById(nodeA), document.getElementById(nodeB), edge]);
    setStatus(`${nodeA} and ${nodeB} are now connected.`);
    setTimeout(() => {
      document.getElementById(nodeA).setAttribute('stroke', 'none');
      document.getElementById(nodeB).setAttribute('stroke', 'none');
    }, 500);
  } else {
    selectedNodes.forEach((nodeID) => document.getElementById(nodeID).setAttribute('stroke', 'none'));
  }
  selectedObject = null;
  selectedNodes = [];
}

// Create an edge/line between two points
function drawEdge(x1, y1, x2, y2) {
  const edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  currentNumEdges++;
  edge.setAttribute('id', `line${currentNumEdges}`);
  edge.setAttribute('class', 'line');
  edge.setAttribute('stroke', normalColor);
  edge.setAttribute('stroke-width', lineStrokeWidth);
  edge.setAttribute('x1', x1);
  edge.setAttribute('y1', y1);
  edge.setAttribute('x2', x2);
  edge.setAttribute('y2', y2);
  edgesContainer.appendChild(edge);
  drawTaskBox();
  return edge;
}

function drawTaskBox() {
  const taskBox = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  taskBox.setAttribute('x', '150');
  taskBox.setAttribute('y', '150');
  taskBox.setAttribute('width', '200');
  taskBox.setAttribute('height', '200');
  const div = document.createElement('div');
  div.setAttribute('class', 'taskbox');
  div.setAttribute('xmlns', "http://www.w3.org/1999/xhtml");
  div.innerHTML = `
    <p>Estimated Time</p>
  `;
  taskBox.appendChild(div);
  edgesContainer.appendChild(taskBox);
}

function drawGridPoints() {
  const gridPointsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridPointsContainer.setAttribute('id', 'grid-points-container');
  svg.appendChild(gridPointsContainer);
}

function offFlag() {
  togglePanningFlag = false;
  toggleDragObjectFlag = false;
  toggleDrawNodeFlag = false;
  toggleDrawCommentFlag = false;
  selectedNodes.forEach((node) => document.getElementById(node).setAttribute('stroke', 'none'));
  selectedNodes = []
  selectedObject = null;
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
          setStatus('Edit node/edge mode selected');
          toggleDrawNodeFlag = true;
          break;
        case 'create-text-btn':
          offFlag();
          toggleDrawTextFlag = true;
          break;
        case 'create-comment-btn':
          offFlag();
          toggleDrawCommentFlag = true;
          break;
      }
    });
  });
}
