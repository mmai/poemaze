var chai = require("chai");
var expect = chai.expect;

import {makeAI} from '../src/arbreintegral';

// let AI = null;
// fetch('http://arbre-integral.net/wp-content/arbreintegral.json').then(function(response) {
//     return response.json()
//   }).then(function(json) {
//       AI = makeAI(json);
//     });

// beforeEach(function() { });


describe( 'AI', function() {
    // before(function() {
    // });
    let AI = makeAI({});
    AI.getLeaf = function (leafId){
      var elems = leafId.split('.');
      return {
        id: leafId,
        parent: elems.slice(0, elems.length - 1).join('.')
      };
    };

    describe( 'getCoords', function() {
        it('should return the correct coordinates', function(){
            expect(AI.getCoords({id: "0.0"})).to.deep.equal({circ:1, pos:1});
            expect(AI.getCoords({id: "0.1.1"})).to.deep.equal({circ:2, pos:4});
            expect(AI.getCoords({id: "0.0.1.0"})).to.deep.equal({circ:3, pos:3});
          });
      });

    describe( 'getLeafId', function() {
        it('should return the same id when composed with getCoords()', function(){
            for (let id of ["0.0", "0.1.1", "0.0.1.0"]){
              expect(AI.getLeafId(AI.getCoords({id: id}))).to.equal(id);
            }
          });
        it('should return the correct id when coordinates are not normalized', function(){
            expect(AI.getLeafId({circ: 1, pos:0})).to.equal("0.1");
            expect(AI.getLeafId({circ: 1, pos:-1})).to.equal("0.0");
          });
      });

    describe( 'getNeighbors', function() {
        it('should return the correct neighbors for 0.0', function(){
            let neighbors = AI.getNeighbors({id: "0.0", parent:"0"});
            expect(neighbors.leftChild.leaf.id).to.equal("0.0.0");
            expect(neighbors.rightChild.leaf.id).to.equal("0.0.1");
            expect(neighbors.leftBrother.leaf).to.equal(false);
            expect(neighbors.rightBrother.leaf.id).to.equal("0.1");
          });
        it('should return the correct neighbors for 0.1.1', function(){
            let neighbors = AI.getNeighbors({id: "0.1.1", parent:"0.1"});
            expect(neighbors.leftChild.leaf.id).to.equal("0.1.1.0");
            expect(neighbors.rightChild.leaf.id).to.equal("0.1.1.1");
            expect(neighbors.leftBrother.leaf.id).to.equal("0.1.0");
            expect(neighbors.rightBrother.leaf.id).to.equal("0.0.0");
          });

      });
  });
