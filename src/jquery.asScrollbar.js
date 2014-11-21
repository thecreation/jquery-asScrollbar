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
                x: 'Y',
                pos: 'top',
                size: 'height',
                client: 'clientHeight',
                offset: 'offsetHeight',
                offsetPos: 'offsetTop',
                scroll: 'scrollTop',
                scrollSize: 'scrollHeight',
                overflow: 'overflow-y',
                pageOffset: 'pageYOffset',
                mousePosition: 'pageY'
            };
        } else if (this.options.direction === 'horizontal') {
            this.attributes = {
                x: 'X',
                pos: 'left',
                size: 'width',
                client: 'clientWidth',
                offset: 'offsetWidth',
                offsetPos: 'offsetLeft',
                scroll: 'scrollLeft',
                scrollSize: 'scrollWidth',
                overflow: 'overflow-x',
                pageOffset: 'pageXOffset',
                mousePosition: 'pageX'
            };
        }

        this.init();
    };

    Plugin.defaults = {
        namespace: 'asScrollbar',
        skin: false,
        mousewheel: 10,
        template: '<div class="{{handle}}"></div>',
        barLength: false,
        handleLength: false,
        barClass: null,
        handleClass: null,
        minHandleLength: 30,
        direction: 'vertical'
    };

    Plugin.prototype = {
        constructor: Plugin,
        init: function() {
            var options = this.options;

            this.$handle = this.$bar.find('.' + this.classes.handleClass);
            if (this.$handle.length === 0) {
                this.$handle = $(options.template.replace(/\{\{handle\}\}/g, this.classes.handleClass)).appendTo(this.$bar);
            }

            var handle = this.$handle[0],
                bar = this.$bar[0];

            this.$bar.addClass(this.classes.barClass).addClass(this.classes.directionClass).attr('draggable', false);

            if (options.skin) {
                this.$bar.addClass(options.skin);
            }
            if (options.barLength !== false) {
                this.setBarLength(options.barLength);
            }

            if (options.handleLength !== false) {
                this.setHanldeLength(options.handleLength);
            }

            this.handleLenght = handle[this.attributes.client];
            this.barLength = bar[this.attributes.client] - this.handleLenght;
            this.handlePosition = 0;
            this.bindEvent();
        },
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
        bindEvent: function() {
            var self = this,
                $bar = this.$bar;

            $bar.on('mousedown', function(e) {
                var attributes = self.attributes,
                    barLength = self.barLength,
                    handleLenght = self.handleLenght,
                    $handle = self.$handle,
                    handlePosition = self.getHanldeOffset();
                if (barLength <= 0 || handleLenght <= 0) return;

                if ($(e.target).is($handle)) {
                    self.dragStart = e[attributes.mousePosition];
                    self.isDrag = true;
                    $handle.addClass('is-drag');
                    self.$bar.trigger(self.eventName('dragstart'));

                    $(document).on(self.eventName('selectstart'), function() {
                        return false;
                    });

                    $(document).on(self.eventName('mousemove'), function(e) {
                        if (self.isDrag) {
                            var attributes = self.attributes,
                                barLength = self.barLength;

                            var stop = e[attributes.mousePosition],
                                start = self.dragStart;

                            var distance = handlePosition + stop - start;
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
                    var offset = e[attributes.mousePosition] - self.$bar.offset()[attributes.pos] - handleLenght / 2;
                    self.handleMove(offset, false, true);
                }
            });

            $bar.on('mousewheel', function(e, delta) {
                var offset = self.getHanldeOffset();
                if (offset <= 0 && delta > 0) {
                    return true;
                } else if (offset >= self.barLength && delta < 0) {
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
                this.$bar.css(this.attributes.size, length);
            }
            this.setLength();
        },

        setHandleLength: function(length) {
            if (typeof length !== 'undefined') {
                if (length < this.options.minHandleLength) {
                    length = this.options.minHandleLength;
                }
                this.$handle.css(this.attributes.size, length);
            }
            this.setLength();
        },

        setLength: function() {
            this.handleLenght = this.$handle[0][this.attributes.client];
            this.barLength = this.$bar[0][this.attributes.client] - this.handleLenght;
        },

        getHanldeOffset: function() {
            return parseFloat(this.$handle.css(this.attributes.pos).replace('px', ''));
        },

        setHandleOffset: function(offset) {
            this.$handle.css(this.attributes.pos, offset);
        },

        handleMove: function(value, isPercent, trigger) {
            var percent, $handle = this.$handle,
                params = {},
                offset = this.getHanldeOffset(),
                barLength = this.barLength,
                handleLenght = this.handleLenght,
                attributes = this.attributes,
                $bar = this.$bar;
            if (isPercent) {
                percent = value;
                if (percent < 0) {
                    value = 0;
                } else if (percent > 1) {
                    value = 1;
                }
                value = value * barLength;
            } else {
                if (value < 0) {
                    value = 0;
                } else if (value > barLength) {
                    value = barLength;
                }
                percent = value / barLength;
            }
            if (trigger) {
                $bar.trigger(this.eventName('change'), [percent, 'bar']);
            }
            if (offset === 0 && value === 0) return;
            if (value === 1 && isPercent && offset === this.barLength) return;
            if (value === this.barLength && offset === this.barLength) return;
            params[attributes.pos] = value;

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
