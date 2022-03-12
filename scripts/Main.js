import { Render } from './Render.js';

class Main {
  constructor() {
  }
  start() {
    console.log('Application started.');
    const render = new Render();
    render.initialize();

    render.drawNode(350, 350, 45);
  }
}

const main = new Main();
main.start();