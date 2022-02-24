const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('id', 'svg')
const svgWidth = 500;
const svgHeight = 500;
const gridBoxSize = 50;
const nodeRadius = 50;
let numNodes = 0;
let zoomLevel = 6000;

const zoomSlider = document.querySelector('#zoom-slider');
function startApp() {
  initialize();
}
startApp();

function initialize() {
  // svg.setAttribute('width', svgWidth);
  // svg.setAttribute('height', svgHeight);
  svg.setAttribute('viewBox', `0 0 500 500`)
  main.appendChild(svg);
  zoomSlider.value = 5;
  // main.firstChild.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`)
  toggleMousePanning();
  toggleDrag();
  createNode(150, 150);
  buttonEvents();
}


// TODO: If the mouse leaves the window while scrolling, it still scrolls...
let toggleMousePanningFlag = false;
function toggleMousePanning() {
  let drag = false;
  main.addEventListener('mousedown', (event) => {
    drag = true;
  });
  main.addEventListener('mouseup', (event) => {
    drag = false;
  });
  main.addEventListener('mousemove', (event) => {
    if (drag && toggleMousePanningFlag) {
      // window.scrollBy(-event.movementX, -event.movementY);
    }
  });
}

function createNode(x, y) {
  // TODO: Probably won't use <g>, will use classes instead to manage moving multiple elements
  // since <g> is entirely useless in mouseevents and we do unnecessary calculations
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  node.setAttribute('class', 'node');
  node.setAttribute('transform', `translate(${x},${y})`);
  const rcle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', nodeRadius);
  circle.setAttribute('fill', 'transparent');
  circle.setAttribute('stroke', 'black');
  circle.setAttribute('stroke-width', 5);
  circle.setAttribute('cx', 0);
  circle.setAttribute('cy', 0);

  node.appendChild(circle);
  svg.appendChild(node);
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

// TODO: Work on this more to have a smoother zoom...
zoomSlider.addEventListener('input', (event) => {
  let value = event.target.value;
  // 1 = 60%
  // 2 = 70%
  // 3 = 80%
  // 4 = 90%
  // 5 = 100%
  // 6 = 110%
  // 7 = 120%
  // 8 = 130%
  // 9 = 140%
  // 10 = 150%
  switch(value) {
    case '1':
      zoomLevel = 10000;
      break;
    case '2':
      zoomLevel = 9000;
      break;
    case '3':
      zoomLevel = 8000;
      break;
    case '4':
      zoomLevel = 7000;
      break;
    case '5':
      zoomLevel = 6000;
      break;
    case '6':
      zoomLevel = 5000;
      break;
    case '7':
      zoomLevel = 4000;
      break;
    case '8':
      zoomLevel = 3000;
      break;
  }
  main.firstChild.setAttribute('viewBox', `0 0 ${zoomLevel} ${zoomLevel}`);
});

//TODO: Study SVG paths to connect the nodes

//TODO: See how to add/create text 

//TODO: Firebase will need to keep track of all of the node's positions using translate(x,y)



// TODO: Select multiple elements with drag selection
// Use a div and detect whether the svgs are overlapping with it

// TODO: The unit of time is days

// TODO: CSS Desktop only display, if it was on mobile then just view only

// TODO: Calculate expected duration: E = (O + (4*M) + P) / 6 
//       where O is optimistic time - the least amount of time to accomplish
//       where P is the max time to accomplish, worst case
//       where M is the most likely time, best estimate, assume no problems
//       where E is the expected time, realistic duration
function calculateExpectedDuration(O, P, M) {
  return (O + (4 * M) + P) / 6;
}

// The larger this result, the less confidence you have in estimate, vice versa
function calculateStandardDeviationDuration(P, O) {
  return (P- O) / 6;
}
