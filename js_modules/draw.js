const NS = 'http://www.w3.org/2000/svg';
const criticalColor = '#ff7353';
const normalColor = '#2f3b47';

const doc = document;
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');
const textContainer = doc.querySelector('#text-container');

export function drawTask(x, y) {

  const taskBox = document.createElementNS(NS, 'foreignObject');
  const width = 340; 
  const height = 120;
  taskBox.setAttribute('class', 'taskbox');
  taskBox.setAttribute('width', width);
  taskBox.setAttribute('height', height);
  taskBox.setAttribute('x', x);
  taskBox.setAttribute('y', y);
  const div = document.createElement('div');
  div.innerHTML = `
    <input class='task-name' type='text' placeholder='Enter task name / description' />
    <input class='team-name' type='text' placeholder='Enter team name' />
    <input class='assignee-name' type='text' placeholder='Enter assignee name' />
    <input class='expected-time' type='text' placeholder='Enter expected time' />
    <label>Status:</label>
    <select>
      <option>-</option>
      <option>Completed</option>
      <option>In Progress</option>
      <option>Delayed</option>
    </select>
  `;
  div.setAttribute('class', 'taskboxDIV');
  taskBox.appendChild(div);
  nodeContainer.appendChild(taskBox);

}

export function drawLine(nodeA, nodeB) {

  const line = createElementNS(NS, 'line');
  lineContainer.appendChild(lineContainer);

}

export function drawComment() {}
