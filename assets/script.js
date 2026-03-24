/**
 * AccessibleMe v2 — Shared JavaScript
 * - Accessibility toolbar (7 prefs)
 * - Mobile nav
 * - Accessibility features modal
 * - Cookie banner
 * - Contact form validation
 * - FAQ accordion
 * - Chatbot widget (FAQ lookup + fake live chat)
 */

/* ── Accessibility Preferences ─────────────────────────── */
const PREFS = [
  { key:'hcMode',       cls:'hc-mode',      btnId:'btn-hc'       },
  { key:'hcYellow',     cls:'hc-yellow',    btnId:'btn-hc-yellow'},
  { key:'darkMode',     cls:'dark-mode',    btnId:'btn-dark'     },
  { key:'textLarge',    cls:'text-large',   btnId:'btn-text-lg'  },
  { key:'textXL',       cls:'text-xl',      btnId:'btn-text-xl'  },
  { key:'readableFont', cls:'readable-font',btnId:'btn-readable' },
  { key:'reduceMotion', cls:'reduce-motion',btnId:'btn-motion'   },
];

function applyPref(pref, active) {
  document.body.classList.toggle(pref.cls, active);
  const btn = document.getElementById(pref.btnId);
  if (btn) btn.setAttribute('aria-pressed', String(active));
}

// Load saved prefs on page load (before DOMContentLoaded for FOUC prevention)
PREFS.forEach(p => applyPref(p, localStorage.getItem(p.key) === 'true'));
if (!localStorage.getItem('reduceMotion') && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  applyPref(PREFS.find(p => p.key === 'reduceMotion'), true);
}

document.addEventListener('DOMContentLoaded', () => {

  /* ── Toolbar button wiring ──────────────────────────── */
  PREFS.forEach(pref => {
    const btn = document.getElementById(pref.btnId);
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(localStorage.getItem(pref.key) === 'true'));

    btn.addEventListener('click', () => {
      const contrastKeys = ['hcMode','hcYellow'];
      // Contrast modes are mutually exclusive
      if (contrastKeys.includes(pref.key)) {
        const newActive = !(localStorage.getItem(pref.key) === 'true');
        contrastKeys.forEach(k => {
          const p = PREFS.find(x => x.key === k);
          applyPref(p, k === pref.key ? newActive : false);
          localStorage.setItem(k, k === pref.key ? newActive : false);
        });
        if (newActive) {
          const dm = PREFS.find(p => p.key === 'darkMode');
          applyPref(dm, false); localStorage.setItem('darkMode', false);
        }
        return;
      }
      // Dark mode turns off contrast
      if (pref.key === 'darkMode') {
        const newActive = !(localStorage.getItem('darkMode') === 'true');
        if (newActive) {
          contrastKeys.forEach(k => { const p = PREFS.find(x => x.key === k); applyPref(p, false); localStorage.setItem(k, false); });
        }
        applyPref(pref, newActive); localStorage.setItem(pref.key, newActive);
        return;
      }
      // Text sizes are mutually exclusive
      if (pref.key === 'textLarge' || pref.key === 'textXL') {
        const newActive = !(localStorage.getItem(pref.key) === 'true');
        const otherKey  = pref.key === 'textLarge' ? 'textXL' : 'textLarge';
        const other = PREFS.find(p => p.key === otherKey);
        if (newActive) { applyPref(other, false); localStorage.setItem(otherKey, false); }
        applyPref(pref, newActive); localStorage.setItem(pref.key, newActive);
        return;
      }
      // Default toggle
      const newActive = !(localStorage.getItem(pref.key) === 'true');
      applyPref(pref, newActive); localStorage.setItem(pref.key, newActive);
    });
  });

  /* ── Mobile Nav ─────────────────────────────────────── */
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav       = document.querySelector('[data-nav]');
  const navClose  = document.querySelector('[data-nav-close]');

  function openNav() {
    nav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const first = nav.querySelector('a'); if (first) first.focus();
  }
  function closeNav() {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (navToggle) navToggle.focus();
  }
  if (navToggle && nav) navToggle.addEventListener('click', () => nav.classList.contains('open') ? closeNav() : openNav());
  if (navClose)         navClose.addEventListener('click', closeNav);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav && nav.classList.contains('open')) closeNav(); });

  /* ── Accessibility Features Panel ───────────────────── */
  const panelOverlay = document.getElementById('a11y-panel-overlay');
  const panelClose   = document.getElementById('a11y-panel-close');
  document.querySelectorAll('[data-open-a11y-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!panelOverlay) return;
      panelOverlay.classList.add('open');
      panelOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (panelClose) panelClose.focus();
    });
  });
  function closePanel() {
    if (!panelOverlay) return;
    panelOverlay.classList.remove('open');
    panelOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const t = document.querySelector('[data-open-a11y-panel]'); if (t) t.focus();
  }
  if (panelClose) panelClose.addEventListener('click', closePanel);
  if (panelOverlay) panelOverlay.addEventListener('click', e => { if (e.target === panelOverlay) closePanel(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panelOverlay && panelOverlay.classList.contains('open')) closePanel(); });

  /* ── Cookie Banner ───────────────────────────────────── */
  const cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    if (localStorage.getItem('cookieChoice')) {
      cookieBanner.hidden = true;
    } else {
      cookieBanner.hidden = false;
    }
    cookieBanner.querySelectorAll('[data-cookie-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem('cookieChoice', btn.dataset.cookieChoice);
        cookieBanner.hidden = true;
      });
    });
  }

  /* ── Contact Form ────────────────────────────────────── */
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      contactForm.querySelectorAll('[data-required]').forEach(field => {
        const errorEl = contactForm.querySelector(`[data-error-for="${field.name}"]`);
        if (!field.value.trim()) {
          valid = false; field.setAttribute('aria-invalid','true');
          if (errorEl) errorEl.textContent = 'This field is required.';
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          valid = false; field.setAttribute('aria-invalid','true');
          if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
        } else {
          field.removeAttribute('aria-invalid');
          if (errorEl) errorEl.textContent = '';
        }
      });
      const live = contactForm.querySelector('[data-form-live]');
      if (!valid) {
        if (live) live.textContent = 'Please fix the errors below before submitting.';
        const first = contactForm.querySelector('[aria-invalid="true"]'); if (first) first.focus();
      } else {
        if (live) { live.classList.add('form-live'); live.textContent = '✓ Thank you! We\'ll be in touch within 2 working days.'; }
        contactForm.reset();
      }
    });
  }

  /* ── FAQ Accordion ───────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const answer = document.getElementById(this.getAttribute('aria-controls'));
      this.setAttribute('aria-expanded', !expanded);
      if (answer) answer.classList.toggle('open', !expanded);
    });
  });

  /* ── Smooth scroll ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) { e.preventDefault(); target.focus({ preventScroll:true }); target.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  /* ── Sticky header shadow ────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    document.body.insertBefore(sentinel, document.body.firstChild);
    new IntersectionObserver(([e]) => header.classList.toggle('scrolled', !e.isIntersecting), { rootMargin:'-1px 0px 0px 0px', threshold:[1] }).observe(sentinel);
  }

  /* ════════════════════════════════════════════════════
     CHATBOT WIDGET
     ════════════════════════════════════════════════════ */
  const launcher    = document.getElementById('chat-launcher');
  const chatWindow  = document.getElementById('chat-window');
  const chatClose   = document.getElementById('chat-close-btn');
  const chatInput   = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send');
  const chatMsgs    = document.getElementById('chat-messages');
  const humanBtn    = document.getElementById('chat-human-btn');
  if (!launcher || !chatWindow) return;

  // FAQ knowledge base — used to answer queries
  const FAQ_KB = [
    {
      q: ['what is wcag','wcag','web content accessibility guidelines'],
      a: 'WCAG stands for Web Content Accessibility Guidelines — the international standard for accessible digital content. WCAG 2.2 AA is the current benchmark, covering contrast, keyboard access, screen readers, and much more. <a href="faq.html#wcag">Read more in our FAQ →</a>'
    },
    {
      q: ['services','what do you offer','how can you help','tiers','kickstarter','audit','sustained'],
      a: 'We offer three service tiers: <strong>Kickstarter</strong> (focused first audit), <strong>Audit & Enablement</strong> (full audit + training), and <strong>Sustained Maturity</strong> (ongoing embedded advisory). <a href="services.html">See all services →</a>'
    },
    {
      q: ['a11yship','accessibility training','gamified','workshop'],
      a: 'A11yShip is our gamified accessibility experience — making WCAG learning fun and memorable for design, dev, and content teams. Available virtually or in-person. <a href="a11yship.html">Learn about A11yShip →</a>'
    },
    {
      q: ['price','cost','how much','pricing','budget'],
      a: 'Pricing depends on scope. Our Kickstarter tier is designed to be accessible for organisations with limited budgets. Get in touch and we\'ll tailor a proposal to your needs. <a href="contact.html">Contact us →</a>'
    },
    {
      q: ['how long','duration','timeline','how quickly'],
      a: 'A focused audit of a single user journey typically takes 5–10 working days. A full product suite audit can take 4–8 weeks. We agree scope before starting so you always know what to expect.'
    },
    {
      q: ['automated','manual','testing','how do you test','screen reader','nvda','voiceover'],
      a: 'We use both — but with heavy emphasis on manual testing with real assistive technology: NVDA, JAWS, VoiceOver, TalkBack. Automated tools like axe catch ~30–40% of issues; manual testing finds the rest.'
    },
    {
      q: ['eaa','european accessibility act','eu','europe','compliance'],
      a: 'The European Accessibility Act (EAA) came into force in June 2025, requiring private sector businesses in the EU to make digital products accessible. It likely applies to you if you sell to EU customers. <a href="faq.html#eaa">Read our EAA briefing →</a>'
    },
    {
      q: ['case study','clients','examples','results','ing','virgin money','closerstill'],
      a: 'We\'ve worked with ING, Virgin Money, CloserStill Media, Same Solutions, and more — helping them move from compliance risk to embedded accessibility capability. <a href="case-studies.html">See case studies →</a>'
    },
    {
      q: ['resources','guides','checklist','tools','free','download'],
      a: 'We have a library of free resources: WCAG checklists, audit guides, EAA briefings, accessibility statement templates, and recommended tools. <a href="resources.html">Browse resources →</a>'
    },
    {
      q: ['contact','get in touch','email','reach','talk'],
      a: 'You can reach us at <a href="mailto:hello@accessibleme.solutions">hello@accessibleme.solutions</a> or via the <a href="contact.html">contact form</a>. We respond within 2 working days.'
    },
    {
      q: ['about','who are you','company','founded','team'],
      a: 'AccessibleMe is a specialist accessibility consultancy founded to change how organisations approach inclusion — from reactive remediation to embedded, confident practice. <a href="about.html">About us →</a>'
    },
    {
      q: ['blind','visual impairment','disability','disabilities','motor','cognitive','dyslexia'],
      a: 'Accessibility covers the full range of human ability — visual, auditory, motor, and cognitive differences — including dyslexia, ADHD, arthritis, epilepsy, and many more. It also helps everyone in situational contexts (bright sunlight, one-handed use).'
    },
  ];

  // Suggested questions to show initially
  const QUICK_QUESTIONS = [
    'What is WCAG?',
    'What services do you offer?',
    'How much does an audit cost?',
    'What is A11yShip?',
    'How do you do testing?',
  ];

  let liveChat = false;
  let chatOpen = false;

  function toggleChat() {
    chatOpen = !chatOpen;
    chatWindow.hidden = !chatOpen;
    if (chatOpen) { chatInput.focus(); }
    launcher.setAttribute('aria-expanded', String(chatOpen));
    launcher.setAttribute('aria-label', chatOpen ? 'Close chat' : 'Open chat with AccessibleMe');
  }

  function addMsg(text, role) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + role;
    msg.innerHTML = text;
    chatMsgs.appendChild(msg);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return msg;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'chat-typing'; t.id = 'typing-indicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    chatMsgs.appendChild(t);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return t;
  }

  function removeTyping() {
    const t = document.getElementById('typing-indicator'); if (t) t.remove();
  }

  function botReply(html, delay) {
    const typing = showTyping();
    setTimeout(() => { typing.remove(); addMsg(html, 'bot'); }, delay || 800);
  }

  function matchFAQ(query) {
    const q = query.toLowerCase();
    for (const entry of FAQ_KB) {
      if (entry.q.some(kw => q.includes(kw))) return entry.a;
    }
    return null;
  }

  function showQuickChips() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-chips';
    QUICK_QUESTIONS.forEach(qText => {
      const chip = document.createElement('button');
      chip.className = 'chat-chip'; chip.textContent = qText;
      chip.addEventListener('click', () => { wrap.remove(); handleUserMessage(qText); });
      wrap.appendChild(chip);
    });
    chatMsgs.appendChild(wrap);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function handleUserMessage(text) {
    addMsg(text, 'user');
    chatInput.value = '';

    if (liveChat) {
      // Fake live agent
      botReply('👋 You\'re now connected with a member of the AccessibleMe team. We\'ll reply as soon as possible — usually within a few hours during working hours (Mon–Fri, 9am–5:30pm UK).', 1200);
      return;
    }

    const answer = matchFAQ(text);
    if (answer) {
      botReply(answer, 700);
    } else {
      botReply('I\'m not sure I have an answer for that one. You could try rephrasing, or click <strong>Talk to a human</strong> below to reach the team directly. <a href="contact.html">Contact form →</a>', 800);
    }
  }

  function startLiveChat() {
    liveChat = true;
    humanBtn.textContent = '🟢 Connected to a human';
    humanBtn.disabled = true;
    humanBtn.style.opacity = '.7';
    botReply('Connecting you to the AccessibleMe team... 💬\n\nA real person will respond to your next message. In the meantime you can also email us at <a href="mailto:hello@accessibleme.solutions">hello@accessibleme.solutions</a>.', 600);
  }

  // Init chat on first open
  let chatInitialised = false;
  function initChat() {
    if (chatInitialised) return;
    chatInitialised = true;
    addMsg('Hi there! 👋 I\'m the AccessibleMe assistant. Ask me anything about accessibility, our services, or how we work.', 'bot');
    setTimeout(showQuickChips, 400);
  }

  launcher.addEventListener('click', () => { toggleChat(); if (chatOpen) initChat(); });
  chatClose.addEventListener('click', toggleChat);
  humanBtn.addEventListener('click', startLiveChat);

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    initChat(); // ensure initialised if user typed before opening
    handleUserMessage(text);
  }

  chatSendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  // Close chat on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && chatOpen) toggleChat();
  });

}); // end DOMContentLoaded
