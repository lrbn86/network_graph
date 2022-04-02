const NS = 'http://www.w3.org/2000/svg';
export const criticalColor = '#ff7353';
export const normalColor = '#2f3b47';

const doc = document;
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');

export function drawTask(x, y, id) {

  const width = 400; 
  const height = 265;
  
  const taskBox = document.createElementNS(NS, 'foreignObject');
  taskBox.setAttribute('id', `node${id}`);
  taskBox.setAttribute('class', 'taskbox');
  taskBox.setAttribute('width', width);
  taskBox.setAttribute('height', height);
  taskBox.setAttribute('x', x - (width / 2));
  taskBox.setAttribute('y', y - (height / 2));
  taskBox.setAttribute('data-centerX', x);
  taskBox.setAttribute('data-centerY', y);
  
  const div = document.createElement('div');
  div.innerHTML = `

    <p>Task Name: <input class='task-name' type='text' placeholder='Enter task name' /></p>
    <p>Team Name: <input class='team-name' type='text' placeholder='Enter team name' /></p>

    <p>Assigned to: <input class='assignee-name' type='text' placeholder='Enter assignee name' /></p>

    <p>Optimistic Time:  <input class='topt' type='number' /> days</p>
    <p>Most Likely Time: <input class='tlikely' type='number' /> days</p>
    <p>Pessimistic Time: <input class='tpess' type='number' /> days</p>

    <p>Expected Time: <span class='expected-time'> ___ </span> days</p>
    <label>Status:</label>
    <select>
      <option>In Progress</option>
      <option>Completed</option>
      <option>Delayed</option>
    </select>
  `;

  
  div.setAttribute('class', 'taskboxDIV');
  taskBox.appendChild(div);
  nodeContainer.appendChild(taskBox);
  // const n = document.createElementNS(NS, 'circle');
  // n.setAttribute('fill', 'black');
  // n.setAttribute('r', '45');
  // n.setAttribute('cx', centerX);
  // n.setAttribute('cy', centerY);
  // nodeContainer.appendChild(n);

  return taskBox; 
  
}

export function drawLine(x1, y1, x2, y2, id) {
  
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('id', `edge${id}`);
  line.setAttribute('class', 'line');
  line.setAttribute('stroke', normalColor);
  line.setAttribute('stroke-width', '10');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  lineContainer.appendChild(line);
  return line;

}