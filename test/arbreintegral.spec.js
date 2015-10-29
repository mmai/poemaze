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
      return leafId;
    };

    describe( 'getCoords', function() {
        it('should return the correct coordinates', function(){
            expect(AI.getCoords({id: "0.1"})).to.deep.equal({circ:1, pos:1});
            expect(AI.getCoords({id: "0.2.2"})).to.deep.equal({circ:2, pos:4});
            expect(AI.getCoords({id: "0.1.2.1"})).to.deep.equal({circ:3, pos:3});
          });
      });

    describe( 'getLeafId', function() {
        it('should return the same id when composed with getCoords()', function(){
            for (let id of ["0.1", "0.2.2", "0.1.2.1"]){
              expect(AI.getLeafId(AI.getCoords({id: id}))).to.equal(id);
            }
          });
        it('should return the correct id when coordinates are not normalized', function(){
            expect(AI.getLeafId({circ: 1, pos:0})).to.equal("0.2");
            expect(AI.getLeafId({circ: 1, pos:-1})).to.equal("0.1");
          });
      });

    describe( 'getNeighbors', function() {
        it('should return the correct neighbors for 0.1', function(){
            let neighbors = AI.getNeighbors({id: "0.1"});
            expect(neighbors.leftChild).to.equal("0.1.1");
            expect(neighbors.rightChild).to.equal("0.1.2");
            expect(neighbors.leftBrother).to.equal("0.2");
            expect(neighbors.rightBrother).to.equal("0.2");
          });
        it('should return the correct neighbors for 0.2.2', function(){
            let neighbors = AI.getNeighbors({id: "0.2.2"});
            expect(neighbors.leftChild).to.equal("0.2.2.1");
            expect(neighbors.rightChild).to.equal("0.2.2.2");
            expect(neighbors.leftBrother).to.equal("0.2.1");
            expect(neighbors.rightBrother).to.equal("0.1.1");
          });

      });
  });
