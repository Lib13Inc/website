// Contact form: POSTs JSON to the endpoint in the form's data-endpoint attribute.
// The endpoint is a separate service (not part of this static site).
// The form stays hidden, and the email fallback paragraph shows, until data-endpoint is set.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  if (form.getAttribute('data-endpoint')) {
    form.hidden = false;
    var fallback = document.getElementById('contact-fallback');
    if (fallback) fallback.hidden = true;
  }
  var status = document.getElementById('contact-status');
  var button = form.querySelector('button[type="submit"]');

  function show(message, ok) {
    status.textContent = message;
    status.className = 'contact-status ' + (ok ? 'is-ok' : 'is-error');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      show('This form is not connected yet.', false);
      return;
    }
    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    if (data.website) return; // honeypot: bots fill the hidden field
    button.disabled = true;
    show('Sending...', true);
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error('bad status ' + res.status);
      form.reset();
      show('Thanks. We will reply within one business day.', true);
    }).catch(function () {
      show('Something went wrong. Please try again in a moment.', false);
    }).then(function () {
      button.disabled = false;
    });
  });
})();
