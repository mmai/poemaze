export function makeAI(aiData){
  return {
    data: aiData,
    getLeaf: function getLeaf(leafId){
      let leaf = false;
      if (aiData.hasOwnProperty(leafId)){
        leaf = aiData[leafId];
      }
      return leaf;
    },

    getType: function getType(leaf){
      let {circ, pos} = this.getCoords(leaf);
      if (circ == 0) return 'ROOT';
      return (pos > Math.pow(2, circ - 1))?'DOWN':'UP';
    },

    getNeighbors: function getNeighbors(leaf, options = {exclude:[]}){
      let coords = this.getCoords(leaf);

      return {
        leftChild:    this.getNewNeighbor(coords, (coords) => {return this.getLeftChild(coords);}, options.exclude),
        rightChild:   this.getNewNeighbor(coords, (coords) => {return this.getRightChild(coords);}, options.exclude),
        leftBrother:  this.getNewNeighbor(coords, (coords) => {return this.getLeftBrother(coords);}, options.exclude),
        rightBrother: this.getNewNeighbor(coords, (coords) => {return this.getRightBrother(coords);}, options.exclude),
        parent:       this.getNewParent(leaf, options.exclude)
      }
    },

    getNewNeighbor: function getNewNeighbor(coords, getNeighbor, exclude){
      let neighbor = getNeighbor(coords);
      let viewed = {};
      while ((neighbor !== false) && (neighbor.id in exclude) && !(neighbor.id in viewed)){
        viewed[neighbor.id] = true;
        neighbor = getNeighbor(this.getCoords(neighbor));
      } 
      if (neighbor.id in viewed) return false;
      return neighbor;
    },

    getNewParent: function (leaf, exclude){
      let neighbor = this.getParent(leaf);
      let viewed = {};
      while ((neighbor !== false) && (neighbor.id in exclude) && !(neighbor.id in viewed)){
        viewed[neighbor.id] = true;
        neighbor = this.getParent(neighbor);
      } 
      return neighbor;
    },

    getLeftChild: function getLeftChild(coords){
      let childId = this.getLeafId({
          circ: coords.circ + 1,
          pos: coords.pos * 2 - 1
        })
      return this.getLeaf(childId);
    },
    getRightChild: function getRightChild(coords){
      let childId = this.getLeafId({
          circ: coords.circ + 1,
          pos: coords.pos * 2 
        })
      return this.getLeaf(childId);
    },
    getLeftBrother: function getLeftBrother(coords){
      let id = this.getLeafId({
          circ: coords.circ,
          pos: coords.pos - 1
        });
      return this.getLeaf(id);
    },
    getRightBrother: function getRightBrother(coords){
      let id = this.getLeafId({
          circ: coords.circ,
          pos: coords.pos + 1
        });
      return this.getLeaf(id);
    },
    getParent: function getParent(leaf){
      return this.getLeaf(leaf.parent);
    },


    //XXX lié à la nomenclature choisie pour les id des fragments
    getCoords(leaf){
      //Nomenclature : 0.1.2.2.1
      let path = leaf.id.split('.');
      let circle = path.length - 1;  
      let position = 1;
      let lcircle = circle - 1;
      for (let pos of path.slice(1)){
        position += Math.pow(2, lcircle) * (parseInt(pos) - 1);
        lcircle -= 1;
      }
      return {circ:circle, pos:position};
    },
    //XXX lié à la nomenclature choisie pour les id des fragments
    getLeafId({circ, pos}){
      //Normalize pos
      if (!(pos == 0 && circ == 0)){// not root
        let circleLength = Math.pow(2, circ);
        pos = (pos - 1) % circleLength + 1;
        while (pos < 1){
          pos += circleLength;
        }
      }

      let id = "0";
      let level = circ; 
      let cpos = pos; 
      while (level > 0){
        let half = Math.pow(2, level - 1);
        if (cpos <= half) {
          id += "." + 1;
        } else {
          id += "." + 2;
          cpos -= half;
        }
        level -= 1;
      }
      return id;
    }
  };
}
