<?php
/**
 * The Header template for our theme
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 */
?><!DOCTYPE html>
<!--[if IE 7]>
<html class="ie ie7" lang="fr">
<![endif]-->
<!--[if IE 8]>
<html class="ie ie8" lang="fr">
<![endif]-->
<!--[if !(IE 7) & !(IE 8)]><!-->
<html lang="fr">
<!--<![endif]-->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title><?php wp_title( '|', true, 'right' ); ?></title>
	<link rel="apple-touch-icon" sizes="57x57" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/wp-content/themes/arbre-integral/img/favicon/apple-touch-icon-180x180.png">
	<link rel="icon" type="image/png" href="/wp-content/themes/arbre-integral/img/favicon/favicon-32x32.png" sizes="32x32">
	<link rel="icon" type="image/png" href="/wp-content/themes/arbre-integral/img/favicon/android-chrome-192x192.png" sizes="192x192">
	<link rel="icon" type="image/png" href="/wp-content/themes/arbre-integral/img/favicon/favicon-96x96.png" sizes="96x96">
	<link rel="icon" type="image/png" href="/wp-content/themes/arbre-integral/img/favicon/favicon-16x16.png" sizes="16x16">
	<link rel="manifest" href="/wp-content/themes/arbre-integral/img/favicon/manifest.json">
	<link rel="mask-icon" href="/wp-content/themes/arbre-integral/img/favicon/safari-pinned-tab.svg" color="#000000">
	<link rel="shortcut icon" href="/wp-content/themes/arbre-integral/img/favicon/favicon.ico">
	<meta name="msapplication-TileColor" content="#da532c">
	<meta name="msapplication-TileImage" content="/wp-content/themes/arbre-integral/img/favicon/mstile-144x144.png">
	<meta name="msapplication-config" content="/wp-content/themes/arbre-integral/img/favicon/browserconfig.xml">
	<meta name="theme-color" content="#ffffff">

	<!-- Twitter card. Only if twitter account is created. See https://dev.twitter.com/cards/overview -->
	<!--
	<meta name="twitter:card" content="summary">
	<meta name="twitter:site" content="">
	<meta name="twitter:title" content="">
	<meta name="twitter:description" content="">
	<meta name="twitter:creator" content="">
	<meta name="twitter:image:src" content="">
	<meta name="twitter:domain" content="">
	-->

	<!-- Facebook Open Graph tags. See https://developers.facebook.com/docs/sharing/webmasters -->
	<!--
	<meta name="og:title" content="">
	<meta property="og:type" content="website">
	<meta property="og:url" content="">
	<meta property="og:image" content="">
	<meta property="og:description" content="">
	<meta property="og:locale:locale" content="fr_fr">
	-->

	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Asap|Crimson+Text|Kite+One|Sanchez">
  <link rel="stylesheet" href='/wp-content/themes/arbre-integral/css/main.css' type='text/css'>

	<!--[if lt IE 9]>
	<script src="<?php echo get_template_directory_uri(); ?>/js/html5.js"></script>
	<![endif]-->
</head>

<body>
