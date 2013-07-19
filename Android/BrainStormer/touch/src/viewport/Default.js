/**
 * @private
 * Base class for iOS and Android viewports.
 */
Ext.define('Ext.viewport.Default', {
    extend: 'Ext.Container',

    xtype: 'viewport',

    PORTRAIT: 'portrait',

    LANDSCAPE: 'landscape',

    requires: [
        'Ext.LoadMask',
        'Ext.layout.Card',
        'Ext.util.InputBlocker'
    ],

    /**
     * @event ready
     * Fires when the Viewport is in the DOM and ready.
     * @param {Ext.Viewport} this
     */

    /**
     * @event maximize
     * Fires when the Viewport is maximized.
     * @param {Ext.Viewport} this
     */

    /**
     * @event orientationchange
     * Fires when the Viewport orientation has changed.
     * @param {Ext.Viewport} this
     * @param {String} newOrientation The new orientation.
     * @param {Number} width The width of the Viewport.
     * @param {Number} height The height of the Viewport.
     */

    config: {
        /**
         * @cfg {Boolean} autoMaximize
         * Whether or not to always automatically maximize the viewport on first load and all subsequent orientation changes.
         *
         * This is set to `false` by default for a number of reasons:
         *
         * - Orientation change performance is drastically reduced when this is enabled, on all devices.
         * - On some devices (mostly Android) this can sometimes cause issues when the default browser zoom setting is changed.
         * - When wrapping your phone in a native shell, you may get a blank screen.
         * - When bookmarked to the homescreen (iOS), you may get a blank screen.
         *
         * @accessor
         */
        autoMaximize: false,

        /**
         * @private
         */
        autoBlurInput: true,

        /**
         * @cfg {Boolean} preventPanning
         * Whether or not to always prevent default panning behavior of the
         * browser's viewport.
         * @accessor
         */
        preventPanning: true,

        /**
         * @cfg {Boolean} preventZooming
         * `true` to attempt to stop zooming when you double tap on the screen on mobile devices,
         * typically HTC devices with HTC Sense UI.
         * @accessor
         */
        preventZooming: false,

        /**
         * @cfg
         * @private
         */
        autoRender: true,

        /**
         * @cfg {Object/String} layout Configuration for this Container's layout. Example:
         *
         *     Ext.create('Ext.Container', {
         *         layout: {
         *             type: 'hbox',
         *             align: 'middle'
         *         },
         *         items: [
         *             {
         *                 xtype: 'panel',
         *                 flex: 1,
         *                 style: 'background-color: red;'
         *             },
         *             {
         *                 xtype: 'panel',
         *                 flex: 2,
         *                 style: 'background-color: green'
         *             }
         *         ]
         *     });
         *
         * See the [layouts guide](#!/guides/layouts) for more information.
         *
         * @accessor
         */
        layout: 'card',

        /**
         * @cfg
         * @private
         */
        width: '100%',

        /**
         * @cfg
         * @private
         */
        height: '100%',

        useBodyElement: true,

        /**
         * An object of all the menus on this viewport.
         * @private
         */
        menus: {}
    },

    /**
     * @property {Boolean} isReady
     * `true` if the DOM is ready.
     */
    isReady: false,

    isViewport: true,

    isMaximizing: false,

    id: 'ext-viewport',

    isInputRegex: /^(input|textarea|select|a)$/i,

    focusedElement: null,

    /**
     * @private
     */
    fullscreenItemCls: Ext.baseCSSPrefix + 'fullscreen',

    constructor: function(config) {
        var bind = Ext.Function.bind;

        this.doPreventPanning = bind(this.doPreventPanning, this);
        this.doPreventZooming = bind(this.doPreventZooming, this);
        this.doBlurInput = bind(this.doBlurInput, this);

        this.maximizeOnEvents = [
          'ready',
          'orientationchange'
        ];

      // set default devicePixelRatio if it is not explicitly defined
        window.devicePixelRatio = window.devicePixelRatio || 1;

        this.callSuper([config]);

        this.orientation = this.determineOrientation();
        this.windowWidth = this.getWindowWidth();
        this.windowHeight = this.getWindowHeight();
        this.windowOuterHeight = this.getWindowOuterHeight();

        if (!this.stretchHeights) {
        this.stretchHeights = {};
        }

        // Android is handled separately
        if (!Ext.os.is.Android || Ext.browser.is.ChromeMobile) {
            if (this.supportsOrientation()) {
                this.addWindowListener('orientationchange', bind(this.onOrientationChange, this));
            }
            else {
                this.addWindowListener('resize', bind(this.onResize, this));
            }
        }

        document.addEventListener('focus', bind(this.onElementFocus, this), true);
        document.addEventListener('blur', bind(this.onElementBlur, this), true);

        Ext.onDocumentReady(this.onDomReady, this);

        this.on('ready', this.onReady, this, {single: true});

        this.getEventDispatcher().addListener('component', '*', 'fullscreen', 'onItemFullscreenChange', this);

        return this;
    },

    onDomReady: function() {
        this.isReady = true;
        this.updateSize();
        this.fireEvent('ready', this);
    },

    onReady: function() {
        if (this.getAutoRender()) {
            this.render();
        }
        if (Ext.browser.name == 'ChromeiOS') {
            this.setHeight('-webkit-calc(100% - ' + ((window.outerHeight - window.innerHeight) / 2) + 'px)');
        }
    },

    onElementFocus: function(e) {
        this.focusedElement = e.target;
    },

    onElementBlur: function() {
        this.focusedElement = null;
    },

    render: function() {
        if (!this.rendered) {
            var body = Ext.getBody(),
                clsPrefix = Ext.baseCSSPrefix,
                classList = [],
                osEnv = Ext.os,
                osName = osEnv.name.toLowerCase(),
                browserName = Ext.browser.name.toLowerCase(),
                osMajorVersion = osEnv.version.getMajor(),
                orientation = this.getOrientation();

            this.renderTo(body);

            classList.push(clsPrefix + osEnv.deviceType.toLowerCase());

            if (osEnv.is.iPad) {
                classList.push(clsPrefix + 'ipad');
            }

            classList.push(clsPrefix + osName);
            classList.push(clsPrefix + browserName);

            if (osMajorVersion) {
                classList.push(clsPrefix + osName + '-' + osMajorVersion);
            }

            if (osEnv.is.BlackBerry) {
                classList.push(clsPrefix + 'bb');
            }

            if (Ext.browser.is.WebKit) {
                classList.push(clsPrefix + 'webkit');
            }

            if (Ext.browser.is.Standalone) {
                classList.push(clsPrefix + 'standalone');
            }

            classList.push(clsPrefix + orientation);

            body.addCls(classList);
        }
    },

    applyAutoBlurInput: function(autoBlurInput) {
        var touchstart = (Ext.feature.has.Touch) ? 'touchstart' : 'mousedown';

        if (autoBlurInput) {
            this.addWindowListener(touchstart, this.doBlurInput, false);
        }
        else {
            this.removeWindowListener(touchstart, this.doBlurInput, false);
        }

        return autoBlurInput;
    },

    applyAutoMaximize: function(autoMaximize) {
        if (Ext.browser.is.WebView) {
            autoMaximize = false;
        }
        if (autoMaximize) {
            this.on('ready', 'doAutoMaximizeOnReady', this, { single: true });
            this.on('orientationchange', 'doAutoMaximizeOnOrientationChange', this);
        }
        else {
            this.un('ready', 'doAutoMaximizeOnReady', this);
            this.un('orientationchange', 'doAutoMaximizeOnOrientationChange', this);
        }

        return autoMaximize;
    },

    applyPreventPanning: function(preventPanning) {
        if (preventPanning) {
            this.addWindowListener('touchmove', this.doPreventPanning, false);
        }
        else {
            this.removeWindowListener('touchmove', this.doPreventPanning, false);
        }

        return preventPanning;
    },

    applyPreventZooming: function(preventZooming) {
        var touchstart = (Ext.feature.has.Touch) ? 'touchstart' : 'mousedown';

        if (preventZooming) {
            this.addWindowListener(touchstart, this.doPreventZooming, false);
        }
        else {
            this.removeWindowListener(touchstart, this.doPreventZooming, false);
        }

        return preventZooming;
    },

    doAutoMaximizeOnReady: function() {
        var controller = arguments[arguments.length - 1];

        controller.pause();

        this.isMaximizing = true;

        this.on('maximize', function() {
            this.isMaximizing = false;

            this.updateSize();

            controller.resume();

            this.fireEvent('ready', this);
        }, this, { single: true });

        this.maximize();
    },

    doAutoMaximizeOnOrientationChange: function() {
        var controller = arguments[arguments.length - 1],
            firingArguments = controller.firingArguments;

        controller.pause();

        this.isMaximizing = true;

        this.on('maximize', function() {
            this.isMaximizing = false;

            this.updateSize();

            firingArguments[2] = this.windowWidth;
            firingArguments[3] = this.windowHeight;

            controller.resume();
        }, this, { single: true });

        this.maximize();
    },

    doBlurInput: function(e) {
        var target = e.target,
            focusedElement = this.focusedElement;
        //In IE9/10 browser window loses focus and becomes inactive if focused element is <body>. So we shouldn't call blur for <body>
        if (focusedElement && focusedElement.nodeName.toUpperCase() != 'BODY' && !this.isInputRegex.test(target.tagName)) {
            delete this.focusedElement;
            focusedElement.blur();
        }
    },

    doPreventPanning: function(e) {
        e.preventDefault();
    },

    doPreventZooming: function(e) {
        // Don't prevent right mouse event
        if ('button' in e && e.button !== 0) {
            return;
        }

        var target = e.target;

        if (target && target.nodeType === 1 && !this.isInputRegex.test(target.tagName)) {
            e.preventDefault();
        }
    },

    addWindowListener: function(eventName, fn, capturing) {
        window.addEventListener(eventName, fn, Boolean(capturing));
    },

    removeWindowListener: function(eventName, fn, capturing) {
        window.removeEventListener(eventName, fn, Boolean(capturing));
    },

    doAddListener: function(eventName, fn, scope, options) {
        if (eventName === 'ready' && this.isReady && !this.isMaximizing) {
            fn.call(scope);
            return this;
        }

        return this.callSuper(arguments);
    },

    supportsOrientation: function() {
        return Ext.feature.has.Orientation;
    },

    onResize: function() {
        var oldWidth = this.windowWidth,
            oldHeight = this.windowHeight,
            width = this.getWindowWidth(),
            height = this.getWindowHeight(),
            currentOrientation = this.getOrientation(),
            newOrientation = this.determineOrientation();

        // Determine orientation change via resize. BOTH width AND height much change, otherwise
        // this is a keyboard popping up.
        if ((oldWidth !== width && oldHeight !== height) && currentOrientation !== newOrientation) {
            this.fireOrientationChangeEvent(newOrientation, currentOrientation);
        }
    },

    onOrientationChange: function() {
        var currentOrientation = this.getOrientation(),
            newOrientation = this.determineOrientation();

        if (newOrientation !== currentOrientation) {
            this.fireOrientationChangeEvent(newOrientation, currentOrientation);
        }
    },

    fireOrientationChangeEvent: function(newOrientation, oldOrientation) {
        var clsPrefix = Ext.baseCSSPrefix;
        Ext.getBody().replaceCls(clsPrefix + oldOrientation, clsPrefix + newOrientation);

        this.orientation = newOrientation;

        this.updateSize();
        this.fireEvent('orientationchange', this, newOrientation, this.windowWidth, this.windowHeight);
    },

    updateSize: function(width, height) {
        this.windowWidth = width !== undefined ? width : this.getWindowWidth();
        this.windowHeight = height !== undefined ? height : this.getWindowHeight();

        return this;
    },

    waitUntil: function(condition, onSatisfied, onTimeout, delay, timeoutDuration) {
        if (!delay) {
            delay = 50;
        }

        if (!timeoutDuration) {
            timeoutDuration = 2000;
        }

        var scope = this,
            elapse = 0;

        setTimeout(function repeat() {
            elapse += delay;

            if (condition.call(scope) === true) {
                if (onSatisfied) {
                    onSatisfied.call(scope);
                }
            }
            else {
                if (elapse >= timeoutDuration) {
                    if (onTimeout) {
                        onTimeout.call(scope);
                    }
                }
                else {
                    setTimeout(repeat, delay);
                }
            }
        }, delay);
    },

    maximize: function() {
        this.fireMaximizeEvent();
    },

    fireMaximizeEvent: function() {
        this.updateSize();
        this.fireEvent('maximize', this);
    },

    doSetHeight: function(height) {
        Ext.getBody().setHeight(height);

        this.callParent(arguments);
    },

    doSetWidth: function(width) {
        Ext.getBody().setWidth(width);

        this.callParent(arguments);
    },

    scrollToTop: function() {
        window.scrollTo(0, -1);
    },

    /**
     * Retrieves the document width.
     * @return {Number} width in pixels.
     */
    getWindowWidth: function() {
        return window.innerWidth;
    },

    /**
     * Retrieves the document height.
     * @return {Number} height in pixels.
     */
    getWindowHeight: function() {
        return window.innerHeight;
    },

    getWindowOuterHeight: function() {
        return window.outerHeight;
    },

    getWindowOrientation: function() {
        return window.orientation;
    },

    /**
     * Returns the current orientation.
     * @return {String} `portrait` or `landscape`
     */
    getOrientation: function() {
        return this.orientation;
    },

    getSize: function() {
        return {
            width: this.windowWidth,
            height: this.windowHeight
        };
    },

    determineOrientation: function() {
        var portrait = this.PORTRAIT,
            landscape = this.LANDSCAPE;

        if (!Ext.os.is.Android && this.supportsOrientation()) {
            if (this.getWindowOrientation() % 180 === 0) {
                return portrait;
            }

            return landscape;
        }
        else {
            if (this.getWindowHeight() >= this.getWindowWidth()) {
                return portrait;
            }

            return landscape;
        }
    },

    onItemFullscreenChange: function(item) {
        item.addCls(this.fullscreenItemCls);
        this.add(item);
    },

    /**
     * Sets a menu for a given side of the Viewport.
     *
     * Adds functionality to show the menu by swiping from the side of the screen from the given side.
     *
     * If a menu is already set for a given side, it will be removed.
     *
     * Available sides are: `left`, `right`, `top`, and `bottom`.
     *
     * @param  {Ext.Menu} menu The menu to assign to the viewport
     * @param  {Object} config The configuration for the menu.
     * @param {String} config.side The side to put the menu on.
     * @param {Boolean} config.cover True to cover the viewport content. Defaults to `true`.
     */
    setMenu: function(menu, config) {
        var config = config || {};

        if (!menu) {
            //<debug error>
            Ext.Logger.error("You must specify a side to dock the menu.");
            //</debug>
            return;
        }

        if (!config.side) {
            //<debug error>
            Ext.Logger.error("You must specify a side to dock the menu.");
            //</debug>
            return;
        }

        if (['left', 'right', 'top', 'bottom'].indexOf(config.side) == -1) {
            //<debug error>
            Ext.Logger.error("You must specify a valid side (left, right, top or botom) to dock the menu.");
            //</debug>
            return;
        }

        var menus = this.getMenus();

        if (!menus) {
            menus = {};
        }

        // Remove any existing menus on this side
        if (menus[config.side]) {
            this.remove(menus[config.side]);
        }

        // Add a listener to show this menu on swipe
        if (!this.addedSwipeListener) {
            this.addedSwipeListener = true;

            this.element.on({
                tap: this.onTap,
                swipestart: this.onSwipeStart,
                edgeswipestart: this.onEdgeSwipeStart,
                edgeswipe: this.onEdgeSwipe,
                edgeswipeend: this.onEdgeSwipeEnd,
                scope: this
            });
        }

        menus[config.side] = menu;
        menu.$cover = (config.cover === false) ? false : true;
        menu.setDocked(config.side);
        menu.$side = config.side;
        this.fixMenuSize(menu, config.side);

        this.setMenus(menus);
    },

    /**
     * Removes a menu from a specified side.
     * @param  {String} side The side to remove the menu from
     */
    removeMenu: function(side) {
        var menus = this.getMenus() || {};
        delete menus[side];
        this.setMenus(menus);
    },

    /**
     * @private
     * Changes the sizing of the specified menu so that it displays correctly when shown.
     */
    fixMenuSize: function(menu, side) {
        if (side == 'top' || side == 'bottom') {
            menu.setWidth('100%');
        }
        else if (side == 'left' || side == 'right') {
            menu.setHeight('100%');
        }
    },

    /**
     * Shows a menu specified by the menu's side.
     * @param  {String} side The side which the menu is placed.
     */
    showMenu: function(side) {
        var menus = this.getMenus(),
            menu = menus[side],
            to = {};

        if (!menu || menu.isAnimating) {
            return;
        }

        Ext.Viewport.add(menu);
        menu.show();
        menu.addCls('x-' + side);

        var size = (side == 'left' || side == 'right') ? menu.element.getWidth() : menu.element.getHeight(),
            setter = 'set' + Ext.String.capitalize(side);

        menu[setter](-size);

        to[side] = 0;

        var animations = [];

        animations.push(new Ext.fx.Animation({
            element: menu.element,
            preserveEndState: true,
            duration: 200,
            to: to,
            onEnd: function() {
                menu.isAnimating = false;
            }
        }));

        to[side] = size;

        if (!menu.$cover) {
            animations.push(new Ext.fx.Animation({
                element: this.innerElement,
                preserveEndState: true,
                duration: 200,
                to: to
            }));
        }

        // Make the menu as animating
        menu.isAnimating = true;

        Ext.Animator.run(animations);
    },

    /**
     * Hides a menu specified by the menu's side.
     * @param  {String} side The side which the menu is placed.
     */
    hideMenu: function(side, animate) {
        var menus = this.getMenus(),
            menu = menus[side],
            menuBefore = {},
            menuTo = {},
            viewportTo = {},
            animations = [],
            size;

        animate = (animate === false) ? false : true;

        if (!menu || (menu.isHidden() || menu.isAnimating)) {
            return;
        }

        size = (side == 'left' || side == 'right') ? menu.element.getWidth() : menu.element.getHeight();

        menuTo[side] = -size;
        menuBefore[side] = 0;
        viewportTo[side] = 0;

        if (animate) {
            animations.push(new Ext.fx.Animation({
                element: menu.element,
                preserveEndState: true,
                duration: 200,
                before: menuBefore,
                to: menuTo,
                onEnd: function() {
                    menu.isAnimating = false;
                    menu.setHidden(true);
                }
            }));

            // Move the viewport if cover is not enabled
            if (!menu.$cover) {
                animations.push(new Ext.fx.Animation({
                    element: this.innerElement,
                    preserveEndState: true,
                    duration: 200,
                    to: viewportTo,
                    onEnd: function() {
                        this.innerElement.setLeft('auto');
                        this.innerElement.setRight('auto');
                        this.innerElement.setTop('auto');
                        this.innerElement.setBottom('auto');
                    },
                    scope: this
                }));
            }

            // Make the menu as animating
            menu.isAnimating = true;

            Ext.Animator.run(animations);
        } else {
            // var setter = 'set' + Ext.String.capitalize(side);

            // menu.element[setter] = -size;
            menu.setHidden(true);

            // Move the viewport if cover is not enabled
            if (!menu.$cover) {
                this.innerElement.setLeft('auto');
                this.innerElement.setRight('auto');
                this.innerElement.setTop('auto');
                this.innerElement.setBottom('auto');
            }
        }
    },

    /**
     * Hides all visible menus.
     */
    hideAllMenus: function(animation) {
        var menus = this.getMenus();

        for (var side in menus) {
            this.hideMenu(side, animation);
        }
    },

    /**
     * @private
     */
    sideForDirection: function(direction) {
        if (direction == 'left') {
            return 'right';
        }
        else if (direction == 'right') {
            return 'left';
        }
        else if (direction == 'up') {
            return 'bottom';
        }
        else if (direction == 'down') {
            return 'top';
        }
    },

    /**
     * @private
     */
    sideForSwipeDirection: function(direction) {
        if (direction == "up") {
            return  "top";
        }
        else if (direction == "down") {
            return "bottom";
        }
        return direction;
    },

    /**
     * @private
     */
    onTap: function(e) {
        // this.hideAllMenus();
    },

    /**
     * @private
     */
    onSwipeStart: function(e) {
        var side = this.sideForSwipeDirection(e.direction);
        this.hideMenu(side);
    },

    /**
     * @private
     */
    onEdgeSwipeStart: function(e) {
        var side = this.sideForDirection(e.direction),
            menu = this.getMenus()[side];

        if (!menu || !menu.isHidden()) {
            return;
        }

        this.$swiping = true;

        this.hideAllMenus(false);

        // show the menu first so we can calculate the size
        Ext.Viewport.add(menu);
        menu.show();

        var size = (side == 'left' || side == 'right') ? menu.element.getWidth() : menu.element.getHeight(),
            setter = 'set' + Ext.String.capitalize(side);

        menu[setter](-size);
    },

    /**
     * @private
     */
    onEdgeSwipe: function(e) {
        var side = this.sideForDirection(e.direction),
            menu = this.getMenus()[side];

        if (!menu || !this.$swiping) {
            return;
        }

        var size = (side == 'left' || side == 'right') ? menu.element.getWidth() : menu.element.getHeight(),
            setter = 'set' + Ext.String.capitalize(side),
            movement = Math.min(e.distance - size, 0);

        menu[setter](movement);

        // if not cover, also move the viewport
        if (!menu.$cover) {
            this.innerElement[setter](Math.max(size - Math.abs(movement), 0));
        }
    },

    /**
     * @private
     */
    onEdgeSwipeEnd: function(e) {
        var side = this.sideForDirection(e.direction),
            menu = this.getMenus()[side],
            shouldRevert = false;

        if (!menu) {
            return;
        }

        var size = (side == 'left' || side == 'right') ? menu.element.getWidth() : menu.element.getHeight(),
            setter = 'set' + Ext.String.capitalize(side),
            getter = 'get' + Ext.String.capitalize(side),
            velocity = (e.flick) ? e.flick.velocity : 0;

        // check if already fully offset
        if (menu[getter]() == size) {
            return;
        }

        // check if continuing in the right dirrection
        if (side == 'right') {
            if (velocity.x > 0) {
                shouldRevert = true;
            }
        }
        else if (side == 'left') {
            if (velocity.x < 0) {
                shouldRevert = true;
            }
        }
        else if (side == 'top') {
            if (velocity.y < 0) {
                shouldRevert = true;
            }
        }
        else if (side == 'bottom') {
            if (velocity.y > 0) {
                shouldRevert = true;
            }
        }

        var menuTo = {},
            viewportTo = {},
            animations = [];

        menuTo[side] = (shouldRevert) ? -size : 0;
        viewportTo[side] = (shouldRevert) ? 0 : size;

        animations.push(new Ext.fx.Animation({
            element: menu.element,
            preserveEndState: true,
            duration: 200,
            to: menuTo,
            onEnd: function() {
                if (shouldRevert) {
                    menu.hide();
                }
            }
        }));

        // Move the viewport if cover is not enabled
        if (!menu.$cover) {
            animations.push(new Ext.fx.Animation({
                element: this.innerElement,
                preserveEndState: true,
                duration: 200,
                to: viewportTo
            }));
        }

        Ext.Animator.run(animations);

        this.$swiping = false;
    }
});
