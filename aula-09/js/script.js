// Dados de cada membro da equipe — a única fonte de verdade usada
// para preencher o modal de perfil dinamicamente.
const MEMBROS = {
  rafael: {
    nome: "Rafael Nakamura",
    cargo: "Desenvolvedor Front-end",
    iniciais: "RN",
    cor: "#4f46e5",
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
    bio: "Cria experiências claras e acessíveis, do wireframe ao design system, sempre com o usuário final como ponto de partida.",
    skills: ["Figma", "Design System", "Acessibilidade"],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "larissa@technova.com.br",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  configurarModalDePerfil();
  configurarValidacaoDoFormulario();
});

function configurarModalDePerfil() {
  const modalPerfil = document.getElementById("modalPerfil");
  const modalContent = modalPerfil.querySelector(".tn-modal__content");

  // "show.bs.modal" dispara antes do modal aparecer e carrega, em
  // event.relatedTarget, o botão que foi clicado — é dali que lemos
  // qual membro da equipe deve preencher o modal.
  modalPerfil.addEventListener("show.bs.modal", (event) => {
    const botao = event.relatedTarget;
    const membro = MEMBROS[botao.getAttribute("data-member-id")];
    if (!membro) return;

    const avatar = document.getElementById("modalPerfilAvatar");
    avatar.textContent = membro.iniciais;
    avatar.style.setProperty("--tn-avatar-color", membro.cor);

    document.getElementById("modalPerfilLabel").textContent = membro.nome;
    document.getElementById("modalPerfilRole").textContent = membro.cargo;
    document.getElementById("modalPerfilBio").textContent = membro.bio;

    const skillsEl = document.getElementById("modalPerfilSkills");
    skillsEl.innerHTML = "";
    membro.skills.forEach((skill) => {
      const pill = document.createElement("span");
      pill.className = "tn-skill-pill";
      pill.textContent = skill;
      skillsEl.appendChild(pill);
    });

    const socialsEl = document.getElementById("modalPerfilSocials");
    socialsEl.innerHTML = "";
    [
      { href: membro.github, icone: "bi-github", label: "GitHub" },
      { href: membro.linkedin, icone: "bi-linkedin", label: "LinkedIn" },
      { href: `mailto:${membro.email}`, icone: "bi-envelope", label: "E-mail" },
    ].forEach((rede) => {
      const link = document.createElement("a");
      link.href = rede.href;
      link.target = "_blank";
      link.rel = "noopener";
      link.className = "tn-social-btn";
      link.setAttribute("aria-label", rede.label);
      link.innerHTML = `<i class="bi ${rede.icone}"></i>`;
      socialsEl.appendChild(link);
    });

    // Remove a classe, força o navegador a recalcular o layout
    // (void ...offsetWidth) e adiciona de novo — é o truque para uma
    // animação CSS rodar outra vez num elemento que nunca saiu do DOM.
    modalContent.classList.remove("tn-modal-pop");
    void modalContent.offsetWidth;
    modalContent.classList.add("tn-modal-pop");
  });
}

function configurarValidacaoDoFormulario() {
  const form = document.getElementById("formContato");
  const sucesso = document.getElementById("formSucesso");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      sucesso.classList.add("d-none");
      return;
    }

    sucesso.classList.remove("d-none");
    form.reset();
    form.classList.remove("was-validated");
  });
}
