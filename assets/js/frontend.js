(function () {
    'use strict';

    var galleries = [];
    var galleryInstances = new WeakMap();

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                callback
            );
        } else {
            callback();
        }
    }

    function qs(parent, selector) {
        if (!parent) {
            return null;
        }

        return parent.querySelector(selector);
    }

    function qsa(parent, selector) {
        if (!parent) {
            return [];
        }

        return Array.prototype.slice.call(
            parent.querySelectorAll(selector)
        );
    }

    function createElement(html) {
        var template =
            document.createElement('template');

        template.innerHTML = html.trim();

        return template.content
            .firstElementChild;
    }

    function isEnabled(value) {
        return (
            value === true ||
            value === 1 ||
            value === '1' ||
            value === 'true' ||
            value === 'yes' ||
            value === 'on'
        );
    }

    function number(value, fallback) {
        var parsed =
            parseFloat(value);

        return isFinite(parsed)
            ? parsed
            : fallback;
    }

    function integer(value, fallback) {
        var parsed =
            parseInt(value, 10);

        return isFinite(parsed)
            ? parsed
            : fallback;
    }

    function clamp(value, min, max) {
        return Math.max(
            min,
            Math.min(max, value)
        );
    }

    function normalizeString(
        value,
        fallback
    ) {
        if (
            value === undefined ||
            value === null ||
            value === ''
        ) {
            return fallback;
        }

        return String(value)
            .toLowerCase()
            .trim()
            .replace(/_/g, '-')
            .replace(/\s+/g, '-');
    }

    function getDeviceSettings() {
        if (
            typeof window.PGS_SETTINGS ===
            'undefined'
        ) {
            return {};
        }

        var width =
            window.innerWidth;

        if (width <= 767) {
            return (
                window.PGS_SETTINGS.mobile ||
                {}
            );
        }

        if (width <= 1024) {
            return (
                window.PGS_SETTINGS.tablet ||
                {}
            );
        }

        return (
            window.PGS_SETTINGS.desktop ||
            {}
        );
    }

    function getSlides(instance) {
        return qsa(
            instance.gallery,
            '.woocommerce-product-gallery__image'
        ).filter(function (slide) {
            return !slide.classList.contains(
                'clone'
            );
        });
    }

    function getWrapper(instance) {
        return qs(
            instance.gallery,
            '.woocommerce-product-gallery__wrapper'
        );
    }

    function getViewport(instance) {
        return qs(
            instance.gallery,
            '.flex-viewport'
        );
    }

    function getThumbList(instance) {
        return qs(
            instance.gallery,
            '.pgs-thumb-list'
        );
    }

    function hideNativeWooThumbLists(
        instance
    ) {
        var lists = qsa(
            instance.gallery,
            '.flex-control-thumbs'
        );

        lists.forEach(function (list) {

            if (
                !list.classList.contains(
                    'pgs-thumb-list'
                )
            ) {
                list.classList.add(
                    'pgs-native-thumb-list-hidden'
                );

                list.style.setProperty(
                    'display',
                    'none',
                    'important'
                );
            }
        });
    }

    function showNativeWooThumbLists(
        instance
    ) {
        var lists = qsa(
            instance.gallery,
            '.flex-control-thumbs'
        );

        lists.forEach(function (list) {

            if (
                !list.classList.contains(
                    'pgs-thumb-list'
                )
            ) {
                list.classList.remove(
                    'pgs-native-thumb-list-hidden'
                );

                list.style.removeProperty(
                    'display'
                );
            }
        });
    }

    function stopAutoplay(instance) {

        if (instance.autoplayTimer) {
            window.clearTimeout(
                instance.autoplayTimer
            );

            instance.autoplayTimer =
                null;
        }
    }

    function scheduleAutoplay(instance) {

        stopAutoplay(instance);

        if (instance.autoplayHoverPaused) {
            return;
        }

        var slides =
            getSlides(instance);

        /*
         * The thumbnail-bar play/pause button (instance.userAutoplay)
         * overrides the backend "Autoplay" setting once the visitor
         * has used it.
         */
        var autoplayOn =
            typeof instance.userAutoplay === 'boolean'
                ? instance.userAutoplay
                : isEnabled(
                    instance.settings.autoplay
                );

        if (
            !autoplayOn ||
            slides.length < 2
        ) {
            return;
        }

        var speed =
            Math.max(
                1000,
                integer(
                    instance.settings
                        .autoplay_speed,
                    4000
                )
            );

        instance.autoplayTimer =
            window.setTimeout(
                function () {

                    goToSlide(
                        instance,
                        instance.slideIndex + 1,
                        true
                    );

                },
                speed
            );
    }

    function pauseAutoplayOnHover(instance) {

        if (!instance) {
            return;
        }

        instance.autoplayHoverPaused = true;
        instance.autoplayHoverWasRunning = !!instance.autoplayTimer;
        stopAutoplay(instance);
    }

    function resumeAutoplayAfterHover(instance) {

        if (!instance) {
            return;
        }

        var wasRunning = instance.autoplayHoverWasRunning;

        instance.autoplayHoverPaused = false;
        instance.autoplayHoverWasRunning = false;

        if (wasRunning) {
            scheduleAutoplay(instance);
        }
    }

    function normalizeIndex(
        instance,
        index,
        total
    ) {
        var loop =
            instance.settings.loop ===
            undefined ||
            isEnabled(
                instance.settings.loop
            );

        if (index < 0) {
            return loop
                ? total - 1
                : 0;
        }

        if (index >= total) {
            return loop
                ? 0
                : total - 1;
        }

        return index;
    }

    function updateDots(instance) {

        var dots = qsa(
            instance.gallery,
            '.pgs-dots button'
        );

        dots.forEach(
            function (dot, index) {

                dot.classList.toggle(
                    'active',
                    index ===
                    instance.slideIndex
                );
            }
        );
    }

    function updateThumbs(instance) {

        var list =
            getThumbList(instance);

        if (!list) {
            return;
        }

        var thumbs =
            qsa(
                list,
                'li'
            );

        var activeThumb =
            null;

        thumbs.forEach(
            function (thumb, index) {

                var active =
                    index ===
                    instance.slideIndex;

                thumb.classList.toggle(
                    'pgs-active-thumb',
                    active
                );

                thumb.setAttribute(
                    'aria-selected',
                    active
                        ? 'true'
                        : 'false'
                );

                if (active) {
                    activeThumb =
                        thumb;
                }
            }
        );

        scrollThumbIntoView(
            list,
            activeThumb
        );
    }

    function scrollThumbIntoView(
        list,
        activeThumb
    ) {

        if (
            !list ||
            !activeThumb
        ) {
            return;
        }

        /*
         * Measure with getBoundingClientRect() relative to the list
         * itself. offsetLeft / offsetTop are relative to the thumb's
         * offsetParent, which depends on the theme's CSS (positioned
         * ancestors) and produced wrong scroll positions.
         */
        var playWrap =
            list.querySelector(
                '.pgs-thumb-play-wrap'
            );

        var reserve =
            playWrap
                ? playWrap.getBoundingClientRect().width
                : 0;

        var listRect =
            list.getBoundingClientRect();

        var thumbRect =
            activeThumb.getBoundingClientRect();

        if (
            list.scrollWidth >
            list.clientWidth
        ) {

            var left =
                thumbRect.left -
                listRect.left +
                list.scrollLeft;

            var right =
                left +
                thumbRect.width;

            var viewLeft =
                list.scrollLeft;

            var viewRight =
                viewLeft +
                list.clientWidth -
                reserve;

            if (left < viewLeft) {

                list.scrollTo({
                    left: Math.max(0, left - 10),
                    behavior: 'smooth'
                });

            } else if (
                right > viewRight
            ) {

                list.scrollTo({
                    left:
                        right -
                        list.clientWidth +
                        reserve +
                        10,
                    behavior: 'smooth'
                });
            }
        }

        if (
            list.scrollHeight >
            list.clientHeight
        ) {

            var top =
                thumbRect.top -
                listRect.top +
                list.scrollTop;

            var bottom =
                top +
                thumbRect.height;

            var viewTop =
                list.scrollTop;

            var viewBottom =
                viewTop +
                list.clientHeight;

            if (top < viewTop) {

                list.scrollTo({
                    top: Math.max(0, top - 10),
                    behavior: 'smooth'
                });

            } else if (
                bottom > viewBottom
            ) {

                list.scrollTo({
                    top:
                        bottom -
                        list.clientHeight +
                        10,
                    behavior: 'smooth'
                });
            }
        }
    }

    function applyFadeTransition(
        instance,
        slides,
        newIndex
    ) {

        slides.forEach(
            function (slide, i) {

                var active =
                    i ===
                    newIndex;

                slide.classList.toggle(
                    'pgs-active-slide',
                    active
                );

                slide.style.setProperty(
                    'position',
                    'absolute',
                    'important'
                );

                slide.style.setProperty(
                    'left',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'top',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'width',
                    '100%',
                    'important'
                );

                slide.style.setProperty(
                    'height',
                    '100%',
                    'important'
                );

                slide.style.setProperty(
                    'display',
                    'block',
                    'important'
                );

                slide.style.setProperty(
                    'opacity',
                    active
                        ? '1'
                        : '0',
                    'important'
                );

                slide.style.setProperty(
                    'visibility',
                    active
                        ? 'visible'
                        : 'hidden',
                    'important'
                );

                slide.style.setProperty(
                    'z-index',
                    active
                        ? '2'
                        : '1',
                    'important'
                );

                slide.style.removeProperty(
                    'transition'
                );

                slide.style.setProperty(
                    'transform',
                    'none',
                    'important'
                );
            }
        );
    }

    function applySlideTransition(
        instance,
        slides,
        previousIndex,
        newIndex,
        direction
    ) {

        var speed =
            Math.max(
                150,
                number(
                    instance.settings.slide_speed,
                    450
                )
            );

        instance.gallery.style.setProperty(
            '--pgs-slide-speed',
            speed + 'ms'
        );

        var enterFrom =
            direction === 'prev' ?
                '-100%' :
                '100%';

        var exitTo =
            direction === 'prev' ?
                '100%' :
                '-100%';

        var hasChanged =
            previousIndex !==
            newIndex;

        slides.forEach(
            function (slide, i) {

                var active =
                    i === newIndex;

                var wasActive =
                    hasChanged &&
                    i === previousIndex;

                slide.classList.toggle(
                    'pgs-active-slide',
                    active
                );

                slide.style.setProperty(
                    'position',
                    'absolute',
                    'important'
                );

                slide.style.setProperty(
                    'left',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'top',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'width',
                    '100%',
                    'important'
                );

                slide.style.setProperty(
                    'height',
                    '100%',
                    'important'
                );

                slide.style.setProperty(
                    'display',
                    'block',
                    'important'
                );

                slide.style.setProperty(
                    'transition',
                    'none',
                    'important'
                );

                if (active) {

                    slide.style.setProperty(
                        'opacity',
                        '1',
                        'important'
                    );

                    slide.style.setProperty(
                        'visibility',
                        'visible',
                        'important'
                    );

                    slide.style.setProperty(
                        'z-index',
                        '2',
                        'important'
                    );

                    slide.style.setProperty(
                        'transform',
                        hasChanged ?
                            'translateX(' + enterFrom + ')' :
                            'translateX(0)',
                        'important'
                    );

                } else if (wasActive) {

                    slide.style.setProperty(
                        'opacity',
                        '1',
                        'important'
                    );

                    slide.style.setProperty(
                        'visibility',
                        'visible',
                        'important'
                    );

                    slide.style.setProperty(
                        'z-index',
                        '1',
                        'important'
                    );

                    slide.style.setProperty(
                        'transform',
                        'translateX(0)',
                        'important'
                    );

                } else {

                    slide.style.setProperty(
                        'opacity',
                        '0',
                        'important'
                    );

                    slide.style.setProperty(
                        'visibility',
                        'hidden',
                        'important'
                    );

                    slide.style.setProperty(
                        'z-index',
                        '0',
                        'important'
                    );

                    slide.style.setProperty(
                        'transform',
                        'none',
                        'important'
                    );
                }
            }
        );

        if (!hasChanged) {
            return;
        }

        void instance.gallery.offsetWidth;

        var activeSlide =
            slides[newIndex];

        var outgoingSlide =
            slides[previousIndex];

        if (activeSlide) {

            activeSlide.style.removeProperty(
                'transition'
            );

            activeSlide.style.setProperty(
                'transform',
                'translateX(0)',
                'important'
            );
        }

        if (outgoingSlide) {

            outgoingSlide.style.removeProperty(
                'transition'
            );

            outgoingSlide.style.setProperty(
                'transform',
                'translateX(' + exitTo + ')',
                'important'
            );

            window.setTimeout(
                function () {

                    if (
                        !outgoingSlide.classList.contains(
                            'pgs-active-slide'
                        )
                    ) {

                        outgoingSlide.style.setProperty(
                            'opacity',
                            '0',
                            'important'
                        );

                        outgoingSlide.style.setProperty(
                            'visibility',
                            'hidden',
                            'important'
                        );

                        outgoingSlide.style.setProperty(
                            'z-index',
                            '0',
                            'important'
                        );
                    }
                },
                speed + 60
            );
        }
    }

    function applyFlipTransition(
        instance,
        slides,
        previousIndex,
        newIndex,
        direction
    ) {

        var speed =
            Math.max(
                150,
                number(
                    instance.settings.slide_speed,
                    450
                )
            );

        instance.gallery.style.setProperty(
            '--pgs-slide-speed',
            speed + 'ms'
        );

        var wrapper =
            getWrapper(instance);

        if (wrapper) {

            wrapper.style.setProperty(
                'perspective',
                '1200px',
                'important'
            );

            wrapper.style.setProperty(
                'perspective-origin',
                '50% 50%',
                'important'
            );
        }

        var enterFrom =
            direction === 'prev' ?
                '-90deg' :
                '90deg';

        var exitTo =
            direction === 'prev' ?
                '90deg' :
                '-90deg';

        var hasChanged =
            previousIndex !==
            newIndex;

        slides.forEach(
            function (slide, i) {

                var active =
                    i === newIndex;

                var wasActive =
                    hasChanged &&
                    i === previousIndex;

                slide.classList.toggle(
                    'pgs-active-slide',
                    active
                );

                slide.style.setProperty('position', 'absolute', 'important');
                slide.style.setProperty('left', '0', 'important');
                slide.style.setProperty('top', '0', 'important');
                slide.style.setProperty('width', '100%', 'important');
                slide.style.setProperty('height', '100%', 'important');
                slide.style.setProperty('display', 'block', 'important');
                slide.style.setProperty('backface-visibility', 'hidden', 'important');
                slide.style.setProperty('transform-style', 'preserve-3d', 'important');
                slide.style.setProperty('transition', 'none', 'important');

                if (active) {

                    slide.style.setProperty('opacity', '1', 'important');
                    slide.style.setProperty('visibility', 'visible', 'important');
                    slide.style.setProperty('z-index', '2', 'important');

                    slide.style.setProperty(
                        'transform',
                        hasChanged ?
                            'rotateY(' + enterFrom + ')' :
                            'rotateY(0deg)',
                        'important'
                    );

                } else if (wasActive) {

                    slide.style.setProperty('opacity', '1', 'important');
                    slide.style.setProperty('visibility', 'visible', 'important');
                    slide.style.setProperty('z-index', '1', 'important');
                    slide.style.setProperty('transform', 'rotateY(0deg)', 'important');

                } else {

                    slide.style.setProperty('opacity', '0', 'important');
                    slide.style.setProperty('visibility', 'hidden', 'important');
                    slide.style.setProperty('z-index', '0', 'important');
                    slide.style.setProperty('transform', 'none', 'important');
                }
            }
        );

        if (!hasChanged) {
            return;
        }

        void instance.gallery.offsetWidth;

        var activeSlide = slides[newIndex];
        var outgoingSlide = slides[previousIndex];

        if (activeSlide) {

            activeSlide.style.removeProperty('transition');
            activeSlide.style.setProperty('transform', 'rotateY(0deg)', 'important');
        }

        if (outgoingSlide) {

            outgoingSlide.style.removeProperty('transition');
            outgoingSlide.style.setProperty('transform', 'rotateY(' + exitTo + ')', 'important');

            window.setTimeout(
                function () {

                    if (!outgoingSlide.classList.contains('pgs-active-slide')) {

                        outgoingSlide.style.setProperty('opacity', '0', 'important');
                        outgoingSlide.style.setProperty('visibility', 'hidden', 'important');
                        outgoingSlide.style.setProperty('z-index', '0', 'important');
                    }
                },
                speed + 60
            );
        }
    }

    function goToSlide(
        instance,
        index,
        fromAutoplay
    ) {

        if (instance.destroyed) {
            return;
        }

        var slides =
            getSlides(instance);

        var total =
            slides.length;

        if (!total) {
            return;
        }

        var previousIndex =
            instance.slideIndex;

        var rawTarget =
            index;

        instance.slideIndex =
            normalizeIndex(
                instance,
                index,
                total
            );

        // var useSlideType =
        //     total > 1 &&
        //     instance.settings &&
        //     instance.settings.slide_type ===
        //     'slide';

        // if (useSlideType) {

        //     var direction =
        //         rawTarget >=
        //             previousIndex ?
        //             'next' :
        //             'prev';

        //     applySlideTransition(
        //         instance,
        //         slides,
        //         previousIndex,
        //         instance.slideIndex,
        //         direction
        //     );

        // } else {

        //     applyFadeTransition(
        //         instance,
        //         slides,
        //         instance.slideIndex
        //     );
        // }
        var currentSlideType =
            instance.settings &&
            instance.settings.slide_type;

        var useSlideType =
            total > 1 &&
            currentSlideType === 'slide';

        var useFlipType =
            total > 1 &&
            currentSlideType === 'flip';

        if (useSlideType) {

            var direction =
                rawTarget >= previousIndex ? 'next' : 'prev';

            applySlideTransition(
                instance,
                slides,
                previousIndex,
                instance.slideIndex,
                direction
            );

        } else if (useFlipType) {

            var flipDirection =
                rawTarget >= previousIndex ? 'next' : 'prev';

            applyFlipTransition(
                instance,
                slides,
                previousIndex,
                instance.slideIndex,
                flipDirection
            );

        } else {

            applyFadeTransition(
                instance,
                slides,
                instance.slideIndex
            );
        }

        updateThumbs(instance);
        updateDots(instance);

        instance.gallery.setAttribute(
            'data-pgs-current',
            String(
                instance.slideIndex
            )
        );

        instance.gallery.classList.add(
            'pgs-has-active-slide'
        );

        setupZoom(instance);

        scheduleAutoplay(instance);
    }

    function buildThumbnails(instance) {

        var slides =
            getSlides(instance);

        if (!slides.length) {
            return null;
        }

        hideNativeWooThumbLists(
            instance
        );

        var list =
            getThumbList(instance);

        if (!list) {

            list =
                document.createElement(
                    'ol'
                );

            list.className =
                'pgs-thumb-list';

            list.setAttribute(
                'role',
                'list'
            );

            var wrapper =
                getWrapper(instance);

            if (
                wrapper &&
                wrapper.parentNode
            ) {

                wrapper.parentNode.insertBefore(
                    list,
                    wrapper.nextSibling
                );

            } else {

                instance.gallery.appendChild(
                    list
                );
            }
        }

        list.classList.add(
            'pgs-thumb-list'
        );

        list.setAttribute(
            'data-pgs-managed',
            '1'
        );

        list.classList.remove(
            'pgs-native-thumb-list-hidden'
        );

        instance.isBuildingThumbs =
            true;

        list.innerHTML =
            '';

        slides.forEach(
            function (
                slide,
                index
            ) {

                var image =
                    qs(
                        slide,
                        'img'
                    );

                if (!image) {
                    return;
                }

                var source =
                    slide.getAttribute(
                        'data-thumb'
                    ) ||
                    image.getAttribute(
                        'data-thumb'
                    ) ||
                    image.getAttribute(
                        'data-src'
                    ) ||
                    image.currentSrc ||
                    image.getAttribute(
                        'src'
                    ) ||
                    '';

                var alt =
                    image.getAttribute(
                        'alt'
                    ) ||
                    'Product image ' +
                    (index + 1);

                var li =
                    document.createElement(
                        'li'
                    );

                li.className =
                    'pgs-thumb-item';

                li.setAttribute(
                    'role',
                    'button'
                );

                li.setAttribute(
                    'tabindex',
                    '0'
                );

                li.setAttribute(
                    'data-pgs-index',
                    String(index)
                );

                li.setAttribute(
                    'aria-label',
                    'Show product image ' +
                    (index + 1)
                );

                li.setAttribute(
                    'aria-selected',
                    index ===
                        instance.slideIndex
                        ? 'true'
                        : 'false'
                );

                var thumb =
                    document.createElement(
                        'img'
                    );

                thumb.setAttribute(
                    'loading',
                    'lazy'
                );

                thumb.setAttribute(
                    'decoding',
                    'async'
                );

                thumb.setAttribute(
                    'src',
                    source
                );

                thumb.setAttribute(
                    'alt',
                    alt
                );

                thumb.setAttribute(
                    'draggable',
                    'false'
                );

                li.appendChild(
                    thumb
                );

                list.appendChild(
                    li
                );
            }
        );

        instance.isBuildingThumbs =
            false;

        ensureThumbPlayButton(
            instance,
            list
        );

        return list;
    }

    function isThumbAutoplayOn(instance) {

        return typeof instance.userAutoplay === 'boolean'
            ? instance.userAutoplay
            : isEnabled(
                instance.settings.autoplay
            );
    }

    function updateThumbPlayButton(instance) {

        var button =
            qs(
                instance.gallery,
                '.pgs-thumb-play'
            );

        if (!button) {
            return;
        }

        var playing =
            isThumbAutoplayOn(instance);

        button.classList.toggle(
            'is-playing',
            playing
        );

        button.setAttribute(
            'aria-pressed',
            playing ? 'true' : 'false'
        );

        button.setAttribute(
            'aria-label',
            playing
                ? 'Pause slideshow'
                : 'Play slideshow'
        );

        button.title =
            playing
                ? 'Pause slideshow'
                : 'Play slideshow';
    }

    /*
     * Play / pause button shown at the right end of the "card"
     * thumbnail bar. It lives inside the thumbnail <ol> (sticky, so it
     * stays put while thumbnails scroll) which keeps the DOM and the
     * theme-independent layout rules untouched.
     */
    function ensureThumbPlayButton(instance, list) {

        var old =
            qsa(
                instance.gallery,
                '.pgs-thumb-play-wrap'
            );

        old.forEach(
            function (node) {
                node.remove();
            }
        );

        var enabled =
            normalizeString(
                instance.settings.thumb_style,
                'card'
            ) !== 'classic' &&
            (
                instance.settings.thumb_play_button ===
                undefined ||
                isEnabled(
                    instance.settings.thumb_play_button
                )
            ) &&
            getSlides(instance).length > 1;

        instance.gallery.classList.toggle(
            'pgs-thumb-has-play',
            enabled
        );

        if (
            !enabled ||
            !list
        ) {
            return;
        }

        var wrap =
            document.createElement('div');

        wrap.className =
            'pgs-thumb-play-wrap';

        var button =
            document.createElement('button');

        button.type = 'button';

        button.className =
            'pgs-thumb-play';

        button.innerHTML =
            '<svg class="pgs-thumb-play-icon" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M8 5v14l11-7z"></path>' +
            '</svg>' +
            '<svg class="pgs-thumb-pause-icon" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>' +
            '</svg>';

        button.addEventListener(
            'click',
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                var next =
                    !isThumbAutoplayOn(instance);

                instance.userAutoplay =
                    next;

                if (next) {

                    instance.autoplayHoverPaused =
                        false;

                    scheduleAutoplay(instance);

                } else {

                    stopAutoplay(instance);
                }

                updateThumbPlayButton(instance);
            }
        );

        wrap.appendChild(button);
        list.appendChild(wrap);

        updateThumbPlayButton(instance);
    }

    function createDots(instance) {

        var dots =
            qs(
                instance.gallery,
                '.pgs-dots'
            );

        if (!dots) {

            dots =
                document.createElement(
                    'div'
                );

            dots.className =
                'pgs-dots';

            dots.setAttribute(
                'role',
                'tablist'
            );

            instance.gallery.appendChild(
                dots
            );
        }

        dots.innerHTML =
            '';

        var slides =
            getSlides(instance);

        slides.forEach(
            function (_, index) {

                var button =
                    document.createElement(
                        'button'
                    );

                button.type =
                    'button';

                button.setAttribute(
                    'role',
                    'tab'
                );

                button.setAttribute(
                    'aria-label',
                    'Go to slide ' +
                    (index + 1)
                );

                button.addEventListener(
                    'click',
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();

                        goToSlide(
                            instance,
                            index,
                            false
                        );
                    }
                );

                dots.appendChild(
                    button
                );
            }
        );

        updateDots(instance);
    }

    function ensureArrows(instance) {

        var nav =
            qs(
                instance.gallery,
                '.pgs-custom-nav'
            );

        if (!nav) {

            nav =
                createElement(
                    '<div class="pgs-custom-nav" aria-hidden="false">' +
                    '<button type="button" class="pgs-arrow pgs-arrow-prev" aria-label="Previous image"></button>' +
                    '<button type="button" class="pgs-arrow pgs-arrow-next" aria-label="Next image"></button>' +
                    '</div>'
                );

            instance.gallery.appendChild(
                nav
            );
        }

        var previous =
            qs(
                nav,
                '.pgs-arrow-prev'
            );

        var next =
            qs(
                nav,
                '.pgs-arrow-next'
            );

        if (previous) {

            previous.onclick =
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    goToSlide(
                        instance,
                        instance.slideIndex - 1,
                        false
                    );
                };
        }

        if (next) {

            next.onclick =
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    goToSlide(
                        instance,
                        instance.slideIndex + 1,
                        false
                    );
                };
        }

        return nav;
    }

    function destroyZoom(instance) {

        if (instance.zoomFrame) {

            window.cancelAnimationFrame(
                instance.zoomFrame
            );

            instance.zoomFrame =
                null;
        }

        if (instance.zoomBindings) {

            instance.zoomBindings.forEach(
                function (binding) {

                    if (
                        binding.element &&
                        binding.enter
                    ) {
                        binding.element.removeEventListener(
                            'mouseenter',
                            binding.enter
                        );
                    }

                    if (
                        binding.element &&
                        binding.move
                    ) {
                        binding.element.removeEventListener(
                            'mousemove',
                            binding.move
                        );
                    }

                    if (
                        binding.element &&
                        binding.leave
                    ) {
                        binding.element.removeEventListener(
                            'mouseleave',
                            binding.leave
                        );
                    }
                }
            );
        }

        instance.zoomBindings = [];

        if (instance.zoomWindow) {

            instance.zoomWindow.remove();

            instance.zoomWindow =
                null;
        }

        if (instance.zoomLens) {

            instance.zoomLens.remove();

            instance.zoomLens =
                null;
        }

        if (instance.zoomInside) {

            instance.zoomInside.remove();

            instance.zoomInside =
                null;
        }

        qsa(
            instance.gallery,
            '.woocommerce-product-gallery__image'
        ).forEach(
            function (slide) {

                slide.classList.remove(
                    'pgs-zoom-active'
                );
            }
        );

        qsa(
            instance.gallery,
            '.woocommerce-product-gallery__image a'
        ).forEach(
            function (anchor) {

                anchor.classList.remove(
                    'pgs-zoom-source'
                );
            }
        );

        qsa(
            instance.gallery,
            '.woocommerce-product-gallery__image img'
        ).forEach(
            function (image) {

                image.style.removeProperty(
                    'transform'
                );

                image.style.removeProperty(
                    'transform-origin'
                );

                image.style.removeProperty(
                    'transition'
                );

                image.style.removeProperty(
                    'cursor'
                );
            }
        );

        instance.zoomState =
            null;
    }

    function normalizeZoomType(value) {

        var type =
            normalizeString(
                value,
                'inside'
            );

        if (
            type === 'inside-zoom' ||
            type === 'insidezoom'
        ) {
            return 'inside';
        }

        if (
            type === 'window-zoom' ||
            type === 'windowzoom'
        ) {
            return 'window';
        }

        if (
            type === 'lens-magnifier' ||
            type === 'lens-magnifier-zoom' ||
            type === 'magnifier'
        ) {
            return 'lens';
        }

        if (
            type === 'cursor-follow' ||
            type === 'cursorfollow' ||
            type === 'cursor-follow-zoom'
        ) {
            return 'follow';
        }

        if (type === 'disabled') {
            return 'disabled';
        }

        if (
            type === 'lightbox' ||
            type === 'lightbox-legacy'
        ) {
            return 'lightbox';
        }

        return type;
    }

    function getZoomSource(image) {

        var source = '';

        source =
            image.getAttribute(
                'data-large_image'
            ) ||
            image.getAttribute(
                'data-large-image'
            ) ||
            '';

        if (!source) {

            var anchor =
                image.closest('a');

            if (anchor) {

                source =
                    anchor.getAttribute(
                        'href'
                    ) || '';
            }
        }

        if (!source) {

            source =
                image.getAttribute(
                    'data-src'
                ) ||
                image.currentSrc ||
                image.getAttribute(
                    'src'
                ) ||
                '';
        }

        return source;
    }

    function getRenderedImageRect(
        image
    ) {

        var box =
            image.getBoundingClientRect();

        var naturalWidth =
            image.naturalWidth;

        var naturalHeight =
            image.naturalHeight;

        if (
            !naturalWidth ||
            !naturalHeight
        ) {

            return {
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                right: box.right,
                bottom: box.bottom
            };
        }

        var boxRatio =
            box.width /
            box.height;

        var imageRatio =
            naturalWidth /
            naturalHeight;

        var width;
        var height;
        var left;
        var top;

        if (
            imageRatio >
            boxRatio
        ) {

            width =
                box.width;

            height =
                width /
                imageRatio;

            left =
                box.left;

            top =
                box.top +
                (
                    box.height -
                    height
                ) / 2;

        } else {

            height =
                box.height;

            width =
                height *
                imageRatio;

            left =
                box.left +
                (
                    box.width -
                    width
                ) / 2;

            top =
                box.top;
        }

        return {
            left: left,
            top: top,
            width: width,
            height: height,
            right:
                left + width,
            bottom:
                top + height
        };
    }

    function getZoomPoint(
        event,
        image
    ) {

        var rect =
            getRenderedImageRect(
                image
            );

        if (
            !rect.width ||
            !rect.height
        ) {

            return {
                x: 0.5,
                y: 0.5,
                rect: rect
            };
        }

        var x =
            (
                event.clientX -
                rect.left
            ) /
            rect.width;

        var y =
            (
                event.clientY -
                rect.top
            ) /
            rect.height;

        return {
            x:
                clamp(
                    x,
                    0,
                    1
                ),
            y:
                clamp(
                    y,
                    0,
                    1
                ),
            rect:
                rect
        };
    }

    function getZoomBackgroundSize(
        image,
        zoom
    ) {

        var naturalWidth =
            image.naturalWidth ||
            image.clientWidth ||
            1;

        var naturalHeight =
            image.naturalHeight ||
            image.clientHeight ||
            1;

        return {
            width:
                naturalWidth *
                zoom,

            height:
                naturalHeight *
                zoom
        };
    }

    function setZoomBackground(
        element,
        source,
        image,
        zoom
    ) {

        var size =
            getZoomBackgroundSize(
                image,
                zoom
            );

        element.style.backgroundImage =
            'url("' +
            source.replace(
                /"/g,
                '\\"'
            ) +
            '")';

        element.style.backgroundRepeat =
            'no-repeat';

        element.style.backgroundSize =
            size.width +
            'px ' +
            size.height +
            'px';

        element.style.backgroundPosition =
            'center center';
    }

    function updateZoomBackground(
        element,
        event,
        image,
        zoom
    ) {

        if (!element) {
            return;
        }

        var point =
            getZoomPoint(
                event,
                image
            );

        var bg =
            getZoomBackgroundSize(
                image,
                zoom
            );

        var elementWidth =
            element.offsetWidth;

        var elementHeight =
            element.offsetHeight;

        var overflowX =
            Math.max(
                0,
                bg.width -
                elementWidth
            );

        var overflowY =
            Math.max(
                0,
                bg.height -
                elementHeight
            );

        var backgroundX =
            -(
                overflowX *
                point.x
            );

        var backgroundY =
            -(
                overflowY *
                point.y
            );

        element.style.backgroundPosition =
            backgroundX +
            'px ' +
            backgroundY +
            'px';
    }

    function positionZoomWindow(
        zoomWindow,
        image,
        settings
    ) {

        if (!zoomWindow) {
            return;
        }

        var imageRect =
            image.getBoundingClientRect();

        var windowWidth =
            zoomWindow.offsetWidth;

        var windowHeight =
            zoomWindow.offsetHeight;

        var gap =
            Math.max(
                0,
                number(
                    settings.zoom_window_gap,
                    15
                )
            );

        var viewportWidth =
            window.innerWidth;

        var viewportHeight =
            window.innerHeight;

        var position =
            normalizeString(
                settings.zoom_window_position,
                'right'
            );

        var left;
        var top;

        if (position === 'right') {

            left =
                imageRect.right +
                gap;

            top =
                imageRect.top +
                (
                    imageRect.height -
                    windowHeight
                ) / 2;

            if (
                left + windowWidth >
                viewportWidth - 10
            ) {

                left =
                    imageRect.left -
                    windowWidth -
                    gap;
            }

        } else if (
            position === 'left'
        ) {

            left =
                imageRect.left -
                windowWidth -
                gap;

            top =
                imageRect.top +
                (
                    imageRect.height -
                    windowHeight
                ) / 2;

            if (left < 10) {

                left =
                    imageRect.right +
                    gap;
            }

        } else if (
            position === 'top'
        ) {

            left =
                imageRect.left +
                (
                    imageRect.width -
                    windowWidth
                ) / 2;

            top =
                imageRect.top -
                windowHeight -
                gap;

            if (top < 10) {

                top =
                    imageRect.bottom +
                    gap;
            }

        } else if (
            position === 'bottom'
        ) {

            left =
                imageRect.left +
                (
                    imageRect.width -
                    windowWidth
                ) / 2;

            top =
                imageRect.bottom +
                gap;

            if (
                top + windowHeight >
                viewportHeight - 10
            ) {

                top =
                    imageRect.top -
                    windowHeight -
                    gap;
            }

        } else {

            left =
                imageRect.left;

            top =
                imageRect.top;
        }

        left =
            clamp(
                left,
                10,
                Math.max(
                    10,
                    viewportWidth -
                    windowWidth -
                    10
                )
            );

        top =
            clamp(
                top,
                10,
                Math.max(
                    10,
                    viewportHeight -
                    windowHeight -
                    10
                )
            );

        zoomWindow.style.left =
            Math.round(left) +
            'px';

        zoomWindow.style.top =
            Math.round(top) +
            'px';
    }

    function createZoomWindow(
        instance,
        image,
        source,
        zoom,
        transition
    ) {

        var settings =
            instance.settings;

        var requestedWidth =
            Math.max(
                150,
                number(
                    settings.zoom_window_width,
                    420
                )
            );

        var requestedHeight =
            Math.max(
                150,
                number(
                    settings.zoom_window_height,
                    420
                )
            );

        var maxWidth =
            Math.max(
                150,
                window.innerWidth - 20
            );

        var maxHeight =
            Math.max(
                150,
                window.innerHeight - 20
            );

        var width =
            Math.min(
                requestedWidth,
                maxWidth
            );

        var height =
            Math.min(
                requestedHeight,
                maxHeight
            );

        var zoomWindow =
            document.createElement(
                'div'
            );

        zoomWindow.className =
            'pgs-zoom-window';

        zoomWindow.setAttribute(
            'aria-hidden',
            'true'
        );

        zoomWindow.style.position =
            'fixed';

        zoomWindow.style.zIndex =
            '999999';

        zoomWindow.style.pointerEvents =
            'none';

        zoomWindow.style.width =
            width + 'px';

        zoomWindow.style.height =
            height + 'px';

        zoomWindow.style.boxSizing =
            'border-box';

        zoomWindow.style.overflow =
            'hidden';

        zoomWindow.style.backgroundColor =
            settings.zoom_window_background ||
            '#ffffff';

        zoomWindow.style.backgroundRepeat =
            'no-repeat';

        zoomWindow.style.borderStyle =
            'solid';

        zoomWindow.style.borderWidth =
            Math.max(
                0,
                number(
                    settings.zoom_window_border_width,
                    1
                )
            ) + 'px';

        zoomWindow.style.borderColor =
            settings.zoom_window_border_color ||
            '#dddddd';

        zoomWindow.style.boxShadow =
            settings.zoom_window_shadow ||
            '0 8px 30px rgba(0,0,0,0.15)';

        zoomWindow.style.opacity =
            '0';

        zoomWindow.style.visibility =
            'hidden';

        zoomWindow.style.transition =
            'opacity ' +
            transition +
            'ms ease';

        setZoomBackground(
            zoomWindow,
            source,
            image,
            zoom
        );

        document.body.appendChild(
            zoomWindow
        );

        positionZoomWindow(
            zoomWindow,
            image,
            settings
        );

        window.requestAnimationFrame(
            function () {

                if (
                    zoomWindow &&
                    zoomWindow.isConnected
                ) {

                    zoomWindow.style.opacity =
                        '1';

                    zoomWindow.style.visibility =
                        'visible';
                }
            }
        );

        return zoomWindow;
    }

    function createZoomLens(
        instance,
        image,
        source,
        zoom,
        transition
    ) {

        var settings =
            instance.settings;

        var width =
            Math.max(
                40,
                number(
                    settings.zoom_lens_width,
                    120
                )
            );

        var height =
            Math.max(
                40,
                number(
                    settings.zoom_lens_height,
                    120
                )
            );

        var borderWidth =
            Math.max(
                0,
                number(
                    settings.zoom_lens_border_width,
                    1
                )
            );

        var lens =
            document.createElement(
                'div'
            );

        lens.className =
            'pgs-zoom-lens';

        lens.setAttribute(
            'aria-hidden',
            'true'
        );

        lens.style.position =
            'fixed';

        lens.style.left =
            '0';

        lens.style.top =
            '0';

        lens.style.width =
            width + 'px';

        lens.style.height =
            height + 'px';

        lens.style.boxSizing =
            'border-box';

        lens.style.pointerEvents =
            'none';

        lens.style.zIndex =
            '999999';

        lens.style.overflow =
            'hidden';

        lens.style.backgroundColor =
            settings.zoom_lens_background ||
            'rgba(255,255,255,0.15)';

        lens.style.borderStyle =
            'solid';

        lens.style.borderWidth =
            borderWidth + 'px';

        lens.style.borderColor =
            settings.zoom_lens_border_color ||
            '#ffffff';

        lens.style.backgroundRepeat =
            'no-repeat';

        lens.style.boxShadow =
            settings.zoom_lens_shadow ||
            '0 4px 20px rgba(0,0,0,0.15)';

        lens.style.opacity =
            '0';

        lens.style.transition =
            'opacity ' +
            transition +
            'ms ease';

        setZoomBackground(
            lens,
            source,
            image,
            zoom
        );

        var shape =
            normalizeString(
                settings.zoom_lens_shape,
                'square'
            );

        if (shape === 'circle') {

            lens.style.borderRadius =
                '50%';
        }

        document.body.appendChild(
            lens
        );

        window.requestAnimationFrame(
            function () {

                if (
                    lens &&
                    lens.isConnected
                ) {

                    lens.style.opacity =
                        '1';
                }
            }
        );

        return lens;
    }

    function updateZoomLens(
        lens,
        event,
        image,
        zoom
    ) {

        if (!lens) {
            return;
        }

        var imageRect =
            getRenderedImageRect(
                image
            );

        var lensWidth =
            lens.offsetWidth;

        var lensHeight =
            lens.offsetHeight;

        var left =
            event.clientX -
            lensWidth / 2;

        var top =
            event.clientY -
            lensHeight / 2;

        left =
            clamp(
                left,
                imageRect.left,
                imageRect.right -
                lensWidth
            );

        top =
            clamp(
                top,
                imageRect.top,
                imageRect.bottom -
                lensHeight
            );

        lens.style.transform =
            'translate3d(' +
            Math.round(left) +
            'px, ' +
            Math.round(top) +
            'px, 0)';

        updateZoomBackground(
            lens,
            event,
            image,
            zoom
        );
    }

    function createInsideZoom(
        instance,
        image,
        source,
        zoom,
        transition
    ) {

        var inside =
            document.createElement(
                'div'
            );

        inside.className =
            'pgs-zoom-inside-layer';

        inside.setAttribute(
            'aria-hidden',
            'true'
        );

        var rect =
            image.getBoundingClientRect();

        inside.style.position =
            'fixed';

        inside.style.left =
            rect.left + 'px';

        inside.style.top =
            rect.top + 'px';

        inside.style.width =
            rect.width + 'px';

        inside.style.height =
            rect.height + 'px';

        inside.style.zIndex =
            '5';

        inside.style.pointerEvents =
            'none';

        inside.style.overflow =
            'hidden';

        inside.style.backgroundRepeat =
            'no-repeat';

        inside.style.backgroundColor =
            '#ffffff';

        inside.style.opacity =
            '0';

        inside.style.transition =
            'opacity ' +
            transition +
            'ms ease';

        setZoomBackground(
            inside,
            source,
            image,
            zoom
        );

        image.style.opacity =
            '0';

        document.body.appendChild(
            inside
        );

        window.requestAnimationFrame(
            function () {

                if (
                    inside &&
                    inside.isConnected
                ) {

                    inside.style.opacity =
                        '1';
                }
            }
        );

        return inside;
    }

    function updateInsideZoom(
        inside,
        event,
        image,
        zoom
    ) {

        if (!inside) {
            return;
        }

        var rect =
            image.getBoundingClientRect();

        inside.style.left =
            rect.left + 'px';

        inside.style.top =
            rect.top + 'px';

        inside.style.width =
            rect.width + 'px';

        inside.style.height =
            rect.height + 'px';

        updateZoomBackground(
            inside,
            event,
            image,
            zoom
        );
    }

    function setupZoom(instance) {

        destroyZoom(instance);

        var type =
            normalizeZoomType(
                instance.settings.zoom_style
            );

        if (
            type === 'disabled' ||
            type === 'lightbox'
        ) {
            return;
        }

        if (
            window.matchMedia &&
            window.matchMedia(
                '(hover: none)'
            ).matches
        ) {
            return;
        }

        var zoom =
            Math.max(
                1.1,
                number(
                    instance.settings.zoom_level,
                    2
                )
            );

        var transition =
            Math.max(
                0,
                integer(
                    instance.settings.zoom_transition,
                    150
                )
            );

        var delay =
            Math.max(
                0,
                integer(
                    instance.settings.zoom_hover_delay,
                    0
                )
            );

        var activeSlide =
            qs(
                instance.gallery,
                '.woocommerce-product-gallery__image.pgs-active-slide'
            );

        if (!activeSlide) {
            return;
        }

        var image =
            qs(
                activeSlide,
                'img'
            );

        if (!image) {
            return;
        }

        var anchor =
            image.closest('a') ||
            image.parentElement;

        if (!anchor) {
            return;
        }

        var source =
            getZoomSource(
                image
            );

        if (!source) {
            return;
        }

        var state = {

            active: false,

            enterTimer: null,

            lastEvent: null,

            window: null,

            lens: null,

            inside: null
        };

        instance.zoomState =
            state;

        function clearTimer() {

            if (
                state.enterTimer
            ) {

                window.clearTimeout(
                    state.enterTimer
                );

                state.enterTimer =
                    null;
            }
        }

        function move(event) {

            if (
                !state.active
            ) {
                return;
            }

            state.lastEvent =
                event;

            if (
                instance.zoomFrame
            ) {
                return;
            }

            instance.zoomFrame =
                window.requestAnimationFrame(
                    function () {

                        instance.zoomFrame =
                            null;

                        if (
                            !state.active ||
                            !state.lastEvent
                        ) {
                            return;
                        }

                        var currentEvent =
                            state.lastEvent;

                        if (
                            state.window
                        ) {

                            updateZoomBackground(
                                state.window,
                                currentEvent,
                                image,
                                zoom
                            );
                        }

                        if (
                            state.lens
                        ) {

                            updateZoomLens(
                                state.lens,
                                currentEvent,
                                image,
                                zoom
                            );
                        }

                        if (
                            state.inside
                        ) {

                            updateInsideZoom(
                                state.inside,
                                currentEvent,
                                image,
                                zoom
                            );
                        }
                    }
                );
        }

        function activate(event) {

            if (
                state.active
            ) {
                return;
            }

            state.active =
                true;

            state.lastEvent =
                event;

            activeSlide.classList.add(
                'pgs-zoom-active'
            );

            anchor.classList.add(
                'pgs-zoom-source'
            );

            if (
                type === 'window'
            ) {

                state.window =
                    createZoomWindow(
                        instance,
                        image,
                        source,
                        zoom,
                        transition
                    );

                positionZoomWindow(
                    state.window,
                    image,
                    instance.settings
                );
            }

            if (
                type === 'lens' ||
                type === 'follow'
            ) {

                state.lens =
                    createZoomLens(
                        instance,
                        image,
                        source,
                        zoom,
                        transition
                    );
            }

            if (
                type === 'inside'
            ) {

                state.inside =
                    createInsideZoom(
                        instance,
                        image,
                        source,
                        zoom,
                        transition
                    );
            }

            if (event) {
                move(event);
            }
        }

        function deactivate() {

            clearTimer();

            state.active =
                false;

            state.lastEvent =
                null;

            activeSlide.classList.remove(
                'pgs-zoom-active'
            );

            anchor.classList.remove(
                'pgs-zoom-source'
            );

            if (
                instance.zoomFrame
            ) {

                window.cancelAnimationFrame(
                    instance.zoomFrame
                );

                instance.zoomFrame =
                    null;
            }

            if (
                state.window
            ) {

                state.window.remove();

                state.window =
                    null;
            }

            if (
                state.lens
            ) {

                state.lens.remove();

                state.lens =
                    null;
            }

            if (
                state.inside
            ) {

                state.inside.remove();

                state.inside =
                    null;
            }

            image.style.opacity =
                '';
        }

        function mouseEnter(event) {

            clearTimer();

            if (
                delay > 0
            ) {

                state.enterTimer =
                    window.setTimeout(
                        function () {

                            activate(
                                event
                            );

                            move(
                                event
                            );
                        },
                        delay
                    );

            } else {

                activate(
                    event
                );

                move(
                    event
                );
            }
        }

        function mouseMove(event) {

            if (
                !state.active
            ) {

                activate(
                    event
                );
            }

            move(
                event
            );
        }

        function mouseLeave() {

            deactivate();
        }

        anchor.addEventListener(
            'mouseenter',
            mouseEnter
        );

        anchor.addEventListener(
            'mousemove',
            mouseMove
        );

        anchor.addEventListener(
            'mouseleave',
            mouseLeave
        );

        instance.zoomBindings.push({

            element: anchor,

            enter: mouseEnter,

            move: mouseMove,

            leave: mouseLeave
        });

        instance.zoomPositionHandler =
            function () {

                if (
                    !state.active ||
                    !state.window
                ) {
                    return;
                }

                positionZoomWindow(
                    state.window,
                    image,
                    instance.settings
                );
            };

        window.addEventListener(
            'resize',
            instance.zoomPositionHandler,
            {
                passive: true
            }
        );

        window.addEventListener(
            'scroll',
            instance.zoomPositionHandler,
            {
                passive: true
            }
        );

        instance.zoomBindings.push({

            element: window,

            enter: null,

            move: null,

            leave: null,

            position:
                instance.zoomPositionHandler
        });
    }

    function setupSwipe(instance) {

        var viewport =
            getViewport(instance) ||
            getWrapper(instance);

        if (!viewport) {
            return;
        }

        if (
            instance.swipeStart
        ) {

            viewport.removeEventListener(
                'touchstart',
                instance.swipeStart
            );
        }

        if (
            instance.swipeEnd
        ) {

            viewport.removeEventListener(
                'touchend',
                instance.swipeEnd
            );
        }

        instance.swipeStart =
            null;

        instance.swipeEnd =
            null;

        if (
            !isEnabled(
                instance.settings.touch_swipe
            )
        ) {
            return;
        }

        instance.swipeStart =
            function (event) {

                if (
                    !event.touches ||
                    !event.touches.length
                ) {
                    return;
                }

                instance.touchStartX =
                    event.touches[0]
                        .clientX;
            };

        instance.swipeEnd =
            function (event) {

                if (
                    instance.touchStartX ===
                    null
                ) {
                    return;
                }

                if (
                    !event.changedTouches ||
                    !event.changedTouches.length
                ) {
                    return;
                }

                var endX =
                    event.changedTouches[0]
                        .clientX;

                var difference =
                    endX -
                    instance.touchStartX;

                instance.touchStartX =
                    null;

                if (
                    Math.abs(difference) <
                    40
                ) {
                    return;
                }

                goToSlide(
                    instance,
                    difference > 0
                        ? instance.slideIndex - 1
                        : instance.slideIndex + 1,
                    false
                );
            };

        viewport.addEventListener(
            'touchstart',
            instance.swipeStart,
            {
                passive: true
            }
        );

        viewport.addEventListener(
            'touchend',
            instance.swipeEnd,
            {
                passive: true
            }
        );
    }

    function getFancyboxImageSources(
        image,
        slide
    ) {

        var full = '';
        var thumb = '';

        if (image) {

            full =
                image.getAttribute(
                    'data-large_image'
                ) ||
                image.getAttribute(
                    'data-large-image'
                ) ||
                '';

            thumb =
                image.getAttribute(
                    'data-thumb'
                ) ||
                image.getAttribute(
                    'data-src'
                ) ||
                image.currentSrc ||
                image.getAttribute(
                    'src'
                ) ||
                '';
        }

        if (
            !full &&
            slide
        ) {

            var anchor =
                slide.querySelector(
                    'a[href]'
                );

            if (anchor) {

                full =
                    anchor.getAttribute(
                        'href'
                    ) || '';
            }
        }

        if (!full) {

            full =
                thumb || '';
        }

        if (
            full &&
            /-\d+x\d+(?=\.[a-z0-9]+(?:\?.*)?$)/i
                .test(full)
        ) {

            full =
                full.replace(
                    /-\d+x\d+(?=\.[a-z0-9]+(?:\?.*)?$)/i,
                    ''
                );
        }

        return {
            src: full,
            thumb:
                thumb ||
                full
        };
    }

    function buildProfessionalFancyboxThumbs(
        fancybox,
        items,
        visibleThumbnails
    ) {
        if (
            !fancybox ||
            !fancybox.container ||
            !items ||
            !items.length
        ) {
            return;
        }

        var container = fancybox.container;

        var visibleCount =
            Math.max(
                1,
                integer(
                    visibleThumbnails,
                    4
                )
            );

        var oldBar = container.querySelector(
            '.pgs-fancybox-topbar'
        );

        if (oldBar) {
            oldBar.remove();
        }

        var topbar = document.createElement('div');

        topbar.className =
            'pgs-fancybox-topbar';

        topbar.style.setProperty(
            '--pgs-fb-visible-thumbnails',
            String(visibleCount)
        );

        topbar.setAttribute(
            'role',
            'navigation'
        );

        topbar.setAttribute(
            'aria-label',
            'Product image navigation'
        );

        /*
         * Thumbnail viewport.
         */
        var trackWrap = document.createElement('div');

        trackWrap.className =
            'pgs-fancybox-topbar-thumbs';

        /*
         * Thumbnail track.
         */
        var track = document.createElement('div');

        track.className =
            'pgs-fancybox-topbar-track';

        trackWrap.appendChild(track);

        topbar.appendChild(trackWrap);


        items.forEach(
            function (item, index) {

                var button =
                    document.createElement('button');

                button.type = 'button';

                button.className =
                    'pgs-fancybox-top-thumb';

                button.setAttribute(
                    'data-pgs-index',
                    index
                );

                button.setAttribute(
                    'aria-label',
                    'View product image ' +
                    (index + 1)
                );

                button.setAttribute(
                    'aria-current',
                    index === 0
                        ? 'true'
                        : 'false'
                );

                var image =
                    document.createElement('img');

                image.src =
                    item.thumbSrc ||
                    item.src ||
                    '';

                image.alt =
                    item.caption ||
                    'Product image ' +
                    (index + 1);

                image.draggable = false;

                button.appendChild(image);

                button.addEventListener(
                    'click',
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();

                        if (
                            typeof fancybox.jumpTo ===
                            'function'
                        ) {
                            fancybox.jumpTo(index);
                        }

                        updateProfessionalFancyboxThumb(
                            topbar,
                            index
                        );
                    }
                );

                track.appendChild(button);
            }
        );

        /*
         * Insert the custom topbar BEFORE Fancybox carousel.
         */
        var carousel =
            container.querySelector(
                '.fancybox__carousel'
            );

        if (carousel) {

            container.insertBefore(
                topbar,
                carousel
            );

        } else {

            container.appendChild(
                topbar
            );
        }

        /*
         * Initial active thumbnail.
         */
        var current =
            typeof fancybox.getSlide ===
                'function'
                ? fancybox.getSlide()
                : null;

        updateProfessionalFancyboxThumb(
            topbar,
            current &&
                typeof current.index === 'number'
                ? current.index
                : 0
        );
    }

    function updateProfessionalFancyboxThumb(
        strip,
        activeIndex
    ) {
        if (!strip) {
            return;
        }

        var buttons = qsa(
            strip,
            '.pgs-fancybox-top-thumb'
        );

        buttons.forEach(
            function (button, index) {

                var active =
                    index === activeIndex;

                button.classList.toggle(
                    'is-active',
                    active
                );

                button.setAttribute(
                    'aria-current',
                    active
                        ? 'true'
                        : 'false'
                );
            }
        );

        var activeButton =
            buttons[activeIndex];

        if (activeButton) {

            var parent =
                activeButton.parentElement;

            if (parent) {

                var left =
                    activeButton.offsetLeft;

                var right =
                    left +
                    activeButton.offsetWidth;

                var viewLeft =
                    parent.scrollLeft;

                var viewRight =
                    viewLeft +
                    parent.clientWidth;

                if (left < viewLeft) {

                    parent.scrollTo({
                        left: left - 10,
                        behavior: 'smooth'
                    });

                } else if (
                    right > viewRight
                ) {

                    parent.scrollTo({
                        left:
                            right -
                            parent.clientWidth +
                            10,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }

    function stopProfessionalSlideshow(
        fancybox
    ) {

        if (!fancybox) {
            return;
        }

        if (
            fancybox.pgsSlideshowTimer
        ) {

            window.clearInterval(
                fancybox.pgsSlideshowTimer
            );

            fancybox.pgsSlideshowTimer =
                null;
        }

        fancybox.pgsSlideshowPlaying =
            false;

        updateProfessionalSlideshowButton(
            fancybox,
            false
        );
    }

    function startProfessionalSlideshow(
        fancybox
    ) {

        if (!fancybox) {
            return;
        }

        stopProfessionalSlideshow(
            fancybox
        );

        fancybox.pgsSlideshowPlaying =
            true;

        updateProfessionalSlideshowButton(
            fancybox,
            true
        );

        fancybox.pgsSlideshowTimer =
            window.setInterval(
                function () {

                    if (
                        !fancybox ||
                        (typeof fancybox.isClosing === 'function' &&
                            fancybox.isClosing())
                    ) {

                        stopProfessionalSlideshow(
                            fancybox
                        );

                        return;
                    }

                    var current =
                        typeof fancybox.getSlide === 'function'
                            ? fancybox.getSlide()
                            : null;

                    var total =
                        Array.isArray(fancybox.userSlides)
                            ? fancybox.userSlides.length
                            : 0;

                    var looping =
                        fancybox.options &&
                        fancybox.options.Carousel &&
                        fancybox.options.Carousel.infinite !== false;

                    if (!looping && current && current.index >= total - 1) {
                        stopProfessionalSlideshow(fancybox);
                        return;
                    }

                    if (
                        typeof fancybox.next ===
                        'function'
                    ) {

                        fancybox.next();

                        return;
                    }

                    if (
                        fancybox.carousel &&
                        typeof fancybox
                            .carousel
                            .slideNext ===
                        'function'
                    ) {

                        fancybox.carousel
                            .slideNext();
                    }

                },
                3000
            );
    }

    function toggleProfessionalSlideshow(
        fancybox
    ) {

        if (!fancybox) {
            return;
        }

        if (
            fancybox.pgsSlideshowPlaying
        ) {

            stopProfessionalSlideshow(
                fancybox
            );

        } else {

            startProfessionalSlideshow(
                fancybox
            );
        }
    }

    function updateProfessionalSlideshowButton(
        fancybox,
        playing
    ) {
        if (
            !fancybox ||
            !fancybox.container
        ) {
            return;
        }

        var button =
            fancybox.container.querySelector(
                '.pgs-fancybox-slideshow-toggle'
            );

        if (!button) {
            return;
        }

        button.setAttribute(
            'aria-pressed',
            playing
                ? 'true'
                : 'false'
        );

        button.setAttribute(
            'aria-label',
            playing
                ? 'Pause slideshow'
                : 'Play slideshow'
        );

        button.title =
            playing
                ? 'Pause slideshow'
                : 'Play slideshow';

        button.classList.toggle(
            'is-playing',
            playing
        );
    }
    function buildProfessionalSlideshowButton(
        fancybox
    ) {
        if (
            !fancybox ||
            !fancybox.container
        ) {
            return;
        }

        var container =
            fancybox.container;

        /*
         * Remove old button.
         */
        var oldButton =
            container.querySelector(
                '.pgs-fancybox-slideshow-toggle'
            );

        if (oldButton) {
            oldButton.remove();
        }

        /*
         * Find our topbar.
         */
        var topbar =
            container.querySelector(
                '.pgs-fancybox-topbar'
            );

        if (!topbar) {
            return;
        }

        /*
         * Right side controls.
         */
        var controls =
            document.createElement('div');

        controls.className =
            'pgs-fancybox-topbar-controls';

        /*
         * Play / Pause.
         */
        var button =
            document.createElement('button');

        button.type = 'button';

        button.className =
            'pgs-fancybox-slideshow-toggle';

        button.setAttribute(
            'aria-label',
            'Play slideshow'
        );

        button.setAttribute(
            'aria-pressed',
            'false'
        );

        button.title =
            'Play slideshow';

        button.innerHTML =
            '<svg class="pgs-play-icon" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M8 5v14l11-7z"></path>' +
            '</svg>' +

            '<svg class="pgs-pause-icon" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>' +
            '</svg>';

        button.addEventListener(
            'click',
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                toggleProfessionalSlideshow(
                    fancybox
                );
            }
        );

        controls.appendChild(button);

        /*
         * Add controls to top-right.
         */
        topbar.appendChild(
            controls
        );

        updateProfessionalSlideshowButton(
            fancybox,
            false
        );
    }
    function setupFancyboxHoverPause(fancybox) {

        if (
            !fancybox ||
            !fancybox.container
        ) {
            return;
        }

        var container = fancybox.container;

        if (fancybox.pgsHoverOverHandler) {
            container.removeEventListener(
                'mouseover',
                fancybox.pgsHoverOverHandler
            );
        }

        if (fancybox.pgsHoverOutHandler) {
            container.removeEventListener(
                'mouseout',
                fancybox.pgsHoverOutHandler
            );
        }

        fancybox.pgsHoverOverHandler = function (event) {

            var target = event.target;

            if (!target || !target.closest) {
                return;
            }

            var image = target.closest('.fancybox__image');

            if (!image || !container.contains(image)) {
                return;
            }

            /* Ignore mouse movement between children of the same image. */
            if (
                event.relatedTarget &&
                image.contains(event.relatedTarget)
            ) {
                return;
            }

            fancybox.pgsHoverPauseWasPlaying = !!fancybox.pgsSlideshowPlaying;

            if (fancybox.pgsHoverPauseWasPlaying) {
                stopProfessionalSlideshow(fancybox);
            }
        };

        fancybox.pgsHoverOutHandler = function (event) {

            var image = event.target && event.target.closest
                ? event.target.closest('.fancybox__image')
                : null;

            if (!image || !container.contains(image)) {
                return;
            }

            /* Only resume when the pointer actually leaves the image. */
            if (
                event.relatedTarget &&
                image.contains(event.relatedTarget)
            ) {
                return;
            }

            if (fancybox.pgsHoverPauseWasPlaying) {
                fancybox.pgsHoverPauseWasPlaying = false;
                startProfessionalSlideshow(fancybox);
            }
        };

        /* mouseover/mouseout bubble, so this also works after slide changes. */
        container.addEventListener(
            'mouseover',
            fancybox.pgsHoverOverHandler
        );

        container.addEventListener(
            'mouseout',
            fancybox.pgsHoverOutHandler
        );
    }

    function openFancybox(
        instance,
        startIndex
    ) {

        var Fancybox =
            window.PGS_Fancybox ||
            window.Fancybox;

        if (
            !Fancybox ||
            typeof Fancybox.show !==
            'function'
        ) {
            return;
        }

        var slides =
            getSlides(instance);

        if (!slides.length) {
            return;
        }

        var items = [];
        var originalIndexes = [];

        slides.forEach(
            function (
                slide,
                index
            ) {

                var image =
                    qs(
                        slide,
                        'img'
                    );

                if (!image) {
                    return;
                }

                var sources =
                    getFancyboxImageSources(
                        image,
                        slide
                    );

                if (!sources.src) {
                    return;
                }

                var caption =
                    image.getAttribute(
                        'data-caption'
                    ) ||
                    image.getAttribute(
                        'title'
                    ) ||
                    image.getAttribute(
                        'alt'
                    ) ||
                    '';

                items.push({
                    src:
                        sources.src,

                    type:
                        'image',

                    thumbSrc:
                        sources.thumb,

                    caption:
                        caption,

                    triggerEl:
                        image
                });

                originalIndexes.push(
                    index
                );
            }
        );

        if (!items.length) {
            return;
        }

        var requestedIndex =
            integer(
                startIndex,
                0
            );

        var fancyIndex =
            originalIndexes.indexOf(
                requestedIndex
            );

        if (fancyIndex < 0) {
            fancyIndex = 0;
        }

        var infinite =
            instance.settings.loop ===
            undefined ||
            isEnabled(
                instance.settings.loop
            );

        var fancybox =
            Fancybox.show(
                items,
                {

                    startIndex:
                        fancyIndex,

                    infinite:
                        infinite,

                    animated:
                        true,

                    hideScrollbar:
                        true,

                    placeFocusBack:
                        true,

                    autoFocus:
                        false,

                    dragToClose:
                        true,

                    closeButton:
                        'top',


                    caption:
                        function (
                            fancybox,
                            slide
                        ) {

                            return (
                                slide.caption ||
                                ''
                            );
                        },

                    Toolbar: {

                        display: {

                            left: [
                                'infobar'
                            ],

                            middle: [],

                            right: [
                                'fullscreen',
                                'close'
                            ]
                        }
                    },

                    Carousel: {

                        infinite:
                            infinite,

                        Navigation:
                            true,

                        transition:
                            'slide'
                    },

                    Panzoom: {

                        maxScale:
                            4,

                        pinchToZoom:
                            true,

                        panOnlyZoomed:
                            'auto',

                        click:
                            'toggleZoom',

                        wheel:
                            'zoom'
                    },

                    on: {

                        /*
                         * ------------------------------------------------
                         * FANCYBOX READY
                         * ------------------------------------------------
                         */

                        ready:
                            function (fancybox) {

                                if (!fancybox) {
                                    return;
                                }

                                var attempts = 0;

                                function mountPGSControls() {

                                    attempts++;

                                    if (
                                        !fancybox ||
                                        (
                                            typeof fancybox.isClosing ===
                                            'function' &&
                                            fancybox.isClosing()
                                        )
                                    ) {
                                        return;
                                    }

                                    if (!fancybox.container) {

                                        if (attempts < 20) {

                                            window.setTimeout(
                                                mountPGSControls,
                                                50
                                            );
                                        }

                                        return;
                                    }

                                    var container =
                                        fancybox.container;

                                    /*
                                     * Mark this as our PGS Fancybox.
                                     */
                                    container.classList.add(
                                        'pgs-fancybox-professional'
                                    );

                                    container.setAttribute(
                                        'data-pgs-lightbox',
                                        '1'
                                    );

                                    /*
                                     * Build custom controls.
                                     */
                                    buildProfessionalFancyboxThumbs(
                                        fancybox,
                                        items,
                                        instance.settings.visible_thumbnails
                                    );

                                    buildProfessionalSlideshowButton(
                                        fancybox
                                    );

                                    setupFancyboxHoverPause(
                                        fancybox
                                    );

                                    /*
                                     * Force carousel dimensions.
                                     */
                                    var carousel =
                                        container.querySelector(
                                            '.fancybox__carousel'
                                        );

                                    if (carousel) {

                                        carousel.style.setProperty(
                                            'width',
                                            '100%',
                                            'important'
                                        );

                                        carousel.style.setProperty(
                                            'height',
                                            '100%',
                                            'important'
                                        );

                                        carousel.style.setProperty(
                                            'flex',
                                            '1 1 auto',
                                            'important'
                                        );
                                    }

                                    var current =
                                        typeof fancybox.getSlide ===
                                            'function'
                                            ? fancybox.getSlide()
                                            : null;

                                    updateProfessionalFancyboxThumb(
                                        container.querySelector(
                                            '.pgs-fancybox-topbar'
                                        ),
                                        current &&
                                            typeof current.index ===
                                            'number'
                                            ? current.index
                                            : 0
                                    );
                                }

                                /*
                                 * Try immediately.
                                 */
                                mountPGSControls();

                                /*
                                 * Try again after DOM paint.
                                 */
                                window.requestAnimationFrame(
                                    function () {
                                        mountPGSControls();
                                    }
                                );

                                /*
                                 * Extra safety for themes/plugins.
                                 */
                                window.setTimeout(
                                    function () {
                                        mountPGSControls();
                                    },
                                    100
                                );

                                window.setTimeout(
                                    function () {
                                        mountPGSControls();
                                    },
                                    300
                                );

                                window.setTimeout(
                                    function () {
                                        mountPGSControls();
                                    },
                                    600
                                );
                            },


                        'Carousel.change':
                            function (fancybox) {

                                if (
                                    !fancybox ||
                                    !fancybox.container
                                ) {
                                    return;
                                }

                                var topbar =
                                    fancybox.container.querySelector(
                                        '.pgs-fancybox-topbar'
                                    );

                                var current =
                                    typeof fancybox.getSlide ===
                                        'function'
                                        ? fancybox.getSlide()
                                        : null;

                                if (
                                    topbar &&
                                    current &&
                                    typeof current.index ===
                                    'number'
                                ) {

                                    updateProfessionalFancyboxThumb(
                                        topbar,
                                        current.index
                                    );
                                }
                            },


                        close:
                            function (
                                fancybox
                            ) {

                                stopProfessionalSlideshow(
                                    fancybox
                                );
                            }
                    }
                }
            );
    }


    function setupEvents(instance) {

        var gallery =
            instance.gallery;


        if (instance.autoplayMouseEnterHandler) {
            gallery.removeEventListener(
                'mouseover',
                instance.autoplayMouseEnterHandler
            );
        }

        if (instance.autoplayMouseLeaveHandler) {
            gallery.removeEventListener(
                'mouseout',
                instance.autoplayMouseLeaveHandler
            );
        }

        instance.autoplayMouseEnterHandler = function (event) {

            var image = event.target && event.target.closest
                ? event.target.closest(
                    '.woocommerce-product-gallery__image'
                )
                : null;

            if (!image || !gallery.contains(image)) {
                return;
            }

            if (
                event.relatedTarget &&
                image.contains(event.relatedTarget)
            ) {
                return;
            }

            pauseAutoplayOnHover(instance);
        };

        instance.autoplayMouseLeaveHandler = function (event) {

            var image = event.target && event.target.closest
                ? event.target.closest(
                    '.woocommerce-product-gallery__image'
                )
                : null;

            if (!image || !gallery.contains(image)) {
                return;
            }

            if (
                event.relatedTarget &&
                image.contains(event.relatedTarget)
            ) {
                return;
            }

            resumeAutoplayAfterHover(instance);
        };

        gallery.addEventListener(
            'mouseover',
            instance.autoplayMouseEnterHandler
        );

        gallery.addEventListener(
            'mouseout',
            instance.autoplayMouseLeaveHandler
        );

        /*
         * Remove previous delegated listeners.
         */

        if (
            instance.clickHandler
        ) {

            gallery.removeEventListener(
                'click',
                instance.clickHandler
            );
        }

        if (
            instance.lightboxClickHandler
        ) {

            gallery.removeEventListener(
                'click',
                instance.lightboxClickHandler,
                true
            );
        }

        if (
            instance.keyHandler
        ) {

            gallery.removeEventListener(
                'keydown',
                instance.keyHandler
            );
        }

        instance.lightboxClickHandler =
            function (event) {

                var target =
                    event.target;

                if (!target) {
                    return;
                }

                var slide =
                    target.closest(
                        '.woocommerce-product-gallery__image'
                    );

                if (
                    !slide ||
                    !gallery.contains(
                        slide
                    )
                ) {
                    return;
                }

                /*
                 * NOTE: do NOT require the click target to be inside the
                 * slide's <a>. WooCommerce's zoom script appends an
                 * invisible <img class="zoomImg"> on top of the slide (a
                 * sibling of the <a>), so real mouse clicks land on that
                 * overlay, not on the anchor. Requiring an <a> made the
                 * click fall through to WooCommerce's own PhotoSwipe
                 * lightbox (black screen, no PGS thumbnails).
                 */
                if (
                    target.closest(
                        '.pgs-arrow, .pgs-dots, .pgs-custom-nav'
                    )
                ) {
                    return;
                }

                /*
                 * IMPORTANT: Do not exclude .pgs-zoom-window or
                 * .pgs-zoom-lens here. On desktop, the hover-zoom UI can
                 * sit above the product image and become the actual mouse
                 * event target. Excluding those elements prevents the PGS
                 * lightbox from opening on desktop, while mobile (where
                 * the hover zoom is normally inactive) still works.
                 *
                 * The zoom overlay is part of the current slide, so the
                 * code below can safely resolve the slide and open the
                 * same PGS Fancybox gallery.
                 */

                var slides =
                    getSlides(
                        instance
                    );

                var index =
                    slides.indexOf(
                        slide
                    );

                if (index < 0) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                openFancybox(
                    instance,
                    index
                );
            };

        gallery.addEventListener(
            'click',
            instance.lightboxClickHandler,
            true
        );

        instance.clickHandler =
            function (event) {

                var thumb =
                    event.target.closest(
                        '.pgs-thumb-list li'
                    );

                if (
                    !thumb ||
                    !gallery.contains(
                        thumb
                    )
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                var index =
                    integer(
                        thumb.getAttribute(
                            'data-pgs-index'
                        ),
                        -1
                    );

                if (
                    index >= 0
                ) {

                    goToSlide(
                        instance,
                        index,
                        false
                    );
                }
            };

        instance.keyHandler =
            function (event) {

                var thumb =
                    event.target.closest(
                        '.pgs-thumb-list li'
                    );

                if (
                    !thumb ||
                    !gallery.contains(
                        thumb
                    )
                ) {
                    return;
                }

                if (
                    event.key ===
                    'Enter' ||
                    event.key ===
                    ' '
                ) {

                    event.preventDefault();

                    thumb.click();
                }
            };

        gallery.addEventListener(
            'click',
            instance.clickHandler
        );

        gallery.addEventListener(
            'keydown',
            instance.keyHandler
        );

        setupSwipe(instance);
    }

    function neutralizeWooGallery(
        instance
    ) {

        var gallery =
            instance.gallery;

        var wrapper =
            getWrapper(
                instance
            );

        var viewport =
            getViewport(
                instance
            );

        var slides =
            getSlides(
                instance
            );

        gallery.classList.add(
            'pgs-woo-controls-disabled'
        );

        qsa(
            gallery,
            '.flex-direction-nav, .flex-control-nav, .flex-control-paging, .flex-control-thumbs'
        ).forEach(
            function (control) {

                if (
                    !control.classList.contains(
                        'pgs-thumb-list'
                    )
                ) {

                    control.style.setProperty(
                        'display',
                        'none',
                        'important'
                    );

                    control.style.setProperty(
                        'pointer-events',
                        'none',
                        'important'
                    );
                }
            }
        );

        qsa(
            gallery,
            '.flex-prev, .flex-next'
        ).forEach(
            function (control) {

                control.style.setProperty(
                    'display',
                    'none',
                    'important'
                );

                control.style.setProperty(
                    'pointer-events',
                    'none',
                    'important'
                );
            }
        );

        gallery.classList.add(
            'pgs-controlled-gallery'
        );

        gallery.style.setProperty(
            'box-sizing',
            'border-box',
            'important'
        );

        if (wrapper) {

            wrapper.style.setProperty(
                'width',
                '100%',
                'important'
            );

            wrapper.style.setProperty(
                'height',
                'var(--pgs-main-height)',
                'important'
            );

            wrapper.style.setProperty(
                'margin',
                '0',
                'important'
            );

            wrapper.style.setProperty(
                'padding',
                '0',
                'important'
            );

            wrapper.style.setProperty(
                'position',
                'relative',
                'important'
            );

            wrapper.style.setProperty(
                'transform',
                'none',
                'important'
            );

            wrapper.style.setProperty(
                'left',
                '0',
                'important'
            );

            wrapper.style.setProperty(
                'top',
                '0',
                'important'
            );

            wrapper.style.setProperty(
                'display',
                'block',
                'important'
            );
        }

        if (viewport) {

            viewport.style.setProperty(
                'width',
                '100%',
                'important'
            );

            viewport.style.setProperty(
                'height',
                'var(--pgs-main-height)',
                'important'
            );

            viewport.style.setProperty(
                'margin',
                '0',
                'important'
            );

            viewport.style.setProperty(
                'padding',
                '0',
                'important'
            );

            viewport.style.setProperty(
                'position',
                'relative',
                'important'
            );

            viewport.style.setProperty(
                'overflow',
                'hidden',
                'important'
            );

            viewport.style.setProperty(
                'transform',
                'none',
                'important'
            );

            viewport.style.setProperty(
                'left',
                '0',
                'important'
            );

            viewport.style.setProperty(
                'top',
                '0',
                'important'
            );

            viewport.style.setProperty(
                'display',
                'block',
                'important'
            );
        }

        slides.forEach(
            function (slide) {

                slide.style.setProperty(
                    'width',
                    '100%',
                    'important'
                );

                slide.style.setProperty(
                    'height',
                    'var(--pgs-main-height)',
                    'important'
                );

                slide.style.setProperty(
                    'margin',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'padding',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'left',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'top',
                    '0',
                    'important'
                );

                slide.style.setProperty(
                    'transform',
                    'none',
                    'important'
                );

                var image =
                    qs(
                        slide,
                        'img'
                    );

                if (image) {

                    image.style.setProperty(
                        'display',
                        'block',
                        'important'
                    );

                    image.style.setProperty(
                        'width',
                        '100%',
                        'important'
                    );

                    image.style.setProperty(
                        'height',
                        '100%',
                        'important'
                    );

                    image.style.setProperty(
                        'max-width',
                        'none',
                        'important'
                    );

                    image.style.setProperty(
                        'max-height',
                        'none',
                        'important'
                    );

                    image.style.setProperty(
                        'margin',
                        '0',
                        'important'
                    );

                    image.style.setProperty(
                        'padding',
                        '0',
                        'important'
                    );

                    image.style.setProperty(
                        'object-fit',
                        instance.settings.object_fit ||
                        'contain',
                        'important'
                    );

                    image.style.setProperty(
                        'object-position',
                        'center center',
                        'important'
                    );
                }
            }
        );
    }


    function applySettings(
        instance
    ) {

        if (
            instance.isApplying
        ) {
            return;
        }

        instance.isApplying =
            true;

        instance.settings =
            getDeviceSettings();

        stopAutoplay(
            instance
        );

        if (
            instance.settings.enabled !==
            undefined &&
            !isEnabled(
                instance.settings.enabled
            )
        ) {

            instance.gallery.classList.remove(
                'pgs-controlled-gallery'
            );

            instance.gallery.classList.add(
                'pgs-gallery-disabled'
            );

            showNativeWooThumbLists(
                instance
            );

            destroyZoom(
                instance
            );

            instance.isApplying =
                false;

            return;
        }

        instance.gallery.classList.remove(
            'pgs-gallery-disabled'
        );

        instance.gallery.classList.add(
            'pgs-controlled-gallery'
        );

        var layout =
            normalizeString(
                instance.settings.gallery_layout,
                'horizontal-bottom'
            );

        instance.gallery.classList.remove(
            'pgs-horizontal-top',
            'pgs-horizontal-bottom',
            'pgs-vertical-left',
            'pgs-vertical-right',
            'pgs-thumbnails-only',
            'pgs-no-thumbnails'
        );

        instance.gallery.classList.add(
            'pgs-' +
            layout
        );

        var thumbShape =
            normalizeString(
                instance.settings.thumb_shape,
                'square'
            );

        if (
            [
                'square',
                'rounded',
                'circle'
            ].indexOf(
                thumbShape
            ) === -1
        ) {

            thumbShape =
                'square';
        }

        instance.gallery.classList.remove(
            'pgs-thumb-square',
            'pgs-thumb-rounded',
            'pgs-thumb-circle'
        );

        instance.gallery.classList.add(
            'pgs-thumb-' +
            thumbShape
        );

        /*
         * Thumbnail bar style: "card" = dark rounded bar with dimmed
         * thumbnails, white active border and a play/pause button
         * (same look as the lightbox bar). "classic" = plain row.
         */
        var thumbStyle =
            normalizeString(
                instance.settings.thumb_style,
                'card'
            ) === 'classic'
                ? 'classic'
                : 'card';

        instance.gallery.classList.remove(
            'pgs-thumb-style-card',
            'pgs-thumb-style-classic'
        );

        instance.gallery.classList.add(
            'pgs-thumb-style-' +
            thumbStyle
        );

        instance.gallery.style.setProperty(
            '--pgs-card-bg',
            String(
                instance.settings.thumb_card_bg ||
                '#121417'
            )
        );

        instance.gallery.style.setProperty(
            '--pgs-card-active',
            String(
                instance.settings.thumb_card_active ||
                '#ffffff'
            )
        );

        var height =
            Math.max(
                120,
                number(
                    instance.settings
                        .main_image_height,
                    360
                )
            );

        var width =
            number(
                instance.settings
                    .main_image_width,
                100
            );

        var thumbWidth =
            Math.max(
                20,
                number(
                    instance.settings.thumb_width,
                    58
                )
            );

        var thumbHeight =
            Math.max(
                20,
                number(
                    instance.settings.thumb_height,
                    58
                )
            );

        /*
         * A "Circle" thumbnail needs an equal width and height —
         * otherwise border-radius: 50% draws an oval/pill instead
         * of a true circle. Force a square box for that shape only.
         */
        if (thumbShape === 'circle') {

            thumbHeight = thumbWidth;
        }

        var thumbGap =
            Math.max(
                0,
                number(
                    instance.settings.thumb_gap,
                    8
                )
            );

        var visibleThumbnails =
            Math.max(
                1,
                integer(
                    instance.settings.visible_thumbnails,
                    4
                )
            );

        var borderWidth =
            Math.max(
                0,
                number(
                    instance.settings.border_width,
                    0
                )
            );

        var borderRadius =
            Math.max(
                0,
                number(
                    instance.settings.border_radius,
                    0
                )
            );

        instance.gallery.style.setProperty(
            '--pgs-main-height',
            height + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-main-width',
            width + '%'
        );

        instance.gallery.style.setProperty(
            '--pgs-thumb-width',
            thumbWidth + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-thumb-height',
            thumbHeight + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-visible-thumbnails',
            String(visibleThumbnails)
        );

        instance.gallery.style.setProperty(
            '--pgs-thumb-ratio',
            String(thumbWidth / thumbHeight)
        );

        instance.gallery.style.setProperty(
            '--pgs-thumb-column',
            thumbWidth + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-thumb-gap',
            thumbGap + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-border-width',
            borderWidth + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-border-radius',
            borderRadius + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-thumb-border',
            instance.settings.thumb_border ||
            '#dddddd'
        );

        instance.gallery.style.setProperty(
            '--pgs-active-thumb-border',
            instance.settings.active_thumb_border ||
            '#333333'
        );

        instance.gallery.style.setProperty(
            '--pgs-arrow-color',
            instance.settings.arrow_color ||
            '#333333'
        );

        instance.gallery.style.setProperty(
            '--pgs-arrow-bg',
            instance.settings.arrow_bg ||
            '#ffffff'
        );

        instance.gallery.style.setProperty(
            '--pgs-arrow-size',
            Math.max(
                16,
                number(
                    instance.settings.arrow_size,
                    36
                )
            ) + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-arrow-offset',
            Math.max(
                0,
                number(
                    instance.settings.arrow_offset,
                    12
                )
            ) + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-dot-size',
            Math.max(
                2,
                number(
                    instance.settings.dots_size,
                    8
                )
            ) + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-dot-gap',
            Math.max(
                0,
                number(
                    instance.settings.dots_gap,
                    7
                )
            ) + 'px'
        );

        instance.gallery.style.setProperty(
            '--pgs-dot-color',
            instance.settings.dots_color ||
            '#cccccc'
        );

        instance.gallery.style.setProperty(
            '--pgs-dot-active-color',
            instance.settings
                .dots_active_color ||
            '#333333'
        );

        instance.gallery.style.setProperty(
            '--pgs-dots-offset',
            Math.max(
                0,
                number(
                    instance.settings.dots_offset,
                    12
                )
            ) + 'px'
        );

        var slides =
            getSlides(instance);

        if (!slides.length) {

            instance.isApplying =
                false;

            return;
        }

        if (
            instance.slideIndex >=
            slides.length
        ) {

            instance.slideIndex =
                0;
        }

        neutralizeWooGallery(
            instance
        );

        buildThumbnails(
            instance
        );

        hideNativeWooThumbLists(
            instance
        );

        var thumbList =
            getThumbList(instance);

        if (thumbList) {

            var thumbs =
                qsa(
                    thumbList,
                    'li'
                );

            /*
             * Vertical layouts collapse to a horizontal row at <= 767px
             * (see frontend.css), so they use the row sizing there too.
             */
            var isHorizontalLayout =
                layout === 'horizontal-top' ||
                layout === 'horizontal-bottom' ||
                (
                    (
                        layout === 'vertical-left' ||
                        layout === 'vertical-right'
                    ) &&
                    window.innerWidth <= 767
                );

            /*
             * Horizontal rows: each thumbnail is an equal share of the
             * row, and the row itself is capped at
             * N * thumb-width + gaps (see frontend.css), so the size
             * follows the backend width when there is room and shrinks
             * to fit otherwise. Vertical layouts keep the fixed width.
             */
            var thumbWidthValue =
                isHorizontalLayout ?
                    'calc((100% - (var(--pgs-thumb-gap, 8px) * (var(--pgs-visible-thumbnails, 4) - 1)) - var(--pgs-thumb-reserve, 0px)) / var(--pgs-visible-thumbnails, 4))' :
                    'var(--pgs-thumb-width)';

            var thumbFlexValue =
                '0 0 ' +
                thumbWidthValue;

            thumbs.forEach(
                function (
                    thumb,
                    index
                ) {

                    thumb.classList.remove(
                        'pgs-hidden-thumb'
                    );

                    thumb.style.setProperty(
                        'width',
                        thumbWidthValue,
                        'important'
                    );

                    thumb.style.setProperty(
                        'min-width',
                        thumbWidthValue,
                        'important'
                    );

                    thumb.style.setProperty(
                        'max-width',
                        thumbWidthValue,
                        'important'
                    );

                    thumb.style.setProperty(
                        'flex',
                        thumbFlexValue,
                        'important'
                    );

                    /*
                     * Horizontal rows centre their first/last thumbnail
                     * with auto margins from the stylesheet, so only
                     * reset margin inline for the other layouts.
                     */
                    if (isHorizontalLayout) {

                        thumb.style.removeProperty('margin');

                    } else {

                        thumb.style.setProperty(
                            'margin',
                            '0',
                            'important'
                        );
                    }

                    thumb.style.setProperty(
                        'padding',
                        '0',
                        'important'
                    );

                    var image =
                        qs(
                            thumb,
                            'img'
                        );

                    if (image) {

                        image.style.setProperty(
                            'width',
                            '100%',
                            'important'
                        );

                        image.style.setProperty(
                            'height',
                            '100%',
                            'important'
                        );

                        image.style.setProperty(
                            'max-width',
                            'none',
                            'important'
                        );

                        image.style.setProperty(
                            'max-height',
                            'none',
                            'important'
                        );

                        image.style.setProperty(
                            'pointer-events',
                            'none',
                            'important'
                        );
                    }

                }
            );
        }

        createDots(
            instance
        );

        var dots =
            qs(
                instance.gallery,
                '.pgs-dots'
            );

        if (dots) {

            var dotsEnabled =
                instance.settings.dots ===
                undefined ||
                isEnabled(
                    instance.settings.dots
                );

            dots.classList.toggle(
                'pgs-dots-hidden',
                !dotsEnabled
            );
        }

        var nav =
            ensureArrows(
                instance
            );

        if (nav) {

            var arrowsEnabled =
                instance.settings.nav_arrows ===
                undefined ||
                isEnabled(
                    instance.settings.nav_arrows
                );

            nav.classList.toggle(
                'pgs-arrows-hidden',
                !arrowsEnabled
            );

            qsa(
                nav,
                '.pgs-arrow'
            ).forEach(
                function (arrow) {

                    arrow.style.color =
                        instance.settings
                            .arrow_color ||
                        '#333';

                    arrow.style.background =
                        instance.settings
                            .arrow_bg ||
                        '#fff';
                }
            );
        }

        instance.gallery.classList.remove(
            'pgs-arrow-circle',
            'pgs-arrow-square',
            'pgs-arrow-minimal'
        );

        var arrowStyle =
            normalizeString(
                instance.settings.arrow_style,
                'circle'
            );

        instance.gallery.classList.add(
            'pgs-arrow-' +
            arrowStyle
        );

        /*
         * Arrow placement.
         */

        instance.gallery.classList.remove(
            'pgs-arrow-inside',
            'pgs-arrow-outside',
            'pgs-arrow-top',
            'pgs-arrow-center',
            'pgs-arrow-bottom'
        );

        var arrowPosition =
            normalizeString(
                instance.settings.arrow_position,
                'inside'
            );

        var arrowVertical =
            normalizeString(
                instance.settings
                    .arrow_vertical_position,
                'center'
            );

        if (
            [
                'inside',
                'outside'
            ].indexOf(
                arrowPosition
            ) === -1
        ) {
            arrowPosition =
                'inside';
        }

        if (
            [
                'top',
                'center',
                'bottom'
            ].indexOf(
                arrowVertical
            ) === -1
        ) {
            arrowVertical =
                'center';
        }

        instance.gallery.classList.add(
            'pgs-arrow-' +
            arrowPosition
        );

        instance.gallery.classList.add(
            'pgs-arrow-' +
            arrowVertical
        );

        instance.gallery.classList.remove(
            'pgs-dots-top',
            'pgs-dots-bottom',
            'pgs-dots-overlay-top',
            'pgs-dots-overlay-bottom',
            'pgs-dots-left',
            'pgs-dots-center',
            'pgs-dots-right'
        );

        var dotsPosition =
            normalizeString(
                instance.settings.dots_position,
                'bottom'
            );

        var dotsAlignment =
            normalizeString(
                instance.settings.dots_alignment,
                'center'
            );

        var dotsPositionMap = {
            'top':
                'top',

            'bottom':
                'bottom',

            'overlay-top':
                'overlay-top',

            'overlay-bottom':
                'overlay-bottom'
        };

        var dotsAlignMap = {
            'left':
                'left',

            'center':
                'center',

            'right':
                'right'
        };

        dotsPosition =
            dotsPositionMap[
            dotsPosition
            ] ||
            'bottom';

        dotsAlignment =
            dotsAlignMap[
            dotsAlignment
            ] ||
            'center';

        instance.gallery.classList.add(
            'pgs-dots-' +
            dotsPosition
        );

        instance.gallery.classList.add(
            'pgs-dots-' +
            dotsAlignment
        );

        qsa(
            instance.gallery,
            '.woocommerce-product-gallery__trigger'
        ).forEach(
            function (trigger) {

                trigger.style.setProperty(
                    'display',
                    'none',
                    'important'
                );

                trigger.style.setProperty(
                    'pointer-events',
                    'none',
                    'important'
                );

                trigger.setAttribute(
                    'aria-hidden',
                    'true'
                );
            }
        );

        instance.gallery.classList.remove(
            'pgs-zoom-inside',
            'pgs-zoom-window',
            'pgs-zoom-lens',
            'pgs-zoom-follow',
            'pgs-zoom-disabled',
            'pgs-zoom-lightbox'
        );

        var zoomType =
            normalizeZoomType(
                instance.settings.zoom_style
            );

        instance.gallery.classList.add(
            'pgs-zoom-' +
            zoomType
        );

        setupEvents(
            instance
        );

        goToSlide(
            instance,
            instance.slideIndex,
            false
        );

        instance.isApplying =
            false;
    }

    function hasRelevantMutation(
        instance,
        mutations
    ) {

        for (
            var i = 0;
            i < mutations.length;
            i++
        ) {

            var mutation =
                mutations[i];

            if (
                mutation.target &&
                mutation.target.closest &&
                mutation.target.closest(
                    '.pgs-thumb-list, .pgs-dots, .pgs-custom-nav, .pgs-zoom-window, .pgs-zoom-lens'
                )
            ) {
                continue;
            }

            if (
                mutation.type ===
                'childList'
            ) {
                return true;
            }

            if (
                mutation.type ===
                'attributes'
            ) {

                var target =
                    mutation.target;

                if (
                    target &&
                    (
                        target.matches(
                            '.woocommerce-product-gallery__image img'
                        ) ||
                        target.matches(
                            '.woocommerce-product-gallery__image a'
                        )
                    )
                ) {

                    return true;
                }

                if (
                    mutation.attributeName ===
                    'src' ||
                    mutation.attributeName ===
                    'href' ||
                    mutation.attributeName ===
                    'data-src' ||
                    mutation.attributeName ===
                    'data-large_image' ||
                    mutation.attributeName ===
                    'data-large-image' ||
                    mutation.attributeName ===
                    'data-thumb'
                ) {

                    return true;
                }
            }
        }

        return false;
    }

    function scheduleReinit(
        instance
    ) {

        if (
            instance.reinitTimer
        ) {

            window.clearTimeout(
                instance.reinitTimer
            );
        }

        instance.reinitTimer =
            window.setTimeout(
                function () {

                    if (
                        !instance.isApplying &&
                        !instance.destroyed
                    ) {

                        applySettings(
                            instance
                        );
                    }
                },
                150
            );
    }

    function setupObserver(
        instance
    ) {

        if (
            !window.MutationObserver
        ) {
            return;
        }

        var gallery =
            instance.gallery;

        instance.observer =
            new MutationObserver(
                function (
                    mutations
                ) {

                    if (
                        instance.isApplying ||
                        instance.isBuildingThumbs
                    ) {
                        return;
                    }

                    if (
                        hasRelevantMutation(
                            instance,
                            mutations
                        )
                    ) {

                        scheduleReinit(
                            instance
                        );
                    }
                }
            );

        instance.observer.observe(
            gallery,
            {
                childList:
                    true,

                subtree:
                    true,

                attributes:
                    true,

                attributeFilter: [
                    'src',
                    'href',
                    'data-src',
                    'data-large_image',
                    'data-large-image',
                    'data-thumb'
                ]
            }
        );
    }

    function setupResize(
        instance
    ) {

        instance.resizeHandler =
            function () {

                if (
                    instance.resizeTimer
                ) {

                    window.clearTimeout(
                        instance.resizeTimer
                    );
                }

                instance.resizeTimer =
                    window.setTimeout(
                        function () {

                            instance.slideIndex =
                                0;

                            applySettings(
                                instance
                            );
                        },
                        200
                    );
            };

        window.addEventListener(
            'resize',
            instance.resizeHandler
        );
    }


    function createInstance(
        gallery
    ) {

        if (
            galleryInstances.has(
                gallery
            )
        ) {

            return galleryInstances.get(
                gallery
            );
        }

        var instance = {

            gallery:
                gallery,

            settings:
                {},

            slideIndex:
                0,

            autoplayTimer:
                null,

            autoplayHoverPaused:
                false,

            autoplayHoverWasRunning:
                false,

            resizeTimer:
                null,

            reinitTimer:
                null,

            touchStartX:
                null,

            isApplying:
                false,

            isBuildingThumbs:
                false,

            destroyed:
                false,

            zoomBindings:
                [],

            zoomFrame:
                null,

            zoomWindow:
                null,

            zoomLens:
                null,

            zoomInside:
                null,

            zoomState:
                null,

            zoomPositionHandler:
                null,

            observer:
                null,

            swipeStart:
                null,

            swipeEnd:
                null,

            clickHandler:
                null,

            lightboxClickHandler:
                null,

            keyHandler:
                null
        };

        galleryInstances.set(
            gallery,
            instance
        );

        galleries.push(
            instance
        );

        return instance;
    }

    function initGallery(
        gallery
    ) {

        if (!gallery) {
            return;
        }

        if (
            typeof window.PGS_SETTINGS ===
            'undefined'
        ) {
            return;
        }

        var instance =
            createInstance(
                gallery
            );

        if (
            instance.initialized
        ) {
            return;
        }

        instance.initialized =
            true;

        gallery.setAttribute(
            'data-pgs-initialized',
            '1'
        );

        setupObserver(
            instance
        );

        setupResize(
            instance
        );

        applySettings(
            instance
        );
    }

    function initAll() {

        if (
            typeof window.PGS_SETTINGS ===
            'undefined'
        ) {
            return;
        }

        var found =
            qsa(
                document,
                '.woocommerce-product-gallery'
            );

        found.forEach(
            function (gallery) {

                initGallery(
                    gallery
                );
            }
        );
    }

    ready(
        function () {

            initAll();

            window.setTimeout(
                initAll,
                300
            );

            window.setTimeout(
                initAll,
                1000
            );
        }
    );

})();

/* =========================================================
 * PGS - THEME SAFE PRODUCT LAYOUT MARKER
 *
 * This block never changes display/width/flex/grid/float values from
 * JavaScript. It only identifies the WooCommerce product wrapper and
 * the two columns. The CSS file owns the layout.
 * Fancybox is completely outside this code path.
 * ========================================================= */

(function () {
    'use strict';

    var GALLERY_SELECTOR =
        '.woocommerce-product-gallery.pgs-controlled-gallery';

    var SUMMARY_SELECTOR =
        '.summary.entry-summary, .entry-summary, .summary, .product-summary, .woocommerce-product-details__summary';

    function markGalleryLayout(gallery) {

        if (!gallery || !gallery.parentElement) {
            return;
        }

        var current = gallery.parentElement;
        var summary = null;
        var productWrapper = null;

        while (
            current &&
            current !== document.body &&
            current !== document.documentElement
        ) {

            summary = current.querySelector(SUMMARY_SELECTOR);

            if (
                summary &&
                !gallery.contains(summary)
            ) {

                /* Prefer the standard WooCommerce product wrapper. */
                if (
                    current.matches &&
                    current.matches(
                        'div.product, .product.type-product'
                    )
                ) {
                    productWrapper = current;
                    break;
                }

                /* Keep the nearest valid common ancestor as fallback. */
                if (!productWrapper) {
                    productWrapper = current;
                }
            }

            current = current.parentElement;
        }

        if (!productWrapper || !summary) {
            return;
        }

        productWrapper.classList.add(
            'pgs-product-layout'
        );

        gallery.classList.add(
            'pgs-layout-gallery'
        );

        summary.classList.add(
            'pgs-layout-summary'
        );
    }

    function initProductLayout() {

        var galleries = document.querySelectorAll(
            GALLERY_SELECTOR
        );

        Array.prototype.forEach.call(
            galleries,
            markGalleryLayout
        );
    }

    function boot() {

        initProductLayout();

        window.setTimeout(initProductLayout, 150);
        window.setTimeout(initProductLayout, 500);
        window.setTimeout(initProductLayout, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    /*
     * Some themes/builders replace product markup after load. Re-mark
     * the wrapper when that happens, but never rewrite its styles.
     */
    if (typeof MutationObserver !== 'undefined') {

        var observerTimer = null;

        var observer = new MutationObserver(function () {

            if (observerTimer) {
                return;
            }

            observerTimer = window.setTimeout(function () {

                observerTimer = null;
                initProductLayout();

            }, 150);
        });

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

})();
