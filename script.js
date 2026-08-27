/* ==========================================================================
   Wish a Drink — script.js
   Namespace único (window.WAD) usado por todas as páginas do site.
   ========================================================================== */
(function () {
  "use strict";

  const CHAVE_CARRINHO = "wad_carrinho";
  const CHAVE_FAVORITOS = "wad_favoritos";
  const CHAVE_USUARIO = "wad_usuario";
  const CHAVE_USUARIOS = "wad_usuarios";
  const CHAVE_FONTE = "wad_escala_fonte";
  const CHAVE_CONTRASTE = "wad_alto_contraste";
  const CHAVE_ESCURO = "wad_modo_escuro";

  /* ------------------------------------------------------------------ */
  /* Catálogo de produtos (usado em index.html e bebidas.html)          */
  /* ------------------------------------------------------------------ */
  const produtos = [
    { id: "cerveja-heineken", nome: "Cerveja Heineken Long Neck 330ml", categoria: "cervejas", preco: 7.99, precoAntigo: 9.49, imagem: "Bebidas/Heineken.png" },
    { id: "refri-cola-2l", nome: "Coca-Cola Sabor Original 2L", categoria: "refrigerantes", preco: 11.99, imagem: "Bebidas/coca_cola2l.png" },
    { id: "refri-cola-lata", nome: "Coca-Cola Sabor Original Lata 350ml", categoria: "refrigerantes", preco: 4.99, imagem: "Bebidas/coca-cola-lata.webp" },
    { id: "guarana-2l", nome: "Guaraná Antarctica 2L", categoria: "refrigerantes", preco: 9.99, imagem: "Bebidas/Guarana2l.png" },
    { id: "suco-natural", nome: "Suco de Frutas Natural 1L", categoria: "sucos", preco: 13.90, precoAntigo: 16.90, imagem: "Bebidas/sucos.png" },
    { id: "energy-drink", nome: "Red Bull Energy Drink 250ml", categoria: "energeticos", preco: 9.99, precoAntigo: 12.49, imagem: "Bebidas/RedBull.png" },
    { id: "jack-daniels", nome: "Jack Daniel's Old No. 7 1L", categoria: "destilados", preco: 149.90, precoAntigo: 179.90, imagem: "Bebidas/Jack_Daniels.png" },
    { id: "vodka-absolute", nome: "Vodka Absolut 1L", categoria: "destilados", preco: 99.90, imagem: "Bebidas/vodka_absolute.png" },
    { id: "vinho-tinto", nome: "Vinho Tinto Seco 750ml", categoria: "vinhos", preco: 42.90, imagem: "Bebidas/vinho.png" }
  ];

  const idsDestaque = ["refri-cola-2l", "vodka-absolute", "refri-cola-lata", "vinho-tinto"];

  /* ------------------------------------------------------------------ */
  /* Utilidades                                                          */
  /* ------------------------------------------------------------------ */
  function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function lerJSON(chave, valorPadrao) {
    try {
      const bruto = localStorage.getItem(chave);
      return bruto ? JSON.parse(bruto) : valorPadrao;
    } catch (erro) {
      return valorPadrao;
    }
  }

  function salvarJSON(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  function normalizarTexto(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  /* ------------------------------------------------------------------ */
  /* Toasts (Bootstrap)                                                  */
  /* ------------------------------------------------------------------ */
  function mostrarToast(mensagem, tipo) {
    const container = document.getElementById("wad-toast-container");
    if (!container) {
      window.alert(mensagem);
      return;
    }
    const icone = tipo === "erro" ? "bi-exclamation-circle-fill text-danger" : "bi-check-circle-fill text-success";
    const classeExtra = tipo === "erro" ? "wad-toast-erro" : "wad-toast-sucesso";

    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center border-0 ${classeExtra}`;
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.setAttribute("aria-atomic", "true");
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icone} me-2"></i>${mensagem}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
      </div>`;
    container.appendChild(toastEl);

    if (window.bootstrap && window.bootstrap.Toast) {
      const toast = new window.bootstrap.Toast(toastEl, { delay: 3500 });
      toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
      toast.show();
    } else {
      toastEl.style.display = "block";
      setTimeout(() => toastEl.remove(), 3500);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Acessibilidade: fonte, contraste e modo escuro                      */
  /* ------------------------------------------------------------------ */
  function aplicarPreferencias() {
    const escala = parseFloat(localStorage.getItem(CHAVE_FONTE)) || 1;
    document.documentElement.style.setProperty("--wad-escala-fonte", escala);

    const contraste = lerJSON(CHAVE_CONTRASTE, false);
    document.documentElement.classList.toggle("wad-alto-contraste", contraste);

    const escuro = lerJSON(CHAVE_ESCURO, false);
    document.documentElement.classList.toggle("wad-modo-escuro", escuro);

    const btnContraste = document.getElementById("wad-btn-contraste");
    if (btnContraste) btnContraste.setAttribute("aria-pressed", String(contraste));

    const btnEscuro = document.getElementById("wad-btn-modo-escuro");
    if (btnEscuro) btnEscuro.setAttribute("aria-pressed", String(escuro));
  }

  function iniciarBarraAcessibilidade() {
    const barra = document.querySelector(".wad-a11y-bar");
    const btnMais = document.getElementById("wad-btn-fonte-mais");
    const btnMenos = document.getElementById("wad-btn-fonte-menos");
    const btnContraste = document.getElementById("wad-btn-contraste");
    const btnEscuro = document.getElementById("wad-btn-modo-escuro");

    if (barra && !document.querySelector(".wad-a11y-fab")) {
      barra.id = "wad-a11y-painel";
      const fab = document.createElement("button");
      fab.type = "button";
      fab.className = "wad-a11y-fab";
      fab.setAttribute("aria-label", "Abrir opções de acessibilidade");
      fab.setAttribute("aria-expanded", "false");
      fab.setAttribute("aria-controls", "wad-a11y-painel");
      fab.innerHTML = '<i class="bi bi-universal-access-circle" aria-hidden="true"></i>';
      document.body.appendChild(fab);

      const fecharPainel = () => {
        barra.classList.remove("is-open");
        fab.setAttribute("aria-expanded", "false");
        fab.setAttribute("aria-label", "Abrir opções de acessibilidade");
      };

      fab.addEventListener("click", (evento) => {
        evento.stopPropagation();
        const aberto = barra.classList.toggle("is-open");
        fab.setAttribute("aria-expanded", String(aberto));
        fab.setAttribute("aria-label", aberto ? "Fechar opções de acessibilidade" : "Abrir opções de acessibilidade");
      });

      document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") fecharPainel();
      });
      document.addEventListener("click", (evento) => {
        if (!barra.classList.contains("is-open")) return;
        if (!barra.contains(evento.target) && !fab.contains(evento.target)) fecharPainel();
      });
    }

    if (btnMais) {
      btnMais.addEventListener("click", () => {
        let escala = parseFloat(localStorage.getItem(CHAVE_FONTE)) || 1;
        escala = Math.min(1.3, escala + 0.1);
        localStorage.setItem(CHAVE_FONTE, String(escala));
        aplicarPreferencias();
      });
    }
    if (btnMenos) {
      btnMenos.addEventListener("click", () => {
        let escala = parseFloat(localStorage.getItem(CHAVE_FONTE)) || 1;
        escala = Math.max(0.85, escala - 0.1);
        localStorage.setItem(CHAVE_FONTE, String(escala));
        aplicarPreferencias();
      });
    }
    if (btnContraste) {
      btnContraste.addEventListener("click", () => {
        const atual = lerJSON(CHAVE_CONTRASTE, false);
        salvarJSON(CHAVE_CONTRASTE, !atual);
        aplicarPreferencias();
      });
    }
    if (btnEscuro) {
      btnEscuro.addEventListener("click", () => {
        const atual = lerJSON(CHAVE_ESCURO, false);
        salvarJSON(CHAVE_ESCURO, !atual);
        aplicarPreferencias();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Sessão de usuário (simulada — sem backend)                          */
  /* ------------------------------------------------------------------ */
  function obterUsuario() {
    return lerJSON(CHAVE_USUARIO, null);
  }

  function entrar(usuario) {
    salvarJSON(CHAVE_USUARIO, usuario);
  }

  function obterUsuarios() {
    return lerJSON(CHAVE_USUARIOS, []);
  }

  function cadastrarUsuario(usuario) {
    const usuarios = obterUsuarios();
    const email = usuario.email.trim().toLowerCase();
    const jaCadastrado = usuarios.some((item) => item.email.toLowerCase() === email);
    if (jaCadastrado) return false;
    usuarios.push({ ...usuario, email });
    salvarJSON(CHAVE_USUARIOS, usuarios);
    entrar({ nome: usuario.nome, email });
    return true;
  }

  function autenticarUsuario(email, senha) {
    const usuario = obterUsuarios().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.senha === senha);
    if (!usuario) return false;
    entrar({ nome: usuario.nome, email: usuario.email });
    return true;
  }

  function logout() {
    localStorage.removeItem(CHAVE_USUARIO);
    mostrarToast("Você saiu da sua conta.", "sucesso");
    setTimeout(() => { window.location.href = "index.html"; }, 900);
  }

  function iniciaisDoNome(nome) {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    const primeira = partes[0] ? partes[0][0] : "";
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    return (primeira + ultima).toUpperCase();
  }

  function montarAreaUsuario() {
    const areas = document.querySelectorAll("[data-wad-area-usuario]");
    if (!areas.length) return;
    const usuario = obterUsuario();

    areas.forEach((area) => {
      if (usuario) {
        area.innerHTML = `
          <div class="wad-user-box">
            <a href="minha_conta.html" class="wad-user-link" aria-label="Abrir informações da conta de ${usuario.nome}">
              <div class="wad-avatar" aria-hidden="true">${iniciaisDoNome(usuario.nome)}</div>
              <span>Olá, <strong>${usuario.nome.split(" ")[0]}</strong></span>
            </a>
            <button type="button" class="wad-btn-logout" data-wad-logout>
              <i class="bi bi-box-arrow-right"></i> Sair
            </button>
          </div>`;
        const btn = area.querySelector("[data-wad-logout]");
        if (btn) btn.addEventListener("click", logout);
      } else {
        area.innerHTML = `
          <a href="login.html" class="wad-link-entrar" aria-label="Entrar ou cadastrar">
            <i class="bi bi-person"></i> Entrar / cadastrar
          </a>`;
      }
    });
  }

  function montarAcessoAdmin() {
    const usuario = obterUsuario();
    const eAdmin = sessionStorage.getItem("wad_admin_autenticado") === "true" ||
      usuario?.email?.toLowerCase() === "wishadmin@gmail.com";
    if (!eAdmin) return;
    document.querySelectorAll("header nav").forEach((navegacao) => {
      if (navegacao.querySelector("[data-wad-admin-link]")) return;
      const link = document.createElement("a");
      link.href = "admin.html";
      link.className = "wad-admin-link";
      link.setAttribute("data-wad-admin-link", "true");
      link.setAttribute("aria-label", "Abrir painel administrativo beta");
      link.innerHTML = '<i class="bi bi-shield-lock" aria-hidden="true"></i><span>Admin beta</span>';
      const areaAcoes = navegacao.querySelector(".nav-actions, .navbar-collapse > .d-flex");
      if (areaAcoes) areaAcoes.prepend(link);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Carrinho de compras                                                 */
  /* ------------------------------------------------------------------ */
  function obterCarrinho() {
    return lerJSON(CHAVE_CARRINHO, []);
  }

  function salvarCarrinho(carrinho) {
    salvarJSON(CHAVE_CARRINHO, carrinho);
    atualizarBadgeCarrinho();
  }

  function adicionarAoCarrinho(produtoId, quantidade) {
    quantidade = quantidade || 1;
    const produto = produtos.find((item) => item.id === produtoId);
    if (!produto) return;

    const carrinho = obterCarrinho();
    const existente = carrinho.find((item) => item.id === produtoId);
    if (existente) {
      existente.quantidade += quantidade;
    } else {
      carrinho.push({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        quantidade
      });
    }
    salvarCarrinho(carrinho);
    mostrarToast(`${produto.nome} adicionado ao carrinho!`, "sucesso");
  }

  function removerDoCarrinho(produtoId) {
    const carrinho = obterCarrinho().filter((item) => item.id !== produtoId);
    salvarCarrinho(carrinho);
    renderizarCarrinho();
  }

  function atualizarQuantidade(produtoId, quantidade) {
    const carrinho = obterCarrinho();
    const item = carrinho.find((atual) => atual.id === produtoId);
    if (!item) return;
    item.quantidade = Math.max(1, quantidade);
    salvarCarrinho(carrinho);
    renderizarCarrinho();
  }

  function calcularTotalCarrinho() {
    return obterCarrinho().reduce((total, item) => total + item.preco * item.quantidade, 0);
  }

  function atualizarBadgeCarrinho() {
    const totalItens = obterCarrinho().reduce((total, item) => total + item.quantidade, 0);
    document.querySelectorAll("#wad-badge-carrinho, .wad-badge-carrinho").forEach((badge) => {
      badge.textContent = String(totalItens);
      badge.style.display = totalItens > 0 ? "flex" : "none";
    });
  }

  /* ------------------------------------------------------------------ */
  /* Favoritos                                                            */
  /* ------------------------------------------------------------------ */
  function obterFavoritos() {
    return lerJSON(CHAVE_FAVORITOS, []);
  }

  function salvarFavoritos(favoritos) {
    salvarJSON(CHAVE_FAVORITOS, favoritos);
    atualizarBadgeFavoritos();
  }

  function estaFavoritado(produtoId) {
    return obterFavoritos().includes(produtoId);
  }

  function alternarFavorito(produtoId) {
    const favoritos = obterFavoritos();
    const indice = favoritos.indexOf(produtoId);
    let favoritado;
    if (indice === -1) {
      favoritos.push(produtoId);
      favoritado = true;
    } else {
      favoritos.splice(indice, 1);
      favoritado = false;
    }
    salvarFavoritos(favoritos);
    return favoritado;
  }

  function atualizarBadgeFavoritos() {
    const total = obterFavoritos().length;
    document.querySelectorAll("#wad-badge-favoritos").forEach((badge) => {
      badge.textContent = String(total);
      badge.style.display = total > 0 ? "flex" : "none";
    });
  }

  /* ------------------------------------------------------------------ */
  /* Renderização: grade de produtos (index.html / bebidas.html / etc.)  */
  /* ------------------------------------------------------------------ */
  function criarCardProduto(produto) {
    const precoAntigoHtml = produto.precoAntigo
      ? `<span class="preco-antigo">${formatarPreco(produto.precoAntigo)}</span>`
      : "";
    const favoritado = estaFavoritado(produto.id);
    return `
      <li>
        <article class="produto-card">
          <button type="button" class="favorito" data-wad-favorito="${produto.id}" aria-label="Adicionar ${produto.nome} aos favoritos" aria-pressed="${favoritado}">
            <i class="bi ${favoritado ? "bi-heart-fill" : "bi-heart"}" aria-hidden="true"></i>
          </button>
          <img src="${produto.imagem}" alt="${produto.nome}" width="240" height="240" loading="lazy">
          <h3>${produto.nome}</h3>
          <p class="preco">
            ${precoAntigoHtml}
            <span class="preco-atual">${formatarPreco(produto.preco)}</span>
          </p>
          <button type="button" class="btn btn--primary btn--full" data-wad-adicionar="${produto.id}">Adicionar</button>
        </article>
      </li>`;
  }

  function renderizarListaProdutos(lista, seletorContainer) {
    const container = document.querySelector(seletorContainer);
    if (!container) return;
    container.innerHTML = lista.length
      ? lista.map(criarCardProduto).join("")
      : `<li class="text-center text-muted py-4">Nenhum produto encontrado nesta categoria.</li>`;
  }

  function iniciarGradesDeProdutos() {
    const parametros = new URLSearchParams(window.location.search);
    const termoBusca = normalizarTexto(parametros.get("q") || "");
    const campoBusca = document.getElementById("busca");
    if (campoBusca && termoBusca) campoBusca.value = parametros.get("q");

    document.querySelectorAll("[data-wad-produtos]").forEach((container) => {
      const filtro = container.getAttribute("data-wad-produtos");
      let lista = filtro === "ofertas"
        ? produtos.filter((produto) => produto.precoAntigo)
        : filtro === "destaque"
          ? idsDestaque.map((id) => produtos.find((produto) => produto.id === id)).filter(Boolean)
          : filtro === "todos"
            ? produtos
            : produtos.filter((produto) => produto.categoria === filtro);

      if (termoBusca && filtro === "todos") {
        lista = lista.filter((produto) => {
          const nome = normalizarTexto(produto.nome);
          const categoria = normalizarTexto(produto.categoria);
          return nome.includes(termoBusca) || categoria.includes(termoBusca);
        });
      }
      renderizarListaProdutos(lista, `[data-wad-produtos="${filtro}"]`);
    });

    // Botões "Adicionar" (delegação de evento cobre elementos renderizados dinamicamente)
    document.body.addEventListener("click", (evento) => {
      const botao = evento.target.closest("[data-wad-adicionar]");
      if (!botao) return;
      adicionarAoCarrinho(botao.getAttribute("data-wad-adicionar"), 1);
    });

    // Favoritar (persistido em localStorage, disponível em todas as páginas)
    document.body.addEventListener("click", (evento) => {
      const favorito = evento.target.closest(".favorito[data-wad-favorito]");
      if (!favorito) return;
      const produtoId = favorito.getAttribute("data-wad-favorito");
      const favoritado = alternarFavorito(produtoId);
      favorito.setAttribute("aria-pressed", String(favoritado));
      const icone = favorito.querySelector("i");
      if (icone) icone.className = favoritado ? "bi bi-heart-fill" : "bi bi-heart";
      renderizarFavoritos();
    });
  }

  function iniciarFiltrosCategoria() {
    const chips = document.querySelectorAll("[data-wad-filtro]");
    if (!chips.length) return;
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const categoria = chip.getAttribute("data-wad-filtro");
        const lista = categoria === "todos" ? produtos : produtos.filter((p) => p.categoria === categoria);
        renderizarListaProdutos(lista, "[data-wad-produtos]");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Renderização: página do carrinho                                    */
  /* ------------------------------------------------------------------ */
  function renderizarCarrinho() {
    const container = document.getElementById("wad-carrinho-lista");
    const resumo = document.getElementById("wad-carrinho-resumo");
    if (!container) return;

    const carrinho = obterCarrinho();

    if (!carrinho.length) {
      container.innerHTML = `
        <div class="wad-carrinho-vazio">
          <i class="bi bi-cart-x" aria-hidden="true"></i>
          <p class="mb-3">Seu carrinho está vazio.</p>
          <a href="bebidas.html" class="btn btn--accent">Ver bebidas</a>
        </div>`;
      if (resumo) resumo.innerHTML = "";
      return;
    }

    container.innerHTML = carrinho.map((item) => `
      <div class="wad-carrinho-item">
        <img src="${item.imagem}" alt="${item.nome}" width="72" height="72">
        <div class="flex-grow-1">
          <h3 class="h6 mb-1">${item.nome}</h3>
          <span class="preco-atual">${formatarPreco(item.preco)}</span>
        </div>
        <div class="wad-qtd-controle">
          <button type="button" aria-label="Diminuir quantidade de ${item.nome}" data-wad-menos="${item.id}">−</button>
          <span aria-live="polite">${item.quantidade}</span>
          <button type="button" aria-label="Aumentar quantidade de ${item.nome}" data-wad-mais="${item.id}">+</button>
        </div>
        <strong class="ms-3">${formatarPreco(item.preco * item.quantidade)}</strong>
        <button type="button" class="btn-close ms-3" aria-label="Remover ${item.nome} do carrinho" data-wad-remover="${item.id}"></button>
      </div>
    `).join("");

    if (resumo) {
      const total = calcularTotalCarrinho();
      resumo.innerHTML = `
        <div class="wad-resumo-item"><span>Subtotal</span><span>${formatarPreco(total)}</span></div>
        <div class="wad-resumo-item"><span>Entrega</span><span>Grátis</span></div>
        <div class="wad-resumo-total"><span>Total</span><span>${formatarPreco(total)}</span></div>
        <a href="checkout.html" class="btn btn-wad-primario w-100 py-2 fw-bold mt-3 justify-content-center">
          Finalizar compra <i class="bi bi-arrow-right"></i>
        </a>`;
    }
  }

  function iniciarPaginaCarrinho() {
    const container = document.getElementById("wad-carrinho-lista");
    if (!container) return;
    renderizarCarrinho();
    container.addEventListener("click", (evento) => {
      const menos = evento.target.closest("[data-wad-menos]");
      const mais = evento.target.closest("[data-wad-mais]");
      const remover = evento.target.closest("[data-wad-remover]");
      const carrinho = obterCarrinho();

      if (menos) {
        const item = carrinho.find((i) => i.id === menos.getAttribute("data-wad-menos"));
        if (item) atualizarQuantidade(item.id, item.quantidade - 1);
      }
      if (mais) {
        const item = carrinho.find((i) => i.id === mais.getAttribute("data-wad-mais"));
        if (item) atualizarQuantidade(item.id, item.quantidade + 1);
      }
      if (remover) {
        removerDoCarrinho(remover.getAttribute("data-wad-remover"));
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Renderização: página de favoritos                                   */
  /* ------------------------------------------------------------------ */
  function renderizarFavoritos() {
    const container = document.querySelector('[data-wad-produtos="favoritos"]');
    if (!container) return;

    const idsFavoritos = obterFavoritos();
    const lista = idsFavoritos
      .map((id) => produtos.find((produto) => produto.id === id))
      .filter(Boolean);

    const vazio = document.getElementById("wad-favoritos-vazio");

    if (!lista.length) {
      container.innerHTML = "";
      if (vazio) vazio.style.display = "block";
      return;
    }

    if (vazio) vazio.style.display = "none";
    renderizarListaProdutos(lista, '[data-wad-produtos="favoritos"]');
  }

  /* ------------------------------------------------------------------ */
  /* Renderização: resumo do checkout                                    */
  /* ------------------------------------------------------------------ */
  function iniciarResumoCheckout() {
    const resumo = document.getElementById("wad-checkout-resumo");
    if (!resumo) return;
    const carrinho = obterCarrinho();

    if (!carrinho.length) {
      resumo.innerHTML = `<p class="text-muted small mb-0">Seu carrinho está vazio. <a href="bebidas.html">Ver bebidas</a></p>`;
      return;
    }

    const total = calcularTotalCarrinho();
    resumo.innerHTML = carrinho.map((item) => `
      <div class="wad-resumo-item">
        <span>${item.quantidade}x ${item.nome}</span>
        <span>${formatarPreco(item.preco * item.quantidade)}</span>
      </div>
    `).join("") + `
      <div class="wad-resumo-item"><span>Entrega</span><span>Grátis</span></div>
      <div class="wad-resumo-total"><span>Total</span><span>${formatarPreco(total)}</span></div>
    `;

    const form = document.getElementById("wad-form-checkout");
    if (form) {
      form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          return;
        }
        localStorage.removeItem(CHAVE_CARRINHO);
        atualizarBadgeCarrinho();
        mostrarToast("Pedido confirmado com sucesso!", "sucesso");
        setTimeout(() => { window.location.href = "pedidos.html"; }, 1500);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Renderização: meus pedidos (dados de demonstração)                  */
  /* ------------------------------------------------------------------ */
  function iniciarListaPedidos() {
    const container = document.getElementById("wad-lista-pedidos");
    if (!container) return;

    const pedidosDemo = [
      { numero: "#WAD-1042", data: "18/08/2026", status: "entregue", total: 87.30 },
      { numero: "#WAD-1058", data: "20/08/2026", status: "transporte", total: 42.80 },
      { numero: "#WAD-1063", data: "22/08/2026", status: "preparo", total: 24.90 }
    ];

    const rotulos = { entregue: "Entregue", transporte: "Em transporte", preparo: "Em preparo" };

    container.innerHTML = pedidosDemo.map((pedido) => `
      <div class="wad-pedido-card d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>${pedido.numero}</strong>
          <div class="text-muted small">Realizado em ${pedido.data}</div>
        </div>
        <span class="wad-pedido-status wad-status-${pedido.status}">${rotulos[pedido.status]}</span>
        <strong>${formatarPreco(pedido.total)}</strong>
      </div>
    `).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Inicialização geral                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    aplicarPreferencias();
    iniciarBarraAcessibilidade();
    montarAreaUsuario();
    montarAcessoAdmin();
    atualizarBadgeCarrinho();
    atualizarBadgeFavoritos();
    iniciarGradesDeProdutos();
    iniciarFiltrosCategoria();
    iniciarPaginaCarrinho();
    iniciarResumoCheckout();
    iniciarListaPedidos();
    renderizarFavoritos();
  });

  /* ------------------------------------------------------------------ */
  /* API pública                                                         */
  /* ------------------------------------------------------------------ */
  window.WAD = {
    produtos,
    formatarPreco,
    mostrarToast,
    obterUsuario,
    entrar,
    cadastrarUsuario,
    autenticarUsuario,
    obterUsuarios,
    logout,
    obterCarrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    atualizarQuantidade,
    calcularTotalCarrinho,
    atualizarBadgeCarrinho,
    obterFavoritos,
    estaFavoritado,
    alternarFavorito,
    atualizarBadgeFavoritos
  };
})();
