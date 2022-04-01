import { UIMode } from './uimode.js';
import { drawLine, drawTask } from './draw.js';
import { calculateExpectedTime } from '../js_modules/calculations.js';

const doc = document;
const svg = doc.querySelector('#svg');
const uiContainer = doc.querySelector('#ui-container');
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');
const textContainer = doc.querySelector('#text-container');
const zoomSlider = doc.querySelector('#zoom-slider');

let currentNumTasks = 0;
let currentNumEdges = 0;

export function EventListeners() {

  doc.querySelector('#select-btn').classList.add('btn-selected');

  doc.addEventListener('keydown', handleKeyDown);

  uiContainer.addEventListener('click', handleUIClick);

  svg.addEventListener('mousedown', handleMouseDown);

  svg.addEventListener('mouseup', handleMouseUp);

  svg.addEventListener('mousemove', handleMouseMove);

  svg.addEventListener('wheel', handleMouseWheel);

}

function handleUIClick(event) {

  const target = event.target;
  const targetID = target.getAttribute('id');
  
  if (target.classList.contains('btn-function')) {
    Object.keys(UIMode).forEach((key) => UIMode[key] = false);
    UIMode[targetID] = UIMode[targetID] ? false : true;
    doc.querySelectorAll('.btn-function').forEach((btn) => btn.classList.remove('btn-selected'));
    doc.querySelector(`#${targetID}`).classList.add('btn-selected');
  }

  if (targetID === 'undo-btn') {
  } else if (targetID === 'redo-btn') {
  } else if (targetID === 'graph-btn') {
  } else if (targetID === 'present-btn') {
  } else if (targetID === 'account-btn') {
  } else if (targetID === 'export-btn') {
  }

}

let selectedObject = null;
const svgPoint = svg.createSVGPoint();
function convertToSVGCoordinates(x, y) { svgPoint.x = x; svgPoint.y = y; return svgPoint.matrixTransform(svg.getScreenCTM().inverse()); }

let zoomLevel = 1250;
let isPanning = false;
let pointerOrigin = { x: 0, y: 0 };
let currentViewBox = { x: 0, y: 0, width: zoomLevel, height: zoomLevel };
let newViewBox = { x: 0, y: 0 };
svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`)

let selectedTaskboxes = [];

let graph = {};

function handleMouseDown(event) {

  const target = event.target;
  const targetID = target.getAttribute('id');
  const targetClass = target.getAttribute('class');
  const targetParent = target.parentNode;
  const targetParentClass = targetParent.getAttribute('class');

  const matrix = convertToSVGCoordinates(event.x, event.y);

  if (UIMode['select-btn']) {
    if (targetParentClass === 'taskbox') {
      selectedObject = targetParent;
    }
  }

  if (UIMode['move-btn']) {
    isPanning = true;
    pointerOrigin.x = event.x;
    pointerOrigin.y = event.y;
  }
  
  if (UIMode['add-node-btn']) {
    currentNumTasks++;
    const taskBox = drawTask(matrix.x, matrix.y, currentNumTasks)
    const taskBoxID = taskBox.getAttribute('id');
    graph[taskBoxID] = [];
  }

  if (UIMode['connect-nodes-btn']) {
    if (targetParentClass === 'taskbox') {

      selectedTaskboxes.push(targetParent);

      if (selectedTaskboxes.length >= 2) {
        const nodeA = selectedTaskboxes[0];
        const nodeB = selectedTaskboxes[1];

        const cx1 = nodeA.getAttribute('data-centerX');
        const cy1 = nodeA.getAttribute('data-centerY');
        const cx2 = nodeB.getAttribute('data-centerX');
        const cy2 = nodeB.getAttribute('data-centerY');

        if (nodeA != nodeB) {

          currentNumEdges++;
          const edge = drawLine(cx1, cy1, cx2, cy2, currentNumEdges);
          const edgeID = edge.getAttribute('id');

          graph[nodeA.getAttribute('id')].push([nodeB.getAttribute('id'), edgeID])
          graph[nodeB.getAttribute('id')].push([nodeA.getAttribute('id'), edgeID])

        }

        selectedTaskboxes = [];

      }
    }
  }

  if (UIMode['add-comment-btn']) {

  }
  
}

function handleMouseUp(event) {

  const target = event.target;
  const targetID = target.getAttribute('id');
  const targetClass = target.getAttribute('class');
  const targetParent = target.parentNode;
  const targetParentClass = targetParent.getAttribute('class');

  if (UIMode['select-btn']) {
    selectedObject = null;
  }

  if (UIMode['move-btn']) {
    isPanning = false;
    currentViewBox.x = newViewBox.x;
    currentViewBox.y = newViewBox.y;
  }
  
  if (UIMode['add-node-btn']) {

  }

  if (UIMode['connect-nodes-btn']) {

  }

  if (UIMode['add-comment-btn']) {

  }

}

function handleMouseMove(event) {

  const target = event.target;
  const targetID = target.getAttribute('id');
  const targetClass = target.getAttribute('class');
  const targetParent = target.parentNode;
  const targetParentClass = targetParent.getAttribute('class');

  const matrix = convertToSVGCoordinates(event.x, event.y);

  if (UIMode['select-btn']) {
    if (selectedObject) {
      selectedObject.setAttribute('x', matrix.x);
      selectedObject.setAttribute('y', matrix.y);

      for (const node in graph) {
        const connected = graph[node];
        if (connected) {
          console.log('updating');
          for (const arr of connected) {
            const [nodeB, edge] = arr;
            const nodeBDOM = doc.querySelector(`#${nodeB}`);
            const edgeDOM = doc.querySelector(`#${edge}`);
            edgeDOM.setAttribute('x1', selectedObject.getAttribute('data-centerX'));
            edgeDOM.setAttribute('y1', selectedObject.getAttribute('data-centerY'));
            edgeDOM.setAttribute('x2', 450);
            edgeDOM.setAttribute('y2', 450);
          }
        }
      }
    }
  }

  if (UIMode['move-btn']) {
    if (isPanning) {
      newViewBox.x = currentViewBox.x - (event.x - pointerOrigin.x);
      newViewBox.y = currentViewBox.y - (event.y - pointerOrigin.y);
      svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${zoomLevel} ${zoomLevel}`);0
    }
  }
  
  if (UIMode['add-node-btn']) {

  }

  if (UIMode['connect-nodes-btn']) {

  }

  if (UIMode['add-comment-btn']) {

  }

}

function handleMouseWheel(event) {
  const deltaY = event.deltaY;
  if (deltaY < 0) { // Zooming in
    zoomLevel += 10;
  }
  else if (deltaY > 0) { // Zooming out
    zoomLevel -= 10;
  }
  svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`)
}

function handleKeyDown(event) {}