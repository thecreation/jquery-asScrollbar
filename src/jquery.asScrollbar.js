/*
 * asScrollbar
 * https://github.com/amazingSurge/jquery-asScrollable
 *
 * Copyright (c) 2014 amazingSurge
 * Licensed under the GPL license.
 */

(function($, document, window, undefined) {
    "use strict";

    var pluginName = 'asScrollbar';

    var Plugin = $[pluginName] = function(options, bar) {
        this.$bar = $(bar);

        options = this.options = $.extend({}, Plugin.defaults, options || {});

        this.classes = {
            barClass: options.namespace + '-' + options.barClass,
            handleClass: options.namespace + '-' + options.handleClass,
            directionClass: options.namespace + '-' + options.direction
        };

        if (options.skin) {
            this.classes.skinClass = options.namespace + '-' + options.skin;
        }

        var oriAttr;
        if (this.options.direction === 'vertical') {
            oriAttr = this.oriAttr = {
                x: 'Y',
                pos: 'top',
                crossPos: 'left',
                size: 'height',
                crossSize: 'width',
                client: 'clientHeight',
                crossClient: 'clientWidth',
                offset: 'offsetHeight',
                crossOffset: 'offsetWidth',
                offsetPos: 'offsetTop',
                scroll: 'scrollTop',
                scrollSize: 'scrollHeight',
                overflow: 'overflow-y',
                pageOffset: 'pageYOffset',
                mouseAttr: 'pageY'
            };
        } else if (this.options.direction === 'horizontal') {
            oriAttr = this.oriAttr = { // Horizontal
                x: 'X',
                pos: 'left',
                crossPos: 'top',
                size: 'width',
                crossSize: 'height',
                client: 'clientWidth',
                crossClient: 'clientHeight',
                offset: 'offsetWidth',
                crossOffset: 'offsetHeight',
                offsetPos: 'offsetLeft',
                scroll: 'scrollLeft',
                scrollSize: 'scrollWidth',
                overflow: 'overflow-x',
                pageOffset: 'pageXOffset',
                mouseAttr: 'pageX'
            };
        }

        var $handle = this.$handle = this.$bar.find('.' + this.classes.handleClass),
            handle = $handle[0];
        bar = this.$bar[0];

        this.$bar.addClass(this.classes.barClass).addClass(this.classes.directionClass).attr('draggable', false);

        if (options.skin) {
            this.$bar.addClass(this.classes.skinClass);
        }
        if (options.barLength !== false) {
            this.setBarLength(options.barLength);
        }

        if (options.handleLength !== false) {
            this.setHanldeLength(options.handleLength);
        }
        this.hLength = handle[oriAttr.client];
        this.bLength = bar[oriAttr.client] - this.hLength;
        this.hPosition = 0;
        this.initEvent();

    };

    Plugin.defaults = {
        skin: false,
        mousewheel: 10,
        barLength: false,
        handleLength: false,
        namespace: 'asScrollbar',
        barClass: 'scrollbar',
        handleClass: 'handle',
        minHandleLength: 30,
        direction: 'vertical' //if it's 0, scroll orientation is 'horizontal',else scroll orientation is 'vertical'.
    };

    Plugin.prototype = {
        constructor: Plugin,
        eventName: function(events) {
            if (typeof events !== 'string' || events === '') {
                return false;
            }
            events = events.split(' ');

            var namespace = this.options.namespace,
                length = events.length;
            for (var i = 0; i < length; i++) {
                events[i] = events[i] + '.' + namespace;
            }
            return events.join(' ');
        },

        initEvent: function() {
            var self = this,
                $bar = this.$bar;

            $bar.on('mousedown', function(e) {
                var oriAttr = self.oriAttr,
                    bLength = self.bLength,
                    hLength = self.hLength,
                    $handle = self.$handle,
                    hPosition = self.getHanldeOffset();
                if (bLength <= 0 || hLength <= 0) return;

                if ($(e.target).is($handle)) {
                    self.dragStart = e[oriAttr.mouseAttr];
                    self.isDrag = true;
                    $handle.addClass('is-drag');
                    self.$bar.trigger(self.eventName('dragstart'));

                    $(document).on(self.eventName('selectstart'), function() {
                        return false;
                    });

                    $(document).on(self.eventName('mousemove'), function(e) {
                        if (self.isDrag) {
                            var oriAttr = self.oriAttr;

                            var stop = e[oriAttr.mouseAttr],
                                start = self.dragStart;

                            var distance = hPosition + stop - start;
                            self.handleMove(distance, false, true);
                        }
                    });
                    $(document).one(self.eventName('mouseup blur'), function() {
                        self.$handle.removeClass('is-drag');
                        self.$bar.trigger('dragend.' + self.options.namespace);
                        self.isDrag = false;
                        $(document).off(self.eventName('selectstart mousemove'));
                    });
                } else {
                    var offset = e[oriAttr.mouseAttr] - self.$bar.offset()[oriAttr.pos] - hLength / 2;
                    self.handleMove(offset, false, true);
                }



            });

            $bar.on('mousewheel', function(e, delta) {
                var offset = self.getHanldeOffset();
                if (offset <= 0 && delta > 0) {
                    return true;
                } else if (offset >= self.bLength && delta < 0) {
                    return true;
                } else {
                    offset = offset - self.options.mousewheel * delta;

                    self.handleMove(offset, false, true);
                    return false;
                }
            });

        },

        setBarLength: function(length) {
            if (typeof length !== 'undefined') {
                this.$bar.css(this.oriAttr.size, length);
            }
            this.setLength();
        },

        setHandleLength: function(length) {
            if (typeof length !== 'undefined') {
                if (length < this.options.minHandleLength) {
                    length = this.options.minHandleLength;
                }
                this.$handle.css(this.oriAttr.size, length);
            }
            this.setLength();
        },

        setLength: function() {
            this.hLength = this.$handle[0][this.oriAttr.client];
            this.bLength = this.$bar[0][this.oriAttr.client] - this.hLength;
        },

        getHanldeOffset: function() {
            return parseFloat(this.$handle.css(this.oriAttr.pos).replace('px', ''));
        },

        setHandleOffset: function(offset) {
            this.$handle.css(this.oriAttr.pos, offset);
        },

        handleMove: function(value, isPercent, trigger) {
            var percent, $handle = this.$handle,
                params = {},
                offset = this.getHanldeOffset(),
                bLength = this.bLength,
                oriAttr = this.oriAttr,
                $bar = this.$bar;
            if (isPercent) {
                percent = value;
                if (percent < 0) {
                    value = 0;
                } else if (percent > 1) {
                    value = 1;
                }
                value = value * bLength;
            } else {
                if (value < 0) {
                    value = 0;
                } else if (value > bLength) {
                    value = bLength;
                }
                percent = value / bLength;
            }
            if (trigger) {
                $bar.trigger(this.eventName('change'), [percent, 'bar']);
            }
            if (offset === 0 && value === 0) return;
            if (value === 1 && isPercent && offset === this.bLength) return;
            if (value === this.bLength && offset === this.bLength) return;
            params[oriAttr.pos] = value;

            $handle.css(params);
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
