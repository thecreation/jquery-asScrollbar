/*! jQuery plugin - v0.1.1 - 2014-08-07
* https://github.com/amazingSurge/jquery-asScrollbar
* Copyright (c) 2014 amazingSurge; Licensed GPL */
(function($, document, window, undefined) {
     "use strict";

     var pluginName = 'asScrollbar';

     var Plugin = $[pluginName] = function(options, container) {
         var oriAttr,
             $container = this.$container = $(container);
         options = this.options = $.extend({}, Plugin.defaults, options || {});

         this.classes = {
             contentClass: options.namespace + '-' + options.contentClass,
             wrapperClass: options.namespace + '-' + options.wrapperClass,
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
         }).addClass(this.classes.skinClass);


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
             this.isClick = false;
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

                 this.$bar.addClass(this.classes.directionClass).attr('draggable', false);
             }

             var $handle = this.$handle = this.$bar.find('.' + this.classes.handleClass),
                 bar = this.$bar[0],
                 handle = this.$handle[0];

             var contentLength = content[oriAttr.offset],
                 wrapperLength = wrapper[oriAttr.client];

             if (contentLength - wrapperLength > 0) {
                 $handle.css(oriAttr.size, bar[oriAttr.client] * wrapperLength / contentLength);
                 if (typeof this.bLength === 'undefined') {
                     this.hLength = handle[oriAttr.client];
                     this.bLength = bar[oriAttr.client] - this.hLength;

                     var percent = this.getPercentOffset();
                     this.hPosition = percent * this.bLength;
                     if (this.hPosition !== 0) {
                         this.handleMove(this.hPosition, false);
                     }
                 } else {
                     var origLength = this.bLength;
                     this.hLength = handle[oriAttr.client];
                     var newLength = this.bLength = bar[oriAttr.client] - this.hLength;
                     var hPosition = this.getHanldeOffset();

                     if (hPosition !== 0) {
                         hPosition = hPosition * newLength / origLength;

                         if (hPosition > newLength) {
                             hPosition = newLength;
                         }

                         this.$handle.css(oriAttr.pos, hPosition);
                     }
                 }

                 this.hasBar = true;
                 this.$bar.hide();
             } else {
                 this.hasBar = false;
                 this.$bar.hide();
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

             $bar.on('mousedown', function(e) {
                 var oriAttr = self.oriAttr,
                     bLength = self.bLength,
                     hLength = self.hLength,
                     $handle = self.$handle;
                 self.isClick = true;
                 self.hPosition = self.getHanldeOffset();
                 if ($(e.target).is($handle)) {
                     self.dragStart = e[oriAttr.mouseAttr];
                     self.isDrag = true;
                     $handle.addClass('is-drag');
                     self.$bar.trigger(self.eventName('dragstart'));

                     $(document).on(self.eventName('selectstart'), function() {
                         return false;
                     });

                     self.$container.css({
                         '-moz-user-focus': 'ignore',
                         '-moz-user-input': 'disabled',
                         '-moz-user-select': 'none'
                     });

                     $(document).on(self.eventName('mousemove'), function(e) {
                         if (self.isDrag) {
                             var oriAttr = self.oriAttr,
                                 bLength = self.bLength;

                             var stop = e[oriAttr.mouseAttr],
                                 start = self.dragStart;

                             var distance = self.hPosition + stop - start;

                             if (distance < 0) {
                                 distance = 0;
                             } else if (distance > bLength) {
                                 distance = bLength;
                             }
                             self.handleMove(distance, false, true);
                         }
                     });
                 } else {
                     var offset = e[oriAttr.mouseAttr] - self.$bar.offset()[oriAttr.pos] - hLength / 2;

                     if (offset < 0) {
                         offset = 0;
                     } else if (offset > bLength) {
                         offset = bLength;
                     }

                     self.handleMove(offset, false, true);
                 }
                 $(document).one(self.eventName('mouseup blur'), function() {
                     self.$handle.removeClass('is-drag');
                     self.$bar.trigger('dragend.' + self.options.namespace);
                     self.isDrag = false;
                     $(document).off(self.eventName('selectstart mousemove'));

                     self.$container.css({
                         '-moz-user-focus': 'inherit',
                         '-moz-user-input': 'inherit',
                         '-moz-user-select': 'inherit'
                     });
                     self.isClick = false;
                     self.hideBar();
                 });
             });

             $container.on(this.eventName('change'), function(e, value, type) {
                 if (type === 'bar') {
                     self.move(value, true);
                 } else if (type === 'content') {
                     self.handleMove(value, true);
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
                 if (!this.isOverContainer && !this.isClick) {
                     this.$bar.hide();
                 }
             }
         },
         getHanldeOffset: function() {
             return parseInt(this.$handle.css(this.oriAttr.pos).replace('px', ''), 10);
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
         handleMove: function(value, isPercent, trigger) {
             var percent, $handle = this.$handle,
                 params = {},
                 bLength = this.bLength,
                 oriAttr = this.oriAttr,
                 $bar = this.$bar;

             if (isPercent) {
                 percent = value;
                 value = value * bLength;
             } else {
                 if (value < 0) {
                     value = 0;
                 } else if (value > bLength) {
                     value = bLength;
                 }
                 percent = value / bLength;
             }

             params[oriAttr.pos] = value;

             $handle.css(params);

             if (trigger) {
                 $bar.trigger(this.eventName('change'), [percent, 'bar']);
             }
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
