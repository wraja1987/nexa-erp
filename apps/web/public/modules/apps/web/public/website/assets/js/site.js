(function(){
  function buildHeaderHtml(){
    return '<header class="site-header">\n'
      + '  <div class="header-inner">\n'
      + '    <a class="logo" href="/website/"><img src="/website/assets/img/logo.svg" alt="Nexa"></a>\n'
      + '    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-nav">\n'
      + '      <span></span><span></span><span></span>\n'
      + '    </button>\n'
      + '    <nav class="primary-nav" id="primary-nav">\n'
      + '      <a href="/website/modules.html">Modules</a>\n'
      + '      <a href="/website/pricing.html">Pricing</a>\n'
      + '      <a href="/website/resources.html">Resources</a>\n'
      + '      <a href="/website/security.html">Security</a>\n'
      + '      <a href="/website/about.html">About</a>\n'
      + '      <a href="/website/contact.html">Contact</a>\n'
      + '    </nav>\n'
      + '    <div class="header-cta">\n'
      + '      <a class="btn" href="https://app.nexaai.co.uk/login" rel="nofollow noopener">Login</a>\n'
      + '    </div>\n'
      + '  </div>\n'
      + '</header>';
  }

  function buildFooterHtml(){
    return '<footer class="site-footer">\n'
      + '  <div class="footer-inner">\n'
      + '    <div class="footer-brand">\n'
      + '      <a class="logo" href="/website/"><img src="/website/assets/img/logo.svg" alt="Nexa"></a>\n'
      + '      <p class="copyright">© <span id="y"></span> Nexa</p>\n'
      + '    </div>\n'
      + '    <div class="footer-links">\n'
      + '      <div class="col">\n'
      + '        <h4>Product</h4>\n'
      + '        <a href="/website/modules.html">Modules</a>\n'
      + '        <a href="/website/pricing.html">Pricing</a>\n'
      + '        <a href="/website/resources.html">Resources</a>\n'
      + '      </div>\n'
      + '      <div class="col">\n'
      + '        <h4>Company</h4>\n'
      + '        <a href="/website/about.html">About</a>\n'
      + '        <a href="/website/security.html">Security</a>\n'
      + '        <a href="/website/contact.html">Contact</a>\n'
      + '      </div>\n'
      + '      <div class="col">\n'
      + '        <h4>Legal</h4>\n'
      + '        <a href="/website/privacy.html">Privacy</a>\n'
      + '        <a href="/website/terms.html">Terms</a>\n'
      + '        <a href="/website/status.html">Status</a>\n'
      + '      </div>\n'
      + '    </div>\n'
      + '  </div>\n'
      + '</footer>';
  }

  function replaceOrInsert(containerSelector, html, insertAtEnd){
    var existing = document.querySelector(containerSelector);
    if (existing) {
      existing.outerHTML = html;
    } else {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      var el = wrapper.firstElementChild;
      if (!el) return;
      if (insertAtEnd) {
        document.body.appendChild(el);
      } else {
        document.body.insertBefore(el, document.body.firstChild);
      }
    }
  }

  function initNavToggle(){
    var btn = document.getElementById('nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function(){
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', (!expanded).toString());
      document.documentElement.classList.toggle('nav-open');
    });
  }

  function updateYear(){
    var y = document.getElementById('y');
    if (y) y.textContent = new Date().getFullYear();
  }

  function run(){
    replaceOrInsert('header.site-header', buildHeaderHtml(), false);
    replaceOrInsert('footer.site-footer', buildFooterHtml(), true);
    initNavToggle();
    updateYear();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
