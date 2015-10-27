<?php
/**
 * @package Arbre_Integral
 * @version 1.0
 */
/*
Plugin Name: Arbre Integral
Plugin URI: http://arbre-integral.net
Description: Structure du poème en custom post type
Author: Henri Bourcereau
Version: 1.0
Author URI: http://bourcereau.fr
*/

function custom_post_leaf() {
  $labels = array(
    'name'               => _x( 'Feuilles', 'post type general name' ),
    'singular_name'      => _x( 'Feuille', 'post type singular name' ),
    'add_new'            => _x( 'Ajouter', 'feuille' ),
    'add_new_item'       => __( 'Ajouter une feuille' ),
    'edit_item'          => __( 'Modifier la feuille' ),
    'new_item'           => __( 'Nouvelle feuille' ),
    'all_items'          => __( 'Toutes les feuilles' ),
    'view_item'          => __( 'Voir la feuille' ),
    'search_items'       => __( 'Chercher une feuille"' ),
    'not_found'          => __( 'Aucune feulle trouvée' ),
    'not_found_in_trash' => __( 'Aucune feulle trouvée dans la poubelle' ), 
    'parent_item_colon'  => '',
    'menu_name'          => 'Feuilles'
  );
  $args = array(
    'labels'        => $labels,
    'description'   => 'Les feuilles du poème',
    'hierarchical'  => true,
    'public'        => true,
    'menu_position' => 2,
    'supports'      => array( 'title', 'editor', 'page-attributes' ),
    'has_archive'   => true,
    'register_meta_box_cb' => 'add_leaf_metaboxes',
    'taxonomies' => array('leaf_circle'),
  );
  register_post_type( 'leaf', $args ); 
}
add_action( 'init', 'custom_post_leaf' );

function add_leaf_metaboxes(){
  add_meta_box('wpt_leaf_word', 'Mot', 'wpt_leaf_word', 'leaf', 'side', 'default');
}

function wpt_leaf_word(){
    global $post;
    // Noncename needed to verify where the data originated
    echo '<input type="hidden" name="leafmeta_noncename" id="leafmeta_noncename" value="' .  wp_create_nonce( plugin_basename(__FILE__) ) . '" />';
    // Get the location data if its already been entered
    $word = get_post_meta($post->ID, '_word', true);
    // Echo out the field
    echo '<input type="text" name="_word" value="' . $word  . '" class="widefat" />';
}

// Save the Metabox Data
function wpt_save_leaf_meta($post_id, $post) {
	// verify this came from the our screen and with proper authorization,
	// because save_post can be triggered at other times
	if ( !wp_verify_nonce( $_POST['leafmeta_noncename'], plugin_basename(__FILE__) )) {
    return $post->ID;
	}

	// Is the user allowed to edit the post or page?
	if ( !current_user_can( 'edit_post', $post->ID ))
		return $post->ID;

	// OK, we're authenticated: we need to find and save the data
	// We'll put it into an array to make it easier to loop though.
	$leaf_meta['_word'] = $_POST['_word'];
	
	// Add values of $events_meta as custom fields
	
	foreach ($leaf_meta as $key => $value) { // Cycle through the $leaf_meta array!
		if( $post->post_type == 'revision' ) return; // Don't store custom data twice
		$value = implode(',', (array)$value); // If $value is an array, make it a CSV (unlikely)
		if(get_post_meta($post->ID, $key, FALSE)) { // If the custom field already has a value
			update_post_meta($post->ID, $key, $value);
		} else { // If the custom field doesn't have a value
			add_post_meta($post->ID, $key, $value);
		}
		if(!$value) delete_post_meta($post->ID, $key); // Delete if blank
	}
}
add_action('save_post', 'wpt_save_leaf_meta', 1, 2); // save the custom fields

function my_taxonomies_leaf() {
  $labels = array(
    'name'              => _x( 'Cernes', 'taxonomy general name' ),
    'singular_name'     => _x( 'Cerne', 'taxonomy singular name' ),
    'search_items'      => __( 'Chercher dans les cernes' ),
    'all_items'         => __( 'Toutes les cernes' ),
    'edit_item'         => __( 'Modifier le cerne' ), 
    'update_item'       => __( 'Mettre à jour le cerne' ),
    'add_new_item'      => __( 'Ajouter un cerne' ),
    'new_item_name'     => __( 'Nouveau cerne' ),
    'menu_name'         => __( 'Cernes' ),
  );
  $args = array(
    'labels' => $labels,
    'hierarchical' => true,
  );
  register_taxonomy( 'leaf_circle', 'leaf', $args );
}
add_action( 'init', 'my_taxonomies_leaf', 0 );

add_action( 'admin_menu', 'ai_admin_menu' );

//Export de la structure en json
function ai_admin_menu() {
	add_menu_page( 'Arbre Integral', 'Arbre Integral', 'manage_options', 'arbreintegral', 'ai_admin_page', 'dashicons-tickets', 4  );
}

function ai_admin_page(){
  ?>
<div class="wrap">
		<h2>Mise à jour du JSON</h2>
<?php
  if (!empty($_REQUEST['jsonsubmit']) ){
    $leafs = array();
    $query = new WP_Query( array( 'post_type' => 'leaf') );
    while( $query->have_posts() ) {
      $query->the_post();
      $id =  get_the_ID();
      $post = get_post($id);
      $word = get_post_meta( $id, '_word', true );
      $taxo = wp_get_post_terms($id, 'leaf_circle');
      $parent = get_post($post->post_parent);

      $leaf = array(
        'id' => $post->post_title,
        'word' => $word,
        'content' => $post->post_content,
        'circle' => $taxo[0]->slug,
        'position' => $post->menu_order,
        'parent' => $parent->post_title
      );

      array_push($leafs, $leaf);
    }
    $output = "window.arbreIntegralData = ".json_encode($leafs).";";
    // echo $output;

    $url = wp_nonce_url('admin.php?page=arbreintegral','cbe-nonce');
    $in = true;
    if (false === ($creds = request_filesystem_credentials($url, '', false, false, array('updateJson')) ) ) {
      $in = false;
    }
    if ($in && ! WP_Filesystem($creds) ) {
      // our credentials were no good, ask the user for them again
      request_filesystem_credentials($url, '', true, false,array('updateJson'));
      $in = false;
    }
    if ($in){
      global $wp_filesystem;
      if ( ! WP_Filesystem($creds) ) {
        request_filesystem_credentials($url, '', true, false, null);
        return;
      }
      $contentdir = trailingslashit( $wp_filesystem->wp_content_dir() ); 
      // $wp_filesystem->mkdir( $contentdir. 'cbe' );
      if ( ! $wp_filesystem->put_contents(  $contentdir . 'arbreintegral-data.js', $output, FS_CHMOD_FILE) ) {
        echo "il y a eu une erreur";
      } else {
        echo "json mis à jour";
      }
    }

  }
  ?>
<form action="admin.php">
<input type="hidden" name="page" value="arbreintegral">
<input type="submit" name="jsonsubmit" value="Mettre à jour">
</form>
	</div>
	<?php
}

?>
