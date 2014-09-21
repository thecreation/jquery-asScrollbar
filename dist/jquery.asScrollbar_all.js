/*! jQuery plugin - v0.1.1 - 2014-08-29
* https://github.com/amazingSurge/jquery-asScrollbar
* Copyright (c) 2014 amazingSurge; Licensed GPL */
(function($, document, window, undefined) {
    "use strict";

    var pluginName = 'asScrollbar';

    var Plugin = $[pluginName] = function(options, bar) {
        var oriAttr,
            $bar = this.$bar = $(bar),
            options = this.options = $.extend({}, Plugin.defaults, options || {});
        this.classes = {
            barClass: options.namespace + '-' + options.barClass,
            handleClass: options.namespace + '-' + options.handleClass,
            directionClass: options.namespace + '-' + options.direction
        };

        if (options.skin) {
            this.classes.skinClass = options.namespace + '-' + options.skin;
        }


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
            bar = this.$bar[0],
            handle = $handle[0];

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
        direction: 'vertical', //if it's 0, scroll orientation is 'horizontal',else scroll orientation is 'vertical'.
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
                $bar = this.$bar,
                $handle = this.$handle;

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
                            var oriAttr = self.oriAttr,
                                bLength = self.bLength;

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
                hLength = this.hLength,
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

(function($, document, window, undefined) {
     "use strict";

     var pluginName = 'asScrollable';

     var Plugin = $[pluginName] = function(options, container) {
         var oriAttr,
             $container = this.$container = $(container);
         options = this.options = $.extend({}, Plugin.defaults, options || {});

         this.classes = {
             contentClass: options.namespace + '-' + options.contentClass,
             wrapperClass: options.namespace + '-' + options.wrapperClass,
             barClass: options.namespace + '-' + options.barClass,
             handleClass: options.namespace + '-' + options.handleClass,
             directionClass: options.namespace + '-' + options.direction,
			 scrollableClass : options.namespace + '-' + options.scrollableClass
         };

         if (options.skin) {
             this.classes.skinClass = options.namespace + '-' + options.skin;
         }

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

         //var $content = this.$content = $container.children().first();
         var $content = this.$content = $container.find('.' + this.classes.contentClass);

         if ($content.length === 0) {
             $container.wrapInner('<div class="' + this.classes.contentClass + '"/>');
             $content = this.$content = $container.find('.' + this.classes.contentClass);
         }

         var $wrapper = this.$wrapper = $container.find('.' + this.classes.wrapperClass);
         if ($wrapper.length === 0) {
             $content.wrap('<div class="' + this.classes.wrapperClass + '"/>');
             $wrapper = this.$wrapper = $content.parents('.' + this.classes.wrapperClass);
         }

         $container.css({
             'overflow': 'hidden',
             'position': 'relative'
         })

         if (options.skin) {
             $container.addClass(this.classes.skinClass);
         }


         $wrapper.css(oriAttr.overflow, 'scroll');

         $content.css('overflow', 'hidden')
             .css(oriAttr.crossSize, 'auto');

         this.origPosition = 0;
         this.origHanlePosition = 0;

         this.initLayout();
         this.initEvent();
     };

     Plugin.defaults = {
         contentClass: 'content',
         wrapperClass: 'wrapper',
         barClass: 'scrollbar',
		 scrollableClass : 'is-scrollable',
         barTmpl: '<div class="{{scrollbar}}"><div class="{{handle}}"></div></div>',
         handleClass: 'handle',
         direction: 'vertical', //if it's 0, scroll orientation is 'horizontal',else scroll orientation is 'vertical'.
         namespace: 'asScrollable',
         mousewheel: 10,
         skin: false,
         responsive: false,
         showOnhover: true
     };

     Plugin.prototype = {
         constructor: Plugin,
         initLayout: function() {
             var $wrapper = this.$wrapper,
                 wrapper = $wrapper[0],
                 $container = this.$container,
                 oriAttr = this.oriAttr;

             $wrapper.css(oriAttr.crossSize, wrapper.parentNode[oriAttr.crossClient] + wrapper[oriAttr.crossOffset] - wrapper[oriAttr.crossClient] + 'px');

             if (this.options.direction === 'horizontal') {
                 $container.css('height', $container.height());
             } else {
                 $wrapper.css('height', $container.height());
             }
             this.isOverContainer = false;
             this.hasBar = true;
             this.initBarLayout();
             $container.trigger(this.eventName('initLayout'));
         },
         initBarLayout: function() {
             var oriAttr = this.oriAttr,
                 options = this.options,
                 $wrapper = this.$wrapper,
                 wrapper = this.$wrapper[0],
                 content = this.$content[0];

             if (typeof this.$bar === 'undefined') {
                 this.$bar = this.$container.find('.' + this.classes.barClass);

                 if (this.$bar.length === 0) {
                     this.$bar = $(options.barTmpl.replace(/\{\{scrollbar\}\}/g, this.classes.barClass).replace(/\{\{handle\}\}/g, this.classes.handleClass));
                     this.$bar.appendTo($wrapper);
                 }

                 this.$bar.asScrollbar({
                     namespace: options.namespace,
                     skin: options.skin,
                     barClass: options.barClass,
                     handleClass: options.handleClass
                 });
             }

             var $scrollbar = this.$scrollbar = this.$bar.data('asScrollbar'),
                 $bar = this.$bar,
                 bar = $bar[0],
                 contentLength = content[oriAttr.offset],
                 wrapperLength = wrapper[oriAttr.client];

             if (contentLength - wrapperLength > 0) {
                 this.$bar.css('visibility', 'hidden').show();
                 $scrollbar.setHandleLength(bar[oriAttr.client] * wrapperLength / contentLength);
                 this.$bar.css('visibility', 'visible');
                 var percent = this.getPercentOffset();

                 var hPosition = percent * $scrollbar.bLength;

                 if (hPosition !== 0) {
                     $scrollbar.handleMove(hPosition, false);
                 }

                 this.hasBar = true;
				 this.$wrapper.addClass(this.classes.scrollableClass);
                 this.hideBar();
             } else {
                 this.hasBar = false;
				 this.$wrapper.removeClass(this.classes.scrollableClass);
                 this.hideBar();
             }
         },

         initEvent: function() {
             var self = this,
                 $wrapper = this.$wrapper,
                 $container = this.$container,
                 $bar = this.$bar;

             $wrapper.on('scroll', function() {
                 var percent = self.getPercentOffset();
                 $(this).trigger(self.eventName('change'), [percent, 'content']);
             });

             $bar.on('mousedown', function(e) {

                 self.$container.css({
                     'user-focus': 'ignore',
                     'user-input': 'disabled',
                     'user-select': 'none'
                 });

                 $(document).one(self.eventName('mouseup blur'), function() {
                     self.$container.css({
                         'user-focus': 'inherit',
                         'user-input': 'inherit',
                         'user-select': 'inherit'
                     });
                     self.hideBar();
                 });
             });

             $container.on(this.eventName('change'), function(e, value, type) {
                 if (type === 'bar') {
                     self.move(value, true);
                 } else if (type === 'content') {
                     self.$bar.data('asScrollbar').handleMove(value, true);
                 }

                 $container.addClass('is-scrolled');

                 if (value === 0) {
                     $container.removeClass('is-scrolled');
                     self.$container.trigger(self.eventName('hitstart'));
                 } else if (value === 1) {
                     self.$container.trigger(self.eventName('hitend'));
                 }
             });

             $container.on('mouseenter', function() {
                 self.isOverContainer = true;
                 self.showBar();
             });
             $container.on('mouseleave', function() {
                 self.isOverContainer = false;
                 self.hideBar();
             });
             if (this.options.responsive) {
                 $(window).resize(function() {
                     self.initLayout();
                 });
             }
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
             } else if (!this.hasBar) {
                 this.$bar.hide();
             }
         },

         getContentOffset: function() {
             var oriAttr = this.oriAttr,
                 wrapper = this.$wrapper[0];

             return (wrapper[oriAttr.pageOffset] || wrapper[oriAttr.scroll]);
         },
         getPercentOffset: function() {
             var oriAttr = this.oriAttr,
                 wrapper = this.$wrapper[0],
                 content = this.$content[0];
             return this.getContentOffset() / (content[oriAttr.client] - wrapper[oriAttr.offset]);
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
         move: function(value, isPercent) {
             var oriAttr = this.oriAttr,
                 wrapper = this.$wrapper[0],
                 content = this.$content[0];
             if (isPercent) {
                 if (value > 1 || value < 0) {
                     return false;
                 }

                 value = -value * (wrapper[oriAttr.offset] - content[oriAttr.client]);
             }

             wrapper[oriAttr.scroll] = value;
         },
         destory: function() {
             this.$bar.remove();
             this.$container.html(this.$content.html());
             this.$container.removeData(pluginName);
         }
     }

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
                 } else {
                     $(this).data(pluginName).initLayout();
                 }
             });

         }
         return this;
     };

 })(jQuery, document, window);

(function($, document, window, undefined) {
    "use strict";

    var pluginName = 'asScrollSide';

    var Plugin = $[pluginName] = function(options, side) {
        var $side = this.$side = $(side),
            options = this.options = $.extend({}, Plugin.defaults, options || {});

        this.classes = {
            barClass: options.namespace + '-' + options.barClass,
            handleClass: options.namespace + '-' + options.handleClass,
            contentClass: options.namespace + '-' + options.contentClass,
			scrollableClass : options.namespace + '-' + options.scrollableClass
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
        this.isOverContainer = false;
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
				this.$wrapper.addClass(this.classes.scrollableClass);
                this.hideBar();
            } else {
                this.hasBar = false;
				this.$wrapper.removeClass(this.classes.scrollableClass);
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

                if (self.wHeight > self.height) return;
                var offset = self.getOffset();

                offset = offset + self.options.mousewheel * delta;

                offset = self.move(offset);

                if (offset !== false) {
                    var percent = -offset / self.max;
                    self.$content.trigger(self.eventName('change'), [percent, 'content']);
                }
            });

            $bar.on('mousedown', function(e) {
                self.$side.css({
                    'user-focus': 'ignore',
                    'user-input': 'disabled',
                    'user-select': 'none'
                });

                $(document).one(self.eventName('mouseup blur'), function() {
                    self.$side.css({
                        'user-focus': 'inherit',
                        'user-input': 'inherit',
                        'user-select': 'inherit'
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
            } else if (!this.hasBar) {
                this.$bar.hide();
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
		scrollableClass : 'is-scrollable',
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