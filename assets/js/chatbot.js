/**
 * SmartGen AI Assistant — frontend
 *
 * The Gemini key is NOT here and must never be. This widget talks to the
 * SmartGen Platforms Worker, which holds the key server-side, grounds every
 * answer in the real tool catalogue, and keeps the bot on SmartGen topics.
 *
 * Previous versions carried a placeholder for a build step to substitute the
 * key into. On a static site that puts a live API key in a file every visitor
 * can download — which is why the call moved behind the Worker.
 */
(function () {
  'use strict';

  var API_BASE = (function () {
    var meta = document.querySelector('meta[name="smartgen-api"]');
    var configured = meta && meta.getAttribute('content');
    return (configured || 'https://smartgen-platforms.smartgentools.workers.dev').replace(/\/+$/, '');
  })();

  var MAX_HISTORY = 6;
  var STARTERS = [
    'What tools do you have?',
    'Is my data safe?',
    'Do you have an SEO audit tool?',
    'How do I compress an image?',
  ];

  /* ------------------------------------------------------------ helpers */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Render the small subset of Markdown the assistant uses. Everything is
   * escaped first, so only the patterns matched below can ever become markup —
   * an answer echoing a visitor's `<script>` stays inert text.
   */
  function renderMarkdown(text) {
    var html = esc(text);

    html = html.replace(/\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)/g, function (match, label, url) {
      if (!isAllowedLink(url)) return label;
      return '<a class="chatbot-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + label + '</a>';
    });

    html = html
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>');

    return html
      .split(/\n{2,}/)
      .map(function (para) {
        return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
      })
      .join('');
  }

  /** Only our own domain — the assistant has no business linking elsewhere. */
  function isAllowedLink(url) {
    try {
      var parsed = new URL(url);
      return (
        parsed.protocol === 'https:' &&
        /(^|\.)smartgentools\.com$/.test(parsed.hostname)
      );
    } catch (err) {
      return false;
    }
  }

  /* -------------------------------------------------------------- widget */

  function SmartGenChatbot() {
    this.isOpen = false;
    this.busy = false;
    this.history = [];
    this.build();
    this.bind();
  }

  SmartGenChatbot.prototype.build = function () {
    var container = document.createElement('div');
    container.id = 'smartgen-chatbot';
    container.className = 'smartgen-chatbot-container';
    container.innerHTML =
      '<div class="chatbot-widget">' +
      '<button class="chatbot-toggle-btn" id="chatbot-toggle" type="button" aria-expanded="false" aria-controls="chatbot-window" title="Ask the SmartGen assistant">' +
      '<span class="chatbot-icon" aria-hidden="true">💬</span>' +
      '<span class="chatbot-badge" id="chatbot-badge"></span>' +
      '</button>' +
      '<div class="chatbot-window" id="chatbot-window" role="dialog" aria-label="SmartGen AI Assistant">' +
      '<div class="chatbot-header">' +
      '<div class="chatbot-header-content">' +
      '<h3>SmartGen AI Assistant</h3>' +
      '<p>Answers about SmartGen Tools</p>' +
      '</div>' +
      '<button class="chatbot-close-btn" id="chatbot-close" type="button" title="Close chat">✕</button>' +
      '</div>' +
      '<div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite"></div>' +
      '<div class="chatbot-input-area">' +
      '<label class="chatbot-sr-only" for="chatbot-input">Your question</label>' +
      '<input type="text" id="chatbot-input" class="chatbot-input" placeholder="Ask about any SmartGen tool…" autocomplete="off" maxlength="600">' +
      '<button class="chatbot-send-btn" id="chatbot-send" type="button" title="Send"><span aria-hidden="true">➤</span></button>' +
      '</div>' +
      '</div>' +
      '</div>';

    document.body.appendChild(container);

    this.el = {
      toggle: container.querySelector('#chatbot-toggle'),
      close: container.querySelector('#chatbot-close'),
      window: container.querySelector('#chatbot-window'),
      messages: container.querySelector('#chatbot-messages'),
      input: container.querySelector('#chatbot-input'),
      send: container.querySelector('#chatbot-send'),
    };

    this.greet();
  };

  SmartGenChatbot.prototype.greet = function () {
    this.addBotMessage(
      "👋 Hi! I'm the SmartGen assistant. Ask me about any of our free tools, " +
        'how they work, or where to find something on the site.',
      { followUps: STARTERS }
    );
  };

  SmartGenChatbot.prototype.bind = function () {
    var self = this;

    this.el.toggle.addEventListener('click', function () {
      self.toggleWindow();
    });
    this.el.close.addEventListener('click', function () {
      self.toggleWindow(false);
    });
    this.el.send.addEventListener('click', function () {
      self.submit();
    });
    this.el.input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        self.submit();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && self.isOpen) self.toggleWindow(false);
    });

    // Follow-up chips are added as messages arrive, so delegate.
    this.el.messages.addEventListener('click', function (event) {
      var chip = event.target.closest('.quick-reply-btn');
      if (chip && !self.busy) self.ask(chip.getAttribute('data-question'));
    });
  };

  SmartGenChatbot.prototype.toggleWindow = function (force) {
    this.isOpen = typeof force === 'boolean' ? force : !this.isOpen;
    this.el.window.classList.toggle('open', this.isOpen);
    this.el.toggle.classList.toggle('active', this.isOpen);
    this.el.toggle.setAttribute('aria-expanded', String(this.isOpen));
    if (this.isOpen) this.el.input.focus();
  };

  SmartGenChatbot.prototype.submit = function () {
    var text = this.el.input.value.trim();
    if (!text || this.busy) return;
    this.el.input.value = '';
    this.ask(text);
  };

  SmartGenChatbot.prototype.ask = function (question) {
    var self = this;
    if (!question || this.busy) return;

    this.busy = true;
    this.el.send.disabled = true;
    this.addUserMessage(question);
    var typing = this.showTyping();

    fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        history: this.history.slice(-MAX_HISTORY),
        page: location.pathname,
      }),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { status: response.status, data: data };
        });
      })
      .then(function (result) {
        typing.remove();

        if (!result.data || !result.data.ok) {
          self.addBotMessage(
            (result.data && result.data.error) ||
              'Something went wrong on my side. Please try again in a moment.',
            {}
          );
          return;
        }

        self.addBotMessage(result.data.answer, {
          sources: result.data.sources,
          followUps: result.data.followUps,
        });

        self.history.push({ role: 'user', content: question });
        self.history.push({ role: 'assistant', content: result.data.answer });
        if (self.history.length > MAX_HISTORY * 2) {
          self.history = self.history.slice(-MAX_HISTORY * 2);
        }
      })
      .catch(function () {
        typing.remove();
        self.addBotMessage(
          "I can't reach the assistant right now. You can browse every tool at " +
            '[all SmartGen tools](https://smartgentools.com/tools/) in the meantime.',
          {}
        );
      })
      .finally(function () {
        self.busy = false;
        self.el.send.disabled = false;
        if (self.isOpen) self.el.input.focus();
      });
  };

  /* ----------------------------------------------------------- rendering */

  SmartGenChatbot.prototype.addUserMessage = function (text) {
    var node = document.createElement('div');
    node.className = 'chatbot-message user-message';
    // Escaped, not raw: a visitor's own input must never become markup.
    node.innerHTML = '<div class="message-content"><p>' + esc(text) + '</p></div>';
    this.append(node);
  };

  SmartGenChatbot.prototype.addBotMessage = function (text, options) {
    var opts = options || {};
    var node = document.createElement('div');
    node.className = 'chatbot-message bot-message';

    var html = '<div class="message-content">' + renderMarkdown(text);

    if (opts.sources && opts.sources.length) {
      html +=
        '<div class="chatbot-sources">' +
        opts.sources
          .map(function (source) {
            if (!isAllowedLink(source.url)) return '';
            return (
              '<a class="chatbot-source" href="' +
              esc(source.url) +
              '" target="_blank" rel="noopener">' +
              '<span class="chatbot-source-title">' +
              esc(source.title) +
              '</span>' +
              '<span class="chatbot-source-meta">' +
              esc(source.category || 'SmartGen tool') +
              '</span>' +
              '</a>'
            );
          })
          .join('') +
        '</div>';
    }

    if (opts.followUps && opts.followUps.length) {
      html +=
        '<div class="quick-replies">' +
        opts.followUps
          .map(function (question) {
            return (
              '<button type="button" class="quick-reply-btn" data-question="' +
              esc(question) +
              '">' +
              esc(question) +
              '</button>'
            );
          })
          .join('') +
        '</div>';
    }

    node.innerHTML = html + '</div>';
    this.append(node);
  };

  SmartGenChatbot.prototype.showTyping = function () {
    var node = document.createElement('div');
    node.className = 'chatbot-message bot-message';
    node.innerHTML =
      '<div class="message-content"><p class="chatbot-typing-indicator">' +
      '<span></span><span></span><span></span></p></div>';
    this.append(node);
    return node;
  };

  SmartGenChatbot.prototype.append = function (node) {
    // Only the newest message keeps its chips — older ones become clutter.
    var stale = this.el.messages.querySelectorAll('.quick-replies');
    for (var i = 0; i < stale.length; i++) stale[i].remove();

    this.el.messages.appendChild(node);
    this.el.messages.scrollTop = this.el.messages.scrollHeight;
  };

  /* ---------------------------------------------------------------- boot */

  function start() {
    if (document.getElementById('smartgen-chatbot')) return;
    window.smartGenChatbot = new SmartGenChatbot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
