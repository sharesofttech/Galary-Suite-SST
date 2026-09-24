<?php

if (! defined('ABSPATH')) {
    exit;
}


/**
 * Handles gallery settings: field definitions, defaults, saving and sanitizing.
 */
class PGS_Settings
{

    /**
     * Devices supported by the settings page.
     */
    public static function get_devices()
    {

        return array(
            'desktop' => 'Desktop',
            'tablet'  => 'Tablet',
            'mobile'  => 'Mobile',
        );
    }


    /**
     * Field definitions shared across all device tabs.
     * type: text | number | select | color | checkbox
     */
    public static function get_fields()
    {

        return array(

            'gallery_layout' => array(
                'label'   => 'Gallery layout',
                'type'    => 'select',
                'options' => array(
                    'horizontal-bottom' => 'Horizontal Bottom',
                    'horizontal-top'    => 'Horizontal Top',
                    'vertical-left'     => 'Vertical Left',
                    'vertical-right'    => 'Vertical Right',
                    'thumbnails-only'   => 'Thumbnails Only',
                    'no-thumbnails'     => 'No Thumbnails',
                ),
                'default' => 'horizontal-bottom',
            ),

            'slide_type' => array(
                'label'   => 'Slide type',
                'type'    => 'select',
                'options' => array(
                    'fade'  => 'Fade',
                    'slide' => 'Slide',
                    'flip'  => 'Flip',
                ),
                'default' => 'fade',
            ),

            'slide_speed' => array(
                'label'   => 'Slide speed',
                'type'    => 'number',
                'unit'    => 'ms',
                'default' => 450,
            ),

            'main_image_width' => array(
                'label'   => 'Main image width',
                'type'    => 'number',
                'unit'    => '%',
                'default' => 100,
            ),

            'main_image_height' => array(
                'label'   => 'Main image height',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 360,
            ),

            'thumb_width' => array(
                'label'   => 'Thumbnail width',
                'type'    => 'number',
                'unit'    => 'px',
                'min'     => 20,
                'help'    => 'Maximum width. Shrinks automatically on narrow screens so the exact number of visible thumbnails always fits.',
                'default' => 58,
            ),

            'thumb_height' => array(
                'label'   => 'Thumbnail height',
                'type'    => 'number',
                'unit'    => 'px',
                'min'     => 20,
                'help'    => 'Height follows the width:height ratio you set here.',
                'default' => 58,
            ),

            'thumb_gap' => array(
                'label'   => 'Thumbnail gap',
                'type'    => 'number',
                'unit'    => 'px',
                'min'     => 0,
                'max'     => 60,
                'help'    => 'Space between thumbnails.',
                'default' => 8,
            ),

            'thumb_shape' => array(
                'label'   => 'Thumbnail shape',
                'type'    => 'select',
                'options' => array(
                    'square'  => 'Square',
                    'rounded' => 'Rounded',
                    'circle'  => 'Circle',
                ),
                'default' => 'square',
            ),

            'visible_thumbnails' => array(
                'label'   => 'Visible thumbnails',
                'type'    => 'number',
                'min'     => 1,
                'max'     => 12,
                'help'    => 'Exactly this many thumbnails are shown at once; the rest scroll. Defaults: Desktop 4, Tablet 3, Mobile 3.',
                'default' => 4,
            ),

            'thumb_style' => array(
                'label'   => 'Thumbnail style',
                'type'    => 'select',
                'options' => array(
                    'card'    => 'Card (dark bar + play button)',
                    'classic' => 'Classic (plain row)',
                ),
                'help'    => 'Card = rounded dark bar, dimmed thumbnails, white active border. Applies to Horizontal layouts (and vertical on mobile).',
                'default' => 'card',
            ),

            'thumb_play_button' => array(
                'label'   => 'Play / pause button',
                'type'    => 'checkbox',
                'default' => true,
            ),

            'thumb_card_bg' => array(
                'label'   => 'Card background',
                'type'    => 'color',
                'default' => '#121417',
            ),

            'thumb_card_active' => array(
                'label'   => 'Card active border',
                'type'    => 'color',
                'default' => '#ffffff',
            ),

            'object_fit' => array(
                'label'   => 'Object fit',
                'type'    => 'select',
                'options' => array(
                    'contain' => 'Contain',
                    'cover'   => 'Cover',
                    'fill'    => 'Fill',
                    'none'    => 'None',
                ),
                'default' => 'contain',
            ),

            'border_radius' => array(
                'label'   => 'Border radius',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 0,
            ),

            'border_width' => array(
                'label'   => 'Border width',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 0,
            ),

            'arrow_style' => array(
                'label'   => 'Arrow style',
                'type'    => 'select',
                'options' => array(
                    'circle'  => 'Circle',
                    'square'  => 'Square',
                    'minimal' => 'Minimal',
                    'none'    => 'None',
                ),
                'default' => 'circle',
            ),

            'zoom_style' => array(
                'label'   => 'Hover zoom type',
                'type'    => 'select',
                'options' => array(
                    'inside'   => 'Inside Zoom',
                    'window'   => 'Window Zoom',
                    'lens'     => 'Lens / Magnifier',
                    'follow'   => 'Cursor Follow',
                    'disabled' => 'Disabled',
                    'lightbox' => 'Lightbox (legacy)',
                ),
                'default' => 'inside',
            ),

            'zoom_level' => array(
                'label'   => 'Zoom level',
                'type'    => 'number',
                'unit'    => 'x',
                'default' => 2,
            ),

            'zoom_window_width' => array(
                'label'   => 'Zoom window width',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 420,
            ),

            'zoom_window_height' => array(
                'label'   => 'Zoom window height',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 420,
            ),

            'zoom_window_position' => array(
                'label'   => 'Zoom window position',
                'type'    => 'select',
                'options' => array(
                    'right'  => 'Right',
                    'left'   => 'Left',
                    'top'    => 'Top',
                    'bottom' => 'Bottom',
                    'inside' => 'Inside',
                ),
                'default' => 'right',
            ),

            'zoom_window_gap' => array(
                'label'   => 'Zoom window gap',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 15,
            ),

            'zoom_lens_width' => array(
                'label'   => 'Lens width',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 120,
            ),

            'zoom_lens_height' => array(
                'label'   => 'Lens height',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 120,
            ),

            'zoom_lens_shape' => array(
                'label'   => 'Lens shape',
                'type'    => 'select',
                'options' => array(
                    'square' => 'Square',
                    'circle' => 'Circle',
                ),
                'default' => 'square',
            ),

            'zoom_lens_border_width' => array(
                'label'   => 'Lens border width',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 1,
            ),

            'zoom_lens_border_color' => array(
                'label'   => 'Lens border color',
                'type'    => 'color',
                'default' => '#ffffff',
            ),

            'zoom_transition' => array(
                'label'   => 'Zoom transition',
                'type'    => 'number',
                'unit'    => 'ms',
                'default' => 150,
            ),

            'zoom_hover_delay' => array(
                'label'   => 'Hover delay',
                'type'    => 'number',
                'unit'    => 'ms',
                'default' => 0,
            ),

            'autoplay_speed' => array(
                'label'   => 'Autoplay speed',
                'type'    => 'number',
                'unit'    => 'ms',
                'default' => 4000,
            ),

            'arrow_color' => array(
                'label'   => 'Arrow color',
                'type'    => 'color',
                'default' => '#333333',
            ),

            'arrow_bg' => array(
                'label'   => 'Arrow background',
                'type'    => 'color',
                'default' => '#ffffff',
            ),

            // 'arrow_position' => array(
            //     'label'   => 'Arrow position',
            //     'type'    => 'select',
            //     'options' => array(
            //         'inside'  => 'Inside',
            //         'outside' => 'Outside',
            //     ),
            //     'default' => 'inside',
            // ),

            'arrow_vertical_position' => array(
                'label'   => 'Arrow vertical position',
                'type'    => 'select',
                'options' => array(
                    'top'    => 'Top',
                    'center' => 'Center',
                    'bottom' => 'Bottom',
                ),
                'default' => 'center',
            ),

            // 'arrow_offset' => array(
            //     'label'   => 'Arrow offset',
            //     'type'    => 'number',
            //     'unit'    => 'px',
            //     'default' => 12,
            // ),

            'arrow_size' => array(
                'label'   => 'Arrow size',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 36,
            ),

            'active_thumb_border' => array(
                'label'   => 'Active thumbnail border',
                'type'    => 'color',
                'default' => '#110101',
            ),

            'thumb_border' => array(
                'label'   => 'Thumbnail border',
                'type'    => 'color',
                'default' => '#eb1f1f',
            ),

            'nav_arrows' => array(
                'label'   => 'Navigation arrows',
                'type'    => 'checkbox',
                'default' => true,
            ),

            'dots' => array(
                'label'   => 'Dots / bullets',
                'type'    => 'checkbox',
                'default' => false,
            ),

            'dots_position' => array(
                'label'   => 'Dots position',
                'type'    => 'select',
                'options' => array(
                    'top'          => 'Above image',
                    'bottom'       => 'Below image',
                    'overlay-top'  => 'Overlay top',
                    'overlay-bottom' => 'Overlay bottom',
                ),
                'default' => 'bottom',
            ),

            'dots_alignment' => array(
                'label'   => 'Dots alignment',
                'type'    => 'select',
                'options' => array(
                    'left'   => 'Left',
                    'center' => 'Center',
                    'right'  => 'Right',
                ),
                'default' => 'center',
            ),

            'dots_size' => array(
                'label'   => 'Dot size',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 8,
            ),

            'dots_gap' => array(
                'label'   => 'Dot gap',
                'type'    => 'number',
                'unit'    => 'px',
                'default' => 7,
            ),

            'dots_color' => array(
                'label'   => 'Dot color',
                'type'    => 'color',
                'default' => '#cccccc',
            ),

            'dots_active_color' => array(
                'label'   => 'Active dot color',
                'type'    => 'color',
                'default' => '#333333',
            ),

            // 'dots_offset' => array(
            //     'label'   => 'Dots offset',
            //     'type'    => 'number',
            //     'unit'    => 'px',
            //     'default' => 12,
            // ),

            'zoom_button' => array(
                'label'   => 'Zoom button',
                'type'    => 'checkbox',
                'default' => true,
            ),

            'autoplay' => array(
                'label'   => 'Autoplay',
                'type'    => 'checkbox',
                'default' => false,
            ),

            'lightbox' => array(
                'label'   => 'Lightbox',
                'type'    => 'checkbox',
                'default' => true,
            ),

            'lightbox_counter' => array(
                'label'   => 'Lightbox counter',
                'type'    => 'checkbox',
                'default' => true,
            ),

            'touch_swipe' => array(
                'label'   => 'Touch / swipe',
                'type'    => 'checkbox',
                'default' => true,
            ),

            'loop' => array(
                'label'   => 'Loop',
                'type'    => 'checkbox',
                'default' => true,
            ),
        );
    }


    /**
     * Default values for a single device (all fields + 'enabled').
     */
    public static function get_device_defaults($device = '')
    {

        $defaults = array(
            'enabled' => true,
        );

        foreach (self::get_fields() as $key => $field) {
            $defaults[$key] = $field['default'];
        }

        // Visible thumbnails: Desktop 4, Tablet 3, Mobile 3.
        if ('tablet' === $device || 'mobile' === $device) {
            $defaults['visible_thumbnails'] = 3;
        }

        return $defaults;
    }


    /**
     * Full default settings array for every device.
     */
    public static function get_defaults()
    {

        $defaults = array();

        foreach (self::get_devices() as $device => $label) {
            $defaults[$device] = self::get_device_defaults($device);
        }

        return $defaults;
    }


    /**
     * Get saved settings merged safely with defaults
     * (so newly added fields always have a value).
     */
    public static function get_settings()
    {

        $saved    = get_option('pgs_gallery_settings', array());
        $defaults = self::get_defaults();

        if (! is_array($saved)) {
            $saved = array();
        }

        /*
         * One-time migration: older versions defaulted every device to
         * 4 visible thumbnails. Tablet / Mobile now default to 3, so
         * move any untouched old default (4) over. Custom values stay.
         */
        if ('1' !== get_option('pgs_visible_thumbs_migrated')) {

            foreach (array('tablet', 'mobile') as $device) {
                if (
                    isset($saved[$device]['visible_thumbnails']) &&
                    4 === (int) $saved[$device]['visible_thumbnails']
                ) {
                    $saved[$device]['visible_thumbnails'] = 3;
                }
            }

            update_option('pgs_gallery_settings', $saved);
            update_option('pgs_visible_thumbs_migrated', '1');
        }

        foreach ($defaults as $device => $device_defaults) {

            $device_saved = isset($saved[$device]) && is_array($saved[$device])
                ? $saved[$device]
                : array();

            $defaults[$device] = array_merge($device_defaults, $device_saved);
        }

        return $defaults;
    }


    /**
     * Sanitize settings for all devices.
     */
    private static function sanitize_settings($posted)
    {
        $fields    = self::get_fields();
        $sanitized = array();

        foreach (self::get_devices() as $device => $label) {
            $device_posted = isset($posted[$device]) && is_array($posted[$device])
                ? $posted[$device]
                : array();

            $sanitized[$device] = array(
                'enabled' => ! empty($device_posted['enabled']),
            );

            foreach ($fields as $key => $field) {
                $raw = isset($device_posted[$key]) ? $device_posted[$key] : null;

                switch ($field['type']) {
                    case 'select':
                        $allowed = array_keys($field['options']);
                        $sanitized[$device][$key] = in_array($raw, $allowed, true)
                            ? $raw
                            : $field['default'];
                        break;

                    case 'number':
                        if ('' === $raw || null === $raw) {
                            $sanitized[$device][$key] = $field['default'];
                        } else {
                            $sanitized[$device][$key] = max(
                                isset($field['min']) ? $field['min'] : 0,
                                (float) $raw
                            );
                            if (isset($field['max'])) {
                                $sanitized[$device][$key] = min($field['max'], $sanitized[$device][$key]);
                            }
                            if (floor($sanitized[$device][$key]) === $sanitized[$device][$key]) {
                                $sanitized[$device][$key] = (int) $sanitized[$device][$key];
                            }
                        }
                        break;

                    case 'color':
                        $color = sanitize_hex_color($raw);
                        $sanitized[$device][$key] = $color ? $color : $field['default'];
                        break;

                    case 'checkbox':
                        $sanitized[$device][$key] = ! empty($raw);
                        break;

                    default:
                        $sanitized[$device][$key] = sanitize_text_field($raw);
                        break;
                }
            }
        }

        return $sanitized;
    }


    /**
     * Traditional admin-post save fallback.
     */
    public static function handle_save()
    {
        if (
            ! isset($_POST['pgs_settings_nonce']) ||
            ! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['pgs_settings_nonce'])), 'pgs_save_settings')
        ) {
            wp_die('Security check failed.');
        }

        if (! current_user_can('manage_options')) {
            wp_die('You do not have permission to do this.');
        }

        $posted = isset($_POST['pgs']) ? wp_unslash($_POST['pgs']) : array();
        update_option('pgs_gallery_settings', self::sanitize_settings($posted));

        wp_safe_redirect(
            add_query_arg(
                array(
                    'page'    => 'product-gallery-slider',
                    'updated' => '1',
                ),
                admin_url('admin.php')
            )
        );
        exit;
    }


    /**
     * AJAX save endpoint for the settings page.
     */
    public static function handle_ajax_save()
    {
        if (! current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'You do not have permission to do this.'), 403);
        }

        check_ajax_referer('pgs_ajax_save_settings', 'nonce');

        $posted = isset($_POST['pgs']) ? wp_unslash($_POST['pgs']) : array();
        $sanitized = self::sanitize_settings($posted);

        update_option('pgs_gallery_settings', $sanitized);

        wp_send_json_success(array(
            'message'  => 'Settings saved successfully.',
            'settings' => $sanitized,
        ));
    }


    /**
     * Enqueue admin CSS/JS only on the plugin's settings page.
     */
    public static function enqueue_admin_assets($hook)
    {

        if ('toplevel_page_product-gallery-slider' !== $hook) {
            return;
        }

        wp_enqueue_style(
            'pgs-admin',
            PGS_URL . 'assets/css/admin.css',
            array(),
            PGS_VERSION
        );

        // WordPress native color picker. No external color-picker library is required.
        wp_enqueue_style('wp-color-picker');

        wp_enqueue_script(
            'pgs-admin',
            PGS_URL . 'assets/js/admin.js',
            array('jquery', 'wp-color-picker'),
            PGS_VERSION,
            true
        );

        wp_localize_script(
            'pgs-admin',
            'PGS_ADMIN',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('pgs_ajax_save_settings'),
            )
        );
    }
}

add_action(
    'admin_post_pgs_save_settings',
    array('PGS_Settings', 'handle_save')
);

add_action(
    'admin_enqueue_scripts',
    array('PGS_Settings', 'enqueue_admin_assets')
);

add_action(
    'wp_ajax_pgs_save_settings',
    array('PGS_Settings', 'handle_ajax_save')
);