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
				verticalBarClass : options.namespace + '-' + options.verticalBarClass,
				horizontalBarClass : options.namespace + '-' + options.horizontalBarClass,
				handleClass: options.namespace + '-' + options.handleClass,
				directionClass: options.namespace + '-' + options.direction,
				scrollableClass: options.namespace + '-' + options.scrollableClass
			};

			this.oriAttr = {
				'vertical' : {//Vertical
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
				},
				'horizontal' :  { // Horizontal
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
				}
			};

			if (options.skin) {
				this.classes.skinClass = options.namespace + '-' + options.skin;
			}

			var $content = this.$content = $container.find('.' + this.classes.contentClass);

			if ($content.length === 0) {
				$container.wrapInner('<div class="' + this.classes.contentClass + '"/>');
				$content = this.$content = $container.find('.' + this.classes.contentClass);
			}

			$content.css({
				'overflow' : 'hidden'
			});

			var $wrapper = this.$wrapper = $container.find('.' + this.classes.wrapperClass);
			if ($wrapper.length === 0) {
				$content.wrap('<div class="' + this.classes.wrapperClass + '"/>');
				$wrapper = this.$wrapper = $content.parents('.' + this.classes.wrapperClass);
			}

			$wrapper.css('overflow', 'hidden');

			$container.css({
				'overflow': 'hidden',
				'position': 'relative'
			});

			if (options.skin) {
				$container.addClass(this.classes.skinClass);
			}

			this.origPosition = 0;
			this.origHanlePosition = 0;
			
			if (options.direction === 'horizontal' || options.direction === 'vertical') {
				this.initLayout(options.direction);
			}else{
				this.initLayout('vertical');
				this.initLayout('horizontal');
			}
     };

     Plugin.defaults = {
         contentClass: 'content',
         wrapperClass: 'wrapper',
         barClass: 'scrollbar',
		 verticalBarClass: 'vertical-bar',
		 horizontalBarClass: 'horizontal-bar',
         scrollableClass: 'is-scrollable',
         barTmpl: '<div class="{{scrollbar}}"><div class="{{handle}}"></div></div>',
         handleClass: 'handle',
         direction: 'vertical', //if it's 0, scroll orientation is 'horizontal',else scroll orientation is 'vertical', will add auto.
         namespace: 'asScrollable',
         mousewheel: 10,
         duration: 500,
         skin: false,
         responsive: false,
         showOnhover: false,
         toOffset: 50
     };

     Plugin.prototype = {
         constructor: Plugin,
		 initLayout: function(direction) {
			 var $wrapper = this.$wrapper,
				 wrapper = $wrapper[0],
				 $container = this.$container,
				 options = this.options,
				 oriAttr = this.oriAttr[direction];

			 
			 if (direction === 'horizontal') {
                 $container.css('height', $container.height());
             } else {
                 $wrapper.css('height', $container.height());
             }

			 $wrapper.css(oriAttr.overflow, 'scroll');
			 $wrapper.css(oriAttr.crossSize, wrapper.parentNode[oriAttr.crossClient] + wrapper[oriAttr.crossOffset] - wrapper[oriAttr.crossClient] + 'px');

			 this.initBarLayout(direction);
		 },

		 initBarLayout : function(direction){
			 var oriAttr = this.oriAttr[direction],
                 options = this.options,
                 $wrapper = this.$wrapper,
                 wrapper = this.$wrapper[0],
                 content = this.$content[0],
				 $bar;

			 if (typeof this['$'+direction+'Bar'] === 'undefined') {
				 $bar = this['$'+direction+'Bar']  = this.$container.find('.' + this.classes[direction+'BarClass']);

                 if ($bar.length === 0) {
                     $bar = $(options.barTmpl.replace(/\{\{scrollbar\}\}/g, this.classes.barClass).replace(/\{\{handle\}\}/g, this.classes.handleClass));
                     $bar.appendTo($wrapper);
                 }

                 $bar.asScrollbar({
                     namespace: options.namespace,
                     skin: options.skin,
                     barClass: options.barClass,
					 directionClass : options[direction+'BarClass'],
                     handleClass: options.handleClass,
					 direction : direction
                 });
			 }

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
