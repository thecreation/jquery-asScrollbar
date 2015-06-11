# asScrollbar

A jquery plugin that generate a styleable scrollbar.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/amazingSurge/jquery-asScrollbar/master/dist/jquery-asScrollbar.min.js
[max]: https://raw.github.com/amazingSurge/jquery-asScrollbar/master/dist/jquery-asScrollbar.js

In your web page:

```html
<div class="example"></div>

<script src="jquery.js"></script>
<script src="dist/jquery-asScrollbar.min.js"></script>
<script>
jQuery(function($) {
  	$('.example').asScrollbar({
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
	}); 
});
</script>
```