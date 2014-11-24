/*
 * asScrollbar
 * https://github.com/amazingSurge/jquery-asScrollable
 *
 * Copyright (c) 2015 amazingSurge
 * Licensed under the GPL license.
 */
(function($, document, window, undefined) {
    "use strict";

    var pluginName = 'asScrollbar';

    function isPercentage(n) {
        return typeof n === 'string' && n.indexOf('%') != -1;
    }

    function conventToPercentage(n) {
        if (n < 0) {
            n = 0;
        } else if (n > 1) {
            n = 1;
        }
        return n * 100 + '%';
    }

    function convertPercentageToFloat(n) {
        return parseFloat(n.slice(0, -1) / 100, 10);
    }

    var Plugin = $[pluginName] = function(options, bar) {
        this.$bar = $(bar);

        options = this.options = $.extend({}, Plugin.defaults, options || {});

        this.classes = {
            directionClass: options.namespace + '-' + options.direction,
            barClass: options.barClass ? options.barClass : options.namespace,
            handleClass: options.handleClass ? options.handleClass : options.namespace + '-handle',
        };

        if (this.options.direction === 'vertical') {
            this.attributes = {
                position: 'top',
                length: 'height',
                clientLength: 'clientHeight'
            };
        } else if (this.options.direction === 'horizontal') {
            this.attributes = {
                position: 'left',
                length: 'width',
                clientLength: 'clientWidth'
            };
        }

        // Current state information.
        this._states = {};

        // Current state information for the drag operation.
        this._drag = {
            time: null,
            pointer: null
        };

        // Current handle position
        this.handlePosition = 0;

        this.init();
    };

    Plugin.defaults = {
        namespace: 'asScrollbar',
        
        skin: false,
        template: '<div class="{{handle}}"></div>',
        barClass: null,
        handleClass: null,
        draggingClass: 'is-dragging',

        direction: 'vertical',

        barLength: null,
        handleLength: null,

        minHandleLength: 30,
        maxHandleLength: null,

        mouseDrag: true,
        touchDrag: true,
        pointerDrag: true,
        clickMove: true,
        clickMoveStep: 0.3, // 0 - 1
        mousewheel: true,
        mousewheelSpeed: 10
    };

    Plugin.prototype = {
        constructor: Plugin,
        init: function() {
            var options = this.options;

            this.$handle = this.$bar.find('.' + this.classes.handleClass);
            if (this.$handle.length === 0) {
                this.$handle = $(options.template.replace(/\{\{handle\}\}/g, this.classes.handleClass)).appendTo(this.$bar);
            }

            this.$bar.addClass(this.classes.barClass).addClass(this.classes.directionClass).attr('draggable', false);

            if (options.skin) {
                this.$bar.addClass(options.skin);
            }
            if (options.barLength !== null) {
                this.setBarLength(options.barLength);
            }

            if (options.handleLength !== null) {
                this.setHandleLength(options.handleLength);
            }

            this.updateLength();

            this.bindEvents();
        },

        trigger: function(eventType) {
            var method_arguments = Array.prototype.slice.call(arguments, 1),
                data = [this].concat(method_arguments);

            // event
            this.$bar.trigger(pluginName + '::' + eventType, data);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;

            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },

        /**
         * Checks whether the carousel is in a specific state or not.
         */
        is: function(state) {
            return this._states[state] && this._states[state] > 0;
        },

        /**
         * Enters a state.
         */
        enter: function(state) {
            if (this._states[state] === undefined) {
                this._states[state] = 0;
            }

            this._states[state]++;
        },

        /**
         * Leaves a state.
         */
        leave: function(state) {
            this._states[state]--;
        },

        eventName: function(events) {
            if (typeof events !== 'string' || events === '') {
                return '.' + this.options.namespace;
            }
            events = events.split(' ');

            var length = events.length;
            for (var i = 0; i < length; i++) {
                events[i] = events[i] + '.' + this.options.namespace;
            }
            return events.join(' ');
        },

        bindEvents: function() {
            var self = this;

            if (this.options.mouseDrag) {
                this.$handle.on(this.eventName('mousedown'), $.proxy(this.onDragStart, this));
                this.$handle.on(this.eventName('dragstart selectstart'), function() { return false });
            }

            if (this.options.touchDrag && $.support.touch){
                this.$handle.on(this.eventName('touchstart'), $.proxy(this.onDragStart, this));
                this.$handle.on(this.eventName('touchcancel'), $.proxy(this.onDragEnd, this));
            }

            if(this.options.pointerDrag && $.support.pointer){
                his.$handle.on(this.eventName($.support.prefixPointerEvent('pointerdown')), $.proxy(this.onDragStart, this));
                this.$handle.on(this.eventName($.support.prefixPointerEvent('pointercancel')), $.proxy(this.onDragEnd, this));
            }

            if(this.options.clickMove){
                this.$bar.on(this.eventName('mousedown'), $.proxy(this.onClick, this));
            }

            if(this.options.mousewheel){
                this.$bar.on(this.eventName('mousewheel'), function(e, delta) {
                    var offset = self.getHandlePosition();
                    if (offset <= 0 && delta > 0) {
                        return true;
                    } else if (offset >= self.barLength && delta < 0) {
                        return true;
                    } else {
                        offset = offset - self.options.mousewheelSpeed * delta;

                        self.move(offset, false, true);
                        return false;
                    }
                });
            }
        },

        onClick: function(event) {
            var self = this;

            if (event.which === 3) {
                return;
            }

            if(event.target === this.$handle[0]) {
                return;
            }

            this._drag.time = new Date().getTime();
            this._drag.pointer = this.pointer(event);

            var offset = this.$handle.offset(), distance = this.distance({
                x: offset.left,
                y: offset.top
            }, this._drag.pointer), factor = 1;

            if(distance > 0){
                distance -= this.handleLength;
            } else {
                distance = Math.abs(distance);
                factor = -1;
            }

            if(distance > this.barLength * this.options.clickMoveStep) {
                distance = this.barLength * this.options.clickMoveStep;
            }
            this.moveBy(factor * distance, true);
        },

        /**
         * Handles `touchstart` and `mousedown` events.
         */
        onDragStart: function(event) {
            var self = this;

            if (event.which === 3) {
                return;
            }

            // this.$bar.toggleClass(this.options.draggingClass, event.type === 'mousedown');
            this.$bar.addClass(this.options.draggingClass);

            this._drag.time = new Date().getTime();
            this._drag.pointer = this.pointer(event);

            var callback = function(){
                self.enter('dragging');
                self.trigger('drag');
            }

            if (this.options.mouseDrag) {
                $(document).on(self.eventName('mouseup'), $.proxy(this.onDragEnd, this));

                $(document).one(self.eventName('mousemove'), $.proxy(function(event) {
                    $(document).on(self.eventName('mousemove'), $.proxy(this.onDragMove, this));

                    callback();
                }, this));
            }

            if (this.options.touchDrag && $.support.touch){
                $(document).on(self.eventName('touchend'), $.proxy(this.onDragEnd, this));

                $(document).one(self.eventName('touchmove'), $.proxy(function(event) {
                    $(document).on(self.eventName('touchmove'), $.proxy(this.onDragMove, this));

                    callback();
                }, this));
            }

            if(this.options.pointerDrag && $.support.pointer){
                $(document).on(self.eventName($.support.prefixPointerEvent('pointerup')), $.proxy(this.onDragEnd, this));

                $(document).one(self.eventName($.support.prefixPointerEvent('pointermove')), $.proxy(function(event) {
                    $(document).on(self.eventName($.support.prefixPointerEvent('pointermove')), $.proxy(this.onDragMove, this));

                    callback();
                }, this));
            }

            $(document).on(self.eventName('blur'), $.proxy(this.onDragEnd, this));
        },

        /**
         * Handles the `touchmove` and `mousemove` events.
         */
        onDragMove: function(event) {
            var distance = this.distance(this._drag.pointer, this.pointer(event));

            if (!this.is('dragging')) {
                return;
            }

            event.preventDefault();
            this.moveBy(distance, true);
        },

        /**
         * Handles the `touchend` and `mouseup` events.
         */
        onDragEnd: function(event) {
            $(document).off(this.eventName('mousemove mouseup touchmove touchend pointermove pointerup MSPointerMove MSPointerUp blur'));

            this.$bar.removeClass(this.options.draggingClass);
            this.handlePosition = this.getHandlePosition();

            if (!this.is('dragging')) {
                return;
            }

            this.leave('dragging');
            this.trigger('dragged');
        },

        /**
         * Gets unified pointer coordinates from event.
         * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
         */
        pointer: function(event) {
            var result = { x: null, y: null };

            event = event.originalEvent || event || window.event;

            event = event.touches && event.touches.length ?
                event.touches[0] : event.changedTouches && event.changedTouches.length ?
                    event.changedTouches[0] : event;

            if (event.pageX) {
                result.x = event.pageX;
                result.y = event.pageY;
            } else {
                result.x = event.clientX;
                result.y = event.clientY;
            }

            return result;
        },

        /**
         * Gets the distance of two pointer.
         */
        distance: function(first, second) {
            if(this.options.direction === 'vertical'){
                return second.y - first.y;
            } else {
                return second.x - first.x;
            }
        },

        setBarLength: function(length, update) {
            if (typeof length !== 'undefined') {
                this.$bar.css(this.attributes.length, length);
            }
            if (update !== false){
                this.updateLength();
            }
        },

        setHandleLength: function(length, update) {
            if (typeof length !== 'undefined') {
                if (length < this.options.minHandleLength) {
                    length = this.options.minHandleLength;
                } else if(this.options.maxHandleLength && length > this.options.maxHandleLength){
                    length = this.options.maxHandleLength;
                }
                this.$handle.css(this.attributes.length, length);
            }
            if (update !== false){
                this.updateLength();
            }
        },

        updateLength: function() {
            this.handleLength = this.$handle[0][this.attributes.clientLength];
            this.barLength = this.$bar[0][this.attributes.clientLength];
        },

        getHandlePosition: function() {
            return parseFloat(this.$handle.css(this.attributes.position).replace('px', ''));
        },

        setHandlePosition: function(value) {
            this.$handle.css(this.attributes.position, value);

            if (!this.is('dragging')) {
                this.handlePosition = this.getHandlePosition();
            }
        },

        moveTo: function(value, trigger) {
            var type = typeof value;

            if(type === "string") {
                if(isPercentage(value)){
                    value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
                }

                value = parseFloat(value);
                type = "number";
            }

            if(type !== "number") {
                return;
            }

            this.move(value, trigger);
        },

        moveBy: function(value, trigger) {
            var type = typeof value;

            if (type === "string") {
                if(isPercentage(value)){
                    value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
                }

                value = parseFloat(value);
                type = "number";
            }

            if (type !== "number"){
                return;
            }

            this.move(this.handlePosition + value, trigger);
        },

        move: function(value, trigger) {
            if ( typeof value !== "number") {
                return;
            }

            if (value < 0) {
                value = 0;
            } else if(value + this.handleLength > this.barLength) {
                value = this.barLength - this.handleLength;
            }

            if (trigger) {
                this.trigger(this.eventName('change'), [value/(this.barLength - this.handleLength)]);
            }

            this.setHandlePosition(value + "px");
        },

        destory: function() {
            this.$bar.on(this.eventName());
        }
    };

    $.fn[pluginName] = function(options) {
        if (typeof options === 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function() {
                var instance = $(this).data(pluginName);
                if (!instance) {
                    return false;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    return false;
                }
                // apply method
                instance[options].apply(instance, args);
            });
        } else {
            this.each(function() {
                if (!$(this).data(pluginName)) {
                    $(this).data(pluginName, new Plugin(options, this));
                }
            });

        }
        return this;
    };

})(jQuery, document, window, undefined);
