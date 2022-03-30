const NS = 'http://www.w3.org/2000/svg';
const criticalColor = '#ff7353';
const normalColor = '#2f3b47';

const doc = document;
const lineContainer = doc.querySelector('#line-container');
const nodeContainer = doc.querySelector('#node-container');
const textContainer = doc.querySelector('#text-container');

export function drawTask(x, y) {

  const taskBox = document.createElementNS(NS, 'foreignObject');
  const width = 330; 
  const height = 200;
  taskBox.setAttribute('class', 'taskbox');
  taskBox.setAttribute('width', width);
  taskBox.setAttribute('height', height);
  taskBox.setAttribute('x', x);
  taskBox.setAttribute('y', y);
  const div = document.createElement('div');
  div.innerHTML = `
    <div>
      <input class='task-name' type='text' placeholder='Enter task name' />
      <p>team</p>
    </div>
    <span class='estimated-length'>Estimated Length</span>
    <div>
      <p>Slack Time: <span class='slack-time'>-</span></p>
      <select>
        <option>-</option>
        <option>Completed</option>
        <option>In Progress</option>
        <option>Delayed</option>
      </select>
    </div>
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