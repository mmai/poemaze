<?php 
function ai_breadcrumb(){
	$showCurrent = 1; // 1 - show current post/page title in breadcrumbs, 0 - don't show
	$delimiter   = ' / '; // delimiter between crumbs

	global $post;
	$homeLink = get_bloginfo('url') . '/';
  if ( is_page() && !$post->post_parent ) {
    if ($showCurrent == 1) echo get_the_title();
  } elseif ( is_page() && $post->post_parent ) {
    $parent_id  = $post->post_parent;
    $breadcrumbs = array();
    while ($parent_id) {
      $page = get_page($parent_id);
      $breadcrumbs[] = get_the_title($page->ID);
      $parent_id  = $page->post_parent;
    }
    $breadcrumbs = array_reverse($breadcrumbs);
    for ($i = 0; $i < count($breadcrumbs); $i++) {
      echo $breadcrumbs[$i];
      if ($i != count($breadcrumbs)-1) echo $delimiter;
    }
    if ($showCurrent == 1) echo $delimiter . $before . get_the_title() . $after;

  } elseif (is_category()) {
    	$thisCat = get_category(get_query_var('cat'), false);
			if ($thisCat->parent != 0) {
				$cats = get_category_parents($thisCat->parent, TRUE, $delimiter);
				echo $cats;
			}
			echo sprintf($text['category'], single_cat_title('', false));
  } elseif ( is_single() && !is_attachment() ) {
    if ( get_post_type() != 'post' ) {
      $post_type = get_post_type_object(get_post_type());
      $slug = $post_type->rewrite;
      echo $post_type->labels->singular_name;
      if ($showCurrent == 1) echo $delimiter . get_the_title() ;
    } else {
      $cat = get_the_category(); $cat = $cat[0];
      $cats = get_category_parents($cat, TRUE, $delimiter);
      if ($showCurrent == 0) $cats = preg_replace("#^(.+)$delimiter$#", "$1", $cats);
      echo $cats;
      if ($showCurrent == 1) echo get_the_title();
    }
  }
} // end ai_breadcrumbs()
