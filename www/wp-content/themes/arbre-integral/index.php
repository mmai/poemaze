<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme and one of the
 * two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * For example, it puts together the home page when no home.php file exists.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package WordPress
 * @subpackage Twenty_Thirteen
 * @since Twenty Thirteen 1.0
 */

get_header(); ?>

<div id="page">
  <div id="main" class="site-main">
    <div class="main-container">
      <div class="wp-content" role="main">
      <?php if ( have_posts() ) : ?>

			<?php /* The loop */ ?>
			<?php while ( have_posts() ) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
          <header class="entry-header">
            <h1 class="entry-title"><?php the_title(); ?></h1>
          </header><!-- .entry-header -->
          <div class="entry-content">
            <?php the_content(); ?>
            
          </div><!-- .wp-content -->
        </article>
			<?php endwhile; ?>

      <?php endif; ?>

      </div><!-- .wp-content -->
<?php include("ai-elements.php");?>
</div><!-- .main-container -->

  </div><!-- #main -->
</div><!-- #page -->
<?php get_footer(); ?>
