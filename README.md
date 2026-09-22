# Wish a Drink

Site estático multipágina de um depósito virtual de bebidas. A versão `v1.5` permite navegar pelo catálogo, consultar ofertas, adicionar produtos ao carrinho e simular o fluxo de cadastro, login, pedidos e checkout.

## Funcionalidades

- Catálogo de bebidas com cervejas, refrigerantes, sucos, energéticos, destilados e vinhos.
- Busca por nome e filtro por categoria.
- Seções de ofertas e produtos em destaque.
- Carrinho com inclusão, remoção, alteração de quantidade e cálculo de totais.
- Checkout demonstrativo com confirmação do pedido.
- Cadastro, login, logout e área da conta com sessão simulada no navegador.
- Histórico de pedidos e área administrativa demonstrativa.
- Preferências de acessibilidade: ajuste do tamanho da fonte, alto contraste e modo escuro.
- Interface responsiva em português do Brasil.

## Tecnologias

- HTML5 semântico
- CSS3
- JavaScript vanilla
- Bootstrap 5.3.3 e Bootstrap Icons via CDN
- Google Fonts via CDN
- `localStorage` para persistência local do carrinho, usuários, sessão e preferências

## Como executar

Como o projeto não possui build nem dependências locais, basta abrir o arquivo `index.html` no navegador.

Para uma experiência mais próxima de um servidor web local, também é possível usar qualquer servidor estático. Por exemplo, com Python:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Páginas

| Página | Descrição |
| --- | --- |
| `index.html` | Página inicial, categorias, ofertas e destaques |
| `bebidas.html` | Catálogo, busca e filtros |
| `ofertas.html` | Produtos em promoção |
| `carrinho.html` | Itens selecionados e resumo da compra |
| `checkout.html` | Finalização demonstrativa do pedido |
| `login.html` | Entrada na conta |
| `cadastro.html` | Cadastro de usuário |
| `minha_conta.html` | Dados da conta |
| `pedidos.html` | Histórico de pedidos |
| `alterar_senha.html` | Alteração de senha simulada |
| `admin.html` | Área administrativa demonstrativa |
| `sobre.html` | Informações e canais de contato |

## Estrutura principal

```text
.
├── Assets/       # Logos e imagens dos produtos
├── index.html    # Página inicial
├── bebidas.html
├── ofertas.html
├── carrinho.html
├── checkout.html
├── login.html
├── cadastro.html
├── minha_conta.html
├── pedidos.html
├── alterar_senha.html
├── admin.html
├── sobre.html
├── script.js     # Catálogo, carrinho, sessão e acessibilidade
└── style.css     # Estilos compartilhados
```

## Observações

- O projeto é uma demonstração front-end: não existe servidor, banco de dados ou processamento real de pagamentos.
- Usuários, senhas, carrinho e pedidos ficam somente no `localStorage` do navegador. Não utilize dados reais em produção.
- Os links de redes sociais são placeholders e os contatos exibidos são demonstrativos.
- A venda de bebidas alcoólicas é proibida para menores de 18 anos.

## Validação

Para verificar a sintaxe do JavaScript:

```bash
node --check script.js
```

## Licença

Este projeto não possui uma licença definida no momento.
