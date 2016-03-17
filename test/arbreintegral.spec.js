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
            expect(AI.getCoords({id: "00"})).to.deep.equal({circ:1, pos:1});
            expect(AI.getCoords({id: "011"})).to.deep.equal({circ:2, pos:4});
            expect(AI.getCoords({id: "0010"})).to.deep.equal({circ:3, pos:3});
          });
      });

    describe( 'getLeafId', function() {
        it('should return the same id when composed with getCoords()', function(){
            for (let id of ["00", "011", "0010"]){
              expect(AI.getLeafId(AI.getCoords({id: id}))).to.equal(id);
            }
          });
        it('should return the correct id when coordinates are not normalized', function(){
            expect(AI.getLeafId({circ: 1, pos:0})).to.equal("01");
            expect(AI.getLeafId({circ: 1, pos:-1})).to.equal("00");
          });
      });

    describe( 'getNeighbors', function() {
        it('should return the correct neighbors for 00', function(){
            let neighbors = AI.getNeighbors({id: "00", parent:"0"});
            expect(neighbors.leftChild.leaf.id).to.equal("000");
            expect(neighbors.rightChild.leaf.id).to.equal("001");
            expect(neighbors.leftBrother.leaf).to.equal(false);
            expect(neighbors.rightBrother.leaf).to.equal(false);
            expect(neighbors.parent.leaf.id).to.equal("01");
          });
        it('should return the correct neighbors for 011', function(){
            let neighbors = AI.getNeighbors({id: "011", parent:"01"});
            expect(neighbors.leftChild.leaf.id).to.equal("0110");
            expect(neighbors.rightChild.leaf.id).to.equal("0111");
            expect(neighbors.leftBrother.leaf.id).to.equal("010");
            expect(neighbors.rightBrother.leaf.id).to.equal("000");
          });

      });
  });
