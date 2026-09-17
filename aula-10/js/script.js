// Dados da equipe — única fonte de verdade, usada tanto para gerar
// os cards quanto para preencher o modal de perfil.
const MEMBROS = {
  rafael: {
    nome: "Rafael Nakamura",
    cargo: "Desenvolvedor Front-end",
    iniciais: "RN",
    cor: "#4f46e5",
    bioCard: "Especialista em interfaces rápidas e acessíveis.",
    bio: "5 anos construindo interfaces rápidas e acessíveis, com foco em HTML semântico, CSS moderno e componentes reutilizáveis em React.",
    skills: ["HTML5", "CSS3", "JavaScript", "React"],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "rafael@technova.com.br",
  },
  camila: {
    nome: "Camila Duarte",
    cargo: "Desenvolvedora Back-end",
    iniciais: "CD",
    cor: "#0d9488",
    bioCard: "Constrói APIs robustas e escaláveis.",
    bio: "Projeta APIs robustas e escaláveis, com experiência em modelagem de banco de dados e infraestrutura containerizada.",
    skills: ["Node.js", "PostgreSQL", "Docker"],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "camila@technova.com.br",
  },
  bruno: {
    nome: "Bruno Azevedo",
    cargo: "Especialista em Mobile",
    iniciais: "BA",
    cor: "#ea580c",
    bioCard: "Apps nativos com foco em performance.",
    bio: "Desenvolve apps nativos e multiplataforma com foco em performance e boa experiência de uso em qualquer aparelho.",
    skills: ["React Native", "Kotlin", "Firebase"],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "bruno@technova.com.br",
  },
  larissa: {
    nome: "Larissa Prado",
    cargo: "UX/UI Designer",
    iniciais: "LP",
    cor: "#be185d",
    bioCard: "Cria experiências claras e acessíveis.",
    bio: "Cria experiências claras e acessíveis, do wireframe ao design system, sempre com o usuário final como ponto de partida.",
    skills: ["Figma", "Design System", "Acessibilidade"],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "larissa@technova.com.br",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  renderTeamCards();
  configurarTema();
  configurarMenuMobile();
  configurarNavbarEProgresso();
  configurarScrollSpy();
  configurarRevealOnScroll();
  configurarTabs();
  configurarModalDePerfil();
  configurarAccordion();
  configurarFormulario();
  configurarBotaoTopo();
});

// ---------------------------------------------------------------
// EQUIPE — gera os 4 cards a partir de MEMBROS
// ---------------------------------------------------------------
function renderTeamCards() {
  const grid = document.getElementById("teamGrid");
  grid.innerHTML = Object.entries(MEMBROS)
    .map(
      ([id, m]) => `
      <div class="group rounded-2xl bg-white dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/10 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-none">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold" style="background-color:${m.cor}">${m.iniciais}</div>
        <h3 class="font-bold mb-0.5">${m.nome}</h3>
        <p class="text-xs font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide mb-2">${m.cargo}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${m.bioCard}</p>
        <button type="button" class="text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline" data-open-profile="${id}">
          Mais Informações
        </button>
      </div>`
    )
    .join("");
}

// ---------------------------------------------------------------
// TEMA CLARO/ESCURO
// ---------------------------------------------------------------
function configurarTema() {
  const btn = document.getElementById("themeToggle");
  const iconeEscuro = btn.querySelector("[data-icon-dark]");
  const iconeClaro = btn.querySelector("[data-icon-light]");

  const atualizarIcones = () => {
    const escuro = document.documentElement.classList.contains("dark");
    iconeEscuro.classList.toggle("hidden", escuro);
    iconeClaro.classList.toggle("hidden", !escuro);
  };
  atualizarIcones();

  btn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "tn-theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
    atualizarIcones();
  });
}

// ---------------------------------------------------------------
// MENU MOBILE — max-height animado a partir do scrollHeight real
// ---------------------------------------------------------------
function configurarMenuMobile() {
  const btn = document.getElementById("menuToggle");
  const menu = document.getElementById("mobileMenu");
  const icone = btn.querySelector("i");

  btn.addEventListener("click", () => {
    const abrir = menu.style.maxHeight === "0px" || !menu.style.maxHeight;
    menu.style.maxHeight = abrir ? `${menu.scrollHeight}px` : "0px";
    btn.setAttribute("aria-expanded", String(abrir));
    icone.className = abrir ? "bi bi-x-lg text-xl" : "bi bi-list text-2xl";
  });

  // Fecha o menu ao clicar em qualquer link (após navegar até a seção)
  menu.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", () => {
      menu.style.maxHeight = "0px";
      btn.setAttribute("aria-expanded", "false");
      icone.className = "bi bi-list text-2xl";
    });
  });
}

// ---------------------------------------------------------------
// NAVBAR (fundo ao rolar) + BARRA DE PROGRESSO DE LEITURA
// ---------------------------------------------------------------
function configurarNavbarEProgresso() {
  const navbar = document.getElementById("navbar");
  const progresso = document.getElementById("progressBar");

  const atualizar = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 24);

    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const percentual = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    progresso.style.width = `${percentual}%`;
  };

  atualizar();
  window.addEventListener("scroll", atualizar, { passive: true });
}

// ---------------------------------------------------------------
// SCROLLSPY — destaca o link do menu conforme a seção visível
// (equivalente escrito à mão do data-bs-spy do Bootstrap)
// ---------------------------------------------------------------
function configurarScrollSpy() {
  const secoes = ["inicio", "servicos", "equipe", "contato"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const links = document.querySelectorAll("[data-nav-link]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const ativo = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", ativo);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  secoes.forEach((secao) => observer.observe(secao));
}

// ---------------------------------------------------------------
// REVEAL ON SCROLL — fade/slide-up para blocos com [data-reveal]
// ---------------------------------------------------------------
function configurarRevealOnScroll() {
  const alvos = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  alvos.forEach((alvo) => observer.observe(alvo));
}

// ---------------------------------------------------------------
// TABS de serviços com indicador deslizante
// ---------------------------------------------------------------
function configurarTabs() {
  const botoes = document.querySelectorAll("[data-tab-btn]");
  const paineis = document.querySelectorAll("[data-tab-panel]");
  const indicador = document.getElementById("tabIndicator");
  const lista = document.getElementById("tabList");

  const posicionarIndicador = (botao) => {
    const listaRect = lista.getBoundingClientRect();
    const botaoRect = botao.getBoundingClientRect();
    indicador.style.left = `${botaoRect.left - listaRect.left}px`;
    indicador.style.width = `${botaoRect.width}px`;
  };

  const ativarAba = (nome, botao) => {
    botoes.forEach((b) => b.classList.toggle("is-active", b === botao));
    paineis.forEach((p) => {
      const ativo = p.dataset.tabPanel === nome;
      p.classList.toggle("hidden", !ativo);
      p.classList.toggle("flex", ativo);
      p.classList.toggle("flex-col", ativo);
      p.classList.toggle("md:flex-row", ativo);
      p.classList.toggle("items-center", ativo);
      p.classList.toggle("gap-6", ativo);
    });
    posicionarIndicador(botao);
  };

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => ativarAba(botao.dataset.tab, botao));
  });

  // Posição inicial do indicador (aba "Web", ativa por padrão) — com
  // um pequeno delay para garantir que o layout já foi calculado.
  requestAnimationFrame(() => posicionarIndicador(document.querySelector("[data-tab-btn].is-active")));
  window.addEventListener("resize", () => {
    posicionarIndicador(document.querySelector("[data-tab-btn].is-active"));
  });
}

// ---------------------------------------------------------------
// MODAL DE PERFIL
// ---------------------------------------------------------------
function configurarModalDePerfil() {
  const modal = document.getElementById("profileModal");
  const conteudo = document.getElementById("profileModalContent");
  const backdrop = document.getElementById("profileModalBackdrop");
  const botaoFechar = document.getElementById("profileModalClose");

  const abrir = (id) => {
    const membro = MEMBROS[id];
    if (!membro) return;

    const avatar = document.getElementById("profileModalAvatar");
    avatar.textContent = membro.iniciais;
    avatar.style.backgroundColor = membro.cor;

    document.getElementById("profileModalName").textContent = membro.nome;
    document.getElementById("profileModalRole").textContent = membro.cargo;
    document.getElementById("profileModalBio").textContent = membro.bio;

    const skillsEl = document.getElementById("profileModalSkills");
    skillsEl.innerHTML = membro.skills
      .map((s) => `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">${s}</span>`)
      .join("");

    const socialsEl = document.getElementById("profileModalSocials");
    socialsEl.innerHTML = [
      { href: membro.github, icone: "bi-github", label: "GitHub" },
      { href: membro.linkedin, icone: "bi-linkedin", label: "LinkedIn" },
      { href: `mailto:${membro.email}`, icone: "bi-envelope", label: "E-mail" },
    ]
      .map(
        (r) => `<a href="${r.href}" target="_blank" rel="noopener" aria-label="${r.label}"
                    class="w-10 h-10 rounded-full flex items-center justify-center ring-1 ring-slate-200 dark:ring-white/15 hover:bg-gradient-to-br hover:from-brand-600 hover:to-fuchsia-500 hover:text-white hover:ring-transparent transition-all">
                    <i class="bi ${r.icone}"></i>
                  </a>`
      )
      .join("");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");

    // Reinicia a animação de entrada a cada abertura
    conteudo.classList.remove("animate-pop-in");
    void conteudo.offsetWidth;
    conteudo.classList.add("animate-pop-in");

    botaoFechar.focus();
  };

  const fechar = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
  };

  // Delegação de evento: os botões "Mais Informações" são criados
  // dinamicamente em renderTeamCards(), então o listener fica no
  // documento e verifica o alvo do clique.
  document.addEventListener("click", (event) => {
    const gatilho = event.target.closest("[data-open-profile]");
    if (gatilho) abrir(gatilho.dataset.openProfile);
  });

  botaoFechar.addEventListener("click", fechar);
  backdrop.addEventListener("click", fechar);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) fechar();
  });
}

// ---------------------------------------------------------------
// ACCORDION (FAQ) — altura animada a partir do scrollHeight real
// ---------------------------------------------------------------
function configurarAccordion() {
  const botoes = document.querySelectorAll("[data-accordion-btn]");

  botoes.forEach((botao) => {
    const painel = botao.nextElementSibling;

    botao.addEventListener("click", () => {
      const abrindo = botao.getAttribute("aria-expanded") !== "true";

      // Fecha os outros itens (comportamento de accordion clássico:
      // só um aberto por vez)
      botoes.forEach((outroBotao) => {
        if (outroBotao === botao) return;
        outroBotao.setAttribute("aria-expanded", "false");
        outroBotao.nextElementSibling.style.maxHeight = "0px";
        outroBotao.querySelector("[data-accordion-icon]").style.transform = "rotate(0deg)";
      });

      botao.setAttribute("aria-expanded", String(abrindo));
      painel.style.maxHeight = abrindo ? `${painel.scrollHeight}px` : "0px";
      botao.querySelector("[data-accordion-icon]").style.transform = abrindo ? "rotate(180deg)" : "rotate(0deg)";
    });
  });

  // Abre o primeiro item por padrão (o HTML já vem com aria-expanded
  //="true" nele, só falta calcular o max-height real).
  const primeiroPainel = botoes[0]?.nextElementSibling;
  if (primeiroPainel) primeiroPainel.style.maxHeight = `${primeiroPainel.scrollHeight}px`;
}

// ---------------------------------------------------------------
// FORMULÁRIO DE CONTATO — validação escrita à mão
// ---------------------------------------------------------------
function configurarFormulario() {
  const form = document.getElementById("formContato");
  const sucesso = document.getElementById("formSucesso");

  const validarCampo = (campo) => {
    let valido = campo.checkValidity();
    campo.classList.toggle("is-invalid", !valido);
    const erro = form.querySelector(`[data-error-for="${campo.id}"]`);
    if (erro) erro.classList.toggle("hidden", valido);
    return valido;
  };

  form.querySelectorAll(".form-input").forEach((campo) => {
    campo.addEventListener("blur", () => validarCampo(campo));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const campos = Array.from(form.querySelectorAll(".form-input"));
    const todosValidos = campos.map(validarCampo).every(Boolean);

    if (!todosValidos) {
      sucesso.classList.add("hidden");
      return;
    }

    sucesso.classList.remove("hidden");
    form.reset();
    campos.forEach((campo) => campo.classList.remove("is-invalid"));
  });
}

// ---------------------------------------------------------------
// BOTÃO "VOLTAR AO TOPO"
// ---------------------------------------------------------------
function configurarBotaoTopo() {
  const botao = document.getElementById("backToTop");

  window.addEventListener(
    "scroll",
    () => {
      const visivel = window.scrollY > 480;
      botao.classList.toggle("opacity-0", !visivel);
      botao.classList.toggle("pointer-events-none", !visivel);
      botao.classList.toggle("translate-y-4", !visivel);
    },
    { passive: true }
  );

  botao.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
