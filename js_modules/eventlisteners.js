import { UIMode } from './uimode.js';
import { normalColor, criticalColor, drawLine, drawTask } from './draw.js';
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

  svg.addEventListener('contextmenu', handleContextMenu);

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

    if (targetID === 'svg') {

      currentNumTasks++;
      const taskBox = drawTask(matrix.x, matrix.y, currentNumTasks);

      const topt = taskBox.children[0].children[3];
      const tlikely = taskBox.children[0].children[4];
      const tpess = taskBox.children[0].children[5];
      const expectedTime = taskBox.children[0].children[6].children[0];

      topt.addEventListener('input', (event) => {
        if (topt.value !== '' && tlikely.value !== '' && tpess.value !== '') {
          expectedTime.textContent = calculateExpectedTime(tpess.value, topt.value, tlikely.value);
        }
      });

      tlikely.addEventListener('input', (event) => {
        if (topt.value !== '' && tlikely.value !== '' && tpess.value !== '') {
          expectedTime.textContent = calculateExpectedTime(tpess.value, topt.value, tlikely.value);
        }
      });

      tpess.addEventListener('input', (event) => {
        if (topt.value !== '' && tlikely.value !== '' && tpess.value !== '') {
          expectedTime.textContent = calculateExpectedTime(tpess.value, topt.value, tlikely.value);
        }
      });

      const taskBoxID = taskBox.getAttribute('id');
      graph[taskBoxID] = [];

    }

  }

  if (UIMode['connect-nodes-btn']) {

    if (targetParentClass === 'taskbox') {

      targetParent.children[0].style.borderColor = 'gray';

      selectedTaskboxes.push(targetParent);

      if (selectedTaskboxes.length >= 2) {
        const nodeA = selectedTaskboxes[0];
        const nodeA_ID = nodeA.getAttribute('id');
        const nodeB = selectedTaskboxes[1];
        const nodeB_ID = nodeB.getAttribute('id');

        const cx1 = nodeA.getAttribute('data-centerX');
        const cy1 = nodeA.getAttribute('data-centerY');
        const cx2 = nodeB.getAttribute('data-centerX');
        const cy2 = nodeB.getAttribute('data-centerY');

        if (nodeA != nodeB) {

          if (!graph[nodeA_ID].some(row => row[0] === nodeB_ID) && !graph[nodeB_ID].some(row => row[0] === nodeA_ID)) {
            currentNumEdges++;
            const edge = drawLine(cx1, cy1, cx2, cy2, currentNumEdges);
            const edgeID = edge.getAttribute('id');
            graph[nodeA_ID].push([nodeB_ID, edgeID])
            graph[nodeB_ID].push([nodeA_ID, edgeID])
          }

        }

        setTimeout(() => {
          for (const box of selectedTaskboxes) box.children[0].style.borderColor = normalColor;
          selectedTaskboxes = [];
        }, 1000);

      }
    }
    else if (targetID === 'svg') {
      for (const box of selectedTaskboxes) box.children[0].style.borderColor = normalColor;
      selectedTaskboxes = [];
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

      const width = selectedObject.getAttribute('width');
      const height = selectedObject.getAttribute('height');
      const centerX = matrix.x - (width / 2);
      const centerY = matrix.y - (height / 2);

      selectedObject.setAttribute('x', centerX);
      selectedObject.setAttribute('y', centerY);
      selectedObject.setAttribute('data-centerX', matrix.x);
      selectedObject.setAttribute('data-centerY', matrix.y);

      const id = selectedObject.getAttribute('id');
      const connected = graph[id];

      for (let arr of connected) {
        const [node, edge] = arr;
        const nodeDOM = doc.querySelector(`#${node}`);
        const edgeDOM = doc.querySelector(`#${edge}`);
        edgeDOM.setAttribute('x1', selectedObject.getAttribute('data-centerX'));
        edgeDOM.setAttribute('y1', selectedObject.getAttribute('data-centerY'));
        edgeDOM.setAttribute('x2', nodeDOM.getAttribute('data-centerX'));
        edgeDOM.setAttribute('y2', nodeDOM.getAttribute('data-centerY'));
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
  if (deltaY < 0 && zoomLevel > 360) { // Zooming in
    zoomLevel -= 10;
  }
  else if (deltaY > 0) { // Zooming out
    zoomLevel += 10;
  }
  svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`)
}

function handleKeyDown(event) {}

function handleContextMenu(event) {event.preventDefault();}