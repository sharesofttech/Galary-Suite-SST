<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


/**
 * GalleryPro Suite activation handler.
 */
class PGS_Activation {

    /**
     * Run when plugin is activated.
     */
    public static function activate() {

        /**
         * Default gallery settings for Desktop, Tablet and Mobile.
         */
        require_once dirname( __FILE__ ) . '/class-pgs-settings.php';

        $default_settings = PGS_Settings::get_defaults();


        /**
         * Save default settings only
         * when the option does not already exist.
         */
        if ( false === get_option( 'pgs_gallery_settings' ) ) {

            add_option(
                'pgs_gallery_settings',
                $default_settings
            );
        }


        /**
         * Store plugin version.
         */
        update_option(
            'pgs_version',
            PGS_VERSION
        );
    }
}