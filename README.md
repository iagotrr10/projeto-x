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
- Cadastro, login em 2 etapas (senha + código por e-mail ou app autenticador), perfil, endereços e histórico de pedidos no backend PHP/MySQL. O checkout persiste pedidos demonstrativos, mas não cobra pagamento.
- Tela de usuários exclusiva do usuário master (`usuarios.html`): pesquisa, edição de dados, redefinição de senha, exclusão, pedidos e logs de acesso/páginas.
- Tela com a modelagem do banco de dados (`modelagem.html`).
- Painel administrativo beta para consultar catálogo e adicionar produtos locais de teste.
- Preferências de acessibilidade: escala de fonte, alto contraste, modo escuro e alternância da visibilidade de senha.
- Conteúdo dinâmico escapado antes de ser inserido em HTML; avisos toast criados mesmo em páginas sem container próprio.
- Variáveis CSS próprias do projeto nomeadas em português, como `--cor-principal`, `--fonte-corpo` e `--raio-medio`.

## Tecnologias

- HTML5, CSS3 e JavaScript vanilla.
- Bootstrap 5.3.3, Bootstrap Icons e Google Fonts carregados via CDN.
- PHP 8.1+ e MySQL/MariaDB para cadastro, autenticação em 2 etapas, perfil e área do master (veja `BACKEND.md`).
- `localStorage` para catálogo de teste, carrinho, favoritos, preferências e um espelho (nome, e-mail, CPF, perfil) da sessão do servidor; senhas não ficam no navegador.
- Scripts auxiliares em Python e Windows PowerShell para importar catálogo e tratar imagens.

## Como executar

Páginas de catálogo, carrinho e favoritos funcionam abrindo `index.html`, mas **cadastro, login e a área do master precisam do backend**. Resumo (passo a passo completo em `BACKEND.md`):

```powershell
mysql -u root -p < sql/schema.sql
php setup/criar_master.php
php -S localhost:8000 router.php
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
| `login.html` | Entrada na conta (1ª etapa: e-mail e senha) |
| `2fa.html` | 2ª etapa: código por e-mail ou app autenticador |
| `cadastro.html` | Cadastro com idade, CPF, senha e escolha do 2º fator |
| `usuarios.html` | Gestão de usuários comuns, redefinição de senha e logs (somente master) |
| `modelagem.html` | Diagrama do banco de dados |
| `minha_conta.html` | Consulta e edição de dados e CPF |
| `pedidos.html` | Histórico de pedidos da conta autenticada |
| `alterar_senha.html` | Orientação sobre recuperação de senha ainda não disponível |
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

- Não há processamento real de pagamentos; carrinho, favoritos, pedidos e o painel admin beta continuam locais (`localStorage`).
- Cadastro, login, 2FA, perfil e a área do master são validados no servidor (senhas com `password_hash`, SQL com *prepared statements*, token CSRF, bloqueio após falhas). Detalhes e checklist de produção em `BACKEND.md`.
- A recuperação autônoma de senha por e-mail ainda não está implementada. O master pode definir uma nova senha em `usuarios.html`; a senha não é armazenada no `localStorage`.
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