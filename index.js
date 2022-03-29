const root = document.querySelector('#root');
const svg = document.querySelector('#svg');
const statusMsg = document.querySelector('#status-message');

const nodeRadius = 45;
const normalColor = '#2F3B47';
const criticalColor = '#FF7353';
const lineStrokeWidth = 20;
let currentNumNodes = 0;
let currentNumEdges = 0;

const NS = 'http://www.w3.org/2000/svg'; 


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
const edgesContainer = document.createElementNS(NS, 'g');
edgesContainer.setAttribute('id', 'edges-container');
svg.appendChild(edgesContainer);

const nodesContainer = document.createElementNS(NS, 'g');
nodesContainer.setAttribute('id', 'nodes-container');
svg.appendChild(nodesContainer);

const commentContainer = document.createElementNS(NS, 'g');
commentContainer.setAttribute('id', 'comment-container');
svg.appendChild(commentContainer);

const tasksContainer = document.createElementNS(NS, 'g');
tasksContainer.setAttribute('id', 'tasks-container');
svg.appendChild(tasksContainer);

drawTaskBox(350, 350);

let graph = {};

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
    
    if (UIMode['select-btn'][0]) {
      if (targetClass === 'node') {
        selectedObject = target;
      }
    }

    if (UIMode['move-btn'][0]) {
      isPanning = true;
      pointerOrigin.x = event.x;
      pointerOrigin.y = event.y;
    }

    // Handle node creation
    if (UIMode['add-node-btn'][0]) {
    }

    if (UIMode['connect-nodes-btn'][0]) {
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
  taskBox.setAttribute('class', 'taskboxObj');
  taskBox.setAttribute('x', x);
  taskBox.setAttribute('y', y);
  taskBox.setAttribute('width', '335');
  taskBox.setAttribute('height', '130');
  const div = document.createElement('div');
  div.setAttribute('class', 'taskbox');
  // div.setAttribute('xmlns', "http://www.w3.org/1999/xhtml");
  div.innerHTML = `
      <p>Task: <span contenteditable>_</span></p>
      <p>Assigned: <span contenteditable>_</span></p>
      <p contenteditable>Estimated Time</p>
      <input type="date" />
    <select name='status'>
      <option value='Completed'>Completed</option>
      <option value='In Progress'>In Progress</option>
      <option value='Delayed'>Delayed</option>
    </select>
  `;
  taskBox.appendChild(div);
  tasksContainer.appendChild(taskBox);
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