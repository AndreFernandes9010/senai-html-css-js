// Gerador de memes — Aula 14 (jQuery). Busca templates reais via
// $.getJSON na API pública do Imgflip, monta a UI com jQuery e exporta
// o resultado em PNG usando <canvas>, sem nenhuma dependência além do
// próprio jQuery.

let TEMPLATES = [];
let idSelecionado = null;

$(function () {
  carregarTemplates();
  configurarBusca();
  configurarEditor();
  configurarReferencia();
  configurarScrollEReveal();
});

// ---------------------------------------------------------------
// CARREGAR TEMPLATES (AJAX)
// ---------------------------------------------------------------
function carregarTemplates() {
  $("#estadoErro").hide();
  $("#estadoCarregando").show();
  $("#memeGrid").empty();

  $.getJSON("https://api.imgflip.com/get_memes")
    .done((resposta) => {
      if (!resposta.success) {
        mostrarErro();
        return;
      }
      // Os templates já vêm ordenados por popularidade; os 40
      // primeiros são mais que suficientes para o gerador.
      TEMPLATES = resposta.data.memes.slice(0, 40);
      $("#estadoCarregando").hide();
      renderizarGrid(TEMPLATES);
    })
    .fail(mostrarErro);

  $("#tentarNovamente").off("click").on("click", carregarTemplates);
}

function mostrarErro() {
  $("#estadoCarregando").hide();
  $("#estadoErro").show();
}

// ---------------------------------------------------------------
// GRID DE TEMPLATES
// ---------------------------------------------------------------
function renderizarGrid(templates) {
  const $grid = $("#memeGrid").empty();
  $("#semResultados").toggle(templates.length === 0);

  templates.forEach((meme, indice) => {
    const $card = $(`
      <div class="meme-card${meme.id === idSelecionado ? " is-selecionado" : ""}" data-id="${meme.id}">
        <img src="${meme.url}" alt="${escapeHtml(meme.name)}" loading="lazy">
        <p class="meme-card__nome">${escapeHtml(meme.name)}</p>
      </div>
    `);

    $card.on("click", () => selecionarMeme(meme));
    $grid.append($card);

    // Entrada escalonada: cada card some um pouquinho depois do
    // anterior, em vez de todos aparecerem de uma vez.
    $card.css("opacity", 0).delay(indice * 25).animate({ opacity: 1 }, 220);
  });
}

function configurarBusca() {
  $("#buscaInput").on("input", function () {
    const termo = $(this).val().trim().toLowerCase();
    const filtrados = TEMPLATES.filter((meme) => meme.name.toLowerCase().includes(termo));
    renderizarGrid(filtrados);
  });
}

// ---------------------------------------------------------------
// EDITOR DE LEGENDA
// ---------------------------------------------------------------
function selecionarMeme(meme) {
  idSelecionado = meme.id;
  $(".meme-card").removeClass("is-selecionado");
  $(`.meme-card[data-id="${meme.id}"]`).addClass("is-selecionado");

  // crossorigin precisa ser definido ANTES do src, senão o navegador
  // já inicia o carregamento sem modo CORS e o <canvas> fica "tainted"
  // (não dá pra exportar a imagem depois).
  $("#memeImg").attr("crossorigin", "anonymous").attr("src", meme.url).attr("alt", meme.name);
  $("#inputTopo").val("");
  $("#inputBaixo").val("");
  $("#textoTopo").text("");
  $("#textoBaixo").text("");
  $("#editorStatus").text("").attr("class", "editor__status");

  $("#editor").removeAttr("hidden");
  $("html, body").animate({ scrollTop: $("#editor").offset().top - 20 }, 400);
}

function configurarEditor() {
  $("#inputTopo").on("input", function () {
    $("#textoTopo").text($(this).val().toUpperCase());
  });
  $("#inputBaixo").on("input", function () {
    $("#textoBaixo").text($(this).val().toUpperCase());
  });
  $("#fecharEditor").on("click", () => $("#editor").attr("hidden", true));
  $("#baixarMeme").on("click", baixarMeme);
}

// ---------------------------------------------------------------
// EXPORTAR PARA PNG (Canvas)
// ---------------------------------------------------------------
function baixarMeme() {
  const img = document.getElementById("memeImg");
  const canvas = document.getElementById("exportCanvas");
  const $status = $("#editorStatus");

  if (!img.complete || !img.naturalWidth) {
    $status.text("A imagem ainda está carregando — tente de novo em um instante.").attr("class", "editor__status editor__status--erro");
    return;
  }

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  desenharTextoMeme(ctx, $("#inputTopo").val().toUpperCase(), canvas.width, canvas.height, "top");
  desenharTextoMeme(ctx, $("#inputBaixo").val().toUpperCase(), canvas.width, canvas.height, "bottom");

  try {
    canvas.toBlob((blob) => {
      if (!blob) {
        $status.text("Não foi possível gerar o arquivo.").attr("class", "editor__status editor__status--erro");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meme.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      $status.text("Meme baixado! 🎉").attr("class", "editor__status editor__status--ok");
      $("#baixarMeme").animate({ opacity: 0.4 }, 90).animate({ opacity: 1 }, 160);
    }, "image/png");
  } catch (erro) {
    $status
      .text("O navegador bloqueou a exportação por uma restrição de segurança (CORS) desta imagem.")
      .attr("class", "editor__status editor__status--erro");
  }
}

function desenharTextoMeme(ctx, texto, largura, altura, posicao) {
  if (!texto) return;

  const tamanhoFonte = Math.round(largura * 0.09);
  ctx.font = `bold ${tamanhoFonte}px Impact, "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.lineWidth = tamanhoFonte * 0.09;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";
  ctx.textBaseline = posicao === "top" ? "top" : "bottom";

  const x = largura / 2;
  const margem = tamanhoFonte * 0.3;
  const alturaLinha = tamanhoFonte * 1.1;
  const linhas = quebrarEmLinhas(ctx, texto, largura * 0.92);

  linhas.forEach((linha, i) => {
    const y =
      posicao === "top"
        ? margem + i * alturaLinha
        : altura - margem - (linhas.length - 1 - i) * alturaLinha;
    ctx.strokeText(linha, x, y);
    ctx.fillText(linha, x, y);
  });
}

function quebrarEmLinhas(ctx, texto, larguraMaxima) {
  const palavras = texto.split(" ");
  const linhas = [];
  let atual = "";

  palavras.forEach((palavra) => {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (ctx.measureText(tentativa).width > larguraMaxima && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = tentativa;
    }
  });
  if (atual) linhas.push(atual);
  return linhas;
}

// ---------------------------------------------------------------
// REFERÊNCIA jQuery x VANILLA
// ---------------------------------------------------------------
function configurarReferencia() {
  $("#toggleReferencia").on("click", function () {
    const abrindo = $("#compareBox").is(":hidden");
    $("#compareBox").slideToggle(200);
    $(this).text(abrindo ? "Ocultar comparação" : "Mostrar comparação").attr("aria-expanded", String(abrindo));
  });
}

// ---------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------
function escapeHtml(texto) {
  return $("<div>").text(texto).html();
}

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
  document.querySelectorAll(".panel").forEach((painel) => observer.observe(painel));
}
