<?php

/**
 * Check a path in the database and returns its exisiting or new id
 *
 * @param array $data
 * @return int Id of the path
 */
function registerPath($data){
  global $wpdb;
  $id = null;

  $path = $data["path"];

  $sql = $wpdb->prepare("SELECT id FROM aipaths WHERE path='%s'", $path);
  $res = $wpdb->get_row($sql);

  if (null !== $res){
    $id = $res->id;
  } else {
    $ok = $wpdb->insert("aipaths", array( 'path' => $path), array( '%s'));
    if (false !== $ok) {
      $id = $wpdb->insert_id;
    }
  } 

  registerVisitorForPath($id);
  return $id;
}

function registerVisitorForPath($pathId){
  global $wpdb;
  $visitorId = getVisitorId();

  $sql = $wpdb->prepare("SELECT id FROM aivisitors WHERE pathid=%d AND visitor='%s' ", $pathId, $visitorId);
  $res = $wpdb->get_row($sql);

  if (null === $res){
    $ok = $wpdb->insert("aivisitors", array(
      'pathid' => $pathId,
      'visitor' => $visitorId,
      'date' => date('Y-m-d h:i:s')
    ), array( '%d', '%s', '%s'));
  } 
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
  // return (sizeof(explode('-', $path)) == 126);
  return true;
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'arbreintegral/v1', '/path/(?P<path>[-\w]+)', array(
        'methods' => 'GET',
        'callback' => 'registerPath',
        'args' => array(
          'path' => array(
            'validate_callback' => 'isPath'
          )
        )
    ) );
} );
?>
