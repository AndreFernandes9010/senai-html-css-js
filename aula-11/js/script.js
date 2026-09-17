document.addEventListener("DOMContentLoaded", () => {
  configurarTerminalDoHero();
  configurarProgressoEScrollSpy();
  configurarRevealOnScroll();
  document.querySelectorAll(".panel").forEach(configurarPainel);
});

// ---------------------------------------------------------------
// HERO — terminal interativo: digita um primeiro comando sozinho,
// mostra o resultado, e então libera o input para o visitante
// digitar qualquer expressão JavaScript e ver a resposta na hora.
// ---------------------------------------------------------------
function configurarTerminalDoHero() {
  const corpo = document.getElementById("heroTerminalBody");
  const input = document.getElementById("heroInput");
  const frame = document.getElementById("heroSandbox");

  const sugestoes = [
    "2 + 2",
    '"Ana".toUpperCase()',
    "[1, 2, 3].map(n => n * 2)",
    "Math.max(4, 9, 1)",
    "new Date().getFullYear()",
  ];
  let indiceSugestao = 0;

  const historico = [];
  let indiceHistorico = -1;

  const adicionarLinha = (texto, tipo) => {
    const linha = document.createElement("div");
    linha.className = `term-line term-line--${tipo}`;
    linha.textContent = texto;
    corpo.appendChild(linha);
    corpo.scrollTop = corpo.scrollHeight;
  };

  const executar = (codigo) => {
    adicionarLinha(codigo, "comando");
    frame.srcdoc = montarSandboxRepl(codigo);
  };

  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow) return;
    if (!event.data || event.data.tipo !== "hero-repl") return;
    const { logs, resultado, erro } = event.data;

    logs.forEach((linha) => adicionarLinha(linha, "log"));
    if (erro) {
      adicionarLinha(erro, "error");
    } else if (resultado !== null) {
      adicionarLinha(resultado, "resultado");
    } else if (logs.length === 0) {
      adicionarLinha("undefined", "resultado");
    }
  });

  // Digita o primeiro comando sozinho, à guisa de exemplo, e só
  // depois libera o campo — como uma sessão de terminal que já
  // começou antes da pessoa chegar.
  const comandoInicial = 'console.log("Pronto para começar?")';
  let i = 0;
  const digitar = () => {
    i++;
    corpo.innerHTML = `<div class="term-line term-line--comando">${escapeHtml(comandoInicial.slice(0, i))}<span class="cursor"></span></div>`;
    if (i < comandoInicial.length) {
      setTimeout(digitar, 35);
    } else {
      setTimeout(() => {
        corpo.innerHTML = "";
        executar(comandoInicial);
        input.disabled = false;
        input.placeholder = sugestoes[0];
        input.focus();
      }, 300);
    }
  };
  digitar();

  // Placeholder rotativo com sugestões, só quando o campo está
  // vazio e sem foco — um empurrãozinho de UX pra quem não sabe
  // o que digitar.
  setInterval(() => {
    if (document.activeElement === input || input.value || input.disabled) return;
    indiceSugestao = (indiceSugestao + 1) % sugestoes.length;
    input.placeholder = sugestoes[indiceSugestao];
  }, 2600);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const codigo = input.value.trim();
      if (!codigo) return;
      historico.push(codigo);
      indiceHistorico = historico.length;
      input.value = "";
      executar(codigo);
      return;
    }

    // Setas para cima/baixo navegam pelo histórico de comandos,
    // exatamente como num terminal de verdade.
    if (event.key === "ArrowUp") {
      if (indiceHistorico > 0) {
        indiceHistorico--;
        input.value = historico[indiceHistorico];
        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
      }
      event.preventDefault();
    } else if (event.key === "ArrowDown") {
      if (indiceHistorico < historico.length - 1) {
        indiceHistorico++;
        input.value = historico[indiceHistorico];
      } else {
        indiceHistorico = historico.length;
        input.value = "";
      }
      event.preventDefault();
    }
  });
}

function montarSandboxRepl(codigo) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>
(function () {
  function formatarLog(valor) {
    if (typeof valor === "string") return valor;
    if (valor === undefined) return "undefined";
    if (valor === null) return "null";
    if (typeof valor === "function") return valor.toString();
    try { return JSON.stringify(valor); } catch (e) { return String(valor); }
  }
  function formatarResultado(valor) {
    if (typeof valor === "string") return JSON.stringify(valor);
    return formatarLog(valor);
  }

  var logs = [];
  console.log = console.warn = console.error = function () {
    logs.push(Array.prototype.map.call(arguments, formatarLog).join(" "));
  };

  var resultado = null;
  var erro = null;
  try {
    var valor = eval(${JSON.stringify(codigo)});
    if (valor !== undefined) resultado = formatarResultado(valor);
  } catch (e) {
    erro = e.message;
  }

  parent.postMessage({ tipo: "hero-repl", logs: logs, resultado: resultado, erro: erro }, "*");
})();
</script></body></html>`;
}

// ---------------------------------------------------------------
// BARRA DE PROGRESSO + SCROLLSPY DA SIDEBAR
// ---------------------------------------------------------------
function configurarProgressoEScrollSpy() {
  const barra = document.getElementById("progressBar");

  window.addEventListener(
    "scroll",
    () => {
      const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.width = `${alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0}%`;
    },
    { passive: true }
  );

  const links = document.querySelectorAll("[data-toc-link]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  document.querySelectorAll(".panel[id]").forEach((secao) => observer.observe(secao));
}

// ---------------------------------------------------------------
// REVEAL ON SCROLL
// ---------------------------------------------------------------
function configurarRevealOnScroll() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

// ---------------------------------------------------------------
// PAINEL — liga editor, botões e execução sandboxada de cada seção
// ---------------------------------------------------------------
function configurarPainel(secao) {
  const editor = secao.querySelector("[data-panel]");
  const textarea = secao.querySelector("[data-code]");
  if (!editor || !textarea) return;

  const codigoOriginal = textarea.value;
  const cm = criarEditorDeCodigo(textarea);
  const obterCodigo = () => (cm ? cm.getValue() : textarea.value);
  const restaurarCodigo = () => (cm ? cm.setValue(codigoOriginal) : (textarea.value = codigoOriginal));

  const ehPreview = editor.hasAttribute("data-panel-preview");
  const frame = ehPreview
    ? secao.querySelector("[data-preview-frame]")
    : secao.querySelector("[data-sandbox-frame]");
  const output = ehPreview ? null : secao.querySelector("[data-output]");

  const executar = () => {
    frame.srcdoc = ehPreview ? montarSandboxPreview(obterCodigo()) : montarSandboxConsole(obterCodigo());
  };

  if (!ehPreview) {
    // Cada iframe oculto tem sua própria "caixa de entrada" de
    // mensagens — comparamos event.source (não a origem, que é
    // "null" num srcdoc sandboxed) para saber que a mensagem veio
    // exatamente deste iframe, e não de qualquer outro lugar.
    window.addEventListener("message", (event) => {
      if (event.source !== frame.contentWindow) return;
      if (!event.data || event.data.tipo !== "playground-output") return;
      renderizarSaidaDoConsole(output, event.data.logs);
    });
  }

  secao.querySelector("[data-run]").addEventListener("click", executar);
  secao.querySelector("[data-reset]").addEventListener("click", restaurarCodigo);
  secao.querySelector("[data-copy]").addEventListener("click", (event) => {
    navigator.clipboard.writeText(obterCodigo()).then(() => darFeedbackDeCopia(event.currentTarget));
  });

  // O painel de DOM/Eventos já roda uma vez ao carregar, para não
  // começar com o preview em branco.
  if (ehPreview) executar();
}

function criarEditorDeCodigo(textarea) {
  if (!window.CodeMirror) return null;
  return CodeMirror.fromTextArea(textarea, {
    mode: "javascript",
    theme: "dracula",
    lineNumbers: true,
    tabSize: 2,
    viewportMargin: Infinity,
  });
}

function darFeedbackDeCopia(botao) {
  const original = botao.innerHTML;
  botao.innerHTML = "<i>✓</i>";
  setTimeout(() => {
    botao.innerHTML = original;
  }, 1200);
}

// ---------------------------------------------------------------
// SANDBOX — documentos isolados executados dentro dos iframes
// ---------------------------------------------------------------
function montarSandboxConsole(codigo) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>
(function () {
  function formatar(valor) {
    if (typeof valor === "string") return valor;
    if (valor === undefined) return "undefined";
    if (valor === null) return "null";
    if (typeof valor === "function") return valor.toString();
    try { return JSON.stringify(valor, null, 2); } catch (e) { return String(valor); }
  }

  var logs = [];
  function enviar() {
    parent.postMessage({ tipo: "playground-output", logs: logs }, "*");
  }

  console.log = function () {
    logs.push({ nivel: "log", texto: Array.prototype.map.call(arguments, formatar).join(" ") });
    enviar();
  };
  console.error = console.warn = function () {
    logs.push({ nivel: "error", texto: Array.prototype.map.call(arguments, formatar).join(" ") });
    enviar();
  };

  try {
    ${codigo}
  } catch (e) {
    logs.push({ nivel: "error", texto: e.message });
  }
  enviar();
})();
</script></body></html>`;
}

function montarSandboxPreview(codigo) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: Inter, system-ui, sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; gap: 1rem; height: 100vh; margin: 0;
           background: #f8fafc; color: #0f172a; text-align: center; padding: 0 1rem; }
    button { font: inherit; font-weight: 600; padding: 0.6rem 1.3rem; border-radius: 999px;
             border: none; background: #4ade80; color: #04140b; cursor: pointer; transition: background-color .15s ease; }
    button:hover { background: #6ee7a0; }
    p { font-size: 0.95rem; color: #475569; margin: 0; }
    .erro { color: #e11d48; font-size: 0.85rem; }
  </style></head>
  <body>
    <button id="btn">Clique aqui</button>
    <p id="contador">0 cliques</p>
    <script>
      try {
        ${codigo}
      } catch (e) {
        var erro = document.createElement("p");
        erro.className = "erro";
        erro.textContent = "Erro: " + e.message;
        document.body.appendChild(erro);
      }
    </script>
  </body></html>`;
}

// ---------------------------------------------------------------
// SAÍDA DO CONSOLE
// ---------------------------------------------------------------
function renderizarSaidaDoConsole(output, logs) {
  if (!logs || logs.length === 0) {
    output.innerHTML = '<p class="output__empty">Sem saída no console.</p>';
    return;
  }
  output.innerHTML = logs
    .map((log) => `<p class="output__line output__line--${log.nivel}">${escapeHtml(log.texto)}</p>`)
    .join("");
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}
