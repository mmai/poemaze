# L'Arbre Intégral

Code for the digital poem [L'Arbre Intégral](http://arbre-integral.net) by Donatien Garnier.

Made with  [Cycle.js](http://cyclejs.org) and [Wordpress](http://wordpress.org)
# Structure

* src: javascript sources of the main app, a Cycle.js single page application for exploring the poem and its visualizations.
* www : wordpress site 
* www/wp-content/themes/arbre-integral/ : custom theme where the Cycle.js single page application build is copied 
* www/wp-content/plugins/arbre-integral/ : custom plugin wich allows management of the poem contents and the generation of the final PDF documents. 

Poem contents are stored in the `www/arbreintegral.json` JSON file.

## Credits

* PHP & javascript development : Henri Bourcereau
* HTML/CSS : Mathieu Bué
* Design : Franck Tallon
* Text : Donatien Garnier

