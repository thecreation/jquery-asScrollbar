 /*
  * asScrollable
  * https://github.com/amazingSurge/jquery-asScrollable
  *
  * Copyright (c) 2014 amazingSurge
  * Licensed under the GPL license.
  */

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
         })

         if(options.skin){
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
                    namespace:options.namespace,
                    skin:options.skin,
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
                this.$bar.css('visibility','hidden').show();
                 $scrollbar.setHandleLength(bar[oriAttr.client] * wrapperLength / contentLength);
                this.$bar.css('visibility','visible');
                 var percent = this.getPercentOffset();
                     
                 var hPosition = percent * $scrollbar.bLength;
                     
                if (hPosition !== 0) {
                    $scrollbar.handleMove(this.hPosition, false);
                }
                 
                 this.hasBar = true;
                 this.hideBar();
             } else {
                 this.hasBar = false;
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
                    '-moz-user-focus': 'ignore',
                    '-moz-user-input': 'disabled',
                    '-moz-user-select': 'none'
                });

                 $(document).one(self.eventName('mouseup blur'), function() {
                     self.$container.css({
                         '-moz-user-focus': 'inherit',
                         '-moz-user-input': 'inherit',
                         '-moz-user-select': 'inherit'
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

