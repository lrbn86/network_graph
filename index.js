const main = document.querySelector('#main');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const svgWidth = 10000;
const svgHeight = 10000;
const gridBoxSize = 50;
const nodeRadius = 50;
let numNodes = 0;
svg.setAttribute('width', svgWidth);
svg.setAttribute('height', svgHeight);
main.appendChild(svg);

// Center the document body
window.scrollTo(svgWidth / 2, svgHeight / 2);

// TODO: If the mouse leaves the window, it still scrolls...
function toggleMousePanning() {
  let drag = false;
  main.addEventListener('mousedown', (event) => {
    drag = true;
  });
  main.addEventListener('mouseup', (event) => {
    drag = false;
  });
  document.body.addEventListener('mouseleave', (event) => {
    drag = false;
  });
  main.addEventListener('mousemove', (event) => {
    if (drag) {
      window.scrollBy(-event.movementX, -event.movementY);
    }
  });
}
toggleMousePanning();

// Let the browser handle scroll and zoom
function createGrid() {
  let lineColor = 'black'
  let lineOpacity = .5;
  let num = gridBoxSize;
  let increment = gridBoxSize;
  const verticalLineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  verticalLineGroup.setAttribute('class', 'vertical-line-group');
  for (let i = 0; i < svgWidth; i++) {
    const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    verticalLine.setAttribute('x1', num);
    verticalLine.setAttribute('x2', num);
    verticalLine.setAttribute('y1', 0);
    verticalLine.setAttribute('y2', svgHeight);
    verticalLine.setAttribute('stroke', lineColor);
    verticalLine.setAttribute('opacity', lineOpacity);
    verticalLineGroup.appendChild(verticalLine);
    num += increment;
  }
  svg.appendChild(verticalLineGroup);
  num = gridBoxSize;
  const horizontalLineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  horizontalLineGroup.setAttribute('class', 'horizontal-line-group');
  for (let i = 0; i < svgHeight; i++) {
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', 0);
    horizontalLine.setAttribute('x2', svgWidth);
    horizontalLine.setAttribute('y1', num);
    horizontalLine.setAttribute('y2', num);
    horizontalLine.setAttribute('stroke', lineColor);
    horizontalLine.setAttribute('opacity', lineOpacity);
    horizontalLineGroup.appendChild(horizontalLine);
    num += increment;
  }
  svg.appendChild(horizontalLineGroup);
}
createGrid();

function createNode(x, y) {
  // TODO: Probably won't use <g>, will use classes instead to manage moving multiple elements
  // since <g> is entirely useless in mouseevents and we do unnecessary calculations
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  node.setAttribute('class', 'node');
  node.setAttribute('transform', `translate(${x},${y})`);
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', nodeRadius);
  circle.setAttribute('fill', 'transparent');
  circle.setAttribute('stroke', 'black');
  circle.setAttribute('stroke-width', 5);
  circle.setAttribute('cx', 0);
  circle.setAttribute('cy', 0);

  node.appendChild(circle);
  svg.appendChild(node);
}
createNode(svgWidth / 2 + 650, svgHeight / 2 + 350);

const createNodeBtn = document.querySelector('#create-node-btn');
createNodeBtn.addEventListener('click', nodeBtnClick);
function nodeBtnClick() {
  createNodeBtn.disabled = true;
}

function nodeDrag() {
  let selected = null;
  function dragStart(event) {
    let target = event.target.parentNode;
    if (target.getAttribute('class') === 'node') {
      selected = target;
    }
    // // // TODO: Toggle create node button... for now using limit
    // if (createNodeBtn.disabled && numNodes < 1) {
    //   console.log('Created a node!')
    //   createNode(event.pageX, event.pageY);
    //   numNodes++;
    // }
  }
  function dragEnd(event) {
    selected = null;
  }
  function drag(event) {
    let x = event.pageX;
    let y = event.pageY; 
    if (selected) {
      // source: https://bl.ocks.org/danasilver/cc5f33a5ba9f90be77d96897768802ca
      // TODO: Toggle gridlike movements
      let gridX = round(Math.max(nodeRadius, Math.min(svgWidth - nodeRadius, x)), gridBoxSize);
      let gridY = round(Math.max(nodeRadius, Math.min(svgHeight - nodeRadius, y)), gridBoxSize);
      selected.setAttribute('transform', `translate(${gridX}, ${gridY})`);
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
nodeDrag();

function zoom() {
  window.addEventListener('wheel', (event) => {
  // TODO: Think about whether to stick with DOM manipulation or Canvas manipulation
  // We do not want to interfere with the default zoom in on the browser
  // We want to be able to zoom in with just the div??
  // We also need to implement a zoom feature that accepts two keys (hold down a ctrl button or something)
  if (event.altKey) { // We will use the alt key for modifier key
    // The alt key needs to be held down for zooming to work
    console.log('scrolling')
    
  }
  });
  window.addEventListener('keydown', (event) => {
    // MacOS: CMD is 'OSLeft', vice versa for the left
    //        Option is 'AltLeft', vice versa for right
    //        Control is 'ControlLeft'
    // Window: 
  })
}
zoom();

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
