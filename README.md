# Galary-Suite-SST
Galary Suite SST – A WordPress plugin for managing and displaying product image galleries with a user-friendly interface and responsive gallery functionality.
A clean WooCommerce product gallery foundation with independent Desktop, Tablet and Mobile settings.

## Installation
1. Deactivate/remove the broken previous copy.
2. Upload this ZIP in WordPress > Plugins > Add New > Upload Plugin.
3. Activate WooCommerce first, then activate this plugin.
4. Open WooCommerce > Gallery Suite.
5. Configure Desktop, Tablet and Mobile and save.
6. Open WooCommerce > Gallery Rules and choose All products, Selected products, or Selected categories.
7. Edit a product and use the Gallery Suite box to add extra images.

## Current features
- WooCommerce featured image + product gallery images.
- Optional extra images per product.
- Desktop / Tablet / Mobile settings stored independently.
- Horizontal bottom/top and vertical layout setting foundation.
- Previous/next controls.
- Thumbnail navigation.
- Dots/bullets option.
- Lightbox.
- Touch/swipe.
- Autoplay and loop.
- Theme-safe namespaced CSS classes.
- Product/category display rules.

## Notes
The video URLs are stored per product and shown as video thumbnails; the current foundation opens the stored URL in a new tab. Advanced inline video playback, variation-specific galleries, advanced zoom modes, priority rule engine and richer layout-specific markup can be added as the next modules without changing the core image data structure.


## v1.0.5

- Added theme-independent WooCommerce gallery CSS overrides.
- Neutralizes FlexSlider viewport/wrapper transforms and inline slide positioning that can cause blank images during navigation.
- Stable thumbnail, arrow and dot controls with one navigation state.
- Autoplay uses a single restartable timer to prevent overlapping transitions.
- Frontend assets load late (priority 99) so they override normal WooCommerce/theme gallery CSS.


## v1.0.6

- Gallery no longer forces width/float/clear on its root, so it stays in the theme's original left column beside the summary.
- Added a JS/CSS two-column fallback for themes that stack the gallery above the summary on desktop.
