export function Task(id) {
  this.id = id;
  this.predecessors = [];
  this.successors = [];
  this.duration = -1;
  this.float = -1;
  this.es = -1;
  this.ef = -1;
  this.ls = -1;
  this.lf = -1;
  this.isCritical = false;
  this.dom = null;
}

