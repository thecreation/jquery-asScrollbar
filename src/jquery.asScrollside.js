(function($, document, window, undefined) {
    "use strict";

    var pluginName = 'asScrollSide';

    var Plugin = $[pluginName] = function(options, side) {
        var $side = this.$side = $(side),
            options = this.options = $.extend({}, Plugin.defaults, options || {});

        this.classes = {
            barClass: options.namespace + '-' + options.barClass,
            handleClass: options.namespace + '-' + options.handleClass,
            contentClass: options.namespace + '-' + options.contentClass
        };

        if (options.skin) {
            this.classes.skinClass = options.namespace + '-' + options.skin;
        }

        this.offset = 0;


        if (options.skin) {
            this.$side.addClass(this.classes.skinClass);
        }

        $side.css({
            position: 'fixed',
            top: 0
        });


        $side.wrapInner($('<div/>').addClass(this.classes.contentClass));

        this.$content = $side.find('.' + this.classes.contentClass).css({
            position: 'absolute',
            top: 0,
            width: '100%'
        });
        this.isOverSide = false;
        this.hasBar = true;
        this.initLayout();
        this.initEvent();
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
        initLayout: function() {
            this.height = this.$content.height();
            this.wHeight = document.body.clientHeight;

            if (this.options.adjust > 0) {
                this.wHeight = this.wHeight - this.options.adjust;
            }
            this.max = this.height - this.wHeight;

            if (this.offset !== 0) {
                this.move(this.offset, true);
            }
            this.initBarLayout();

        },

        initBarLayout: function() {

            var $side = this.$side,
                options = this.options,
                height = this.height,
                wHeight = this.wHeight;

            if (typeof this.$bar === 'undefined') {
                this.$bar = this.$side.find('.' + this.classes.barClass);

                if (this.$bar.length === 0) {
                    this.$bar = $(options.barTmpl.replace(/\{\{scrollbar\}\}/g, this.classes.barClass).replace(/\{\{handle\}\}/g, this.classes.handleClass));
                    this.$bar.appendTo($side);
                }

                this.$bar.asScrollbar({
                    barLength: options.barLength,
                    handleLength: options.handleLength,
                    namespace: options.namespace,
                    skin: options.skin,
                    mousewheel: options.delta,
                    barClass: options.barClass,
                    handleClass: options.handleClass,
                    showOnHover: false
                });
            }

            var $scrollbar = this.$scrollbar = this.$bar.data('asScrollbar'),
                $bar = this.$bar,
                bar = $bar[0];

            if (options.adjust > 0) {
                $scrollbar.setBarLength(this.wHeight);
            }
            if (height > wHeight) {
                this.$bar.css('visibility', 'hidden').show();
                $scrollbar.setHandleLength(bar.clientHeight * wHeight / height);
                if (this.offset) {
                    $scrollbar.handleMove(this.offset, true);
                }
                this.$bar.css('visibility', 'visible');
                this.hasBar = true;
                this.hideBar();
            } else {
                this.hasBar = false;
                this.hideBar();
            }
        },

        initEvent: function() {
            var self = this,
                $scrollbar = this.$scrollbar,
                $bar = this.$bar,
                $content = this.$content,
                $side = this.$side;

            $content.on('mousewheel', function(e, delta) {

                var offset = self.getOffset();

                offset = offset + self.options.mousewheel * delta;

                offset = self.move(offset);
                var percent = -offset / self.max;
                self.$content.trigger(self.eventName('change'), [percent, 'content']);
            });

            $bar.on('mousedown', function(e) {
                self.$side.css({
                    '-moz-user-focus': 'ignore',
                    '-moz-user-input': 'disabled',
                    '-moz-user-select': 'none'
                });

                $(document).one(self.eventName('mouseup blur'), function() {
                    self.$side.css({
                        '-moz-user-focus': 'inherit',
                        '-moz-user-input': 'inherit',
                        '-moz-user-select': 'inherit'
                    });
                    self.hideBar();
                });
            });
            $side.on(self.eventName('change'), function(e, value, type) {
                if (type === 'bar') {
                    self.move(value, true);
                } else if (type === 'content') {
                    self.$bar.data('asScrollbar').handleMove(value, true);
                }

                $side.addClass('is-scrolled');

                if (value === 0) {
                    $side.removeClass('is-scrolled');
                    self.$side.trigger(self.eventName('hitstart'));
                } else if (value === 1) {
                    self.$side.trigger(self.eventName('hitend'));
                }
                self.offset = value;
            });

            $side.on('mouseenter', function() {
                self.isOverContainer = true;
                self.showBar();
            });
            $side.on('mouseleave', function() {
                self.isOverContainer = false;
                self.hideBar();
            });

            $(window).resize(function() {

                self.initLayout();
            });

        },

        getOffset: function() {
            return parseInt(this.$content.css('top').replace('px', ''), 10);
        },

        move: function(value, isPercent) {

            if (isPercent) {
                if (value > 1 || value < 0) {
                    return false;
                }
                value = -value * this.max;
            } else {
                if (value > 0) {
                    value = 0;
                } else if (value < -this.max) {
                    value = -this.max;
                }
            }

            if (this.getOffset() !== value) {
                this.$content.css('top', value);
                return value;
            }

            return false;
        },

        showBar: function() {
            if (this.hasBar) {
                this.$bar.show();
            }
        },
        hideBar: function() {
            if (this.options.showOnhover && this.hasBar) {
                if (!this.isOverContainer && !this.$scrollbar.isDrag) {
                    this.$bar.hide();
                }
            }
        },

        destory: function() {
            this.$bar.remove();
            this.$side.html(this.$content.html());
            this.$side.removeData(pluginName);
        }
    };

    Plugin.defaults = {
        skin: false,
        mousewheel: 10,
        barLength: false,
        handleLength: false,
        showOnhover: true,
        namespace: 'asScrollable',
        barTmpl: '<div class="{{scrollbar}}"><div class="{{handle}}"></div></div>',
        barClass: 'scrollbar',
        handleClass: 'handle',
        contentClass: 'content',
        adjust: 0
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
