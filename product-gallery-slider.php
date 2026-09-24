<?php
/**
 * Plugin Name: Gallery Suite
 * Plugin URI: 
 * Description: Professional product image gallery slider for WooCommerce — responsive across desktop, tablet and mobile with fancybox lightbox, zoom and thumbnail controls.
 * Version: 1.0.32
 * Author: SST
 * Author URI: https://www.sharesoft.in/
 * Text Domain: product-gallery-slider
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'PGS_VERSION', '1.0.32' );
define( 'PGS_PATH', plugin_dir_path( __FILE__ ) );
define( 'PGS_URL', plugin_dir_url( __FILE__ ) );

require_once PGS_PATH . 'includes/class-pgs-plugin.php';
require_once PGS_PATH . 'includes/class-pgs-activation.php';

register_activation_hook(
    __FILE__,
    array( 'PGS_Activation', 'activate' )
);

PGS_Plugin::init();