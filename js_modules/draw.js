const NS = 'http://www.w3.org/2000/svg';
const criticalColor = '#ff7353';
const normalColor = '#2f3b47';

const doc = document;
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');
const textContainer = doc.querySelector('#text-container');

export function drawTask(x, y) {

  const width = 340; 
  const height = 120;

  const centerX = x + (width / 2);
  const centerY = y + (height / 2);
  
  const taskBox = document.createElementNS(NS, 'foreignObject');
  taskBox.setAttribute('class', 'taskbox');
  taskBox.setAttribute('width', width);
  taskBox.setAttribute('height', height);
  taskBox.setAttribute('x', x);
  taskBox.setAttribute('y', y);
  taskBox.setAttribute('data-centerX', centerX);
  taskBox.setAttribute('data-centerY', centerY);

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

export function drawLine(x1, y1, x2, y2) {
  
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('class', 'line');
  line.setAttribute('stroke', normalColor);
  line.setAttribute('stroke-width', '10');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  lineContainer.appendChild(line);

}

export function drawComment() {}
