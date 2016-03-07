<?php
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
  add_meta_box('wpt_leaf_name', 'Nom', 'wpt_leaf_name', 'leaf', 'advanced', 'default');
  add_meta_box('wpt_leaf_word', 'Mot', 'wpt_leaf_word', 'leaf', 'side', 'default');
}

function wpt_leaf_name(){
    global $post;
    // Noncename needed to verify where the data originated
    echo '<input type="hidden" name="leafmeta_noncename" id="leafmeta_noncename" value="' .  wp_create_nonce( plugin_basename(__FILE__) ) . '" />';
    // Get the location data if its already been entered
    $name = get_post_meta($post->ID, '_name', true);
    // Echo out the field
    echo '<input type="text" name="_name" value="' . $name  . '" class="widefat" />';
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
	$leaf_meta['_name'] = $_POST['_name'];
	
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
	// add_menu_page( 'Arbre Integral maj', 'AI maj', 'manage_options', 'arbreintegral_update', 'ai_update_page', 'dashicons-tickets', 5  );
}

function ai_admin_page(){
  ?>
<div class="wrap">
		<h2>Mise à jour du JSON</h2>
<?php
  if (!empty($_REQUEST['jsonsubmit']) ){
    $leafs = array();
    $query = new WP_Query( array( 'post_type' => 'leaf', 'nopaging' => true) );
    while( $query->have_posts() ) {
      $query->the_post();
      $id =  get_the_ID();
      $post = get_post($id);
      $word = get_post_meta( $id, '_word', true );
      $name = get_post_meta( $id, '_name', true );
      $taxo = wp_get_post_terms($id, 'leaf_circle');
      $parent = get_post($post->post_parent);

      //Old format 
      /*$leaf = array(
        'id' => $post->post_title,
        'name' => $name,
        'word' => $word,
        'content' => $post->post_content,
        'circle' => $taxo[0]->slug,
        'position' => $post->menu_order,
        'parent' => $parent->post_title
      );

      $leafs[$post->post_title] = $leaf;
       */

      //New lighter format
      $leafid = str_replace('.', '',$post->post_title);
      $leaf = array(
        'name' => $name,
        'word' => $word,
        'content' => $post->post_content
      );

      $leafs[$leafid] = $leaf;

    }
    // $output = "window.arbreIntegralData = ".json_encode($leafs, JSON_PRETTY_PRINT).";";
    $output = json_encode($leafs, JSON_PRETTY_PRINT);
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
      $filepath = trailingslashit( $wp_filesystem->wp_content_dir() ). 'arbreintegral.json'; 
      // $wp_filesystem->mkdir( $contentdir. 'cbe' );
      if ( ! $wp_filesystem->put_contents(  $filepath , $output, 0766) ) {
        echo "il y a eu une erreur";
      } else {
?> json mis à jour
<h3>Aperçu</h3>
<pre><?php echo file_get_contents($filepath);?></pre>
<?php
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

function ai_update_page(){
  ?>
<div class="wrap">
		<h2>*** Mise à jour des feuilles ***</h2>
<?php
  if (!empty($_REQUEST['updatesubmit']) ){
    $leafs = array();
    $query = new WP_Query( array( 'post_type' => 'leaf', 'nopaging' => true) );
    while( $query->have_posts() ) {
      $query->the_post();
      $id =  get_the_ID();
      $post = get_post($id);
      $word = get_post_meta( $id, '_word', true );
      $name = get_post_meta( $id, '_name', true );
      $taxo = wp_get_post_terms($id, 'leaf_circle');
      $parent = get_post($post->post_parent);
      $circle = $taxo[0]->slug;
      $position = $post->menu_order;

			update_post_meta($id, "_name", makeLeafName($circle, $post->post_title));

      $sectors = array_map(function($pos){return $pos -1;}, explode(".", $post->post_title));
      $sectors[0] = "0";
      wp_update_post(array(
        'ID'           => $id,
        'post_title'   => implode(".", $sectors)
      ));
    }

    echo "Données mises à jour";

  }
?>
 <h3>Êtes vous sûr ?</h3>
<form action="admin.php">
<input type="hidden" name="page" value="arbreintegral_update">
<input type="submit" name="updatesubmit" value="Mettre à jour">
</form>
	</div>
	<?php
}

function makeLeafName($circle, $id){
  $parts = [];

  $sectors = array_map(function($pos){return $pos;},explode(".", $id));

  $position = 1;
  $lcircle = sizeof($sectors) - 2;
  foreach($sectors as $circ => $pos){
    if ($circ != 0){
      $position += pow(2, $lcircle) * ($pos - 1);
      $lcircle -= 1;
    }
  }

  switch ($circle){
  case "graine":
    $cerne = "Graine";
    break;
  case "cerne-1-biologique":
    $cerne = "Biologique un";
    // $cerne = "Biologique";
    // $cerne .= ($sectors[1] == "1")?" un":" deux";
    $label = ($sectors[1] == "1")?"Haut":"Bas";
    break;
  case "cerne-2-biologique":
    $cerne = "Biologique deux";
    // $cerne = "Biologique";
    // if ($sectors[1] == "2" && $sectors[2] == 2) {
    //   $cerne .= " un";
    // } else {
    //   $cerne .= " deux";
    // }
    $label = (($sectors[1] == "1")?"Aérien":"Souterrain") . (($sectors[2] == "1")?" un":" deux");
    break;
  case "cerne-3-symbiotique":
    $cerne = "Symbiotique";
    $middle = (($sectors[1] == "1")?"Jour":"Nuit");
    $label =  ["Automne", "Hiver", "Printemps", "Été"][$position % 4];
    break;
  case "cerne-4-symbolique":
    $cerne = "Symbolique";
    $middle = (($sectors[1] == "1")?"Ouranien":"Chtonien");
    $label =  ["Automne deux", "Hiver un", "Hiver deux",  "Printemps un", "Printemps deux", "Été un", "Été deux", "Automne un"][$position % 8];
    break;
  case "cerne-5-politique":
    $cerne = "Politique";
    $middle = (($sectors[1] == "1")?"Lumières":"Ténèbres");
    $label =  ["Automne deux",
      "Hiver un", "Hiver deux", "Hiver trois", "Hiver quatre",
      "Printemps un", "Printemps deux", "Printemps trois", "Printemps quatre",
      "Été un", "Été deux", "Été trois", "Été quatre",
      "Automne un", "Automne deux", "Automne trois"
    ][$position % 16];
    break;
  case "cerne-6-rhizomique":
    $cerne = "Rhizomique";
    if ($position == 64){
      $middle = "Eschatologique";
      $label = "Un";
    } else if ($position > 31){
      $middle = "Politique";
      $label = num2txt($position - 31);
    } else if ($position > 15){
      $middle = "Symbolique";
      $label = num2txt($position - 15);
    } else if ($position > 7){
      $middle = "Symbiotique";
      $label = num2txt($position - 7);
    } else if ($position > 3){
      $middle = "Biologique deux";
      $label = num2txt($position - 3);
    } else if ($position > 1){
      $middle = "Biologique un";
      $label = num2txt($position - 1);
    } else {
      $middle = "Graine";
    }
    break;
  }

  array_push($parts, $cerne);
  if (!empty($middle)) array_push($parts, $middle);
  if (!empty($label)) array_push($parts, $label);

  return implode(" / ", $parts);
}

function num2txt($num){
  $nums = [
    'Zéro', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf',
    'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-sept', 'Dix-huit', 'Dix-neuf',
    'Vingt', 'Vingt-et-un', 'Vingt-deux', 'Vingt-trois', 'Vingt-quatre', 'Vingt-cinq', 'Vingt-six', 'Vingt-sept', 'Vingt-huit', 'Vingt-neuf',
    'Trente', 'Trente-et-un', 'Trente-deux', 'Trente-trois', 'Trente-quatre', 'Trente-cinq', 'Trente-six', 'Trente-sept', 'Trente-huit', 'Trente-neuf'
  ];
  return $nums[$num];
}

?>
