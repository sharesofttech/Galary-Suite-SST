<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$pgs_devices  = PGS_Settings::get_devices();
$pgs_fields   = PGS_Settings::get_fields();
$pgs_settings = PGS_Settings::get_settings();
$pgs_active   = isset( $_GET['pgs_tab'] ) ? sanitize_key( $_GET['pgs_tab'] ) : 'desktop';

if ( ! array_key_exists( $pgs_active, $pgs_devices ) ) {
    $pgs_active = 'desktop';
}

/*
 * UI groups only. Field names and saved option keys are unchanged so this
 * redesign does not affect existing settings or frontend functionality.
 */
$pgs_sections = array(
    'layout' => array(
        'number' => '01',
        'icon'   => '▦',
        'title'  => 'Gallery & Main Image',
        'desc'   => 'Choose the gallery layout and define the main product image size and fit.',
        'fields' => array(
            'main_image_width',
            'main_image_height',
            'object_fit',
            'border_radius',
            'border_width',
            'slide_type',
            'slide_speed',
        ),
    ),
    'thumbnails' => array(
        'number' => '02',
        'icon'   => '▣',
        'title'  => 'Thumbnail Settings',
        'desc'   => 'Control thumbnail size, shape, spacing, visibility and active-state styling.',
        'fields' => array(
            'thumb_width',
            'thumb_height',
            'thumb_gap',
            'thumb_shape',
            'visible_thumbnails',
            'thumb_style',
            'thumb_play_button',
            'thumb_card_bg',
            'thumb_card_active',
            'gallery_layout',
            'thumb_border',
            'active_thumb_border',
        ),
    ),
    'arrows' => array(
        'number' => '03',
        'icon'   => '‹›',
        'title'  => 'Navigation Arrows',
        'desc'   => 'Style the previous and next controls and decide where they appear.',
        'fields' => array(
            'nav_arrows',
            'arrow_style',
            'arrow_color',
            'arrow_bg',
            'arrow_position',
            'arrow_vertical_position',
            'arrow_offset',
            'arrow_size',
        ),
    ),
    'zoom' => array(
        'number' => '04',
        'icon'   => '⌕',
        'title'  => 'Zoom & Magnifier',
        'desc'   => 'Configure hover zoom, window zoom and lens behaviour.',
        'fields' => array(
            'zoom_button',
            'zoom_style',
            'zoom_level',
            'zoom_window_width',
            'zoom_window_height',
            'zoom_window_position',
            'zoom_window_gap',
            'zoom_lens_width',
            'zoom_lens_height',
            'zoom_lens_shape',
            'zoom_lens_border_width',
            'zoom_lens_border_color',
            'zoom_transition',
            'zoom_hover_delay',
        ),
    ),
    'dots' => array(
        'number' => '05',
        'icon'   => '•••',
        'title'  => 'Bullets / Dots',
        'desc'   => 'Customize slider bullets, position, alignment, spacing and colours.',
        'fields' => array(
            'dots',
            'dots_position',
            'dots_alignment',
            'dots_size',
            'dots_gap',
            'dots_color',
            'dots_active_color',
            'dots_offset',
        ),
    ),
    'playback' => array(
        'number' => '06',
        'icon'   => '▶',
        'title'  => 'Playback & Interaction',
        'desc'   => 'Manage autoplay, loop, touch gestures and transition timing.',
        'fields' => array(
            'autoplay',
            'autoplay_speed',
            'loop',
        ),
    ),
    'lightbox' => array(
        'number' => '07',
        'icon'   => '□',
        'title'  => 'Lightbox',
        'desc'   => 'Control the product image lightbox and its counter.',
        'fields' => array(
            'lightbox',
            'lightbox_counter',
            'touch_swipe',
        ),
    ),
);

?>

<div class="wrap pgs-wrap">

    <div class="pgs-page-header">
        <div class="pgs-page-title-wrap">
            <div class="pgs-page-icon" aria-hidden="true">▧</div>
            <div>
                <h1>Gallery Suite</h1>
                <p class="pgs-subtitle">Configure the gallery separately for Desktop, Tablet and Mobile.</p>
            </div>
        </div>
        <span class="pgs-woocommerce-badge">WooCommerce compatible</span>
    </div>

    <?php if ( isset( $_GET['updated'] ) ) : ?>
        <div class="notice notice-success is-dismissible">
            <p>Settings saved.</p>
        </div>
    <?php endif; ?>

    <div class="pgs-device-tabs" role="tablist" aria-label="Responsive settings">
        <?php foreach ( $pgs_devices as $pgs_device_key => $pgs_device_label ) : ?>
            <a href="#"
               class="pgs-device-tab<?php echo ( $pgs_device_key === $pgs_active ) ? ' is-active' : ''; ?>"
               data-device="<?php echo esc_attr( $pgs_device_key ); ?>"
               role="tab">
                <span class="pgs-device-icon" aria-hidden="true">
                    <?php echo ( 'desktop' === $pgs_device_key ) ? '▣' : ( ( 'tablet' === $pgs_device_key ) ? '▤' : '▯' ); ?>
                </span>
                <?php echo esc_html( $pgs_device_label ); ?>
            </a>
        <?php endforeach; ?>
    </div>

    <form id="pgs-settings-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">

        <input type="hidden" name="action" value="pgs_save_settings">
        <?php wp_nonce_field( 'pgs_save_settings', 'pgs_settings_nonce' ); ?>

        <?php foreach ( $pgs_devices as $pgs_device_key => $pgs_device_label ) :
            $pgs_rendered = array();
            $pgs_device_settings = isset( $pgs_settings[ $pgs_device_key ] ) ? $pgs_settings[ $pgs_device_key ] : array();
            ?>

            <div class="pgs-panel<?php echo ( $pgs_device_key === $pgs_active ) ? ' pgs-panel-active' : ''; ?>"
                 data-device-panel="<?php echo esc_attr( $pgs_device_key ); ?>">

                <div class="pgs-device-summary">
                    <div>
                        <span class="pgs-summary-label"><?php echo esc_html( $pgs_device_label ); ?> settings</span>
                        <span class="pgs-summary-text">Only this device range uses these values.</span>
                    </div>
                    <label class="pgs-switch-row">
                        <input type="checkbox"
                               name="pgs[<?php echo esc_attr( $pgs_device_key ); ?>][enabled]"
                               value="1"
                               <?php checked( ! empty( $pgs_device_settings['enabled'] ) ); ?>>
                        <span class="pgs-switch" aria-hidden="true"></span>
                        <span>Enable gallery</span>
                    </label>
                </div>

                <div class="pgs-sections">
                    <?php foreach ( $pgs_sections as $pgs_section_key => $pgs_section ) : ?>
                        <section class="pgs-section pgs-section-<?php echo esc_attr( $pgs_section_key ); ?>">
                            <div class="pgs-section-header">
                                <div class="pgs-section-heading">
                                    <span class="pgs-section-number"><?php echo esc_html( $pgs_section['number'] ); ?></span>
                                    <span class="pgs-section-icon" aria-hidden="true"><?php echo esc_html( $pgs_section['icon'] ); ?></span>
                                    <div>
                                        <h2><?php echo esc_html( $pgs_section['title'] ); ?></h2>
                                        <p><?php echo esc_html( $pgs_section['desc'] ); ?></p>
                                    </div>
                                </div>
                            </div>

                            <div class="pgs-section-body">
                                <div class="pgs-settings-grid">
                                    <?php foreach ( $pgs_section['fields'] as $pgs_key ) :
                                        if ( ! isset( $pgs_fields[ $pgs_key ] ) || isset( $pgs_rendered[ $pgs_key ] ) ) {
                                            continue;
                                        }

                                        $pgs_rendered[ $pgs_key ] = true;
                                        $pgs_field = $pgs_fields[ $pgs_key ];
                                        $pgs_name  = "pgs[{$pgs_device_key}][{$pgs_key}]";
                                        $pgs_id    = "pgs-{$pgs_device_key}-{$pgs_key}";
                                        $pgs_value = isset( $pgs_device_settings[ $pgs_key ] ) ? $pgs_device_settings[ $pgs_key ] : $pgs_field['default'];
                                        $pgs_full  = 'checkbox' === $pgs_field['type'] ? ' pgs-field-full' : '';
                                        ?>

                                        <div class="pgs-field<?php echo esc_attr( $pgs_full ); ?>">
                                            <?php if ( 'checkbox' === $pgs_field['type'] ) : ?>
                                                <label class="pgs-feature-toggle" for="<?php echo esc_attr( $pgs_id ); ?>">
                                                    <input type="checkbox"
                                                           id="<?php echo esc_attr( $pgs_id ); ?>"
                                                           name="<?php echo esc_attr( $pgs_name ); ?>"
                                                           value="1"
                                                           <?php checked( ! empty( $pgs_value ) ); ?>>
                                                    <span class="pgs-mini-switch" aria-hidden="true"></span>
                                                    <span>
                                                        <strong><?php echo esc_html( $pgs_field['label'] ); ?></strong>
                                                        <small>Enable this feature</small>
                                                    </span>
                                                </label>
                                            <?php else : ?>
                                                <label for="<?php echo esc_attr( $pgs_id ); ?>"><?php echo esc_html( $pgs_field['label'] ); ?></label>

                                                <?php if ( 'select' === $pgs_field['type'] ) : ?>
                                                    <select id="<?php echo esc_attr( $pgs_id ); ?>" name="<?php echo esc_attr( $pgs_name ); ?>">
                                                        <?php foreach ( $pgs_field['options'] as $pgs_opt_value => $pgs_opt_label ) : ?>
                                                            <option value="<?php echo esc_attr( $pgs_opt_value ); ?>" <?php selected( $pgs_value, $pgs_opt_value ); ?>>
                                                                <?php echo esc_html( $pgs_opt_label ); ?>
                                                            </option>
                                                        <?php endforeach; ?>
                                                    </select>
                                                <?php elseif ( 'color' === $pgs_field['type'] ) : ?>
                                                    <input type="text"
                                                           class="pgs-color-input"
                                                           id="<?php echo esc_attr( $pgs_id ); ?>"
                                                           name="<?php echo esc_attr( $pgs_name ); ?>"
                                                           value="<?php echo esc_attr( $pgs_value ); ?>">
                                                <?php else : ?>
                                                    <div class="pgs-input-with-unit">
                                                        <input type="number"
                                                               id="<?php echo esc_attr( $pgs_id ); ?>"
                                                               name="<?php echo esc_attr( $pgs_name ); ?>"
                                                               value="<?php echo esc_attr( $pgs_value ); ?>"
                                                               <?php echo isset( $pgs_field['min'] ) ? 'min="' . esc_attr( $pgs_field['min'] ) . '"' : ''; ?>
                                                               <?php echo isset( $pgs_field['max'] ) ? 'max="' . esc_attr( $pgs_field['max'] ) . '"' : ''; ?>>
                                                        <?php if ( ! empty( $pgs_field['unit'] ) ) : ?>
                                                            <span><?php echo esc_html( $pgs_field['unit'] ); ?></span>
                                                        <?php endif; ?>
                                                    </div>
                                                <?php endif; ?>
                                                <?php if ( ! empty( $pgs_field['help'] ) ) : ?>
                                                    <p class="description" style="margin:4px 0 0;font-size:12px;opacity:.7;"><?php echo esc_html( $pgs_field['help'] ); ?></p>
                                                <?php endif; ?>
                                            <?php endif; ?>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </section>
                    <?php endforeach; ?>
                </div>

            </div>
        <?php endforeach; ?>

        <div class="pgs-save-bar">
            <div>
                <button type="submit" class="button button-primary pgs-save-button">
                    <span class="dashicons dashicons-saved" aria-hidden="true"></span>
                    Save Changes
                </button>
                <span class="pgs-save-status" aria-live="polite"></span>
            </div>
            <span class="pgs-save-hint">Changes are saved for each responsive device profile.</span>
        </div>

    </form>

</div>