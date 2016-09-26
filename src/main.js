import $ from 'jquery';
import asScrollbar from './asScrollbar';
import info from './info';

const NAME = 'asScrollbar';
const OtherAsScrollbar = $.fn.asScrollbar;

$.fn.asScrollbar = function jQueryAsScrollbar(options, ...args) {
  if (typeof options === 'string') {
    return this.each(function() {
      let instance = $(this).data(NAME);
      if (!instance) {
        return false;
      }
      if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
        return false;
      }
      // apply method
      return instance[options](...args);
    });
  }

  return this.each(function() {
    if (!$(this).data(NAME)) {
      $(this).data(NAME, new asScrollbar(options, this));
    }
  });
};

$.asScrollbar = $.extend({
  setDefaults: asScrollbar.setDefaults,
  registerEasing: asScrollbar.registerEasing,
  getEasing: asScrollbar.getEasing,
  noConflict: function() {
    $.fn.asScrollbar = OtherAsScrollbar;
    return this;
  }
}, info);
