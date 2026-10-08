# Wish a Drink 3.0V

Site estático multipágina de bebidas, em português do Brasil. Esta versão reúne o catálogo, conta e CPF, checkout demonstrativo, painel beta, melhorias de segurança no front-end e ferramentas locais de manutenção.

## Funcionalidades

- Catálogo com cervejas, refrigerantes, sucos, energéticos, destilados e vinhos.
- Busca por nome e categoria; links da página inicial abrem o catálogo já filtrado. Categorias inválidas voltam para “Todos”.
- Ofertas, produtos em destaque e favoritos salvos no navegador.
- Carrinho com adição, remoção, alteração de quantidade e cálculo de totais.
- Cadastro com CPF obrigatório, máscara `000.000.000-00`, validação de CPF e bloqueio de duplicidade; validação de idade a partir de 18 anos, com datas entre 1900 e o ano atual.
- Área da conta para consultar e editar nome, e-mail e CPF, mantendo CPF único e salvo somente com dígitos.
- Checkout demonstrativo com nome e CPF preenchidos da sessão, validação de CPF e controles desabilitados quando o carrinho está vazio.
- Login, logout, histórico de pedidos e recuperação de senha simulados no navegador.
- Painel administrativo beta para consultar catálogo e adicionar produtos locais de teste.
- Preferências de acessibilidade: escala de fonte, alto contraste, modo escuro e alternância da visibilidade de senha.
- Conteúdo dinâmico escapado antes de ser inserido em HTML; avisos toast criados mesmo em páginas sem container próprio.
- Variáveis CSS próprias do projeto nomeadas em português, como `--cor-principal`, `--fonte-corpo` e `--raio-medio`.

## Tecnologias

- HTML5, CSS3 e JavaScript vanilla.
- Bootstrap 5.3.3, Bootstrap Icons e Google Fonts carregados via CDN.
- `localStorage` para catálogo de teste, usuários, sessão demonstrativa, carrinho, favoritos e preferências.
- Scripts auxiliares em Python e Windows PowerShell para importar catálogo e tratar imagens.

## Como executar

Abra `index.html` no navegador. Para executar em um servidor estático local:

```powershell
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
| `checkout.html` | Finalização demonstrativa, CPF e dados da sessão |
| `login.html` | Entrada na conta |
| `cadastro.html` | Cadastro com idade, CPF e senha |
| `minha_conta.html` | Consulta e edição de dados e CPF |
| `pedidos.html` | Histórico demonstrativo de pedidos |
| `alterar_senha.html` | Recuperação de senha demonstrativa |
| `admin.html` | Painel administrativo beta |
| `favoritos.html` | Produtos favoritados |
| `sobre.html` | Informações, termos e privacidade |

## Estrutura

```text
.
├── Assets/       # Logos e imagens dos produtos
├── css/          # Estilos por página e componentes compartilhados
│   ├── base.css
│   ├── header-footer.css
│   ├── components.css
│   ├── auth.css
│   ├── home.css
│   ├── bebidas.css
│   ├── ofertas.css
│   ├── carrinho.css
│   ├── checkout.css
│   ├── admin.css
│   ├── conta.css
│   ├── favoritos.css
│   └── sobre.css
├── tools/        # Importação de produtos e tratamento de imagens
├── index.html
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
├── favoritos.html
├── sobre.html
└── script.js     # API window.WAD e comportamento compartilhado
```

## Ferramentas

| Arquivo | Uso |
| --- | --- |
| `tools/import-produtos.py` | Importa `.tsv`, `.csv`, `.xlsx` e `.xlsm` para o catálogo; aceita planilha com cabeçalho ou TSV posicional. Requer Python 3.10+. |
| `tools/cervejas-pao-de-acucar.tsv` | Dados de cerveja sem cabeçalho, na ordem `id`, `nome`, `imagem`, `categoria`, `preço`. |
| `tools/remove-white-background.ps1` | Flood-fill do fundo claro conectado às bordas, com limiar configurável. |
| `tools/remove-white-background-fast.ps1` | Torna transparentes apenas pixels brancos puros. Converte PNG indexado para ARGB. |

Simule a importação sem alterar `script.js`:

```powershell
python tools/import-produtos.py tools/cervejas-pao-de-acucar.tsv --dry-run
```

Os scripts PowerShell são compatíveis com Windows PowerShell 5.1 e guardam os originais em `_originais`. Teste-os em uma cópia da pasta de imagens antes de processar arquivos de produção.

## Segurança e limitações

- Esta é uma demonstração somente front-end: não há servidor, banco de dados nem processamento real de pagamentos.
- Senhas ficam em texto puro no `localStorage`; sessão e autorização administrativa podem ser falsificadas pelo próprio navegador.
- A redefinição de senha de usuários comuns ainda não valida código enviado por e-mail. A redefinição do usuário administrativo é bloqueada no front-end, mas a proteção real e o 2FA exigem backend.
- Não use dados pessoais ou credenciais reais nesta versão. Imagens importadas podem conter URLs externas e depender de terceiros.
- A venda de bebidas alcoólicas é proibida para menores de 18 anos. Beba com moderação.

## Validação

Verifique a sintaxe JavaScript com Node.js instalado:

```powershell
node --check script.js
```

Não há suíte automatizada configurada. Confira as páginas no navegador em desktop e celular. Para testar o importador, use `--dry-run`; para validar os scripts de imagem, use uma cópia temporária.

## Licença

Este projeto não possui uma licença definida no momento.