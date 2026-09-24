# Galary-Suite-SST
Galary Suite SST – A WordPress plugin for managing and displaying product image galleries with a user-friendly interface and responsive gallery functionality.
**Version:** 1.0.32
**Author:** SST
**Requires:** WordPress + WooCommerce (active)
**Text Domain:** product-gallery-slider
 
Gallery Suite is a WooCommerce product gallery slider plugin. It does **not** create a second/separate gallery — it takes over WooCommerce's native product gallery (the FlexSlider markup) and re-skins/re-controls it with its own layout, thumbnail, zoom, lightbox (Fancybox) and autoplay options, fully configurable per device (Desktop / Tablet / Mobile).

## Installation
 
1. Deactivate/delete any previous copy of this plugin first.
2. In WordPress admin, go to **Plugins → Add New → Upload Plugin** and upload the ZIP.
3. Make sure **WooCommerce** is active, then activate **Gallery Suite**.
4. Go to **Gallery Suite** in the left admin menu (image icon).
5. Configure the **Desktop**, **Tablet** and **Mobile** tabs independently and save.
6. Visit any WooCommerce single product page to see the gallery.
No per-product setup is required — the plugin applies globally to the WooCommerce product gallery using the product's existing featured image + gallery images.

## How it works
 
- On `after_setup_theme`, the plugin force-enables WooCommerce's `wc-product-gallery-slider` theme support (so WooCommerce always prints the FlexSlider markup Gallery Suite depends on — `flex-viewport`, `flex-control-thumbs`, `active-slide`), even on themes that never declared it themselves.
- It force-disables `wc-product-gallery-zoom` and `wc-product-gallery-lightbox`, so WooCommerce's native zoom (jquery.zoom) and native lightbox (PhotoSwipe) never double up with Gallery Suite's own zoom/Fancybox.
- Frontend CSS/JS load at priority `99` on `wp_enqueue_scripts` (product pages only), late enough to override theme/WooCommerce gallery styling.
- An early inline `<head>` script flags `pgs-js` on `<html>` so `frontend.css` can hide the native gallery controls before Gallery Suite's JS replaces them (avoids a flash of unstyled gallery). A 4-second safety timeout un-hides the native controls again if Gallery Suite's script never finds a gallery on the page, so a page never gets stuck with a hidden gallery.
- Settings are stored as one option (`pgs_gallery_settings`), merged with defaults on read so new fields always have a value for older saved installs.

## Settings (per device: Desktop / Tablet / Mobile)
 
Each device tab has its own independent copy of every setting below, plus an **Enabled** toggle for that device.
 
**Layout & slide**
- Gallery layout: Horizontal Bottom, Horizontal Top, Vertical Left, Vertical Right, Thumbnails Only, No Thumbnails
- Slide type: Fade, Slide, Flip
- Slide speed (ms)
- Main image width (%) / height (px)
- Object fit: Contain, Cover, Fill, None
- Border radius / Border width (px)
**Thumbnails**
- Thumbnail width / height (px) — shrinks responsively so the exact visible count always fits
- Thumbnail gap (px)
- Thumbnail shape: Square, Rounded, Circle
- Visible thumbnails (rest scroll) — default 4 on Desktop, 3 on Tablet/Mobile
- Thumbnail style: Card (dark bar + play button) or Classic (plain row)
- Play/pause button toggle
- Card background / active border colors
- Thumbnail border / active thumbnail border colors
**Navigation**
- Navigation arrows on/off, style (Circle, Square, Minimal, None), color, background, size, vertical position (Top/Center/Bottom)
- Dots/bullets on/off, position (above/below/overlay top/overlay bottom), alignment, size, gap, color, active color
**Zoom (hover)**
- Hover zoom type: Inside Zoom, Window Zoom, Lens/Magnifier, Cursor Follow, Disabled, Lightbox (legacy)
- Zoom level, transition speed (ms), hover delay (ms)
- Zoom window width/height/position/gap (for Window Zoom)
- Lens width/height/shape/border width/border color (for Lens/Magnifier)
**Lightbox & behavior**
- Lightbox on/off (Fancybox-powered) + lightbox counter toggle
- Zoom button toggle
- Autoplay on/off + autoplay speed (ms)
- Touch/swipe on/off
- Loop on/off
All fields are sanitized server-side on save (selects checked against allowed options, numbers clamped to min/max, colors validated as hex, checkboxes cast to boolean). Settings can be saved via the traditional form post (`admin-post.php?action=pgs_save_settings`) or via the AJAX endpoint (`wp_ajax_pgs_save_settings`) used by the settings page's JS.

## File structure

product-gallery-slider/
├── product-gallery-slider.php     # Plugin bootstrap, constants, activation hook
├── uninstall.php
├── admin/
│   ├── admin-menu.php              # Registers the "Gallery Suite" admin menu page
│   └── view/settings-page.php      # Settings page markup (Desktop/Tablet/Mobile tabs)
├── includes/
│   ├── class-pgs-plugin.php        # Bootstraps admin/frontend, forces gallery theme support
│   ├── class-pgs-activation.php    # Sets default options + version on activation
│   ├── class-pgs-settings.php      # Field definitions, defaults, sanitizing, save (admin-post + AJAX)
│   └── class-pgs-frontend.php      # Enqueues frontend assets, anti-flash JS flag, body class
└── assets/
    ├── css/ (frontend.css, admin.css, fancybox.css)
    └── js/  (frontend.js, admin.js, fancybox.umd.js)

## Notes for future changes
 
- Adding a new setting field: add it once to `PGS_Settings::get_fields()` — default, sanitize type and admin UI all follow from that single definition; `get_settings()` auto-merges it into existing saved installs.
- The one-time `pgs_visible_thumbs_migrated` flag in `class-pgs-settings.php` is an example migration pattern for changing a default without disturbing sites that already customized that field — follow the same pattern for future default changes.
- Frontend/admin asset versions are cache-busted with `filemtime()` instead of `PGS_VERSION`, so asset edits during development show up immediately without a version bump.

 ## Documentation

See the [`docs/`](https://sharesofttech.github.io/Gallery-suite-docs/) folder (or open [`docs/index.html`](https://sharesofttech.github.io/Gallery-suite-docs/) in a browser) for a full walkthrough of every admin screen with screenshots.
