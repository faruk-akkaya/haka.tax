(function(){
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); });
    });
  }
})();

// Header bekommt einen etwas kräftigeren Schatten, sobald über den
// Hero hinausgescrollt wurde — dezenter "App-Gefühl"-Hinweis, dass die
// Seite gescrollt ist, ohne die Darstellung sonst zu verändern.
(function(){
  var header = document.querySelector('header');
  if(!header) return;
  var sync = function(){ header.classList.toggle('scrolled', window.scrollY > 40); };
  sync();
  window.addEventListener('scroll', sync, { passive: true });
})();

// Darkmode: manueller Umschalter im Header. Ohne gespeicherte Wahl folgt die
// Seite der Systemeinstellung (per CSS @media prefers-color-scheme); das
// blockierende Inline-Script im <head> setzt data-theme bereits vor dem
// ersten Rendern, dieses Skript übernimmt nur noch Klick-Handling und Icon.
(function(){
  var btn = document.querySelector('.theme-toggle');
  if(!btn) return;
  var root = document.documentElement;
  function isDark(){
    var stored = root.dataset.theme;
    if(stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncPressed(){
    btn.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
  }
  syncPressed();
  btn.addEventListener('click', function(){
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try{ localStorage.setItem('haka-theme', next); }catch(e){}
    syncPressed();
  });
})();

// Adresse: je nach Gerät zu Apple Maps oder Google Maps verlinken
(function(){
  var link = document.getElementById('mapsLink');
  var extra = document.querySelectorAll('.maps-link');
  if(!link && !extra.length) return;
  var address = 'Schleifweg 53, 90409 Nürnberg';
  var encoded = encodeURIComponent(address);
  var isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && !window.MSStream;
  var url = isApple
    ? ('https://maps.apple.com/?q=' + encoded)
    : ('https://www.google.com/maps/search/?api=1&query=' + encoded);
  if(link) link.setAttribute('href', url);
  extra.forEach(function(l){ l.setAttribute('href', url); });
})();

// Sanftes Einblenden beim Scrollen
(function(){
  var targets = document.querySelectorAll('section > .container');
  if(!('IntersectionObserver' in window) || !targets.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  targets.forEach(function(el){ el.classList.add('reveal'); });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function(el){ io.observe(el); });
})();

// Kontaktformular: es gibt (noch) kein Backend, das die Nachricht entgegennimmt.
// Interimslösung: aus den Feldwerten eine mailto:-Nachricht bauen und das
// Mailprogramm des Besuchers öffnen, statt das Formular ins Leere laufen zu
// lassen. Die direkten mailto:/tel:-Links im Kontakt-Infokasten bleiben
// unabhängig davon als Rückfallebene bestehen.
(function(){
  var form = document.getElementById('contactForm');
  if(!form) return;
  var note = document.getElementById('contactFormNote');
  var isEn = document.documentElement.lang === 'en';
  var t = isEn ? {
    subject: 'Contact request from ',
    name: 'Name: ', company: 'Company: ', email: 'Email: ', phone: 'Phone: ',
    note: 'Your email program will open with a pre-filled message — please send it from there. If nothing opens, please email us directly at hallo@haka.tax.'
  } : {
    subject: 'Kontaktanfrage von ',
    name: 'Name: ', company: 'Unternehmen: ', email: 'E-Mail: ', phone: 'Telefon: ',
    note: 'Ihr E-Mail-Programm öffnet sich mit einer vorausgefüllten Nachricht — bitte senden Sie die E-Mail dort ab. Falls sich nichts öffnet, schreiben Sie uns direkt an hallo@haka.tax.'
  };
  form.addEventListener('submit', function(event){
    event.preventDefault();
    if(!form.reportValidity()) return;

    var name = form.querySelector('#name').value.trim();
    var firma = form.querySelector('#firma').value.trim();
    var email = form.querySelector('#email').value.trim();
    var telefon = form.querySelector('#telefon').value.trim();
    var nachricht = form.querySelector('#nachricht').value.trim();

    var bodyLines = [
      nachricht,
      '',
      '—',
      t.name + name,
      firma ? (t.company + firma) : null,
      t.email + email,
      telefon ? (t.phone + telefon) : null
    ].filter(function(line){ return line !== null; });

    var subject = t.subject + name;
    var mailto = 'mailto:hallo@haka.tax'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(bodyLines.join('\n'));

    window.location.href = mailto;

    if(note){
      note.textContent = t.note;
      note.hidden = false;
    }
  });
})();

// Copyright-Jahr im Footer automatisch aktuell halten
(function(){
  var el = document.getElementById('copyYear');
  if(el) el.textContent = new Date().getFullYear();
})();
