/**
 * FormPulse embeddable widget loader.
 *
 * Drop this on any website with a single script tag:
 *
 *   <script src="https://your-domain.com/widget.js"
 *           data-form-id="form-lead-gen"
 *           data-position="bottom-right"
 *           data-color="#4F46E5"
 *           async></script>
 *
 * The script is dependency-free and works on desktop and mobile. The app URL
 * is derived from the script's own `src`, so the same snippet works on any
 * deployment (localhost, staging, production) without configuration.
 */
(function () {
  'use strict';

  var script =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  if (!script) return;

  var formId = script.getAttribute('data-form-id');
  if (!formId) {
    console.warn('[FormPulse] Missing data-form-id attribute on the script tag.');
    return;
  }

  var position = script.getAttribute('data-position') || 'bottom-right';
  var primaryColor = script.getAttribute('data-color') || '#4F46E5';

  // Derive the app origin from the script URL (robust behind proxies/CDNs).
  var scriptUrl = new URL(script.src, window.location.href);
  var appBaseUrl = scriptUrl.origin;

  var launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open the conversational form');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  var isLeft = position === 'bottom-left';
  var inlineStyle =
    'position:fixed;z-index:999999;bottom:20px;' +
    (isLeft ? 'left:20px;' : 'right:20px;') +
    'width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;background:' +
    primaryColor +
    ';box-shadow:0 10px 25px -5px rgba(0,0,0,.2),0 8px 10px -6px rgba(0,0,0,.1);' +
    'transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease;';
  launcher.setAttribute('style', inlineStyle);

  var frame = document.createElement('iframe');
  frame.src = appBaseUrl + '/f/' + encodeURIComponent(formId);
  frame.title = 'FormPulse conversational form';
  frame.loading = 'lazy';
  frame.setAttribute(
    'style',
    'position:fixed;z-index:999999;bottom:90px;' +
      (isLeft ? 'left:20px;' : 'right:20px;') +
      'width:380px;height:560px;max-height:calc(100vh - 120px);max-width:calc(100vw - 40px);' +
      'border:none;border-radius:20px;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);' +
      'display:none;opacity:0;transform:translateY(10px) scale(.98);' +
      'transition:opacity .2s ease,transform .2s ease;'
  );

  var OPEN_ICON =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  var CLOSE_ICON =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  var isOpen = false;
  launcher.addEventListener('click', function () {
    isOpen = !isOpen;
    launcher.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      frame.style.display = 'block';
      window.setTimeout(function () {
        frame.style.opacity = '1';
        frame.style.transform = 'translateY(0) scale(1)';
      }, 10);
      launcher.innerHTML = CLOSE_ICON;
    } else {
      frame.style.opacity = '0';
      frame.style.transform = 'translateY(10px) scale(.98)';
      window.setTimeout(function () {
        frame.style.display = 'none';
      }, 200);
      launcher.innerHTML = OPEN_ICON;
    }
  });

  launcher.addEventListener('mouseover', function () {
    launcher.style.transform = 'scale(1.06)';
  });
  launcher.addEventListener('mouseout', function () {
    launcher.style.transform = 'scale(1)';
  });

  document.body.appendChild(launcher);
  document.body.appendChild(frame);
})();
