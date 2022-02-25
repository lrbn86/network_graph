const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg')
const svgWidth = 500;
const svgHeight = 500;
const gridBoxSize = 50;
const nodeRadius = 50;
let numNodes = 0;
let zoomLevel = 1250;

const zoomSlider = document.querySelector('#zoom-slider');

function startApp() {
  initialize();
}
startApp();

function initialize() {
  zoomSlider.value = zoomLevel;
  svg.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
  main.appendChild(svg);
  toggleMousePanning();
  toggleDrag();
  createNode(150, 150);
  buttonEvents();
}

function createNode(x, y) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  node.setAttribute('class', 'node');
  node.setAttribute('r', nodeRadius);
  node.setAttribute('fill', 'transparent');
  node.setAttribute('stroke', 'black');
  node.setAttribute('stroke-width', 5);
  node.setAttribute('cx', x);
  node.setAttribute('cy', y);
  svg.appendChild(node);
}

// TODO: If the mouse leaves the window while scrolling, it still scrolls...
let toggleMousePanningFlag = false;
function toggleMousePanning() {
  let drag = false;
  svg.addEventListener('mousedown', (event) => {
    drag = true;
  });
  svg.addEventListener('mouseup', (event) => {
    drag = false;
  });
  svg.addEventListener('mousemove', (event) => {
    if (drag && toggleMousePanningFlag) {
      // window.scrollBy(-event.movementX, -event.movementY);
      console.log(event.movementX, event.movementY)
      svg.setAttribute('viewBox', `${-event.movementX} ${-event.movementY} 1000 1000`);
    }
  });
}

let toggleDragFlag = true;
function toggleDrag() {
  let selected = null;
  function dragStart(event) {
    let target = event.target.parentNode;
    // If we click on the scroll bars, we get error here.
    if (target.getAttribute('class') === 'node') {
      selected = target;
    }
  }
  function dragEnd(event) {
    selected = null;
  }
  function drag(event) {
    let x = event.x;
    let y = event.y; 
    if (selected && toggleDragFlag) {
      // source: https://bl.ocks.org/danasilver/cc5f33a5ba9f90be77d96897768802ca
      // TODO: Toggle gridlike movements
      // let gridX = round(Math.max(nodeRadius, Math.min(svgWidth - nodeRadius, x)), gridBoxSize);
      // let gridY = round(Math.max(nodeRadius, Math.min(svgHeight - nodeRadius, y)), gridBoxSize);
      // selected.setAttribute('transform', `translate(${gridX}, ${gridY})`);
      // selected.setAttribute('transform', `translate(${x}, ${y})`);
      console.log(x, y);
    }
  }
  // source: https://bl.ocks.org/danasilver/cc5f33a5ba9f90be77d96897768802ca
  function round(p, n) {
    return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
  }
  window.addEventListener('mousedown', dragStart);
  window.addEventListener('mouseup', dragEnd);
  window.addEventListener('mousemove', drag);
}

function buttonEvents() {
  // The pointer button will be the default select.
  // TODO: There's def a better way to do this...
  document.querySelectorAll('.btn-function')[0].classList.add('btn-selected');
  document.querySelectorAll('.btn-function').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-function').forEach((btn) => {
        btn.classList.remove('btn-selected');
      });
      btn.classList.add('btn-selected');

      switch (btn.id) {
        case 'pointer-btn':
          toggleDragFlag = true;
          toggleMousePanningFlag = false;
          break;
        case 'pan-btn':
          toggleDragFlag = false;
          toggleMousePanningFlag = true;
          break;
        case 'create-node-btn':
          toggleDragFlag = false;
          toggleMousePanningFlag = false;
          break;
        case 'create-line-btn':
          toggleDragFlag = false;
          toggleMousePanningFlag = false;
          break;
        case 'create-text-btn':
          toggleDragFlag = false;
          toggleMousePanningFlag = false;
          break;
        case 'create-comment-btn':
          toggleNodeDragFlag = false;
          toggleMousePanningFlag = false;
          break;
      }
    });
  });
}

zoomSlider.addEventListener('input', (event) => {
  let value = event.target.value;
  zoomLevel = value;
  main.firstChild.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
});
