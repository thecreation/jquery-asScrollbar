import $ from 'jquery';
import asScrollbar from './asScrollbar';
import info from './info';

const NAMESPACE = 'asScrollbar';
const OtherAsScrollbar = $.fn.asScrollbar;

const jQueryAsScrollbar = function(options, ...args) {
  if (typeof options === 'string') {
    const method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new asScrollbar(this, options));
    }
  });
};

$.fn.asScrollbar = jQueryAsScrollbar;

$.asScrollbar = $.extend({
  setDefaults: asScrollbar.setDefaults,
  registerEasing: asScrollbar.registerEasing,
  getEasing: asScrollbar.getEasing,
  noConflict: function() {
    $.fn.asScrollbar = OtherAsScrollbar;
    return jQueryAsScrollbar;
  }
}, info);
