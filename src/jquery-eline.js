
!function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root.jQuery);
    }
}(this, function ($) {
    "use strict";

    $.eline = function ($a, $b, action, options) {
        var currentOptions = $.extend(true, {}, $.eline.options, options || {});

        switch (action) {
            case 'show':
                show();
                break;
            case 'hide':
                hide();
                break;
            default:
                show();
        }

        function show() {
            // Get Id
            var aGuid = $a.data('eline-guid');
            var bGuid = $b.data('eline-guid');
            if (!aGuid) {
                aGuid = generateGuid();
                $a.data('eline-guid', aGuid);
            }

            if (!bGuid) {
                bGuid = generateGuid();
                $b.data('eline-guid', bGuid);
            }

            // Set data
            var aData = $a.data('eline-data') || [];
            var bData = $b.data('eline-data') || [];

            for (var i = 0; i < aData.length; i++) {
                if ((aData[i].a === aGuid && aData[i].b === bGuid) ||
					(aData[i].a === bGuid && aData[i].b === aGuid)) {
                    //console.error('Line already exist');
                    return;
                }
            }

            var lineGuid = generateGuid();
            var data = {
                line: lineGuid,
                a: aGuid,
                b: bGuid,
                $a: $a,
                $b: $b
            };

            aData.push(data);
            bData.push(data);

            $a.data('eline-data', aData),
			$b.data('eline-data', bData);

            var aPosition = getPosition($a, currentOptions.aPlacement);
            var bPosition = getPosition($b, currentOptions.bPlacement);

            // Create line
            var $line = createLine(
                data,
				aPosition.x,
				aPosition.y,
				bPosition.x,
				bPosition.y
                );

            $line.addClass(currentOptions.cssClass)
				.appendTo(currentOptions.appendTo);

            currentOptions.show($line);
        }

        function hide() {
            var aData = $a.data('eline-data');
            var bData = $b.data('eline-data');

            if (!aData || !bData) return;

            for (var i = 0; i < aData.length; i++) {
                for (var j = 0; j < bData.length; j++) {
                    if (aData[i].line === bData[j].line) {
                        var $line = $('#' + aData[i].line);
                        currentOptions.hide($line);

                        $line.remove();

                        aData.splice(i, 1);
                        bData.splice(j, 1);
                    }
                }
            }
        }
    };

    function getPosition($element, placement) {
        var prefix = getPrefix(),
			offset = $element.offset(),
			width = $element.outerWidth(),
			height = $element.outerHeight(),
			xPlacement = placement.split(' ')[0],
			yPlacement = placement.split(' ')[1] || xPlacement,
			x = offset.left + prefix.left,
			y = offset.top + prefix.top;

        switch (xPlacement) {
            case 'center': x += width / 2; break;
            case 'right': x += width; break;
            case 'left': x += 0; break;
        }

        switch (yPlacement) {
            case 'center': y += height / 2; break;
            case 'top': y += 0; break;
            case 'bottom': y += height; break;
        }

        return { x: x, y: y };
    }

    function getPrefix() {
        var scrollLeft = $(window).scrollLeft();
        var scrollTop = $(window).scrollTop();
        var borderLeft = parseInt($('body').css('borderLeftWidth'), 10);
        var borderTop = parseInt($('body').css('borderTopWidth'), 10);

        // For Chrome and Opera
        return {
            left: borderLeft - scrollLeft,
            top: borderTop - scrollTop
        };

        //// For IE and FireFox
        //return {
        //    left: (borderLeft * 2) - scrollLeft,
        //    top: (borderTop * 2) - scrollTop
        //};
    }

    $.fn.eline = function ($b, action, options) {
        $.eline($(this), $b, action, options);
    };

    function createLine(data, x1, y1, x2, y2) {
        var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        var transform = 'rotate(' + angle + 'deg)';

        var $line = $('<div>')
			.css({
			    'position': 'fixed',
			    'transform': transform
			})
            .attr('id', data.line)
            .addClass('eline')
            .data('eline-data', data)
			.width(length)
			.offset({ left: x1, top: y1 })
			.hide();

        return $line;
    }

    function generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    $.eline.hideAll = function () {
        $('.eline').each(function() {
            var data = $(this).data('eline-data');

            $.eline(data.$a, data.$b, 'hide');
        });
    };

    $.eline.options = {
        appendTo: 'body',
        cssClass: 'line',
        aPlacement: 'center center',
        bPlacement: 'center center',
        show: function ($line) {
            $line.show();
        },
        hide: function ($line) {
            $line.hide();
        }
    };
});
