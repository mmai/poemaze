<?php
/**
 * @package Arbre_Integral
 * @version 1.1
 */
/*
Plugin Name: Arbre Integral
Plugin URI: http://arbre-integral.net
Description: Structure du poème en custom post type et enregistrement des parcours effectués
Author: Henri Bourcereau
Version: 1.1
Author URI: http://bourcereau.fr
*/
define( 'AI__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

require_once( AI__PLUGIN_DIR . 'ai-customposts.php' );
require_once( AI__PLUGIN_DIR . 'ai-registerpaths.php' );

?>
