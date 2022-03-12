
export class Vertex {

  #x;
  #y;
  #radius;

  constructor(x, y, radius) {
    this.#x = x;
    this.#y = y;
    this.#radius = radius;
  }
  
  getX() {
    return this.#x;
  }

  setX(newX) {
    this.#x = newX;
  }

  getY() {
    return this.#y;
  }

  setY(newY) {
    this.#y = newY;
  }

  getRadius() {
    return this.#radius;
  }

  setRadius(newRadius) {
    this.#radius = newRadius;
  }

}
