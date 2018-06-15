(function(window) {
	(function(window){
		window.__parseFunction = function(__func, __attrs) {
			__attrs = __attrs || [];
			__func = '(function(' + __attrs.join(',') + '){' + __func + '})';
			return window.execScript ? window.execScript(__func) : eval(__func);
		}
	}(window));
	(function(window){
		function addEvent(el, event, handler) {
			var events = event.split(/\s+/);
			for (var i = 0; i < events.length; i++) {
				if (el.addEventListener) {
					el.addEventListener(events[i], handler);
				} else {
					el.attachEvent('on' + events[i], handler);
				}
			}
		}
		function removeEvent(el, event, handler) {
			var events = event.split(/\s+/);
			for (var i = 0; i < events.length; i++) {
				if (el.removeEventListener) {
					el.removeEventListener(events[i], handler);
				} else {
					el.detachEvent('on' + events[i], handler);
				}
			}
		}
		function getCssProperty(el, prop) {
			if (window.getComputedStyle) {
				return window.getComputedStyle(el, '').getPropertyValue(prop) || null;
			} else if (el.currentStyle) {
				return el.currentStyle[prop] || null;
			}
			return null;
		}
		function initWidget(widgetEl) {
			var widgetId, widgetElId, existsEl,
				src, styles = {}, allowedAttrs = [],
				defWidth, defHeight;
			if (!widgetEl.tagName ||
				!(widgetEl.tagName.toUpperCase() == 'SCRIPT' ||
				  widgetEl.tagName.toUpperCase() == 'BLOCKQUOTE' &&
				  widgetEl.classList.contains('telegram-post'))) {
				return null;
			}
			if (widgetId = widgetEl.getAttribute('data-telegram-post')) {
				widgetElId = 'telegram-post-' + widgetId.replace(/[^a-z0-9_]/ig, '-');
				src = 'embed/index.html#' + widgetId + '';
				allowedAttrs = ['userpic', 'single?'];
				defWidth = widgetEl.getAttribute('data-width') || '100%';
				defHeight = '';
				styles.minWidth = '300px';
			}
			else {
				return null;
			}
			existsEl = document.getElementById(widgetElId);
			if (existsEl) {
				return existsEl;
			}
			for (var i = 0; i < allowedAttrs.length; i++) {
				var attr = allowedAttrs[i];
				var novalue = attr.substr(-1) == '?';
				if (novalue) {
					attr = attr.slice(0, -1);
				}
				var data_attr = 'data-' + attr.replace(/_/g, '-');
				if (widgetEl.hasAttribute(data_attr)) {
					var attr_value = novalue ? '1' : encodeURIComponent(widgetEl.getAttribute(data_attr));
					src += '&' + attr + '=' + attr_value;
				}
			}
			function visibilityHandler() {
				try {
					if (isVisible(iframe, 50)) {
						var data = {event: 'visible', frame: widgetElId};
						iframe.contentWindow.postMessage(JSON.stringify(data), '*');
						var currentHeight = iframe.contentDocument.scrollingElement.offsetHeight;
						if (currentHeight != 0) {
							if (iframe.clientHeight != currentHeight) {
								iframe.style.height = '' + currentHeight + 'px';
							}
						}
					}
				} catch(e) {}
			}
			var iframe = document.createElement('iframe');
			iframe.id = widgetElId;
			iframe.src = src;
			iframe.width = defWidth;
			iframe.height = defHeight;
			iframe.setAttribute('frameborder', '0');
			iframe.setAttribute('scrolling', 'no');
			iframe.style.border = 'none';
			iframe.style.overflow = 'hidden';
			for (var prop in styles) {
				iframe.style[prop] = styles[prop];
			}
			if (widgetEl.parentNode) {
				widgetEl.parentNode.insertBefore(iframe, widgetEl);
				if (widgetEl.tagName.toUpperCase() == 'BLOCKQUOTE') {
					widgetEl.parentNode.removeChild(widgetEl);
				}
			}
			addEvent(iframe, 'load', function() {							
				removeEvent(iframe, 'load', visibilityHandler);
				addEvent(window, 'scroll', visibilityHandler);
				addEvent(window, 'resize', visibilityHandler);
				visibilityHandler();
				setTimeout(visibilityHandler, 500);
				setTimeout(visibilityHandler, 1000);
				setTimeout(visibilityHandler, 2000);
			});
			return iframe;
		}
		function isVisible(el, padding) {
			var node = el, val;
			var visibility = getCssProperty(node, 'visibility');
			if (visibility == 'hidden') return false;
			while (node) {
				if (node === document.documentElement) break;
				var display = getCssProperty(node, 'display');
				if (display == 'none') return false;
				var opacity = getCssProperty(node, 'opacity');
				if (opacity !== null && opacity < 0.1) return false;
				node = node.parentNode;
			}
			if (el.getBoundingClientRect) {
				padding = +padding || 0;
				var rect = el.getBoundingClientRect();
				var html = document.documentElement;
				if (rect.bottom < padding ||
					rect.right < padding ||
					rect.top > (window.innerHeight || html.clientHeight) - padding ||
					rect.left > (window.innerWidth || html.clientWidth) - padding) {
					return false;
				}
			}
			return true;
		}
		if (!document.currentScript ||
			!initWidget(document.currentScript)) {
			var widgets;
			if (document.querySelectorAll) {
				widgets = document.querySelectorAll('script[data-telegram-post],blockquote.telegram-post,script[data-telegram-login]');
			} else {
				widgets = Array.prototype.slice.apply(document.getElementsByTagName('SCRIPT'));
				widgets = widgets.concat(Array.prototype.slice.apply(document.getElementsByTagName('BLOCKQUOTE')));
			}
			for (var i = 0; i < widgets.length; i++) {
				initWidget(widgets[i]);
			}
		}

	}(window));
})(window);