import { UIMode } from './uimode.js';
import { normalColor, criticalColor, drawLine, drawTask } from './draw.js';
import { calculateExpectedTime } from '../js_modules/calculations.js';
import { Task } from './task.js';

const doc = document;
const svg = doc.querySelector('#svg');
const uiContainer = doc.querySelector('#ui-container');
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');
const commentContainer = doc.querySelector('#comment-container');
const zoomSlider = doc.querySelector('#zoom-slider');
const commentBox = doc.querySelector('#comment-box');

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
    getCriticalPath();
    console.log(network);
  }

}

let selectedObject = null;
const svgPoint = svg.createSVGPoint();
function convertToSVGCoordinates(x, y) { svgPoint.x = x; svgPoint.y = y; return svgPoint.matrixTransform(svg.getScreenCTM().inverse()); }

let zoomLevel = 800;
let isPanning = false;
let pointerOrigin = { x: 0, y: 0 };
let currentViewBox = { x: 0, y: 0, width: zoomLevel, height: zoomLevel };
let newViewBox = { x: 0, y: 0 };
svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${zoomLevel} ${zoomLevel}`)

let selectedTaskboxes = [];

let graph = {};
let network = {};


function handleMouseDown(event) {

  const target = event.target;
  const matrix = convertToSVGCoordinates(event.x, event.y);

  let node = target.closest('.taskbox');

  if (UIMode['select-btn']) {
    if (target.className !== 'task-name' && target.className !== 'team-name' && target.className !== 'assignee-name' && target.className !== 'topt' && target.className !== 'tlikely' && target.className !== 'tpess' && target.className !== 'select-status') {
      if (node) {
        selectedObject = node;
      }
    }
  }

  if (UIMode['move-btn']) {
    isPanning = true;
    pointerOrigin.x = event.x;
    pointerOrigin.y = event.y;
  }
  
  if (UIMode['add-node-btn']) {

    if (target.id === 'svg') {

      currentNumTasks++;
      const task = new Task(currentNumTasks);
      network[`node${currentNumTasks}`] = task;

      const taskBox = drawTask(matrix.x, matrix.y, currentNumTasks);
      const id = taskBox.getAttribute('id');
      network[id].dom = taskBox;

      const topt = taskBox.children[0].children[3].children[0];
      const tlikely = taskBox.children[0].children[4].children[0];
      const tpess = taskBox.children[0].children[5].children[0];
      const expectedTime = taskBox.children[0].children[6].children[0];
      const status = taskBox.children[0].children[8];

      topt.addEventListener('input', (event) => {
        if (topt.value !== '' && tlikely.value !== '' && tpess.value !== '') {
          expectedTime.textContent = calculateExpectedTime(tpess.value, topt.value, tlikely.value);
          network[id].duration = Number(expectedTime.textContent);
        }
      });

      tlikely.addEventListener('input', (event) => {
        if (topt.value !== '' && tlikely.value !== '' && tpess.value !== '') {
          expectedTime.textContent = calculateExpectedTime(tpess.value, topt.value, tlikely.value);
          network[id].duration = Number(expectedTime.textContent);
        }
      });

      tpess.addEventListener('input', (event) => {
        if (topt.value !== '' && tlikely.value !== '' && tpess.value !== '') {
          expectedTime.textContent = calculateExpectedTime(tpess.value, topt.value, tlikely.value);
          network[id].duration = Number(expectedTime.textContent);
        }
      });

      status.addEventListener('change', (event) => {
        const value = event.target.value;
        const div = taskBox.children[0];
        if (value === 'Completed') {
          div.style.borderColor = '#b1d5b1';
        } else if (value === 'Delayed') {
          div.style.borderColor = '#ffcd75';
        } else if (value === 'In Progress') {
          div.style.borderColor = '#2f3b47';
        }
      });

      const taskBoxID = taskBox.getAttribute('id');
      graph[taskBoxID] = [];

    }

  }

  if (UIMode['connect-nodes-btn']) {
    
    if (node) {
      
      selectedTaskboxes.push(node);
      
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

            network[nodeB_ID].predecessors.push(network[nodeA_ID]);
            network[nodeA_ID].successors.push(network[nodeB_ID]);
          }
        }
        selectedTaskboxes = [];
      }
    }
    else if (target.id === 'svg') {
      selectedTaskboxes = [];
    }

  }

  if (UIMode['add-comment-btn']) {
    if (target.id === 'svg') {
      const commentBox = document.createElement('div');
      commentBox.setAttribute('class', 'comment-box');
      const closeBtn = document.createElement('button');
      closeBtn.setAttribute('class', 'comment-close-btn');
      closeBtn.innerHTML = 'X';
      closeBtn.addEventListener('click', (event) => {
        commentContainer.removeChild(closeBtn.parentElement);
      });
      commentBox.appendChild(closeBtn);

      const commentMsg = document.createElement('div');
      commentMsg.setAttribute('class', 'comment-msg');
      commentMsg.setAttribute('contenteditable', 'true');
      commentMsg.innerHTML = 'Enter comment here';
      commentBox.appendChild(commentMsg);

      commentBox.style.left = event.x + 'px';
      commentBox.style.top = event.y + 'px';
      commentContainer.appendChild(commentBox);

    }
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

      if (connected) {
        
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


function performForwardPass() {
  const g = Object.values(network);
  const n = g.length;
  const durations = g.map((e) => e.duration);
  if (durations.every((val) => val > -1)) {
    g[0].es = 1;
    g[0].ef = g[0].es + g[0].duration - 1;
    for (let i = 1; i < n; i++) {
      const task = g[i];
      const maxEF = Math.max(...task.predecessors.map((task) => task.ef));
      task.ef = maxEF + task.duration;
      task.es = maxEF + 1;
    }
  }
}

function performBackwardPass() {
  const g = Object.values(network);
  const n = g.length;
  g[n - 1].lf = g[n - 1].ef;
  g[n - 1].ls = g[n - 1].lf - g[n - 1].duration + 1;
  for (let i = n - 2; i >= 0; i--) {
    const task = g[i];
    const minLS = Math.min(...task.successors.map((task) => task.ls));
    task.lf = minLS - 1;
    task.ls = task.lf - task.duration + 1;
  }
}

function calculateTaskFloats() {
  const g = Object.values(network);
  for (const task of g) {
    task.float = task.lf - task.ef;
    if (task.float === 0) {
      task.isCritical = true;
    }
  }
}

function getCriticalPath() {
  // TODO: This only works once everything is all set up. The nodes have to be properly connected and the estimations should be given. We can calculate path with button click
  // The passes can produce unexpected values if we attempt to do it each time we connect a node
  performForwardPass();
  performBackwardPass();
  calculateTaskFloats();
}






