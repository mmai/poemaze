<?php
require_once(dirname(__FILE__).'/makeAiPdf.php');

/**
 * Check a path in the database and returns its exisiting or new id
 *
 * @param array $data
 * @return int Id of the path
 */
function registerPath($data){
  // file_put_contents("/var/www/arbre-integral/test/requestData.txt", print_r($data, true));
  global $wpdb;
  $id = null;

  $path = $data["path"];
  $svg = $data["svg"];

  //for curl tests only
  $svg = stripslashes($svg);

  $sql = $wpdb->prepare("SELECT id FROM aipaths WHERE path='%s'", $path);
  $res = $wpdb->get_row($sql);

  if (null !== $res){
    $id = $res->id;
  } else {
    if ($wpdb->insert("aipaths", array( 'path' => $path), array( '%s'))) {
      $id = $wpdb->insert_id;
    }
  } 

  $visitorId = getVisitorId();
  $visitorNumber = registerVisitorForPath($id, $visitorId);
  createCover($id, $svg);
  createContent($id, $path, $visitorNumber);
  return $id;
}

function registerVisitorForPath($pathId, $visitorId){
  global $wpdb;

  $id = null;
  $sql = $wpdb->prepare("SELECT id FROM aivisitors WHERE pathid=%d AND visitor='%s' ", $pathId, $visitorId);
  $res = $wpdb->get_row($sql);

  if (null === $res){
    $ok = $wpdb->insert("aivisitors", array(
      'pathid' => $pathId,
      'visitor' => $visitorId,
      'date' => date('Y-m-d h:i:s')
     ), array( '%d', '%s', '%s'));
    $id = $wpdb->insert_id;
  } else {
    $id = $res->id;
  }
  return $id;
}

function getVisitorId(){
  if(isset($_COOKIE['aiVisitorID'])) {
    $uniqueId = $_COOKIE['aiVisitorID'];
  } else {
    $uniqueId = uniqid();
    $expire=time()+60*60*24*30;
    setcookie('aiVisitorID', $uniqueId, $expire);
  }
  return $uniqueId;
}

/**
 * Check path format
 * @param string $path
 * @return boolean 
 */
function isPath($path){
  return (sizeof(explode('-', $path)) == 126);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'arbreintegral/v1', '/path/(?P<path>[-\w]+)', array(
        'methods' => 'POST',
        'callback' => 'registerPath',
        'args' => array(
          'svg' => array(),
          'path' => array(
            'validate_callback' => 'isPath'
          )
        )
    ) );
} );
?>
