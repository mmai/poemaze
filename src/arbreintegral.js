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

    // getType: function getTypeNormalized(leaf){
    //   let {circ, pos} = this.getCoords(leaf);
    //   if (circ == 0) return 'ROOT';
    //   return (pos > Math.pow(2, circ - 1))?'DOWN':'UP';
    // },

  //XXX lié à la syntaxe des feuilles pour performance. Utiliser getTypeNormalized pour la version indépendante de la syntaxe 
    getType: function getType(leaf){
      let elems = leaf.id.split('.');
      if (elems.length === 1) return 'ROOT';
      return (elems[1] === "0") ? "UP" : "DOWN"
    },

    getNeighbors: function getNeighbors(leaf, options = {exclude:[]}){
      let coords = this.getCoords(leaf);

      //Parent
      let parent = this.getNewParent(leaf, options.exclude) 
      if (parent.leaf && parent.leaf.id === "0"){
        const rootCoords = this.getCoords(parent.leaf);
        const leafType = this.getType(leaf);

        //We search on the opposite semi-circle
        let child =  ( leafType === 'UP') ? this.getRightChild(rootCoords) : this.getLeftChild(rootCoords);
        parent = this.ensureNewChild(child, options.exclude);

        if (!parent.leaf){
          //No parent found on the opposite semi-circle, we now search on this current semi-circle
          let child =  ( leafType === 'UP') ? this.getLeftChild(rootCoords) : this.getRightChild(rootCoords);
          parent = this.ensureNewChild(child, options.exclude);
        }
      }
      // if (!parent.leaf){ console.log('END') }

      //Childs
      let leftChild = this.ensureNewChild(this.getLeftChild(coords), options.exclude);
      let rightChild = this.ensureNewChild(this.getRightChild(coords), options.exclude);

      //Brothers
      let leftdistance = 0; let rightdistance = 0; // how far are the brothers from the current leaf
      let leftBrother =  this.getNewBrother(coords, (coords) => {leftdistance += 1; return this.getLeftBrother(coords);}, options.exclude);
      let rightBrother = this.getNewBrother(coords, (coords) => {rightdistance += 1; return this.getRightBrother(coords);}, options.exclude);

      if (parent.leaf && (
        (leftBrother.leaf && leftBrother.leaf.id === parent.leaf.id) ||
        (rightBrother.leaf && rightBrother.leaf.id === parent.leaf.id) 
      )) {
        parent.leaf = false;
      }

      //Display only the right brother if the two brothers points to the same leaf
      if (leftBrother.leaf && leftBrother.leaf.id === rightBrother.leaf.id) {
        if (leftdistance < rightdistance){
          rightBrother.leaf = false;
        } else {
          leftBrother.leaf = false;
        }
      }

      return { leftChild, rightChild, leftBrother, rightBrother, parent }
    },

    ensureNewChild: function ensureNewChild(child, exclude){
      if (child.id in exclude){
        child = this.getNextChild(this.getCoords(child), exclude);
      }
      return {
        leaf: child,
        fromId: (child !== false)?this.getParent(child).id:undefined
      };
    },

    //Classical tree deep walk
    getNextChild: function getNextChild(coords, exclude){
        let nextChild = this.getLeftChild(coords);
        while ((nextChild !== false) && nextChild.id in exclude){
          nextChild = this.getNextChild(this.getCoords(nextChild), exclude);
        }

        if (!nextChild){
          nextChild = this.getRightChild(coords);
        } 
        while ((nextChild !== false) && nextChild.id in exclude){
          nextChild = this.getNextChild(this.getCoords(nextChild), exclude);
        }

        return nextChild;
    },

    getNewBrother: function getNewBrother(coords, getBrother, exclude){
      let viewed = {};
      let neighbor = getBrother(coords);
      while ((neighbor !== false) && (neighbor.id in exclude) && !(neighbor.id in viewed)){
        viewed[neighbor.id] = true;
        coords = this.getCoords(neighbor);
        neighbor = getBrother(coords);
      } 
      if (neighbor.id in viewed) return false;
      return {
        leaf: neighbor,
        fromId: this.getLeafId(coords) 
      };
    },

    getNewParent: function getNewParent(leaf, exclude){
      let neighbor = this.getParent(leaf);
      if (neighbor.id == leaf.id) neighbor = false;
      let viewed = {};
      while ((neighbor !== false) && (neighbor.id in exclude) && !(neighbor.id in viewed)){
        viewed[neighbor.id] = true;
        leaf = neighbor;
        neighbor = this.getParent(leaf);
      } 
      return {
        leaf: neighbor,
        fromId: leaf.id
      };
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
      if (leaf === false) throw new Error("Can't get coordinates of a 'false' leaf");
      //Nomenclature : 0.0.1.1.0
      let path = leaf.id.split('.');
      if (path == 0) return {circ:0, pos:1};

      let circle = path.length - 1;  
      let position = 1;
      let lcircle = circle - 1;
      for (let pos of path.slice(1)){
        position += Math.pow(2, lcircle) * (parseInt(pos));
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
          id += "." + 0;
        } else {
          id += "." + 1;
          cpos -= half;
        }
        level -= 1;
      }
      return id;
    },

    makeInitialState (){
        return {
          pathname: '/',
          currentLeafId: "0",
          history:[],
          isUpside: true,
          needRotation: false,
          editionId: false,
          showDashboard: false,
          leafInfos: {
            leaf: { id: "0" },
            fromId: "0",
            type: "ROOT",
            neighbors: this.getNeighbors({ id: "0" })
          }};
      }
  };
}
