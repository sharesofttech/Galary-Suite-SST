<?php

if (! defined('ABSPATH')) {
    exit;
}


/**
 * GalleryPro Suite - Frontend
 *
 * IMPORTANT:
 * This plugin does NOT create a second gallery.
 * It controls the existing WooCommerce product gallery.
 */
class PGS_Frontend
{


    /**
     * Initialize frontend.
     */
    public static function init()
    {

        /*
         * Load CSS + JS on product pages.
         */
        add_action(
            'wp_enqueue_scripts',
            array(__CLASS__, 'enqueue_assets'),
            99
        );

        /*
         * Tiny inline "js is running" flag, printed as early as possible
         * in <head>. frontend.css only hides the native WooCommerce
         * gallery controls (to avoid a flash before PGS replaces them)
         * while this class is present - see the anti-flash rule at the
         * top of frontend.css.
         */
        add_action(
            'wp_head',
            array(__CLASS__, 'print_js_flag'),
            1
        );

        /*
         * Add a stable PGS body class before theme CSS is applied.
         * This lets the theme-safe product layout CSS take effect
         * immediately, without waiting for frontend.js.
         */
        add_filter(
            'body_class',
            array(__CLASS__, 'body_class'),
            20
        );
    }


    /**
     * Print an early, blocking inline script that flags JS as available
     * and self-heals if PGS's own gallery script never finishes.
     */
    public static function print_js_flag()
    {

        if (! function_exists('is_product') || ! is_product()) {
            return;
        }

        echo '<script>' .
            'document.documentElement.classList.add("pgs-js");' .
            /*
             * Safety net: if frontend.js fails to load, errors out, or
             * simply never reaches a gallery on this page, don\'t leave
             * the native WooCommerce controls hidden forever - restore
             * them after a short wait.
             */
            'window.setTimeout(function(){' .
            'if(!document.querySelector(".woocommerce-product-gallery.pgs-controlled-gallery")){' .
            'document.documentElement.classList.remove("pgs-js");' .
            '}' .
            '},4000);' .
            '</script>' . "\n";
    }


    /**
     * Add a stable body class on WooCommerce single-product pages.
     *
     * This class is intentionally generic and does not identify or
     * override any specific theme. It is used only to scope the PGS
     * product layout CSS before JavaScript has initialized.
     */
    public static function body_class($classes)
    {
        if (function_exists('is_product') && is_product()) {
            $classes[] = 'pgs-product-page';
        }

        return $classes;
    }


    /**
     * Load frontend CSS and JS.
     */
    public static function enqueue_assets()
    {

        if (! function_exists('is_product') || ! is_product()) {
            return;
        }


        /*
         * Get PGS settings.
         */
        if (! class_exists('PGS_Settings')) {

            require_once PGS_PATH . 'includes/class-pgs-settings.php';
        }

        $settings = PGS_Settings::get_settings();


        /*
         * PGS frontend CSS.
         */
        $pgs_css_file = PGS_PATH . 'assets/css/frontend.css';
        $pgs_css_version = file_exists($pgs_css_file)
            ? filemtime($pgs_css_file)
            : PGS_VERSION;

        wp_enqueue_style(
            'pgs-frontend',
            PGS_URL . 'assets/css/frontend.css',
            array(),
            $pgs_css_version
        );


        /*
         * Fancybox CSS.
         */
        $pgs_fancybox_css_file = PGS_PATH . 'assets/css/fancybox.css';
        $pgs_fancybox_css_version = file_exists($pgs_fancybox_css_file)
            ? filemtime($pgs_fancybox_css_file)
            : PGS_VERSION;

        wp_enqueue_style(
            'pgs-fancybox',
            PGS_URL . 'assets/css/fancybox.css',
            array(),
            $pgs_fancybox_css_version
        );


        /*
         * Fancybox JS.
         */
        $pgs_fancybox_js_file = PGS_PATH . 'assets/js/fancybox.umd.js';
        $pgs_fancybox_js_version = file_exists($pgs_fancybox_js_file)
            ? filemtime($pgs_fancybox_js_file)
            : PGS_VERSION;

        wp_enqueue_script(
            'pgs-fancybox',
            PGS_URL . 'assets/js/fancybox.umd.js',
            array(),
            $pgs_fancybox_js_version,
            true
        );

        /*
         * Capture the exact Fancybox instance shipped by PGS before any
         * theme/plugin can replace window.Fancybox later in the page.
         * The frontend JS prefers this private reference and falls back to
         * window.Fancybox only when necessary.
         */
        wp_add_inline_script(
            'pgs-fancybox',
            '(function(){' .
            'function capture(){' .
            'if(window.Fancybox && typeof window.Fancybox.show === "function"){' .
            'window.PGS_Fancybox = window.Fancybox;' .
            'return true;' .
            '}' .
            'return false;' .
            '}' .
            'if(!capture()){' .
            'var n=0,t=setInterval(function(){' .
            'n++;' .
            'if(capture() || n>=100){clearInterval(t);}' .
            '},50);' .
            '}' .
            '})();',
            'after'
        );

        /*
         * PGS frontend JS.
         */
        $pgs_frontend_js_file = PGS_PATH . 'assets/js/frontend.js';
        $pgs_frontend_js_version = file_exists($pgs_frontend_js_file)
            ? filemtime($pgs_frontend_js_file)
            : PGS_VERSION;

        wp_enqueue_script(
            'pgs-frontend',
            PGS_URL . 'assets/js/frontend.js',
            array('jquery', 'pgs-fancybox'),
            $pgs_frontend_js_version,
            true
        );


        /*
         * Send settings to JavaScript.
         */
        wp_localize_script(
            'pgs-frontend',
            'PGS_SETTINGS',
            $settings
        );
    }
}


PGS_Frontend::init();
