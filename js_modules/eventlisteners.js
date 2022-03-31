import { UIMode } from './uimode.js';
import { drawTask } from './draw.js';
import { calculateExpectedTime } from '../js_modules/calculations.js';

const doc = document;
const svg = doc.querySelector('#svg');
const uiContainer = doc.querySelector('#ui-container');
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');
const textContainer = doc.querySelector('#text-container');



export function EventListeners() {

  drawTask(350, 350);
  drawTask(350, 650);

  doc.querySelector('#select-btn').classList.add('btn-selected');

  uiContainer.addEventListener('click', handleUIClick);

  svg.addEventListener('mousedown', handleMouseDown);

  svg.addEventListener('mouseup', handleMouseUp);

  svg.addEventListener('mousemove', handleMouseMove);

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

function handleMouseDown(event) {

  const target = event.target;
  const targetID = target.getAttribute('id');
  const targetClass = target.getAttribute('class');
  const targetParent = target.parentNode;
  const targetParentClass = targetParent.getAttribute('class');

  if (UIMode['select-btn']) {
    if (targetParentClass === 'taskbox') {
      selectedObject = targetParent;
      console.log(selectedObject);
    }
  }

  if (UIMode['move-btn']) {

  }
  
  if (UIMode['add-node-btn']) {

  }

  if (UIMode['connect-nodes-btn']) {

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
    }
  }

  if (UIMode['move-btn']) {

  }
  
  if (UIMode['add-node-btn']) {

  }

  if (UIMode['connect-nodes-btn']) {

  }

  if (UIMode['add-comment-btn']) {

  }

}
