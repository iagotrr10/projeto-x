# Backend PHP + MySQL — Wish a Drink

Login em **2 etapas**, área **exclusiva do usuário master** (lista de usuários, exclusão e log de acessos), endereços de entrega e histórico de pedidos persistido no banco.

## Requisitos
- PHP **8.1+** com a extensão `pdo_mysql`
- MySQL 8 ou MariaDB 10.4+

## Instalação (5 passos)

1. **Criar o banco e as tabelas**
   ```bash
   mysql -u root -p < sql/schema.sql
   ```
2. **Configurar o acesso ao banco** — edite `config/config.php` *ou* (recomendado) use variáveis de ambiente:
   `WAD_DB_HOST`, `WAD_DB_PORT`, `WAD_DB_NAME`, `WAD_DB_USER`, `WAD_DB_PASS`.
3. **Criar o usuário master** (a senha não fica gravada em nenhum arquivo):
   ```bash
   php setup/criar_master.php
   ```
4. **Subir o site** (na pasta do projeto):
   ```bash
   php -S localhost:8000 router.php
   ```
   Abra `http://localhost:8000`. (As páginas precisam ser abertas por aqui, não com duplo clique no `.html`.)
5. **Receber o código de e-mail em desenvolvimento**: por padrão (`WAD_MAIL_MODO=arquivo`) nenhum e-mail real é enviado —
   o código é gravado em `storage/emails/*.txt`. Em produção use `WAD_MAIL_MODO=mail` (usa `mail()` do PHP, exige SMTP/sendmail configurado).

Em Apache/XAMPP basta colocar o projeto em `htdocs`; o `.htaccess` já bloqueia `config/`, `lib/`, `sql/`, `setup/` e `storage/`.

## Como funciona o 2FA
1. `login.html` → `api/login.php` confere e-mail + senha. **Ainda não há login**: a sessão fica "aguardando 2º fator".
2. `2fa.html` → `api/verify_2fa.php` confere o código. Só aqui o login é efetivado **e gravado no log**.
3. Dois métodos (o usuário escolhe no cadastro):
   - `email`: código de 6 dígitos, válido por 5 minutos, guardado só como hash, máx. 5 tentativas, reenvio a cada 30 s.
   - `totp`: app autenticador (Google Authenticator, Authy…), padrão RFC 6238. A chave é mostrada **uma única vez** no cadastro.

## Tela do usuário master (`usuarios.html`)
- Pesquisa por **parte do nome**, **CPF** (ou parte) ou **todos**; só lista usuários *comuns*.
- Botão **Editar**: altera nome, e-mail, CPF, nascimento, telefone e endereço do usuário comum. A redefinição de senha é opcional; ao salvar uma nova senha, sessões existentes e códigos de 2FA pendentes são invalidados.
- Botão **Excluir** (com confirmação). O histórico de acessos do usuário é apagado junto; o cadastro de cliente só é apagado se nunca houve venda ou pedido.
- Formulário **Criar conta de teste**: o master informa os dados cadastrais e a senha inicial, escolhe o 2FA e cria uma conta comum. A chave TOTP é mostrada uma única vez. A conta fica disponível para login e entra na listagem normal.
- No Admin beta, os indicadores separam a quantidade de contas master das contas comuns. A lista exibe usuários comuns, incluindo contas de teste; os números são consultados do banco ao abrir ou atualizar as seções.
- Botão **Log**: dia/hora, nome e qual foi o 2º fator, do mais recente para o mais antigo. Há também o **log geral**.
- A tabela informa quando a conta foi criada. O botão **Páginas** consulta os acessos às páginas feitos depois que o registro foi ativado; **Meu log de páginas** exibe os acessos da própria conta master.
- Botão **Pedidos**: pedidos de cada usuário, com data, status, total e nome/quantidade de cada bebida. Os dados são consultados do banco e só ficam disponíveis ao master.
- A atividade registra somente o nome da página e a data/hora para usuários autenticados; URLs, parâmetros, IPs e conteúdo digitado não são armazenados.
- Toda checagem de permissão é feita **no servidor** (`exigir_master()`); esconder o link no front é só conveniência.

## Endpoints (`api/`)
| Arquivo | Método | Acesso | Função |
|---|---|---|---|
| `me.php` | GET | público | sessão atual + token CSRF |
| `register.php` | POST | público | cadastro (cria CLIENTE + USUARIO) |
| `login.php` | POST | público | 1ª etapa |
| `verify_2fa.php` | POST | pré-login | 2ª etapa + grava log |
| `resend_2fa.php` | POST | pré-login | reenvia código por e-mail |
| `logout.php` | POST | logado | encerra sessão |
| `perfil.php` | POST | logado | altera nome, e-mail e CPF |
| `endereco.php` | GET/POST | cliente logado | consulta e salva o endereço de entrega |
| `pedidos.php` | GET/POST | cliente logado | lista pedidos próprios e registra um pedido do checkout |
| `users.php` | GET | **master** | lista/pesquisa usuários |
| `admin_user_create.php` | POST | **master** | cria conta comum de teste e cadastro de cliente |
| `admin_user_update.php` | POST | **master** | edita cadastro comum e, opcionalmente, redefine a senha |
| `admin_pedidos.php` | GET | **master** | consulta pedidos e itens de um usuário comum |
| `page_activity.php` | GET | **master**; POST | master consulta atividade; qualquer usuário autenticado registra a página atual |
| `user_logs.php` | GET | **master** | log de acessos |
| `user_delete.php` | POST | **master** | exclui usuário comum |

## Segurança aplicada
Senhas com `password_hash` (bcrypt) · SQL somente com *prepared statements* · token CSRF em todo POST · `Content-Type: application/json` obrigatório ·
cookie de sessão `HttpOnly` + `SameSite=Lax` e `session_regenerate_id` em cada etapa · bloqueio após 5 falhas em 15 min (senha ou 2º fator) ·
nomes renderizados com `textContent`/escape (evita XSS) · sessão de usuário excluído ou com senha redefinida deixa de valer imediatamente.

## Em produção, não esqueça
- Use **HTTPS** e defina `WAD_COOKIE_SEGURO=1`.
- Não use `router.php` (é só do servidor embutido); sirva por Apache/Nginx e bloqueie as pastas internas.
- A chave TOTP fica no banco em texto; para mais proteção, criptografe-a (ex.: `openssl_encrypt` com chave fora do banco).
- Ainda **não existe** fluxo autônomo de "esqueci a senha" por e-mail. `alterar_senha.html` explica a limitação, e o master pode redefinir a senha de uma conta comum em `usuarios.html`.
- O **Admin beta** (`admin.html`) agora só abre para o usuário **master** (login real + 2ª etapa); os produtos de teste que ele cadastra continuam apenas no `localStorage`.
- `ENDERECO_CLIENTE`, `PEDIDO` e `PEDIDO_ITEM` armazenam o endereço salvo e os pedidos criados pelo checkout. Ao atualizar uma instalação existente, execute `sql/schema.sql` novamente: as novas tabelas são criadas sem apagar as tabelas ou registros existentes.
- O checkout grava um pedido real no banco e a tela `pedidos.html` lista apenas os pedidos da conta autenticada. O catálogo e os preços ainda vêm do JavaScript/localStorage e as opções de pagamento são apenas declaradas: **não há gateway de pagamento nem validação de preço pelo servidor**, portanto não usar em produção até integrar catálogo/estoque e provedor de pagamento.
- Para criar um pedido local de teste sem preencher o checkout manualmente, execute `powershell -NoProfile -ExecutionPolicy Bypass -File .\setup\testar_pedido.ps1` na raiz do projeto. O script autentica uma conta comum (com 2FA), usa dados fictícios, informa o valor de R$ 1,00 e exige confirmação antes de gravar o pedido no banco.
- A credencial fixa de admin que existia no `script.js` foi removida: crie o master com `php setup/criar_master.php`.
