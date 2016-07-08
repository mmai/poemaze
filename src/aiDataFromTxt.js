var nbCircles = 7

export function dataFromTxt(txt){
  return JSON.parse(composeJsonFromPoem(txt))
}

function composeJsonFromPoem(poem){
  var leafs = {}
  var verses = poem.split('\n')
  var words = makeWords(verses)

  leafs["0"] = makePoemLeaf(0, 0, words.shift())

  for (var numCircle = 1; numCircle < nbCircles; numCircle++){
    var nbLeafs = Math.pow(2, numCircle)
    for (var numLeaf = 0; numLeaf < nbLeafs; numLeaf++){
      var idLeaf = getLeafId(numCircle, numLeaf)
      leafs[idLeaf] = makePoemLeaf(numCircle, numLeaf, words.shift())
    }
  }

  return JSON.stringify(leafs)
}

function makePoemLeaf(numCircle, numLeaf, word){
  return {
    'name': makeName(numCircle, numLeaf),
    'word': word.word,
    'content': word.sentences[0]
  }
}


function makeWords(verses){
  // Associate each word with the list of sentences it appears in
  var wordsVerses = {}
  verses.map(function(verse) {
    var words = verse
    .split(/[^a-zA-Z]/).filter(function(w){return w.length > 4})
    .map(function(word){
        word = normalizeWord(word) 
        wordsVerses[word] = [verse].concat(wordsVerses[word]) 
      })
    })

  var wordsIndex = Object.keys(wordsVerses).sort(function(a,b){
      var sa = wordsVerses[a]
      var sb = wordsVerses[b]
      //First criteria:  words which appears in fewer sentences 
      //Second criteria: longuest words
      return (sa.length - sb.length) || (b.length - a.length)
    })

  return wordsIndex.map(function(w){
    return {word: w, sentences: wordsVerses[w]}
  })

}

function normalizeWord(word){
  //TODO : make singular
  return word
}

function makeName(circ, leaf){
  switch(circ){
  case 0: return "Sun"
  case 1: return "Moon"
  case 2: return "Mars"
  case 3: return "Mercury"
  case 4: return "Jupiter"
  case 5: return "Venus"
  case 6: return "Saturn"
  }
  return "Beyond"
}

function getLeafId(circ, pos){
  //Normalize pos
  if (!(pos == 0 && circ == 0)){// not root
    var circleLength = Math.pow(2, circ);
    pos = (pos - 1) % circleLength + 1;
    while (pos < 1){
      pos += circleLength;
    }
  }

  var id = "0";
  var level = circ; 
  var cpos = pos; 
  while (level > 0){
    var half = Math.pow(2, level - 1);
    if (cpos <= half) {
      id += "0";
    } else {
      id += "1";
      cpos -= half;
    }
    level -= 1;
  }
  return id;
}
