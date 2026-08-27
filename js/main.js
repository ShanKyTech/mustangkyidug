/* Mustang Kyidug USA — site behaviour */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  if (header) {
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.site-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Mark the current page in the nav ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    if (link.getAttribute('href') === here) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Scroll-reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -7% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window && !reducedMotion) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
    }
  }

  /* ---------- Filmstrip marquee: duplicate track for a seamless loop ---------- */
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Lightbox (any group of [data-lightbox] links) ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (items.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<span class="lightbox__counter"></span>' +
      '<img alt="">' +
      '<button class="lightbox__close" aria-label="Close">&times;</button>' +
      '<button class="lightbox__prev" aria-label="Previous image">&#8592;</button>' +
      '<button class="lightbox__next" aria-label="Next image">&#8594;</button>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('img');
    var lbCounter = lb.querySelector('.lightbox__counter');
    var current = 0;

    function show(i) {
      current = (i + items.length) % items.length;
      var link = items[current];
      lbImg.src = link.getAttribute('href');
      lbImg.alt = (link.querySelector('img') || {}).alt || 'Photo';
      lbCounter.textContent = (current + 1) + ' / ' + items.length;
    }
    function open(i) {
      show(i);
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    items.forEach(function (link, i) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Contact form ----------
     Posts to a Cloudflare Worker at /api/contact which relays the message
     via Email Routing. If the endpoint is unreachable, falls back to
     opening the visitor's mail app. */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var topic = form.querySelector('#topic') ? form.querySelector('#topic').value : 'General';
      var message = form.querySelector('#message').value.trim();
      var honeypot = form.querySelector('#website') ? form.querySelector('#website').value : '';
      var status = document.getElementById('formStatus');
      var button = form.querySelector('button[type="submit"]');

      function show(msg, isError) {
        if (!status) return;
        status.textContent = msg;
        status.classList.add('is-visible');
        status.classList.toggle('is-error', !!isError);
      }
      function mailtoFallback() {
        var subject = encodeURIComponent('[' + topic + '] Message from ' + name);
        var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
        window.location.href = 'mailto:contact@mustangkyidug.com?subject=' + subject + '&body=' + body;
        show('Our contact service seems unreachable, so we opened your email app instead — your message is pre-filled and ready to send.', true);
      }

      if (!name || !email || !message) { show('Please fill in your name, email and message.', true); return; }

      button.disabled = true;
      var originalLabel = button.firstChild.textContent;
      button.firstChild.textContent = 'Sending… ';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, topic: topic, message: message, website: honeypot })
      }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok && data.ok, data: data }; }); })
        .then(function (out) {
          if (out.ok) {
            show('Thank you, ' + name + '! Your message has been sent — we will get back to you soon.');
            form.reset();
          } else {
            show((out.data && out.data.error) || 'Something went wrong. Please email contact@mustangkyidug.com directly.', true);
          }
        })
        .catch(mailtoFallback)
        .finally(function () {
          button.disabled = false;
          button.firstChild.textContent = originalLabel;
        });
    });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
