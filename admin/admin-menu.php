<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function pgs_add_admin_menu() {

    add_menu_page(
        'Gallery Suite',
        'Gallery Suite',
        'manage_options',
        'product-gallery-slider',
        'pgs_render_settings_page',
        'dashicons-images-alt2',
        56
    );
}

add_action(
    'admin_menu',
    'pgs_add_admin_menu'
);


/**
 * Render settings page.
 */
function pgs_render_settings_page() {

    require PGS_PATH . 'admin/view/settings-page.php';
}