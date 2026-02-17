(function () {
  const API_URL = window.SE_SUPPORT_API || "";

  const STYLES = `
    #se-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 60px; height: 60px; border-radius: 50%;
      background: #1a3a5c; color: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      font-size: 28px; display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    #se-chat-btn:hover { transform: scale(1.08); }

    #se-chat-box {
      position: fixed; bottom: 96px; right: 24px; z-index: 99999;
      width: 380px; max-height: 540px; border-radius: 12px;
      background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: none; flex-direction: column; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #se-chat-box.open { display: flex; }

    #se-chat-header {
      background: #1a3a5c; color: #fff; padding: 14px 18px;
      font-size: 15px; font-weight: 600; display: flex;
      align-items: center; justify-content: space-between;
    }
    #se-chat-header button {
      background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;
    }

    #se-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; min-height: 300px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .se-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 12px;
      font-size: 14px; line-height: 1.5; word-wrap: break-word;
    }
    .se-msg.bot {
      background: #e8eef4; color: #1a2a3a; align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .se-msg.bot strong { font-weight: 600; }
    .se-msg.bot ul, .se-msg.bot ol { margin: 4px 0; padding-left: 18px; }
    .se-msg.bot li { margin: 2px 0; }
    .se-msg.bot p { margin: 4px 0; }
    .se-msg.bot p:first-child { margin-top: 0; }
    .se-msg.bot p:last-child { margin-bottom: 0; }
    .se-msg.bot code {
      background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px;
      font-size: 0.9em;
    }
    .se-msg.user {
      background: #1a3a5c; color: #fff; align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .se-msg.typing { opacity: 0.6; font-style: italic; }

    .se-welcome {
      display: flex; flex-direction: column; align-items: center;
      padding: 24px 16px; text-align: center; gap: 16px;
    }
    .se-welcome-icon {
      width: 48px; height: 48px; border-radius: 50%;
      background: #1a3a5c; color: #fff; display: flex;
      align-items: center; justify-content: center; font-size: 24px;
    }
    .se-welcome h3 {
      margin: 0; font-size: 16px; color: #1a2a3a; font-weight: 600;
    }
    .se-welcome p {
      margin: 0; font-size: 13px; color: #666; line-height: 1.4;
    }

    .se-suggestions {
      display: flex; flex-wrap: wrap; gap: 6px;
      justify-content: center; padding: 0 8px;
    }
    .se-chip {
      background: #f0f4f8; border: 1px solid #d0d8e0; border-radius: 16px;
      padding: 6px 14px; font-size: 12px; color: #1a3a5c; cursor: pointer;
      transition: all 0.15s; line-height: 1.3;
    }
    .se-chip:hover { background: #1a3a5c; color: #fff; border-color: #1a3a5c; }

    .se-escalate-bar {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; background: #fff8e8; border-top: 1px solid #f0e0b0;
      font-size: 13px; color: #7a6520;
    }
    .se-escalate-bar a {
      color: #1a3a5c; font-weight: 600; text-decoration: none;
    }
    .se-escalate-bar a:hover { text-decoration: underline; }

    #se-chat-input-area {
      display: flex; border-top: 1px solid #e0e0e0; padding: 10px;
    }
    #se-chat-input {
      flex: 1; border: 1px solid #ccc; border-radius: 8px; padding: 10px 12px;
      font-size: 14px; outline: none; resize: none;
      font-family: inherit;
    }
    #se-chat-input:focus { border-color: #1a3a5c; }
    #se-chat-send {
      background: #1a3a5c; color: #fff; border: none; border-radius: 8px;
      margin-left: 8px; padding: 10px 16px; cursor: pointer; font-size: 14px;
      font-weight: 600;
    }
    #se-chat-send:disabled { opacity: 0.5; cursor: default; }

    @media (max-width: 480px) {
      #se-chat-box { width: calc(100vw - 24px); right: 12px; bottom: 84px; max-height: 70vh; }
      #se-chat-btn { bottom: 16px; right: 16px; }
    }
  `;

  const WELCOME = {
    en: {
      title: "ShippingExplorer Support",
      subtitle: "Ask me anything about vessel tracking, pricing, or features.",
      chips: ["What plans do you offer?", "How does AIS tracking work?", "Can I get free access?", "Contact sales team"],
    },
    es: {
      title: "Soporte ShippingExplorer",
      subtitle: "Pregunta sobre seguimiento de buques, precios o funcionalidades.",
      chips: ["¿Qué planes ofrecen?", "¿Cómo funciona el AIS?", "¿Hay acceso gratuito?", "Contactar con ventas"],
    },
    ru: {
      title: "Поддержка ShippingExplorer",
      subtitle: "Задайте вопрос о мониторинге судов, ценах или функциях.",
      chips: ["Какие есть тарифы?", "Как работает AIS?", "Есть бесплатный доступ?", "Связаться с отделом продаж"],
    },
  };

  let sessionId = null;
  let isOpen = false;
  let welcomed = false;
  let chosenLang = null;

  // Simple markdown to HTML (bold, lists, paragraphs)
  function md(text) {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^### (.+)$/gm, "<strong>$1</strong>")
      .replace(/^## (.+)$/gm, "<strong>$1</strong>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, function (m) { return "<ul>" + m + "</ul>"; })
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>").replace(/$/, "</p>")
      .replace(/<p><\/p>/g, "");
  }

  function init() {
    var style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);

    var btn = document.createElement("button");
    btn.id = "se-chat-btn";
    btn.innerHTML = "&#9875;";
    btn.title = "Chat with support";
    btn.onclick = toggle;
    document.body.appendChild(btn);

    var box = document.createElement("div");
    box.id = "se-chat-box";
    box.innerHTML =
      '<div id="se-chat-header">' +
        '<span>ShippingExplorer Support</span>' +
        '<button onclick="document.getElementById(\'se-chat-box\').classList.remove(\'open\')">&times;</button>' +
      '</div>' +
      '<div id="se-chat-messages"></div>' +
      '<div id="se-chat-input-area">' +
        '<textarea id="se-chat-input" rows="1" placeholder="Type a message..."></textarea>' +
        '<button id="se-chat-send">Send</button>' +
      '</div>';
    document.body.appendChild(box);

    document.getElementById("se-chat-send").onclick = send;
    document.getElementById("se-chat-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  function toggle() {
    var box = document.getElementById("se-chat-box");
    isOpen = !isOpen;
    box.classList.toggle("open", isOpen);
    if (isOpen && !welcomed) {
      welcomed = true;
      showLangPicker();
    }
  }

  function showLangPicker() {
    var container = document.getElementById("se-chat-messages");
    var div = document.createElement("div");
    div.className = "se-welcome";
    div.id = "se-welcome";
    div.innerHTML =
      '<div class="se-welcome-icon">&#9875;</div>' +
      '<h3>ShippingExplorer Support</h3>' +
      '<p>Please choose your language:<br>Elige tu idioma:<br>Выберите язык:</p>' +
      '<div class="se-suggestions">' +
        '<button class="se-chip" data-lang="en">English</button>' +
        '<button class="se-chip" data-lang="es">Español</button>' +
        '<button class="se-chip" data-lang="ru">Русский</button>' +
      '</div>';
    container.appendChild(div);

    div.querySelectorAll(".se-chip").forEach(function (btn) {
      btn.onclick = function () {
        chosenLang = btn.getAttribute("data-lang");
        div.remove();
        showWelcome();
      };
    });
  }

  function showWelcome() {
    var w = WELCOME[chosenLang] || WELCOME["en"];
    var container = document.getElementById("se-chat-messages");
    var div = document.createElement("div");
    div.className = "se-welcome";
    div.id = "se-welcome";
    div.innerHTML =
      '<div class="se-welcome-icon">&#9875;</div>' +
      '<h3>' + w.title + '</h3>' +
      '<p>' + w.subtitle + '</p>' +
      '<div class="se-suggestions">' +
        w.chips.map(function (c) {
          return '<button class="se-chip">' + c + '</button>';
        }).join("") +
      '</div>';
    container.appendChild(div);

    div.querySelectorAll(".se-chip").forEach(function (chip) {
      chip.onclick = function () {
        document.getElementById("se-chat-input").value = chip.textContent;
        send();
      };
    });
  }

  function clearWelcome() {
    var el = document.getElementById("se-welcome");
    if (el) el.remove();
  }

  function addMessage(text, role, isHtml) {
    var container = document.getElementById("se-chat-messages");
    var div = document.createElement("div");
    div.className = "se-msg " + role;
    if (isHtml) {
      div.innerHTML = text;
    } else {
      div.textContent = text;
    }
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function showEscalation() {
    var existing = document.querySelector(".se-escalate-bar");
    if (existing) return;
    var inputArea = document.getElementById("se-chat-input-area");
    var bar = document.createElement("div");
    bar.className = "se-escalate-bar";
    bar.innerHTML =
      '<span>Need human help?</span> ' +
      '<a href="tel:+442034116454">Call us</a> · ' +
      '<a href="mailto:info@shippingexplorer.net">Email</a>';
    inputArea.parentNode.insertBefore(bar, inputArea);
  }

  async function send() {
    var input = document.getElementById("se-chat-input");
    var sendBtn = document.getElementById("se-chat-send");
    var text = input.value.trim();
    if (!text) return;

    clearWelcome();
    input.value = "";
    addMessage(text, "user", false);

    var typing = addMessage("Typing...", "bot typing", false);
    sendBtn.disabled = true;

    try {
      var res = await fetch(API_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId, lang: chosenLang }),
      });
      var data = await res.json();
      sessionId = data.session_id;
      typing.remove();
      addMessage(md(data.reply), "bot", true);

      if (data.escalated) {
        showEscalation();
      }
    } catch (err) {
      typing.remove();
      addMessage("Sorry, something went wrong. Please try again.", "bot", false);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
