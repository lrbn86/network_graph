const root = document.querySelector('#root');
const svg = document.querySelector('#svg');
const statusMsg = document.querySelector('#status-message');

const nodeRadius = 45;
const normalColor = '#2F3B47';
const criticalColor = '#FF7353';
const lineStrokeWidth = 20;
let currentNumNodes = 0;
let currentNumEdges = 0;

const zoomSlider = document.querySelector('#zoom-slider');
const zoomLevelLabel = document.querySelector('#zoom-level');
// Get attributes from the zoomSlider element
let maxRange = parseInt(zoomSlider.getAttribute('max'));
let minRange = parseInt(zoomSlider.getAttribute('min'));
let stepRange = parseInt(zoomSlider.getAttribute('step'));
let zoomLevel = 1250; // Get the middle number
let zoomPercentage = 100; // Default percentage is 100%


function main() {
  initialize();
}
main();

// Initialization
function initialize() {
  zoomSlider.value = zoomLevel;
  svg.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
  root.appendChild(svg);
  SVGEventListeners();
  UIEventListeners();
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

const textContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
textContainer.setAttribute('id', 'text-container');
svg.appendChild(textContainer);

let graph = {};
let connectedNodes = [];
let nodesEdges = {};
let selectedNodes = [];

const svgPoint = svg.createSVGPoint();

function SVGEventListeners() {

  let selectedObject = null;
  let isPanning = false;
  let pointerOrigin = { x: 0, y: 0 };
  let currentViewBox = { x: 0, y: 0, width: zoomLevel, height: zoomLevel };
  let newViewBox = { x: 0, y: 0 };

  function convertToSVGCoordinates(x, y) { svgPoint.x = x; svgPoint.y = y; return svgPoint.matrixTransform(svg.getScreenCTM().inverse()); }
  
  svg.addEventListener('mousedown', (event) => {

    const target = event.target;
    const targetID = target.getAttribute('id');
    const targetClass = target.getAttribute('class');
    const matrix = convertToSVGCoordinates(event.x, event.y);
    
    // Right click to change color of nodes/edges
    if (event.button === 2) {
      if (targetClass === 'node') {
        const color = target.getAttribute('fill') === normalColor ? criticalColor : normalColor;
        target.setAttribute('fill', color);
      } else if (targetClass === 'line') {
        const color = target.getAttribute('stroke') === normalColor ? criticalColor : normalColor;
        target.setAttribute('stroke', color);
      }
      return;
    }

    if (UIMode['select-btn'][0]) {

      if (targetClass === 'node') {

        selectedObject = target;
        selectedObject.setAttribute('stroke', normalColor);
        selectedObject.setAttribute('stroke-width', '45');
        selectedObject.setAttribute('stroke-opacity', '.2');

      }

    }

    if (UIMode['move-btn'][0]) {

      isPanning = true;
      pointerOrigin.x = event.x;
      pointerOrigin.y = event.y;

    }

    // Handle node creation
    if (UIMode['add-node-btn'][0]) {
      // Make sure that we are not holding an object before we draw a node
      if (!selectedObject) {
        // Don't draw on top of another node or edge
        if (targetClass !== 'node' && targetClass !== 'line') {
          drawNode(matrix.x, matrix.y);
          graph[`node${currentNumNodes}`] = [];
          nodesEdges[`node${currentNumNodes}`] = [];
        }
      }
    }

    if (UIMode['connect-nodes-btn'][0]) {

      if (targetClass === 'node') {
        target.setAttribute('stroke', normalColor);
        target.setAttribute('stroke-width', '45');
        target.setAttribute('stroke-opacity', '.2');
        selectedNodes.push(target.getAttribute('id'));
        if (selectedNodes.length > 1) {
          const [nodeA, nodeB] = selectedNodes;
          if (nodeA !== nodeB) connectNodes(nodeA, nodeB);
        }
      }

      if (targetID === 'svg') {
        selectedNodes.forEach((node) => { const nodeDOM = document.getElementById(node); nodeDOM.setAttribute('stroke', 'none') });
        selectedNodes = [];
      }

    }

    // TODO:
    if (UIMode['add-task-btn'][0]) {
      drawTaskBox(matrix.x, matrix.y);
    }

    // TODO:
    if (UIMode['add-comment-btn'][0]) {
      drawComment(matrix.x, matrix.y);
    }

  });
  
  svg.addEventListener('mouseup', (event) => {

    if (UIMode['select-btn'][0]) {

      if (selectedObject && selectedObject.getAttribute('class') === 'node') {

        selectedObject.setAttribute('stroke', 'none');

      }

      selectedObject = null;

    }

    if (UIMode['move-btn'][0]) {

      isPanning = false;
      currentViewBox.x = newViewBox.x;
      currentViewBox.y = newViewBox.y;

    }

  });
  
  svg.addEventListener('mousemove', (event) => {
    const matrix = convertToSVGCoordinates(event.x, event.y);

    if (UIMode['move-btn'][0]) {
      if (isPanning) {
        newViewBox.x = currentViewBox.x - (event.x - pointerOrigin.x);
        newViewBox.y = currentViewBox.y - (event.y - pointerOrigin.y);
        svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${zoomLevel} ${zoomLevel}`);
      }
    }
    
    if (UIMode['select-btn'][0]) {

      if (selectedObject) {

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
  // // Hacky way of keeping zoom percentages consistent with UI and mouse wheel control
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
    zoomLevelLabel.textContent = zoomLevel;
    zoomLevelLabel.textContent = zoomLevelsPercentageMap[zoomLevel] + '%';
    svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`);
  });
}

// TODO:
// Draw comment at a point
function drawComment(x, y) {
  const object = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  const input = document.createElement('textarea');
  const image = document.createElement('img');
  image.setAttribute('src', 'images/comment.svg');
  image.setAttribute('height', 75);
  image.setAttribute('width', 75);
  input.setAttribute('class', 'comment');
  input.setAttribute('autofocus', true);
  input.setAttribute('cols', 400);
  input.setAttribute('rows', 120);
  object.setAttribute('x', x);
  object.setAttribute('y', y);
  object.setAttribute('height', 300);
  object.setAttribute('width', 500);
  object.appendChild(image);
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
  return edge;
}

function drawTaskBox(x, y) {
  const taskBox = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  taskBox.setAttribute('x', x);
  taskBox.setAttribute('y', y);
  taskBox.setAttribute('width', '335');
  taskBox.setAttribute('height', '102');
  const div = document.createElement('div');
  div.setAttribute('class', 'taskbox');
  // div.setAttribute('xmlns', "http://www.w3.org/1999/xhtml");
  div.innerHTML = `
    <p>Task</p>
    <p>Assigned member</p>
    <p>Estimated Time</p>
  `;
  taskBox.appendChild(div);
  textContainer.appendChild(taskBox);
}

// Determine what mode we are currently in
const UIMode = {
  'select-btn': [true, 'Select'],
  'move-btn': [false, 'Move'],
  'add-node-btn': [false, 'Add Node'],
  'connect-nodes-btn': [false, 'Connect Nodes'],
  'add-task-btn': [false, 'Add Task'],
  'add-comment-btn': [false, 'Add Comment']
};

// This function handles all interactivity on the UI.
function UIEventListeners() {

  // The select button is selected by default
  document.querySelector('#select-btn').classList.add('btn-selected');

  document.addEventListener('click', (event) => {

    const target = event.target;
    const btnID = event.target.getAttribute('id');

    // Check if we are clicking on the buttons on the top-left sidebar
    if (target.classList.contains('btn-function')) {

      // Reset selection
      document.querySelectorAll('.btn-function').forEach((btn) => btn.classList.remove('btn-selected'));

      // Select this button
      target.classList.add('btn-selected');

      // Reset selection
      for (const id in UIMode) UIMode[id][0] = false;

      // Toggle UI mode (e.g., if UI mode for Select button is already false, then set it to true, vice versa)
      UIMode[btnID][0] = UIMode[btnID][0] ? false: true;

      // Set status message according to what button we selected
      if (UIMode[btnID]) setStatus(UIMode[btnID][1]);

      if (btnID === 'undo-btn')
        setStatus('Undo');
      else if (btnID === 'redo-btn')
        setStatus('Redo');

    }

  });

  document.addEventListener('keydown', (event) => {});

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault() 
  });

  function setStatus(status) {
    const statusMsg = document.querySelector('#status-message');
    statusMsg.textContent = status;
  }

}



/**
 * TODO:
 * 1. Draw the nodes
 * 2. Connect the nodes with edge, the user will continue to draw polyline/line (little nodes, might be complicated) until another node is selected or user presses esc in connect nodes mode.
 * 3. Create task boxes on top of the edges manually, how can we relate the connectivity between task boxes?
 * 4. The nodes, edges, and boxes cannot be moved in selection mode to keep things simple, or they can be moved 
 *    Nodes, edges, and boxes can only be deleted and recreated to "move" them to a new place
 * 5. Once the user select save changes, grab all the information from the node dates and task boxes and relate them into a json/object
 * 
 */
