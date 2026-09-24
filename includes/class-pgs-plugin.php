<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


/**
 * Main GalleryPro Suite plugin class.
 */
class PGS_Plugin {

    /**
     * Initialize plugin.
     */
    public static function init() {

        /**
         * Admin functionality.
         */
        if ( is_admin() ) {

            require_once PGS_PATH . 'includes/class-pgs-settings.php';
            require_once PGS_PATH . 'admin/admin-menu.php';

        }

        /**
         * Frontend functionality.
         */
        if ( ! is_admin() ) {

            require_once PGS_PATH . 'includes/class-pgs-frontend.php';

        }

        /**
         * Force WooCommerce gallery theme support.
         *
         * This MUST run on 'after_setup_theme' (late priority, so it
         * runs after the active theme's own setup) so that WooCommerce
         * sees these supports before it decides how to render the
         * product gallery markup. Without this, on themes that don't
         * declare gallery support themselves, WooCommerce skips the
         * flexslider-style markup (flex-viewport / flex-control-thumbs /
         * active-slide) that this plugin's CSS and JS rely on, and just
         * dumps all gallery images out unstructured - which is what
         * causes the broken "no main image, oversized overlapping
         * thumbnails" layout.
         */
        add_action(
            'after_setup_theme',
            array( __CLASS__, 'force_gallery_theme_support' ),
            20
        );
    }


    /**
     * Ensure WooCommerce prints the FlexSlider markup PGS needs
     * (regardless of whether the active theme declared support for
     * it), and ensure WooCommerce's own native zoom/lightbox never
     * run alongside PGS's own zoom/lightbox implementation.
     */
    public static function force_gallery_theme_support() {

        /*
         * Only the slider support is needed - it's what makes WooCommerce
         * print the FlexSlider markup (flex-viewport / flex-control-thumbs /
         * active-slide) that this plugin's CSS and JS rely on.
         */
        if ( ! current_theme_supports( 'wc-product-gallery-slider' ) ) {
            add_theme_support( 'wc-product-gallery-slider' );
        }

        /*
         * PGS ships its own hover-zoom (Inside / Window / Lens / Cursor
         * Follow - the "Hover zoom type" setting) and its own Fancybox
         * lightbox (the "Lightbox" setting), fully replacing WooCommerce's
         * native zoom (jquery.zoom) and native lightbox (PhotoSwipe).
         *
         * If 'wc-product-gallery-zoom' / 'wc-product-gallery-lightbox'
         * stay enabled - whether the theme declared them itself or an
         * earlier version of this plugin force-added them - WooCommerce
         * still enqueues its own zoom/photoswipe assets and binds its own
         * click/hover handlers to the same gallery images PGS controls.
         * That is what causes two magnifiers or two lightboxes to fire on
         * the same image, and native WooCommerce lightbox/zoom CSS to
         * visually clash with PGS's own styling.
         *
         * So PGS explicitly turns these off on every theme and lets its
         * own "Hover zoom type" / "Lightbox" settings be the only thing
         * in control.
         */
        remove_theme_support( 'wc-product-gallery-zoom' );
        remove_theme_support( 'wc-product-gallery-lightbox' );
    }
}