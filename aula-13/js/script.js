document.addEventListener("DOMContentLoaded", () => {
  configurarPalindromo();
  configurarSenha();
  configurarScrollEReveal();
});

// =====================================================================
// DESAFIO 1 — PALÍNDROMO (visualização de dois ponteiros)
// =====================================================================
function configurarPalindromo() {
  const input = document.getElementById("palindromoInput");
  const linhaDigitos = document.getElementById("digitRow");
  const veredito = document.getElementById("palindromoVerdict");
  const botaoLimpar = document.getElementById("palindromoLimpar");

  const verificar = () => {
    const bruto = input.value.trim();

    if (bruto === "") {
      linhaDigitos.innerHTML = "";
      veredito.innerHTML = '<p class="verdict__text verdict__text--empty">O resultado aparece aqui.</p>';
      return;
    }

    if (!/^\d+$/.test(bruto)) {
      linhaDigitos.innerHTML = "";
      veredito.innerHTML = '<p class="verdict__text verdict__text--error">Digite apenas números inteiros positivos (sem espaços, sinais ou letras).</p>';
      return;
    }

    const digitos = bruto.split("");
    const n = digitos.length;

    // Dois ponteiros — um começando no início (i), outro no fim (j),
    // andando um em direção ao outro. Cada nível de comparação (i, j)
    // fica "verde" se os dígitos baterem, "vermelho" se não baterem.
    const niveis = [];
    let paresIguais = 0;
    for (let i = 0, j = n - 1; i <= j; i++, j--) {
      const igual = digitos[i] === digitos[j];
      if (igual) paresIguais++;
      niveis.push(igual);
    }
    const totalNiveis = niveis.length;
    const ehPalindromo = paresIguais === totalNiveis;

    linhaDigitos.innerHTML = digitos
      .map((d, idx) => {
        const nivel = Math.min(idx, n - 1 - idx);
        const igual = niveis[nivel];
        const centro = n % 2 === 1 && idx === Math.floor(n / 2);
        const classe = igual ? "digit--match" : "digit--mismatch";
        return `<span class="digit ${classe}${centro ? " digit--center" : ""}">${d}</span>`;
      })
      .join("");

    if (ehPalindromo) {
      veredito.innerHTML = `<p class="verdict__text verdict__text--success">✅ ${bruto} é um palíndromo! Todos os ${totalNiveis} par(es) de dígitos batem.</p>`;
    } else {
      veredito.innerHTML = `<p class="verdict__text verdict__text--error">❌ ${bruto} não é um palíndromo. ${paresIguais}/${totalNiveis} par(es) batem.</p>`;
    }
  };

  input.addEventListener("input", verificar);
  botaoLimpar.addEventListener("click", () => {
    input.value = "";
    verificar();
    input.focus();
  });

  document.querySelectorAll("[data-exemplo]").forEach((botao) => {
    botao.addEventListener("click", () => {
      input.value = botao.dataset.exemplo;
      verificar();
      input.focus();
    });
  });
}

// =====================================================================
// DESAFIO 2 — SENHA SEGURA
// =====================================================================
const CRITERIOS_SENHA = [
  { id: "tamanho", label: "Mínimo 8 caracteres", teste: (s) => s.length >= 8 },
  { id: "maiuscula", label: "1 letra maiúscula", teste: (s) => /[A-Z]/.test(s) },
  { id: "minuscula", label: "1 letra minúscula", teste: (s) => /[a-z]/.test(s) },
  { id: "numero", label: "1 número", teste: (s) => /[0-9]/.test(s) },
  { id: "especial", label: "1 caractere especial (!@#$%^&*())", teste: (s) => /[!@#$%^&*()]/.test(s) },
];

function configurarSenha() {
  const input = document.getElementById("senhaInput");
  const toggle = document.getElementById("senhaToggle");
  const gerar = document.getElementById("senhaGerar");
  const checklist = document.getElementById("checklist");
  const segmentos = [...document.querySelectorAll("[data-segment]")];
  const label = document.getElementById("strengthLabel");

  checklist.innerHTML = CRITERIOS_SENHA.map((c) => `<li id="crit-${c.id}">☐ ${c.label}</li>`).join("");

  const avaliar = () => {
    const senha = input.value;
    const resultados = CRITERIOS_SENHA.map((c) => ({ ...c, ok: c.teste(senha) }));
    const total = resultados.filter((r) => r.ok).length;

    resultados.forEach((r) => {
      const item = document.getElementById(`crit-${r.id}`);
      item.classList.toggle("is-ok", r.ok);
      item.textContent = `${r.ok ? "✅" : "☐"} ${r.label}`;
    });

    let nivel = "weak";
    let texto = "Digite uma senha";
    if (senha === "") {
      nivel = "";
      texto = "Digite uma senha";
    } else if (total === 5) {
      nivel = "strong";
      texto = "Forte ✅";
    } else if (total === 4) {
      nivel = "mid";
      texto = "Quase forte ⚠️";
    } else {
      nivel = "weak";
      texto = "Fraca ❌";
    }

    segmentos.forEach((seg, i) => {
      seg.className = "strength__segment";
      if (senha !== "" && i < total) seg.classList.add(`is-fill--${nivel}`);
    });

    label.textContent = texto;
    label.className = `strength__label${nivel ? ` strength__label--${nivel}` : ""}`;
  };

  input.addEventListener("input", avaliar);

  toggle.addEventListener("click", () => {
    const estavaVisivel = input.type === "text";
    input.type = estavaVisivel ? "password" : "text";
    toggle.textContent = estavaVisivel ? "Mostrar" : "Ocultar";
    toggle.setAttribute("aria-label", estavaVisivel ? "Mostrar senha" : "Ocultar senha");
  });

  gerar.addEventListener("click", () => {
    input.value = gerarSenhaForte();
    input.type = "text";
    toggle.textContent = "Ocultar";
    toggle.setAttribute("aria-label", "Ocultar senha");
    avaliar();
    input.focus();
  });

  avaliar();
}

function gerarSenhaForte() {
  const maiusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const minusculas = "abcdefghijkmnpqrstuvwxyz";
  const numeros = "23456789";
  const especiais = "!@#$%^&*()";
  const todos = maiusculas + minusculas + numeros + especiais;

  const aleatorio = (charset) => charset[Math.floor(Math.random() * charset.length)];

  // Garante pelo menos 1 de cada critério, depois completa até 12
  // caracteres com o conjunto completo, e embaralha o resultado —
  // senão os 4 primeiros caracteres seguiriam sempre o mesmo padrão.
  const base = [aleatorio(maiusculas), aleatorio(minusculas), aleatorio(numeros), aleatorio(especiais)];
  while (base.length < 12) base.push(aleatorio(todos));

  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }

  return base.join("");
}

// =====================================================================
// BARRA DE PROGRESSO DE LEITURA + REVEAL ON SCROLL
// =====================================================================
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
