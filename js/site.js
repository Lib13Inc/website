/* Site behavior. Loaded with defer so it runs after the DOM is parsed. */

/* Google Analytics 4 (production hostnames only, so staging stays out of the data) */
(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  if (!/^(www\.)?lib13\.com$/.test(location.hostname)) return;
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-PRJ7BK6V32';
  document.head.appendChild(ga);
  gtag('js', new Date());
  gtag('config', 'G-PRJ7BK6V32');
})();

/* Outreach click events (no-ops when GA is not loaded, e.g. staging) */
(function () {
  function track(name, params) {
    if (/^(www\.)?lib13\.com$/.test(location.hostname)) window.gtag('event', name, params || {});
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.id === 'sticky-cta') track('cta_click', { location: 'sticky' });
    else if (a.id === 'top-btn') track('cta_click', { location: 'hero' });
    else if (a.classList.contains('nav-cta')) track('cta_click', { location: 'nav' });
    else if (a.id === 'book-btn' || href.indexOf('calendar.google.com') > -1) track('book_call_click');
    else if (href.indexOf('mailto:') === 0) {
      var topic = 'general';
      try { topic = decodeURIComponent((href.split('subject=')[1] || 'general')); } catch (err) {}
      track('email_click', { topic: topic });
    }
    else if (a.classList.contains('more-btn')) track('service_details', { service: a.getAttribute('data-detail') });
    else if (href.indexOf('kavach.lib13.com') > -1 || href.indexOf('github.com/Lib13Inc/kavach') > -1) track('kavach_click');
  });
})();

/* Mobile nav */
(function () {
  var burger = document.querySelector('.navbar-burger');
  var menu = burger && document.getElementById(burger.getAttribute('data-target'));
  if (!burger || !menu) return;
  function setMenu(open) {
    burger.classList.toggle('is-active', open);
    menu.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-active')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
})();

/* Persistent Book a call button: visible after the hero, hidden while the contact section is on screen */
(function () {
  var cta = document.getElementById('sticky-cta');
  var hero = document.getElementById('large-header');
  var contact = document.getElementById('contact-section');
  if (!cta || !hero || !contact || !('IntersectionObserver' in window)) return;
  var heroOut = false, contactIn = false;
  function update() {
    var show = heroOut && !contactIn;
    cta.classList.toggle('is-visible', show);
    cta.setAttribute('aria-hidden', show ? 'false' : 'true');
    cta.tabIndex = show ? 0 : -1;
  }
  new IntersectionObserver(function (en) { heroOut = !en[0].isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(function (en) { contactIn = en[0].isIntersecting; update(); }).observe(contact);
})();

/* Products rotator */
(function(){
  var root=document.getElementById('product-rotator'); if(!root) return;
  var slides=root.querySelectorAll('.rot-slide'), dots=document.getElementById('rot-dots'), i=0, timer=null;
  var reduce=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  slides.forEach(function(_,n){var b=document.createElement('button');b.className='rot-dot';b.setAttribute('aria-label','Show product '+(n+1));b.onclick=function(){go(n);};dots.appendChild(b);});
  function go(n){i=(n+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle('is-active',k===i);});[].forEach.call(dots.children,function(d,k){d.classList.toggle('on',k===i);});}
  function start(){if(reduce||timer)return;timer=setInterval(function(){go(i+1);},7000);}
  function stop(){clearInterval(timer);timer=null;}
  document.getElementById('rot-prev').onclick=function(){go(i-1);};
  document.getElementById('rot-next').onclick=function(){go(i+1);};
  root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',start);
  root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
  go(0);start();
})();

/* Service details dialog */
(function(){
  var D = {
    comp:{t:'Compliance (SOC 2, ISO 27001, HIPAA, etc.)',b:['Scoping, gap assessment, policies, hands-on remediation, and evidence collection.','Vanta partner. We also work with Drata and other platforms, and with many audit firms across SOC 2, ISO 27001, and HIPAA.','Lib13 is not a CPA firm. An independent CPA performs the SOC 2 examination, and we do not guarantee outcomes.']},
    aisec:{t:'AI and agent security',b:['Policy and approved-tools guidance for the AI your team already uses.','Agent inventory: which agents and MCP servers run, who owns them, and what they can access, with clear rules for when they can act on their own.','Visibility into what data goes where, with containment and guardrails.','Threat modeling and testing for your own AI features: prompt injection, data leakage, and agent or tool abuse.','Kavach is our open-source tooling (Apache-2.0) for containing AI agents: the agent only ever sees tokens and stand-in keys, a gateway enforces an allowlist, and every request is traced. github.com/Lib13Inc/kavach']},
    pen:{t:'Penetration testing and validation',b:['Application: web apps, APIs, and authentication flows.','Infrastructure and network: external and internal environments.','Cloud: AWS, Google Cloud, and Azure accounts, identity paths, and containers.','Mobile: iOS and Android apps and their backends.','AI pentesting: prompt injection, data leakage, and agent or tool abuse in your AI features.','Done by certified experts (OSCP, CISSP, and more). Tools help; people do the testing and validate every finding, so you have fewer false positives to chase. Every finding comes with fix guidance, and we retest fixes, with up to three free retests. We test only with written authorization.']},
    cloud:{t:'Cloud security',b:['Prowler partner. Configuration review across AWS, Google Cloud, and Azure.','Identity and access cleanup, secrets management, and infrastructure-as-code guardrails.','Hardened deployments in all the major public clouds.']},
    vm:{t:'Exposure and vulnerability management',b:['Implement and tune Snyk and your other scanners across code, dependencies, containers, and cloud.','Prioritize by exploitability so the fixes that matter come first, with remediation tracked alongside your engineers.','Monthly reporting that shows findings closed, not findings counted.']},
    ids:{t:'Intrusion detection and AI SOC',b:['Logging and alerting design and detection rules.','AI SOC: AI-assisted alert triage and investigation, with our engineers reviewing what matters.','An incident response runbook and tabletop exercises.','We are not a 24/7 SOC.']},
    train:{t:'Secure AI-assisted development',b:['Secure SDLC training: threat modeling, secure code review, dependency and secrets hygiene, and building security checks into CI.','Reviewing AI-generated code and dependencies, plus secure AI development lifecycle training: prompt injection, agent permissions and data handling, and evaluating and red-teaming AI features before release.','Tabletop exercises for engineers and leaders: incident response, breach scenarios, and AI incidents.','Tailored to your stack and team, with hands-on labs using your own code where possible.']},
    ops:{t:'Operational security',b:['MDM deployments with Iru and Jamf.','Access reviews, onboarding and offboarding hygiene, and customer security questionnaires.','Fractional CISO and security updates for your board or investors.']}
  };
  var m=document.getElementById('detail-modal'),t=document.getElementById('detail-title'),b=document.getElementById('detail-body');
  var lastFocus=null;function close(){m.hidden=true;document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  document.querySelectorAll('.more-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var d=D[btn.getAttribute('data-detail')];
      t.textContent=d.t;
      b.innerHTML='';
      d.b.forEach(function(x){var p=document.createElement('p');p.textContent=x;b.appendChild(p);});
      lastFocus=document.activeElement;m.hidden=false;document.body.style.overflow='hidden';m.querySelector('.detail-close').focus();
    });
  });
  m.addEventListener('click',function(e){if(e.target===m||e.target.className==='detail-close'||e.target.id==='detail-cta')close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
})();
