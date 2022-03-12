import { Vertex } from './Vertex.js';

export class Render {

  constructor() {
    this.root = document.querySelector('#root');
    this.svg = document.querySelector('#svg');
  }

  initialize() {
    console.log('Rendering . . .');
  } 

  drawNode(x, y, radius) {
    const vertex = new Vertex(x, y, radius);
  }

}