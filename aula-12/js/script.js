// =====================================================================
// EXERCICIOS — cada item descreve um exercício da Aula 12: os campos
// de entrada, o rótulo do botão e a função executar() que calcula o
// resultado. A UI inteira (10 cards) é gerada a partir deste array.
// =====================================================================
const EXERCICIOS = [
  {
    id: "par-impar",
    titulo: "Par ou Ímpar",
    desc: "Informe um número inteiro para saber se ele é par ou ímpar.",
    campos: [{ id: "n", tipo: "number", label: "Número", placeholder: "Ex: 17" }],
    acaoLabel: "Verificar",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const n = Number(valores.n);
      if (!Number.isFinite(n)) return { erro: "Digite um número válido." };
      return { texto: `${n} é ${n % 2 === 0 ? "par" : "ímpar"}.` };
    },
  },

  {
    id: "media-notas",
    titulo: "Média de 3 Notas",
    desc: "Calcula a média de 3 notas e diz se está aprovado (média ≥ 6).",
    campos: [
      { id: "n1", tipo: "number", label: "Nota 1", placeholder: "0-10" },
      { id: "n2", tipo: "number", label: "Nota 2", placeholder: "0-10" },
      { id: "n3", tipo: "number", label: "Nota 3", placeholder: "0-10" },
    ],
    acaoLabel: "Calcular",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const notas = [valores.n1, valores.n2, valores.n3].map(Number);
      if (notas.some((n) => !Number.isFinite(n))) return { erro: "Preencha as 3 notas." };
      const media = notas.reduce((a, b) => a + b, 0) / 3;
      const aprovado = media >= 6;
      return { texto: `Média: ${media.toFixed(1)} — ${aprovado ? "Aprovado ✅" : "Reprovado ❌"}` };
    },
  },

  {
    id: "tabuada",
    titulo: "Tabuada",
    desc: "Mostra a tabuada de 1 a 10 do número informado.",
    campos: [{ id: "n", tipo: "number", label: "Número", placeholder: "Ex: 7" }],
    acaoLabel: "Gerar",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const n = Number(valores.n);
      if (!Number.isFinite(n)) return { erro: "Digite um número válido." };
      const itens = Array.from({ length: 10 }, (_, i) => ({ texto: `${n} × ${i + 1} = ${n * (i + 1)}` }));
      return { tipo: "chips", itens };
    },
  },

  {
    id: "contar-ate",
    titulo: "Contar de 1 até N",
    desc: "Lista os números de 1 até o valor informado (máx. 300).",
    campos: [{ id: "n", tipo: "number", label: "Até", placeholder: "Ex: 20" }],
    acaoLabel: "Contar",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const n = Math.trunc(Number(valores.n));
      if (!Number.isFinite(n) || n < 1) return { erro: "Digite um número inteiro positivo." };
      if (n > 300) return { erro: "Escolha um valor até 300 para não pesar a página." };
      const itens = Array.from({ length: n }, (_, i) => ({ texto: String(i + 1) }));
      return { tipo: "chips", mensagem: `${n} número(s):`, itens };
    },
  },

  {
    id: "soma-ate-zero",
    titulo: "Somar até digitar 0",
    desc: "Digite números e pressione Enter para somar; digite 0 para encerrar o round.",
    campos: [{ id: "n", tipo: "number", label: "Número (0 encerra)", placeholder: "Ex: 5" }],
    acaoLabel: "Adicionar",
    reativo: false,
    limparAposExecutar: true,
    executar(valores, estado) {
      if (!estado.itens) {
        estado.itens = [];
        estado.soma = 0;
      }
      if (camposVazios(valores)) {
        return estado.itens.length === 0
          ? { vazio: true }
          : { erro: "Digite um número (ou 0 para encerrar o round)." };
      }
      const n = Number(valores.n);
      if (!Number.isFinite(n)) return { erro: "Digite um número válido." };

      if (n === 0) {
        const total = estado.soma;
        const itens = estado.itens.map((v) => ({ texto: String(v) }));
        itens.push({ texto: `= ${total}`, destaque: true });
        estado.itens = [];
        estado.soma = 0;
        return { tipo: "chips", mensagem: `Round encerrado! Total: ${total}`, itens };
      }

      estado.itens.push(n);
      estado.soma += n;
      return {
        tipo: "chips",
        mensagem: `Soma parcial: ${estado.soma} (digite 0 para encerrar)`,
        itens: estado.itens.map((v) => ({ texto: String(v) })),
      };
    },
  },

  {
    id: "inverter-string",
    titulo: "Inverter uma String",
    desc: 'Ex: "casa" vira "asac".',
    campos: [{ id: "texto", tipo: "text", label: "Texto", placeholder: "Ex: casa" }],
    acaoLabel: "Inverter",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const invertido = valores.texto.split("").reverse().join("");
      return { texto: `"${valores.texto}" → "${invertido}"` };
    },
  },

  {
    id: "maior-numero",
    titulo: "Maior Número da Lista",
    desc: "Digite números separados por vírgula para encontrar o maior.",
    campos: [{ id: "lista", tipo: "text", label: "Números", placeholder: "Ex: 4, 8, 15, 16, 23, 42" }],
    acaoLabel: "Encontrar",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const numeros = valores.lista
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
      if (numeros.length === 0) return { erro: "Digite números válidos separados por vírgula." };
      if (numeros.length > 20) return { erro: "No máximo 20 números para caber no gráfico." };
      const maior = Math.max(...numeros);
      const itens = numeros.map((valor) => ({ valor, max: valor === maior }));
      return { tipo: "barras", mensagem: `Maior número: ${maior}`, itens };
    },
  },

  {
    id: "numero-primo",
    titulo: "Número Primo",
    desc: "Verifica se um número é divisível apenas por 1 e por ele mesmo.",
    campos: [{ id: "n", tipo: "number", label: "Número", placeholder: "Ex: 17" }],
    acaoLabel: "Verificar",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const n = Math.trunc(Number(valores.n));
      if (!Number.isFinite(n)) return { erro: "Digite um número válido." };
      const primo = ehPrimo(n);
      return { texto: `${n} ${primo ? "é primo ✅" : "não é primo ❌"}` };
    },
  },

  {
    id: "fibonacci",
    titulo: "Sequência de Fibonacci",
    desc: "Gera os primeiros N termos (0, 1, 1, 2, 3, 5, ...).",
    campos: [{ id: "n", tipo: "number", label: "Quantos termos", placeholder: "Ex: 10" }],
    acaoLabel: "Gerar",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const n = Math.trunc(Number(valores.n));
      if (!Number.isFinite(n) || n < 1) return { erro: "Digite um número inteiro positivo." };
      if (n > 30) return { erro: "Escolha até 30 termos para não pesar a página." };
      const seq = [0, 1];
      while (seq.length < n) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      return { tipo: "chips", itens: seq.slice(0, n).map((v) => ({ texto: String(v) })) };
    },
  },

  {
    id: "contar-vogais",
    titulo: "Contar Vogais",
    desc: "Conta e destaca as vogais de uma palavra ou frase.",
    campos: [{ id: "texto", tipo: "text", label: "Palavra ou frase", placeholder: "Ex: Desenvolvimento Web" }],
    acaoLabel: "Contar",
    reativo: true,
    executar(valores) {
      if (camposVazios(valores)) return { vazio: true };
      const total = (valores.texto.match(/[aeiouáéíóúâêîôûãõ]/gi) || []).length;
      return {
        tipo: "vogais",
        destaqueHtml: destacarVogais(valores.texto),
        mensagem: `${total} vogal${total === 1 ? "" : "is"} encontrada${total === 1 ? "" : "s"}.`,
      };
    },
  },
];

const CHAVE_PROGRESSO = "aula12-progresso";
let concluidos = new Set(JSON.parse(localStorage.getItem(CHAVE_PROGRESSO) || "[]"));

document.addEventListener("DOMContentLoaded", () => {
  renderizarExercicios();
  configurarProgresso();
  configurarPaleta();
  configurarScrollEReveal();
});

// ---------------------------------------------------------------
// RENDERIZAÇÃO DOS CARDS
// ---------------------------------------------------------------
function renderizarExercicios() {
  const lista = document.getElementById("exercisesList");
  lista.innerHTML = EXERCICIOS.map(montarCardHTML).join("");
  EXERCICIOS.forEach(ligarCard);
}

function montarCardHTML(ex, indice) {
  const campos = ex.campos
    .map(
      (c) => `
      <div class="field">
        <label for="${ex.id}-${c.id}">${c.label}</label>
        <input type="${c.tipo}" id="${ex.id}-${c.id}" placeholder="${c.placeholder || ""}" ${c.tipo === "number" ? 'step="any"' : ""}>
      </div>`
    )
    .join("");

  return `
    <section class="card" id="ex-${ex.id}">
      <div class="card__head">
        <span class="card__index">${String(indice + 1).padStart(2, "0")}</span>
        <h2 class="card__title">${ex.titulo}</h2>
        <span class="card__done" data-done-badge>✓ concluído</span>
      </div>
      <p class="card__desc">${ex.desc}</p>
      <div class="card__controls">
        ${campos}
        <button type="button" class="card__action" data-action>${ex.acaoLabel}</button>
      </div>
      <div class="card__result" data-result>
        <p class="card__result-text card__result--empty">O resultado aparece aqui.</p>
      </div>
    </section>`;
}

function ligarCard(ex) {
  const secao = document.getElementById(`ex-${ex.id}`);
  const areaResultado = secao.querySelector("[data-result]");
  const inputs = ex.campos.map((c) => secao.querySelector(`#${ex.id}-${c.id}`));
  ex.estado = {};

  const obterValores = () => {
    const valores = {};
    ex.campos.forEach((c, i) => (valores[c.id] = inputs[i].value.trim()));
    return valores;
  };

  const rodar = () => {
    const saida = ex.executar(obterValores(), ex.estado);
    renderizarResultado(areaResultado, saida);
    if (saida && !saida.vazio && !saida.erro) marcarConcluido(ex.id);
    if (ex.limparAposExecutar) {
      inputs.forEach((inp) => (inp.value = ""));
      inputs[0]?.focus();
    }
  };

  secao.querySelector("[data-action]").addEventListener("click", rodar);
  inputs.forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") rodar();
    });
    if (ex.reativo) input.addEventListener("input", rodar);
  });
}

function renderizarResultado(container, saida) {
  if (!saida || saida.vazio) {
    container.innerHTML = '<p class="card__result-text card__result--empty">O resultado aparece aqui.</p>';
    return;
  }

  if (saida.erro) {
    container.innerHTML = `<p class="card__result-text card__result--error">${escapeHtml(saida.erro)}</p>`;
    return;
  }

  let corpo = "";

  if (saida.tipo === "chips") {
    corpo = `
      ${saida.mensagem ? `<p class="card__result-text card__result--success mb">${escapeHtml(saida.mensagem)}</p>` : ""}
      <div class="chip-row card__result-text">
        ${saida.itens.map((item) => `<span class="chip${item.destaque ? " chip--accent" : ""}">${escapeHtml(item.texto)}</span>`).join("")}
      </div>`;
  } else if (saida.tipo === "barras") {
    const maiorAbs = Math.max(...saida.itens.map((i) => Math.abs(i.valor))) || 1;
    corpo = `
      <p class="card__result-text card__result--success mb">${escapeHtml(saida.mensagem)}</p>
      <div class="bar-chart card__result-text">
        ${saida.itens
          .map(
            (i) => `
          <div class="bar-chart__item${i.max ? " bar-chart__item--max" : ""}">
            <div class="bar-chart__bar" style="height:${Math.max(10, (Math.abs(i.valor) / maiorAbs) * 90)}%"></div>
            <span class="bar-chart__label">${escapeHtml(String(i.valor))}</span>
          </div>`
          )
          .join("")}
      </div>`;
  } else if (saida.tipo === "vogais") {
    corpo = `
      <p class="vowel-preview card__result-text">${saida.destaqueHtml}</p>
      <p class="card__result-text card__result--success" style="margin-top:.6rem;">${escapeHtml(saida.mensagem)}</p>`;
  } else {
    corpo = `<p class="card__result-text card__result--success">${escapeHtml(saida.texto)}</p>`;
  }

  container.innerHTML = `${corpo}<button type="button" class="card__copy" data-copy title="Copiar resultado">⧉</button>`;
  const botaoCopiar = container.querySelector("[data-copy]");
  botaoCopiar.addEventListener("click", () => {
    const texto = container.innerText.replace(/⧉|✓/g, "").trim();
    navigator.clipboard.writeText(texto).then(() => {
      botaoCopiar.textContent = "✓";
      setTimeout(() => (botaoCopiar.textContent = "⧉"), 1000);
    });
  });
}

// ---------------------------------------------------------------
// HELPERS DE DOMÍNIO
// ---------------------------------------------------------------
function camposVazios(valores) {
  return Object.values(valores).every((v) => v === "" || v === null || v === undefined);
}

function ehPrimo(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function destacarVogais(texto) {
  return texto
    .split("")
    .map((ch) => {
      const escapado = escapeHtml(ch);
      return /[aeiouáéíóúâêîôûãõAEIOUÁÉÍÓÚÂÊÎÔÛÃÕ]/.test(ch) ? `<mark>${escapado}</mark>` : escapado;
    })
    .join("");
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ---------------------------------------------------------------
// PROGRESSO GAMIFICADO (persistido em localStorage) + CONFETE
// ---------------------------------------------------------------
function configurarProgresso() {
  atualizarProgresso();
  document.getElementById("heroProgressReset").addEventListener("click", () => {
    concluidos.clear();
    localStorage.removeItem(CHAVE_PROGRESSO);
    document.querySelectorAll("[data-done-badge]").forEach((b) => b.classList.remove("is-shown"));
    atualizarProgresso();
  });
}

function marcarConcluido(id) {
  const jaTinha = concluidos.has(id);
  concluidos.add(id);
  localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify([...concluidos]));

  const badge = document.querySelector(`#ex-${id} [data-done-badge]`);
  if (badge) badge.classList.add("is-shown");

  atualizarProgresso();
  if (!jaTinha && concluidos.size === EXERCICIOS.length) dispararConfete();
}

function atualizarProgresso() {
  document.getElementById("heroProgressCount").textContent = concluidos.size;
  document.getElementById("heroProgressFill").style.width = `${(concluidos.size / EXERCICIOS.length) * 100}%`;
  EXERCICIOS.forEach((ex) => {
    const badge = document.querySelector(`#ex-${ex.id} [data-done-badge]`);
    if (badge) badge.classList.toggle("is-shown", concluidos.has(ex.id));
  });
}

function dispararConfete() {
  const camada = document.getElementById("confettiLayer");
  const cores = ["#4ade80", "#22d3ee", "#fb7185", "#facc15", "#a78bfa"];

  for (let i = 0; i < 120; i++) {
    const peca = document.createElement("div");
    peca.className = "confetti-piece";
    peca.style.left = `${Math.random() * 100}vw`;
    peca.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
    peca.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    peca.style.animationDelay = `${Math.random() * 0.6}s`;
    camada.appendChild(peca);
    setTimeout(() => peca.remove(), 4200);
  }
}

// ---------------------------------------------------------------
// PALETA DE COMANDO (Ctrl/Cmd+K)
// ---------------------------------------------------------------
function configurarPaleta() {
  const palette = document.getElementById("palette");
  const input = document.getElementById("paletteInput");
  const resultados = document.getElementById("paletteResults");
  const backdrop = document.getElementById("paletteBackdrop");

  let ativos = [];
  let indiceAtivo = 0;

  const renderizarLista = (consulta) => {
    const q = consulta.trim().toLowerCase();
    ativos = EXERCICIOS.filter((ex) => ex.titulo.toLowerCase().includes(q));
    indiceAtivo = 0;

    if (ativos.length === 0) {
      resultados.innerHTML = '<p class="palette__empty">Nenhum exercício encontrado.</p>';
      return;
    }
    resultados.innerHTML = ativos
      .map(
        (ex, i) => `
        <button type="button" class="palette__item${i === 0 ? " is-active" : ""}" data-id="${ex.id}">
          ${ex.titulo} <span>#${String(EXERCICIOS.indexOf(ex) + 1).padStart(2, "0")}</span>
        </button>`
      )
      .join("");
  };

  const atualizarAtivo = () => {
    [...resultados.children].forEach((el, i) => el.classList.toggle("is-active", i === indiceAtivo));
    resultados.children[indiceAtivo]?.scrollIntoView({ block: "nearest" });
  };

  const abrir = () => {
    palette.hidden = false;
    input.value = "";
    renderizarLista("");
    setTimeout(() => input.focus(), 10);
  };

  const fechar = () => {
    palette.hidden = true;
  };

  const irPara = (id) => {
    fechar();
    const secao = document.getElementById(`ex-${id}`);
    if (!secao) return;
    secao.scrollIntoView({ behavior: "smooth", block: "center" });
    secao.classList.add("is-target");
    setTimeout(() => secao.classList.remove("is-target"), 1600);
    const primeiroInput = secao.querySelector("input");
    if (primeiroInput) setTimeout(() => primeiroInput.focus(), 450);
  };

  document.getElementById("openPalette").addEventListener("click", abrir);
  backdrop.addEventListener("click", fechar);

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      palette.hidden ? abrir() : fechar();
    } else if (event.key === "Escape" && !palette.hidden) {
      fechar();
    }
  });

  input.addEventListener("input", () => renderizarLista(input.value));

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      indiceAtivo = Math.min(indiceAtivo + 1, ativos.length - 1);
      atualizarAtivo();
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      indiceAtivo = Math.max(indiceAtivo - 1, 0);
      atualizarAtivo();
      event.preventDefault();
    } else if (event.key === "Enter" && ativos[indiceAtivo]) {
      irPara(ativos[indiceAtivo].id);
    }
  });

  resultados.addEventListener("click", (event) => {
    const item = event.target.closest("[data-id]");
    if (item) irPara(item.dataset.id);
  });
}

// ---------------------------------------------------------------
// BARRA DE PROGRESSO DE LEITURA + REVEAL ON SCROLL
// ---------------------------------------------------------------
function configurarScrollEReveal() {
  const barra = document.getElementById("progressBar");
  window.addEventListener(
    "scroll",
    () => {
      const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.width = `${alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0}%`;
    },
    { passive: true }
  );

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
  document.querySelectorAll(".card").forEach((card) => observer.observe(card));
}
