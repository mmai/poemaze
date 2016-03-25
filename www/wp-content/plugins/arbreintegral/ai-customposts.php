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

      /*/For random text generation
      $randomContent = getRandomContent();
      $leaf = array(
        'name' => $name,
        'word' => getRandomWord($randomContent),
        'content' => $randomContent
      );
      //*/

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

function getRandomWord($content){
  $words = array_filter(explode(" ", $content), function ($w){ return (strlen($w) > 4); });
  $rand_idx = array_rand($words);
  return $words[$rand_idx];
}

function getRandomContent(){
  //return a random verse from The Procreation Sonnets by William Shakespeare
  $shakespeare = split("\n", "From fairest creatures we desire increase,
That thereby beauty's rose might never die,
But as the riper should by time decease,
His tender heir might bear his memory:
But thou contracted to thine own bright eyes,
Feed'st thy light's flame with self-substantial fuel,
Making a famine where abundance lies,
Thy self thy foe, to thy sweet self too cruel:
Thou that art now the world's fresh ornament,
And only herald to the gaudy spring,
Within thine own bud buriest thy content,
And, tender churl, mak'st waste in niggarding:
Pity the world, or else this glutton be,
To eat the world's due, by the grave and thee.
When forty winters shall besiege thy brow,
And dig deep trenches in thy beauty's field,
Thy youth's proud livery so gazed on now,
Will be a totter'd weed of small worth held:
Then being asked, where all thy beauty lies,
Where all the treasure of thy lusty days;
To say, within thine own deep sunken eyes,
Were an all-eating shame, and thriftless praise.
How much more praise deserv'd thy beauty's use,
If thou couldst answer 'This fair child of mine
Shall sum my count, and make my old excuse,'
Proving his beauty by succession thine!
This were to be new made when thou art old,
And see thy blood warm when thou feel'st it cold.
Look in thy glass and tell the face thou viewest
Now is the time that face should form another;
Whose fresh repair if now thou not renewest,
Thou dost beguile the world, unbless some mother.
For where is she so fair whose unear'd womb
Disdains the tillage of thy husbandry?
Or who is he so fond will be the tomb
Of his self-love, to stop posterity?
Thou art thy mother's glass and she in thee
Calls back the lovely April of her prime;
So thou through windows of thine age shalt see,
Despite of wrinkles this thy golden time.
But if thou live, remember'd not to be,
Die single and thine image dies with thee.
Unthrifty loveliness, why dost thou spend
Upon thy self thy beauty's legacy?
Nature's bequest gives nothing, but doth lend,
And being frank she lends to those are free:
Then, beauteous niggard, why dost thou abuse
The bounteous largess given thee to give?
Profitless usurer, why dost thou use
So great a sum of sums, yet canst not live?
For having traffic with thy self alone,
Thou of thy self thy sweet self dost deceive:
Then how when nature calls thee to be gone,
What acceptable audit canst thou leave?
Thy unused beauty must be tombed with thee,
Which, used, lives th' executor to be.
Those hours, that with gentle work did frame
The lovely gaze where every eye doth dwell,
Will play the tyrants to the very same
And that unfair which fairly doth excel;
For never-resting time leads summer on
To hideous winter, and confounds him there;
Sap checked with frost, and lusty leaves quite gone,
Beauty o'er-snowed and bareness every where:
Then were not summer's distillation left,
A liquid prisoner pent in walls of glass,
Beauty's effect with beauty were bereft,
Nor it, nor no remembrance what it was:
But flowers distill'd, though they with winter meet,
Leese but their show; their substance still lives sweet.
Then let not winter's ragged hand deface,
In thee thy summer, ere thou be distilled:
Make sweet some vial; treasure thou some place
With beauty's treasure ere it be self-killed.
That use is not forbidden usury,
Which happies those that pay the willing loan;
That's for thy self to breed another thee,
Or ten times happier, be it ten for one;
Ten times thy self were happier than thou art,
If ten of thine ten times refigured thee:
Then what could death do if thou shouldst depart,
Leaving thee living in posterity?
Be not self-willed, for thou art much too fair
To be death's conquest and make worms thine heir.
Lo! in the orient when the gracious light
Lifts up his burning head, each under eye
Doth homage to his new-appearing sight,
Serving with looks his sacred majesty;
And having climbed the steep-up heavenly hill,
Resembling strong youth in his middle age,
Yet mortal looks adore his beauty still,
Attending on his golden pilgrimage:
But when from highmost pitch, with weary car,
Like feeble age, he reeleth from the day,
The eyes, 'fore duteous, now converted are
From his low tract, and look another way:
So thou, thyself outgoing in thy noon
Unlooked on diest unless thou get a son.
Music to hear, why hear'st thou music sadly?
Sweets with sweets war not, joy delights in joy:
Why lov'st thou that which thou receiv'st not gladly,
Or else receiv'st with pleasure thine annoy?
If the true concord of well-tuned sounds,
By unions married, do offend thine ear,
They do but sweetly chide thee, who confounds
In singleness the parts that thou shouldst bear.
Mark how one string, sweet husband to another,
Strikes each in each by mutual ordering;
Resembling sire and child and happy mother,
Who, all in one, one pleasing note do sing:
Whose speechless song being many, seeming one,
Sings this to thee: 'Thou single wilt prove none.'
Is it for fear to wet a widow's eye,
That thou consum'st thy self in single life?
Ah! if thou issueless shalt hap to die,
The world will wail thee like a makeless wife;
The world will be thy widow and still weep
That thou no form of thee hast left behind,
When every private widow well may keep
By children's eyes, her husband's shape in mind:
Look what an unthrift in the world doth spend
Shifts but his place, for still the world enjoys it;
But beauty's waste hath in the world an end,
And kept unused the user so destroys it.
No love toward others in that bosom sits
That on himself such murd'rous shame commits.
For shame deny that thou bear'st love to any,
Who for thy self art so unprovident.
Grant, if thou wilt, thou art beloved of many,
But that thou none lov'st is most evident:
For thou art so possessed with murderous hate,
That 'gainst thy self thou stick'st not to conspire,
Seeking that beauteous roof to ruinate
Which to repair should be thy chief desire.
O! change thy thought, that I may change my mind:
Shall hate be fairer lodged than gentle love?
Be, as thy presence is, gracious and kind,
Or to thyself at least kind-hearted prove:
Make thee another self for love of me,
That beauty still may live in thine or thee.
As fast as thou shalt wane, so fast thou grow'st
In one of thine, from that which thou departest;
And that fresh blood which youngly thou bestow'st,
Thou mayst call thine when thou from youth convertest.
Herein lives wisdom, beauty, and increase;
Without this folly, age, and cold decay:
If all were minded so, the times should cease
And threescore year would make the world away.
Let those whom nature hath not made for store,
Harsh, featureless, and rude, barrenly perish:
Look whom she best endow'd, she gave the more;
Which bounteous gift thou shouldst in bounty cherish:
She carv'd thee for her seal, and meant thereby,
Thou shouldst print more, not let that copy die.
When I do count the clock that tells the time,
And see the brave day sunk in hideous night;
When I behold the violet past prime,
And sable curls, all silvered o'er with white;
When lofty trees I see barren of leaves,
Which erst from heat did canopy the herd,
And summer's green all girded up in sheaves,
Borne on the bier with white and bristly beard,
Then of thy beauty do I question make,
That thou among the wastes of time must go,
Since sweets and beauties do themselves forsake
And die as fast as they see others grow;
And nothing 'gainst Time's scythe can make defence
Save breed, to brave him when he takes thee hence.
O! that you were your self; but, love, you are
No longer yours, than you your self here live:
Against this coming end you should prepare,
And your sweet semblance to some other give:
So should that beauty which you hold in lease
Find no determination; then you were
Yourself again, after yourself's decease,
When your sweet issue your sweet form should bear.
Who lets so fair a house fall to decay,
Which husbandry in honour might uphold,
Against the stormy gusts of winter's day
And barren rage of death's eternal cold?
O! none but unthrifts. Dear my love, you know,
You had a father: let your son say so.
Not from the stars do I my judgement pluck;
And yet methinks I have Astronomy,
But not to tell of good or evil luck,
Of plagues, of dearths, or seasons' quality;
Nor can I fortune to brief minutes tell,
Pointing to each his thunder, rain and wind,
Or say with princes if it shall go well
By oft predict that I in heaven find:
But from thine eyes my knowledge I derive,
And, constant stars, in them I read such art
As truth and beauty shall together thrive,
If from thyself, to store thou wouldst convert;
Or else of thee this I prognosticate:
Thy end is truth's and beauty's doom and date.
When I consider every thing that grows
Holds in perfection but a little moment,
That this huge stage presenteth nought but shows
Whereon the stars in secret influence comment;
When I perceive that men as plants increase,
Cheered and checked even by the self-same sky,
Vaunt in their youthful sap, at height decrease,
And wear their brave state out of memory;
Then the conceit of this inconstant stay
Sets you most rich in youth before my sight,
Where wasteful Time debateth with decay
To change your day of youth to sullied night,
And all in war with Time for love of you,
As he takes from you, I engraft you new.
But wherefore do not you a mightier way
Make war upon this bloody tyrant, Time?
And fortify your self in your decay
With means more blessed than my barren rhyme?
Now stand you on the top of happy hours,
And many maiden gardens, yet unset,
With virtuous wish would bear you living flowers,
Much liker than your painted counterfeit:
So should the lines of life that life repair,
Which this, Time's pencil, or my pupil pen,
Neither in inward worth nor outward fair,
Can make you live your self in eyes of men.
To give away yourself, keeps yourself still,
And you must live, drawn by your own sweet skill.
Who will believe my verse in time to come,
If it were fill'd with your most high deserts?
Though yet heaven knows it is but as a tomb
Which hides your life, and shows not half your parts.
If I could write the beauty of your eyes,
And in fresh numbers number all your graces,
The age to come would say 'This poet lies;
Such heavenly touches ne'er touch'd earthly faces.'
So should my papers, yellow'd with their age,
Be scorn'd, like old men of less truth than tongue,
And your true rights be term'd a poet's rage
And stretched metre of an antique song:
But were some child of yours alive that time,
You should live twice, in it, and in my rhyme.");
  $rand_idx = array_rand($shakespeare);
  return $shakespeare[$rand_idx];
}

?>
