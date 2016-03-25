# L'Arbre Intégral

This repository hosts the source code of [L'Arbre Intégral](http://arbre-integral.net) website, a digital poem by Donatien Garnier.

It was made with [Cycle.js](http://cyclejs.org) with a [Wordpress](http://wordpress.org) backend.

Note : the text of the poem is not available here and has been replaced by random Shakespeare verses.

## Poem architecture 

### Navigation in the poem

The poem is composed of 127 fragments and follows a binary tree structure. The reader starts at the poem root and choose one of its two childrens. At each node, he can navigate to one of its neighbors until there is no more fragment to read.
A fragment already red is not available anymore as a possible navigation choice, it is replaced by the next neighbor in the same direction.
Neighbors can be the childrens, the "brothers" (nodes at the same level), or the "parent" node (a parent, could in fact be a node on the opposite side if all ancestors of the current node have already been visited).
The final node is fixed and cannot be visited unless all other nodes have been visited.

### Map of the path

The path followed by the reader is graphically rendered on a map of the poem tree. A small version is always visible on the top right of the screen a is updated live. A clicking on this mini-map opens a panel with a larger map on wich is replayed the path evolution since the panel was last open.

When the reader is on a node of the third level, the map can rotate in order to place the current node in the upper half of the tree.

## Code structure

* `src` javascript sources of the main app, a Cycle.js single page application for exploring the poem and its visualizations.
* `www`  wordpress site 
* `www/wp-content/themes/arbre-integral/` custom theme where the Cycle.js single page application build is copied 
* `www/wp-content/plugins/arbre-integral/` custom plugin wich allows management of the poem contents and the generation of the final PDF documents. 

Poem contents are stored in the `www/arbreintegral.json` JSON file (see `www/arbreintegral.example.json` ).

## Wordpress integration

TODO

## Running

```sh
cp www/wp-content/arbreintegral.example.json www/wp-content/arbreintegral.json
cd www; ln -s ../index.html ; cd -
npm install
make dev
```
Open [http://localhost:1234]

## Credits

* Design : Franck Tallon
* HTML/CSS : [Mathieu Bué](https://github.com/twikito)
* SVG, Javascript & PHP development : [Henri Bourcereau](https://github.com/mmai)

