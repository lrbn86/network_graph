const NS = 'http://www.w3.org/2000/svg';
export const criticalColor = '#ff7353';
export const normalColor = '#2f3b47';

const doc = document;
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');
const textContainer = doc.querySelector('#text-container');

export function drawTask(x, y, id) {

  const width = 340; 
  const height = 245;
  
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
    <input class='task-name' type='text' placeholder='Enter task name / description' />
    <input class='team-name' type='text' placeholder='Enter team name' />
    <input class='assignee-name' type='text' placeholder='Enter assignee name' />
    <input class='topt' type='number' placeholder='Enter optimistic time' />
    <input class='tlikely' type='number' placeholder='Enter most likely time' />
    <input class='tpess' type='number' placeholder='Enter pessimistic time' />
    <p>Expected Time: <span class='expected-time'> _ </span> days</p>
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

export function drawComment() {}