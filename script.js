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
  const CHAVE_COOKIES = "wad_cookies_aceito";
  const ADMIN_PADRAO = {
    nome: "WishAdmin",
    email: "admin@wishadrink.com",
    senha: "Admin123!"
  };

  /* ------------------------------------------------------------------ */
  /* Catálogo de produtos (usado em index.html e bebidas.html)          */
  /* ------------------------------------------------------------------ */
  const produtos = [
    { id: "cerveja-heineken", nome: "Cerveja Heineken Long Neck 330ml", descricao: "Lager premium, equilibrada e refrescante.", categoria: "cervejas", preco: 7.99, precoAntigo: 9.49, imagem: "Assets/images/produtos/cervejas/Heineken.png" },
    { id: "cerveja-budweiser", nome: "Cerveja Budweiser Long Neck 330ml", descricao: "American lager leve, dourada e refrescante.", categoria: "cervejas", preco: 5.99, imagem: "Assets/images/produtos/cervejas/Budwaiser.png" },
    { id: "cerveja-spaten", nome: "Cerveja Spaten Puro Malte 355ml", descricao: "Munich Helles puro malte, leve e equilibrada.", categoria: "cervejas", preco: 6.99, precoAntigo: 8.49, imagem: "Assets/images/produtos/cervejas/Spaten.png" },
    { id: "refri-cola-2l", nome: "Coca-Cola Sabor Original 2L", descricao: "Refrigerante de cola com sabor original.", categoria: "refrigerantes", preco: 11.99, imagem: "Assets/images/produtos/refrigerante/coca_cola2l.png" },
    { id: "refri-cola-lata", nome: "Coca-Cola Sabor Original Lata 350ml", descricao: "Refrigerante de cola em lata, ideal para servir gelado.", categoria: "refrigerantes", preco: 4.99, imagem: "Assets/images/produtos/refrigerante/coca-cola-lata.webp" },
    { id: "guarana-2l", nome: "Guaraná Antarctica 2L", descricao: "Refrigerante brasileiro de guaraná, doce e refrescante.", categoria: "refrigerantes", preco: 9.99, imagem: "Assets/images/produtos/refrigerante/Guarana2l.png" },
    { id: "fanta-laranja-1-5l", nome: "Fanta Laranja 1,5L", descricao: "Refrigerante de laranja com sabor cítrico e refrescante.", categoria: "refrigerantes", preco: 8.99, imagem: "Assets/images/produtos/refrigerante/fanta_PNG49.png" },
    { id: "sprite-2l", nome: "Sprite Lemon Fresh 2L", descricao: "Refrigerante sabor limão, leve e refrescante.", categoria: "refrigerantes", preco: 9.99, imagem: "Assets/images/produtos/refrigerante/sprite.png" },
    { id: "h2oh-limao-500ml", nome: "H2OH! Limão 500ml", descricao: "Bebida levemente gaseificada com sabor de limão.", categoria: "refrigerantes", preco: 4.49, imagem: "Assets/images/produtos/refrigerante/H2OH_Limao_500ml.png" },
    { id: "suco-natural", nome: "Suco de Frutas Natural 1L", descricao: "Suco de frutas para acompanhar as suas refeições.", categoria: "sucos", preco: 13.90, precoAntigo: 16.90, imagem: "Assets/images/produtos/sucos/sucos.png" },
    { id: "energy-drink", nome: "Red Bull Energy Drink 250ml", descricao: "Bebida energética com cafeína, taurina e vitaminas do complexo B.", categoria: "energeticos", preco: 9.99, precoAntigo: 12.49, imagem: "Assets/images/produtos/energeticos/RedBull.png" },
    { id: "jack-daniels", nome: "Jack Daniel's Old No. 7 1L", descricao: "Tennessee whiskey encorpado, com notas de carvalho e baunilha.", categoria: "destilados", preco: 149.90, precoAntigo: 179.90, imagem: "Assets/images/produtos/whisky/Jack_Daniels.png" },
    { id: "whisky-red-label", nome: "Johnnie Walker Red Label 1L", descricao: "Blended Scotch Whisky vibrante, com notas defumadas e especiadas.", categoria: "destilados", preco: 129.90, precoAntigo: 149.90, imagem: "Assets/images/produtos/whisky/Whisky_Red_Label_PNG_Transparente_Sem_Fundo.png" },
    { id: "vodka-absolute", nome: "Vodka Absolut 1L", descricao: "Vodka sueca com sabor limpo e textura suave.", categoria: "destilados", preco: 99.90, imagem: "Assets/images/produtos/vodka/vodka_absolute.png" },
    { id: "vinho-tinto", nome: "Vinho Tinto Seco 750ml", descricao: "Vinho tinto seco para harmonizar com massas e carnes.", categoria: "vinhos", preco: 42.90, imagem: "Assets/images/produtos/vinhos/vinho.png" },
    { id: "cerveja-heineken-zero-garrafa-330ml", nome: "Cerveja Heineken Zero Garrafa 330ml", descricao: "Sabor refrescante de Heineken, agora sem álcool e perfeita para qualquer ocasião.", categoria: "cervejas", preco: 8.49, imagem: "Assets/images/produtos/cervejas/cerveja-heineken-zero-garrafa-330ml.png" },
    { id: "cerveja-praya-classica-600ml", nome: "Cerveja Praya Receita Clássica 600ml", descricao: "Cerveja artesanal leve e equilibrada, ideal para compartilhar bem gelada.", categoria: "cervejas", preco: 19.90, imagem: "Assets/images/produtos/cervejas/cerveja-praya-classica-600ml.png" },
    { id: "cerveja-praya-classica-269ml", nome: "Cerveja Praya Receita Clássica 269ml", descricao: "Receita artesanal refrescante em uma embalagem prática para o delivery.", categoria: "cervejas", preco: 7.99, imagem: "Assets/images/produtos/cervejas/cerveja-praya-classica-269ml.png" },
    { id: "cerveja-heineken-zero-lata-350ml", nome: "Cerveja Heineken Zero Lata Sleek 350ml", descricao: "Uma lager refrescante sem álcool, com o sabor marcante da Heineken.", categoria: "cervejas", preco: 8.99, imagem: "Assets/images/produtos/cervejas/cerveja-heineken-zero-lata-350ml.png" },
    { id: "cerveja-corona-330ml", nome: "Cerveja Pilsen Corona Garrafa 330ml", descricao: "Pilsen leve e refrescante, perfeita para servir bem gelada com limão.", categoria: "cervejas", preco: 8.49, imagem: "Assets/images/produtos/cervejas/cerveja-corona-330ml.png" },
    { id: "cerveja-heineken-lata-350ml", nome: "Cerveja Heineken Lata Sleek 350ml", descricao: "Lager premium de sabor equilibrado e final refrescante.", categoria: "cervejas", preco: 7.99, imagem: "Assets/images/produtos/cervejas/cerveja-heineken-lata-350ml.png" },
    { id: "cerveja-blue-moon-lata-350ml", nome: "Cerveja Belgian White Ale Blue Moon Lata 350ml", descricao: "Witbier cremosa e aromática, com notas cítricas e toque de coentro.", categoria: "cervejas", preco: 12.90, imagem: "Assets/images/produtos/cervejas/cerveja-blue-moon-lata-350ml.png" },
    { id: "cerveja-stella-330ml", nome: "Cerveja Puro Malte Pure Gold Stella Artois Garrafa 330ml", descricao: "Puro malte elegante, leve e dourada para momentos especiais.", categoria: "cervejas", preco: 7.49, imagem: "Assets/images/produtos/cervejas/cerveja-stella-330ml.png" },
    { id: "cerveja-lagunitas-lata-350ml", nome: "Cerveja IPA Lagunitas Lata 350ml", descricao: "IPA aromática e intensa, com amargor equilibrado e final marcante.", categoria: "cervejas", preco: 13.90, imagem: "Assets/images/produtos/cervejas/cerveja-lagunitas-lata-350ml.png" },
    { id: "cerveja-baden-cristal-lata-350ml", nome: "Cerveja Pilsen Cristal Baden Baden Lata 350ml", descricao: "Pilsen artesanal leve, dourada e muito refrescante.", categoria: "cervejas", preco: 8.49, imagem: "Assets/images/produtos/cervejas/cerveja-baden-cristal-lata-350ml.png" },
    { id: "cerveja-michelob-garrafa-330ml", nome: "Cerveja Superior Light Michelob Ultra Garrafa 330ml", descricao: "Lager leve e suave, com baixa caloria e alta refrescância.", categoria: "cervejas", preco: 7.99, imagem: "Assets/images/produtos/cervejas/cerveja-michelob-garrafa-330ml.png" },
    { id: "cerveja-stella-lager-330ml", nome: "Cerveja Lager Premium Puro Malte Stella Artois Garrafa 330ml", descricao: "Lager premium puro malte, delicada, equilibrada e refrescante.", categoria: "cervejas", preco: 7.49, imagem: "Assets/images/produtos/cervejas/cerveja-stella-lager-330ml.png" },
    { id: "cerveja-michelob-lata-350ml", nome: "Cerveja Superior Light Michelob Ultra Lata 350ml", descricao: "Leve, refrescante e fácil de beber, ideal para acompanhar o dia.", categoria: "cervejas", preco: 8.49, imagem: "Assets/images/produtos/cervejas/cerveja-michelob-lata-350ml.png" },
    { id: "cerveja-baden-ipa-maracuja-350ml", nome: "Cerveja IPA Puro Malte Maracujá Baden Baden Lata 350ml", descricao: "IPA artesanal com notas tropicais de maracujá e amargor agradável.", categoria: "cervejas", preco: 9.99, imagem: "Assets/images/produtos/cervejas/cerveja-baden-ipa-maracuja-350ml.png" },
    { id: "cerveja-baden-witbier-350ml", nome: "Cerveja Witbier Coentro e Laranja Baden Baden Lata 350ml", descricao: "Witbier cremosa com aroma cítrico de laranja e toque de coentro.", categoria: "cervejas", preco: 9.99, imagem: "Assets/images/produtos/cervejas/cerveja-baden-witbier-350ml.png" },
    { id: "cerveja-coronita-210ml", nome: "Cerveja Pilsen Coronita Extra Garrafa 210ml", descricao: "Pilsen leve e refrescante em tamanho compacto, ótima para servir gelada.", categoria: "cervejas", preco: 5.99, imagem: "Assets/images/produtos/cervejas/cerveja-coronita-210ml.png" },
    { id: "cerveja-lagunitas-long-neck-355ml", nome: "Cerveja Lagunitas IPA Long Neck 355ml", descricao: "IPA encorpada e aromática, com lúpulo intenso e final equilibrado.", categoria: "cervejas", preco: 13.90, imagem: "Assets/images/produtos/cervejas/cerveja-lagunitas-long-neck-355ml.png" },
    { id: "cerveja-eisenbahn-pale-ale-350ml", nome: "Cerveja Eisenbahn Pale Ale Puro Malte Lata 350ml", descricao: "Pale Ale puro malte com notas maltadas e amargor delicado.", categoria: "cervejas", preco: 7.49, imagem: "Assets/images/produtos/cervejas/cerveja-eisenbahn-pale-ale-350ml.png" },
    { id: "cerveja-spaten-lata-350ml", nome: "Cerveja Munich Helles Puro Malte Spaten Lata 350ml", descricao: "Lager alemã puro malte, dourada, suave e muito refrescante.", categoria: "cervejas", preco: 7.49, imagem: "Assets/images/produtos/cervejas/cerveja-spaten-lata-350ml.png" },
    { id: "cerveja-heineken-lata-269ml", nome: "Cerveja Lager Puro Malte Heineken Lata 269ml", descricao: "A clássica lager premium em lata compacta, com sabor equilibrado.", categoria: "cervejas", preco: 6.49, imagem: "Assets/images/produtos/cervejas/cerveja-heineken-lata-269ml.png" },
    { id: "cerveja-amstel-ultra-lata-269ml", nome: "Cerveja Lager Puro Malte sem Glúten Amstel Ultra Lata 269ml", descricao: "Lager puro malte leve e refrescante, sem glúten.", categoria: "cervejas", preco: 4.99, imagem: "Assets/images/produtos/cervejas/cerveja-amstel-ultra-lata-269ml.png" },
    { id: "cerveja-antarctica-original-269ml", nome: "Cerveja Pilsen Antarctica Original Lata 269ml", descricao: "Pilsen brasileira leve e refrescante para acompanhar qualquer ocasião.", categoria: "cervejas", preco: 4.49, imagem: "Assets/images/produtos/cervejas/cerveja-antarctica-original-269ml.png" },
    { id: "cerveja-eisenbahn-american-ipa-350ml", nome: "Cerveja Eisenbahn American IPA Puro Malte Lata 350ml", descricao: "American IPA puro malte com aromas cítricos e amargor marcante.", categoria: "cervejas", preco: 8.49, imagem: "Assets/images/produtos/cervejas/cerveja-eisenbahn-american-ipa-350ml.png" },
    { id: "cerveja-amstel-ultra-garrafa-275ml", nome: "Cerveja Lager Puro Malte sem Glúten Amstel Ultra Garrafa 275ml", descricao: "Lager puro malte sem glúten, leve e perfeita para beber bem gelada.", categoria: "cervejas", preco: 5.49, imagem: "Assets/images/produtos/cervejas/cerveja-amstel-ultra-garrafa-275ml.png" },
    { id: "cerveja-amstel-lata-350ml", nome: "Cerveja Lager Puro Malte Amstel Lata 350ml", descricao: "Lager puro malte de sabor suave e refrescante, ótima para o delivery.", categoria: "cervejas", preco: 5.49, imagem: "Assets/images/produtos/cervejas/cerveja-amstel-lata-350ml.png" },
    { id: "cerveja-baden-golden-ale-350ml", nome: "Cerveja Golden Ale Canela e Frutas Vermelhas Baden Baden Lata 350ml", descricao: "Golden Ale aromática com notas de canela e frutas vermelhas.", categoria: "cervejas", preco: 9.99, imagem: "Assets/images/produtos/cervejas/cerveja-baden-golden-ale-350ml.png" },
    { id: "cerveja-blue-moon-garrafa-355ml", nome: "Cerveja Belgian White BLUE MOON Wheat Ale Garrafa 355ml", descricao: "Wheat Ale importada, cítrica, cremosa e muito aromática.", categoria: "cervejas", preco: 14.90, imagem: "Assets/images/produtos/cervejas/cerveja-blue-moon-garrafa-355ml.png" },
    { id: "cerveja-eisenbahn-pilsen-350ml", nome: "Cerveja Pilsen Puro Malte Eisenbahn Lata 350ml", descricao: "Pilsen puro malte equilibrada, leve e refrescante.", categoria: "cervejas", preco: 7.49, imagem: "Assets/images/produtos/cervejas/cerveja-eisenbahn-pilsen-350ml.png" },
    { id: "cerveja-imperio-ultra-275ml", nome: "Cerveja Império Ultra Longneck 275ml", descricao: "Lager leve e refrescante em uma long neck prática.", categoria: "cervejas", preco: 4.99, imagem: "Assets/images/produtos/cervejas/cerveja-imperio-ultra-275ml.png" },
    { id: "cerveja-baden-cristal-garrafa-600ml", nome: "Cerveja Pilsen Puro Malte Cristal Baden Baden Garrafa 600ml", descricao: "Pilsen artesanal puro malte, suave e perfeita para compartilhar.", categoria: "cervejas", preco: 14.90, imagem: "Assets/images/produtos/cervejas/cerveja-baden-cristal-garrafa-600ml.png" },
    { id: "cerveja-eisenbahn-american-ipa-garrafa-355ml", nome: "Cerveja American IPA Puro Malte Eisenbahn Garrafa 355ml", descricao: "IPA puro malte aromática, com lúpulo cítrico e amargor equilibrado.", categoria: "cervejas", preco: 9.49, imagem: "Assets/images/produtos/cervejas/cerveja-eisenbahn-american-ipa-garrafa-355ml.png" },
    { id: "cerveja-amstel-lata-269ml", nome: "Cerveja Amstel Lata 269ml", descricao: "Lager leve e refrescante, ideal para servir bem gelada.", categoria: "cervejas", preco: 4.49, imagem: "Assets/images/produtos/cervejas/cerveja-amstel-lata-269ml.png" },
    { id: "cerveja-baden-golden-ale-garrafa-600ml", nome: "Cerveja Golden Ale Baden Baden Garrafa 600ml", descricao: "Golden Ale artesanal encorpada e aromática para compartilhar.", categoria: "cervejas", preco: 15.90, imagem: "Assets/images/produtos/cervejas/cerveja-baden-golden-ale-garrafa-600ml.png" },
    { id: "cerveja-baden-american-ipa-garrafa-600ml", nome: "Cerveja American IPA Puro Malte Baden Baden Garrafa 600ml", descricao: "American IPA artesanal intensa, aromática e com amargor elegante.", categoria: "cervejas", preco: 15.90, imagem: "Assets/images/produtos/cervejas/cerveja-baden-american-ipa-garrafa-600ml.png" },
    { id: "cerveja-baden-witbier-garrafa-600ml", nome: "Cerveja Witbier Coentro e Laranja Baden Baden Garrafa 600ml", descricao: "Witbier cremosa com laranja e coentro, ideal para compartilhar.", categoria: "cervejas", preco: 15.90, imagem: "Assets/images/produtos/cervejas/cerveja-baden-witbier-garrafa-600ml.png" },
    { id: "cerveja-estrella-galicia-269ml", nome: "Cerveja Lager Puro Malte Estrella Galicia Lata 269ml", descricao: "Lager espanhola puro malte, equilibrada e refrescante.", categoria: "cervejas", preco: 5.49, imagem: "Assets/images/produtos/cervejas/cerveja-estrella-galicia-269ml.png" },
    { id: "cerveja-eisenbahn-pale-ale-garrafa-355ml", nome: "Cerveja Pale Ale Puro Malte Eisenbahn Garrafa 355ml", descricao: "Pale Ale puro malte com aroma maltado e final levemente amargo.", categoria: "cervejas", preco: 9.49, imagem: "Assets/images/produtos/cervejas/cerveja-eisenbahn-pale-ale-garrafa-355ml.png" },
    { id: "cerveja-michelob-lata-269ml", nome: "Cerveja Superior Light sem Glúten Michelob Ultra Lata 269ml", descricao: "Lager light sem glúten, leve e refrescante para todos os momentos.", categoria: "cervejas", preco: 6.49, imagem: "Assets/images/produtos/cervejas/cerveja-michelob-lata-269ml.png" },
    { id: "cerveja-budweiser-lata-269ml", nome: "Cerveja Pilsen Budweiser Lata 269ml", descricao: "Pilsen americana leve e refrescante em lata compacta.", categoria: "cervejas", preco: 4.49, imagem: "Assets/images/produtos/cervejas/cerveja-budweiser-lata-269ml.png" },
    { id: "cerveja-stella-lata-350ml", nome: "Cerveja Puro Malte Pure Gold Stella Artois Lata 350ml", descricao: "Puro malte dourada e elegante, com sabor equilibrado.", categoria: "cervejas", preco: 7.49, imagem: "Assets/images/produtos/cervejas/cerveja-stella-lata-350ml.png" },
    { id: "cerveja-corona-lata-350ml", nome: "Cerveja Corona Extra Lata 350ml", descricao: "Pilsen leve e refrescante para aproveitar bem gelada.", categoria: "cervejas", preco: 7.49, imagem: "Assets/images/produtos/cervejas/cerveja-corona-lata-350ml.png" },
    { id: "cerveja-stella-lata-269ml", nome: "Cerveja Puro Malte Pure Gold sem Glúten Stella Artois Lata 269ml", descricao: "Puro malte premium sem glúten, leve e refrescante.", categoria: "cervejas", preco: 6.49, imagem: "Assets/images/produtos/cervejas/cerveja-stella-lata-269ml.png" }
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

  function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function cpfValido(cpf) {
    const valor = String(cpf || "").replace(/\D/g, "");
    if (valor.length !== 11 || /^([0-9])\1{10}$/.test(valor)) return false;

    let soma = 0;
    for (let indice = 0; indice < 9; indice += 1) {
      soma += Number(valor.charAt(indice)) * (10 - indice);
    }
    let digito1 = (soma * 10) % 11;
    if (digito1 === 10) digito1 = 0;
    if (digito1 !== Number(valor.charAt(9))) return false;

    soma = 0;
    for (let indice = 0; indice < 10; indice += 1) {
      soma += Number(valor.charAt(indice)) * (11 - indice);
    }
    let digito2 = (soma * 10) % 11;
    if (digito2 === 10) digito2 = 0;
    return digito2 === Number(valor.charAt(10));
  }

  function senhaForte(senha) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(String(senha || ""));
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

  function fecharModalAtivo() {
    const modal = document.querySelector(".wad-modal-backdrop.is-visible");
    if (!modal) return;
    modal.classList.remove("is-visible");
    setTimeout(() => modal.remove(), 180);
  }

  function mostrarModalCookies() {
    if (localStorage.getItem(CHAVE_COOKIES) !== null || document.querySelector(".wad-cookie-banner")) return;

    const cookieBar = document.createElement("div");
    cookieBar.className = "wad-cookie-banner is-visible";
    cookieBar.setAttribute("role", "dialog");
    cookieBar.setAttribute("aria-live", "polite");
    cookieBar.setAttribute("aria-label", "Aviso de cookies");
    cookieBar.innerHTML = `
      <div class="wad-cookie-banner__inner">
        <div class="wad-cookie-banner__content">
          <p class="wad-cookie-banner__message">
            O Wish a Drink utiliza cookies e outras tecnologias semelhantes para melhorar a sua experiência,
            de acordo com a nossa
            <a href="#" class="wad-cookie-banner__link">Política de Privacidade</a>
            e, ao continuar navegando, você concorda com estas condições.
          </p>
        </div>
        <div class="wad-cookie-banner__actions">
          <button type="button" class="wad-cookie-banner__btn wad-cookie-banner__btn--primary" data-wad-cookie="aceito">Continuar</button>
        </div>
      </div>`;
    document.body.appendChild(cookieBar);

    cookieBar.querySelector("[data-wad-cookie]").addEventListener("click", () => {
      localStorage.setItem(CHAVE_COOKIES, "true");
      cookieBar.classList.remove("is-visible");
      setTimeout(() => cookieBar.remove(), 200);
    });
  }

  function mostrarModalCadastro() {
    if (document.querySelector(".wad-signup-modal") || obterUsuario()) return;

    const backdrop = document.createElement("div");
    backdrop.className = "wad-modal-backdrop is-visible wad-signup-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", "Cadastro obrigatório");
    backdrop.innerHTML = `
      <div class="wad-modal wad-signup-modal" tabindex="-1">
        <div class="wad-modal__content wad-signup-modal__content">
          <button type="button" class="wad-modal__close wad-signup-modal__close" aria-label="Fechar aviso" data-wad-close-modal>
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>

          <h2>Faça login ou crie uma conta</h2>
          <p class="wad-signup-modal__lead">
            Para adicionar produtos ao carrinho, entre ou cadastre-se gratuitamente.
          </p>

          <div class="wad-signup-modal__divider"><span>Use seu e-mail para continuar</span></div>

          <label class="wad-signup-modal__label" for="wad-signup-email">E-mail ou telefone</label>
          <input id="wad-signup-email" class="wad-signup-modal__input" type="text" autocomplete="email" placeholder="Digite seu e-mail ou telefone" />

          <button type="button" class="wad-signup-modal__continue" data-wad-login="continuar">Continuar</button>
          <p class="wad-signup-modal__terms">
            Ao continuar, você concorda com os <a href="sobre.html#termos">Termos de uso</a> e a
            <a href="sobre.html#privacidade">Política de privacidade</a> da Wish a Drink.
          </p>
          <a class="wad-signup-modal__help" href="sobre.html#privacidade">Precisa de ajuda?</a>
        </div>
      </div>`;
    document.body.appendChild(backdrop);

    backdrop.querySelector("[data-wad-close-modal]")?.addEventListener("click", fecharModalAtivo);
    backdrop.addEventListener("click", (evento) => {
      if (evento.target === backdrop) fecharModalAtivo();
    });

    backdrop.querySelectorAll("[data-wad-login]").forEach((botao) => {
      botao.addEventListener("click", () => {
        const tipoLogin = botao.dataset.wadLogin;
        const campoEmail = backdrop.querySelector("#wad-signup-email");
        const email = campoEmail.value.trim();
        let rota = "login.html";

        if (tipoLogin === "continuar") {
          if (!email) {
            campoEmail.setCustomValidity("Informe seu e-mail ou telefone.");
            campoEmail.reportValidity();
            campoEmail.focus();
            return;
          }

          const contaExiste = obterUsuarios().some((usuario) => usuario.email.toLowerCase() === email.toLowerCase());
          rota = contaExiste ? `login.html?email=${encodeURIComponent(email)}` : `cadastro.html?email=${encodeURIComponent(email)}`;
        }

        fecharModalAtivo();
        window.location.href = rota;
      });
    });
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

  function aplicarToggleSenha() {
    document.querySelectorAll("[data-wad-toggle-senha]").forEach((botao) => {
      if (botao.dataset.bind === "true") return;
      const campoId = botao.getAttribute("data-wad-toggle-senha");
      const campo = document.getElementById(campoId);
      if (!campo) return;

      botao.dataset.bind = "true";
      const icone = botao.querySelector("i");

      const atualizar = () => {
        const mostrar = campo.type === "password";
        campo.type = mostrar ? "text" : "password";
        if (icone) icone.className = mostrar ? "bi bi-eye-slash" : "bi bi-eye";
        botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
        botao.setAttribute("aria-pressed", String(mostrar));
      };

      botao.addEventListener("click", (evento) => {
        evento.preventDefault();
        atualizar();
      });
    });
  }

  function inicializarFormularioLogin() {
    const form = document.getElementById("wad-form-login");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "sucesso") {
      mostrarToast("Senha redefinida com sucesso. Faça login com sua nova senha.", "sucesso");
    }

    const campoEmail = document.getElementById("wad-login-email");
    const campoSenha = document.getElementById("wad-login-senha");
    const toggleSenha = document.getElementById("wad-login-toggle-senha");

    if (toggleSenha) {
      toggleSenha.addEventListener("click", (evento) => {
        const mostrar = campoSenha.type === "password";
        campoSenha.type = mostrar ? "text" : "password";
        evento.currentTarget.querySelector("i").className = mostrar ? "bi bi-eye-slash" : "bi bi-eye";
      });
    }

    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      const loginValido = autenticarUsuario(campoEmail.value.trim(), campoSenha.value);
      if (!loginValido) {
        mostrarToast("E-mail ou senha incorretos. Verifique seu cadastro e tente novamente.", "erro");
        return;
      }

      mostrarToast("Login realizado com sucesso!", "sucesso");
      setTimeout(() => { window.location.href = "minha_conta.html"; }, 1200);
    });
  }

  function inicializarFormularioCadastro() {
    const form = document.getElementById("wad-form-cadastro");
    if (!form) return;

    const campoNascimento = document.getElementById("nascimento");
    const campoSenha = document.getElementById("senha");
    const campoConfirmar = document.getElementById("confirmar-senha");
    const avisoSenha = document.getElementById("senha-error");
    const barraForca = document.getElementById("wad-forca-barra");

    function idadeValida(dataTexto) {
      if (!dataTexto) return false;
      const nascimento = new Date(dataTexto);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const aindaNaoFezAniversario =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
      if (aindaNaoFezAniversario) idade -= 1;
      return idade >= 18;
    }

    campoSenha.addEventListener("input", () => {
      const valor = campoSenha.value;
      let pontos = 0;
      if (valor.length >= 8) pontos++;
      if (/[A-Z]/.test(valor)) pontos++;
      if (/[a-z]/.test(valor)) pontos++;
      if (/\d/.test(valor)) pontos++;
      if(/[\W_]/.test(valor)) pontos++;
      const cores = ["#e74c3c", "#e74c3c", "#f1c40f", "#f39c12", "#2ecc71", "#27ae60"];
      barraForca.style.width = `${(pontos / 5) * 100}%`;
      barraForca.style.backgroundColor = cores[pontos];
    });

    form.addEventListener("submit", (evento) => {
      evento.preventDefault();

      campoNascimento.setCustomValidity(idadeValida(campoNascimento.value) ? "" : "idade");

      const senhasConferem = campoSenha.value === campoConfirmar.value;
      avisoSenha.classList.toggle("d-none", senhasConferem);
      campoConfirmar.setCustomValidity(senhasConferem ? "" : "As senhas não coincidem.");

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      const cadastroCriado = cadastrarUsuario({
        nome: document.getElementById("nome").value.trim(),
        email: document.getElementById("email").value.trim(),
        senha: campoSenha.value
      });

      if (!cadastroCriado) {
        document.getElementById("email").setCustomValidity("E-mail já cadastrado.");
        form.classList.add("was-validated");
        mostrarToast("Este e-mail já possui cadastro.", "erro");
        return;
      }

      mostrarToast("Conta criada com sucesso! Bem-vindo(a) ao Wish a Drink.", "sucesso");
      setTimeout(() => { window.location.href = "minha_conta.html"; }, 1500);
    });

    campoConfirmar.addEventListener("input", () => {
      avisoSenha.classList.add("d-none");
      campoConfirmar.setCustomValidity("");
    });

    document.getElementById("email").addEventListener("input", (evento) => {
      evento.currentTarget.setCustomValidity("");
    });
  }

  function inicializarFormularioRecuperacaoSenha() {
    const form = document.getElementById("wad-form-recuperar");
    if (!form) return;

    const emailInput = document.getElementById("wad-rec-email");
    const novaSenhaInput = document.getElementById("wad-rec-nova-senha");
    const confirmarInput = document.getElementById("wad-rec-confirmar-senha");

    const validarSenhas = () => {
      const iguais = novaSenhaInput.value === confirmarInput.value && novaSenhaInput.value.length >= 8;
      confirmarInput.setCustomValidity(iguais ? "" : "As senhas não coincidem.");
      confirmarInput.classList.toggle("is-invalid", !iguais && confirmarInput.value.length > 0);
      return iguais;
    };

    novaSenhaInput.addEventListener("input", validarSenhas);
    confirmarInput.addEventListener("input", validarSenhas);

    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const email = emailInput.value.trim();
      const novaSenha = novaSenhaInput.value;

      if (!emailValido(email)) {
        emailInput.classList.add("is-invalid");
        mostrarToast("Informe um e-mail válido.", "erro");
        return;
      }

      emailInput.classList.remove("is-invalid");

      if (!senhaForte(novaSenha)) {
        novaSenhaInput.classList.add("is-invalid");
        mostrarToast("A nova senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo.", "erro");
        return;
      }

      novaSenhaInput.classList.remove("is-invalid");

      if (!validarSenhas()) {
        confirmarInput.classList.add("is-invalid");
        mostrarToast("As senhas precisam ser iguais para continuar.", "erro");
        return;
      }

      const resultado = recuperarSenha(email, novaSenha);

      if (!resultado.ok) {
        emailInput.classList.add("is-invalid");
        mostrarToast(resultado.mensagem, "erro");
        return;
      }

      mostrarToast(resultado.mensagem, "sucesso");
      setTimeout(() => {
        window.location.href = "login.html?reset=sucesso";
      }, 1800);
    });
  }

  function inicializarConsentimentoCookies() {
    const jaRespondido = localStorage.getItem(CHAVE_COOKIES) !== null;
    if (jaRespondido) return;

    const mostrarCookies = () => {
      mostrarModalCookies();
      window.removeEventListener("scroll", mostrarCookies, { passive: true });
    };

    setTimeout(() => {
      mostrarModalCookies();
      window.addEventListener("scroll", mostrarCookies, { passive: true });
    }, 250);
  }

  function inicializarPaginasAutenticacao() {
    aplicarToggleSenha();
    inicializarFormularioLogin();
    inicializarFormularioCadastro();
    inicializarFormularioRecuperacaoSenha();
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

  function validarSenhaForte(senha) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(String(senha || ""));
  }

  function gerarTokenRecuperacao() {
    const bytes = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (valor) => valor.toString(16).padStart(2, "0")).join("");
    }
    return `wad-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  }

  function recuperarSenha(email, novaSenha) {
    const emailNormalizado = String(email || "").trim().toLowerCase();
    if (!emailNormalizado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      return { ok: false, mensagem: "Informe um e-mail válido." };
    }

    if (!validarSenhaForte(novaSenha)) {
      return {
        ok: false,
        mensagem: "A nova senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo."
      };
    }

    const usuarios = obterUsuarios();
    const indice = usuarios.findIndex((item) => item.email.toLowerCase() === emailNormalizado);
    if (indice === -1) {
      return { ok: false, mensagem: "Não encontramos uma conta com este e-mail." };
    }

    usuarios[indice].senha = String(novaSenha);
    salvarJSON(CHAVE_USUARIOS, usuarios);

    const tokens = lerJSON("wad_reset_tokens", {});
    tokens[emailNormalizado] = {
      token: gerarTokenRecuperacao(),
      expiraEm: Date.now() + 15 * 60 * 1000
    };
    salvarJSON("wad_reset_tokens", tokens);

    return {
      ok: true,
      mensagem: "Senha redefinida com sucesso. Agora você pode entrar com sua nova senha."
    };
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
      usuario?.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase();
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
    if (!obterUsuario()) {
      mostrarModalCadastro();
      return;
    }

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
          <p class="produto-descricao">${produto.descricao}</p>
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
      const campoCpf = document.getElementById("wad-cpf-cliente");

      if (campoCpf) {
        campoCpf.addEventListener("input", () => {
          const valor = campoCpf.value.replace(/\D/g, "");
          const mascarado = valor.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
          campoCpf.value = mascarado.slice(0, 14);
          campoCpf.setCustomValidity(cpfValido(campoCpf.value) ? "" : "CPF inválido");
        });
      }

      form.addEventListener("submit", (evento) => {
        evento.preventDefault();

        if (campoCpf) {
          const cpfValidoNoFormulario = cpfValido(campoCpf.value);
          campoCpf.setCustomValidity(cpfValidoNoFormulario ? "" : "CPF inválido");
          if (!cpfValidoNoFormulario) {
            campoCpf.reportValidity();
            campoCpf.focus();
            form.classList.add("was-validated");
            return;
          }
        }

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

  function inicializarAdminPadrao() {
    const usuarios = obterUsuarios();
    const emailAdmin = ADMIN_PADRAO.email.toLowerCase();
    const jaExiste = usuarios.some((usuario) => usuario.email.toLowerCase() === emailAdmin);
    if (!jaExiste) {
      usuarios.push({
        nome: ADMIN_PADRAO.nome,
        email: ADMIN_PADRAO.email.toLowerCase(),
        senha: ADMIN_PADRAO.senha
      });
      salvarJSON(CHAVE_USUARIOS, usuarios);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Inicialização geral                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    inicializarAdminPadrao();
    aplicarPreferencias();
    aplicarToggleSenha();
    inicializarConsentimentoCookies();
    inicializarPaginasAutenticacao();
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
    mostrarModalCookies,
    mostrarModalCadastro,
    obterUsuario,
    entrar,
    cadastrarUsuario,
    autenticarUsuario,
    validarSenhaForte,
    recuperarSenha,
    gerarTokenRecuperacao,
    emailValido,
    senhaForte,
    aplicarToggleSenha,
    inicializarPaginasAutenticacao,
    inicializarFormularioLogin,
    inicializarFormularioCadastro,
    inicializarFormularioRecuperacaoSenha,
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
