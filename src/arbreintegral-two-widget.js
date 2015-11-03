export function AiTwoWidget(ai, twoParams) {
  this.type = 'Widget';
  this.two = new Two(twoParams);
  this.AI = ai;
  this.leafRadius = 3;
  this.circleRadius = 20;
  this.origin = {x:200, y:200};
}

AiTwoWidget.prototype = {
  init: function () {
    var elem = document.createElement('div')

    this.two.appendTo(elem);
    for (let leafid in this.AI.data){
      let gleaf = this.makeLeaf(this.AI.data[leafid]);
    }
    this.two.update();

    return elem
  },

  update: function (prev, elem) {
    this.two = this.two || prev.two
    // this.map.setPosition(this.position)
  },

  makeLeaf: function (leaf){
    let coords = this.AI.getCoords(leaf);
    console.log(coords);
    let pos = this.getPosFromCoords(coords);
    console.log(pos);
    let circle = this.two.makeCircle(pos.x, pos.y, this.leafRadius);
    circle.fill = `rgba(${80 * coords.circ},${80 * coords.circ},${80 * coords.circ},0.75)`
    return circle;
  },

  getPosFromCoords: function({circ, pos}){
    if (circ < 1){
      return this.origin;
    }

    let nbLeafs = Math.pow(2, circ);
    let angleIncrement = Math.PI / (nbLeafs/2 + 1);
    let angle = Math.PI - pos * angleIncrement;
    if (pos > nbLeafs/2) {
      angle -= angleIncrement; 
    }
    let radial = this.circleRadius * circ; 
    return {
      x: this.origin.x + radial * Math.cos(angle),
      y: this.origin.y - radial * Math.sin(angle)
    };
  }
}

