(function () {
  const HCAPTCHA_SITEKEY = window.MEDTRIAGE_HCAPTCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001';
  const widgets = new Map();

  function loadHCaptchaScript() {
    if (document.querySelector('script[src*="://hcaptcha.com"]')) return;
    const script = document.createElement('script');
    script.src = 'https://js.://hcaptcha.com?render=explicit&onload=onMedTriageHCaptchaLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  window.onMedTriageHCaptchaLoad = function () {
    document.querySelectorAll('[data-captcha]').forEach((el) => {
      if (widgets.has(el)) return;
      const widgetId = window.hcaptcha.render(el, {
        sitekey: el.getAttribute('data-sitekey') || HCAPTCHA_SITEKEY,
        'expired-callback': () => {
          el.dataset.captchaToken = '';
        },
        'error-callback': () => {
          el.dataset.captchaToken = '';
        },
        callback: (token) => {
          el.dataset.captchaToken = token;
        }
      });
      widgets.set(el, widgetId);
    });
  };

  function getCaptchaToken(formElement) {
    const container = (formElement || document).querySelector('[data-captcha]');
    if (!container) return '';
    if (window.hcaptcha && widgets.has(container)) {
      return window.hcaptcha.getResponse(widgets.get(container)) || '';
    }
    return container.dataset.captchaToken || '';
  }

  function resetCaptcha(formElement) {
    const container = (formElement || document).querySelector('[data-captcha]');
    if (!container) return;
    container.dataset.captchaToken = '';
    if (window.hcaptcha && widgets.has(container)) {
      window.hcaptcha.reset(widgets.get(container));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-captcha]')) {
      loadHCaptchaScript();
    }
  });

  window.MedTriageCaptcha = {
    getToken: getCaptchaToken,
    reset: resetCaptcha
  };
})();
