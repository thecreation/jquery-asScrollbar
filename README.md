# [jQuery asScrollbar](https://github.com/amazingSurge/jquery-asScrollbar) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![license]](LICENSE)

> A jquery plugin that generate a styleable scrollbar.

## Table of contents
- [Main files](#main-files)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Options](#options)
- [Methods](#methods)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Bugs and feature requests](#bugs-and-feature-requests)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asScrollbar.js
└── jquery-asScrollbar.min.js
```

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/amazingSurge/jquery-asScrollbar/master/dist/jquery-asScrollbar.min.js
[max]: https://raw.github.com/amazingSurge/jquery-asScrollbar/master/dist/jquery-asScrollbar.js

### Install From Bower
    bower install jquery-asScrollbar --save

### Install From Npm
    npm install jquery-asScrollbar --save

### Build From Source
If you want build from source:

    git clone git@github.com:amazingSurge/jquery-asScrollbar.git
    cd jquery-asScrollbar
    npm install
    npm install -g gulp-cli babel-cli
    gulp build

Done!

## Usage
Include files:

```html
<script src="/path/to/jquery.js"></script><!-- jQuery is required -->
<script src="/path/to/jquery-asScrollbar.js"></script>
```

In your web page:

```html
<div class="example"></div>

<script>
jQuery(function($) {
  $('.example').asScrollbar(); 
});
</script>
```

## Options
```
{
  namespace: 'asScrollbar',

  skin: null,
  handleSelector: null,
  handleTemplate: '<div class="{{handle}}"></div>',

  barClass: null,
  handleClass: null,

  disabledClass: 'is-disabled',
  draggingClass: 'is-dragging',
  hoveringClass: 'is-hovering',

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
  mousewheelSpeed: 50,

  keyboard: true,

  useCssTransforms3d: true,
  useCssTransforms: true,
  useCssTransitions: true,

  duration: '500',
  easing: 'ease' // linear, ease-in, ease-out, ease-in-out
}
```

## Methods
### moveTo(position)
Move the scrollbar handle to the position.
```js
// move to 50px
$().asScrollbar('moveTo', '50');

// move to 50%
$().asScrollbar('moveTo', '50%');
```

### moveBy(size)
Move the scrollbar handle by the size.
```js
$().asScrollbar('moveBy', '10');
$().asScrollbar('moveBy', '10%');

$().asScrollbar('moveBy', '-10');
$().asScrollbar('moveBy', '-10%');
```

### enable()
Enable the scrollbar functions.
```js
$().asScrollbar('enable');
```

### disable()
Disable the scrollbar functions.
```js
$().asScrollbar('disable');
```

### destroy()
Destroy the scrollbar instance.
```js
$().asScrollbar('destroy');
```

## No conflict
If you have to use other plugin with the same namespace, just call the `$.fn.asScrollbar.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asScrollbar.js"></script>
<script>
  $.fn.asScrollbar.noConflict();
  // Code that uses other plugin's "$().asScrollbar" can follow here.
</script>
```

## Browser support
Browser           | support
----------------- | -------
Chrome            | latest
Firefox           | latest
Safari            | latest
Opera             | latest
Edge              | latest
Internet Explorer | 8+

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Bugs and feature requests
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of jquery-asScrollbar before submitting an issue.

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asScrollable.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asScrollbar/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asScrollbar.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asScrollbar
[license]: https://img.shields.io/npm/l/jquery-asScrollbar.svg?style=flat
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asScrollbar.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asScrollbar
