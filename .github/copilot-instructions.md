# Wish a Drink

## Projeto
- Site estático multipágina em HTML, CSS e JavaScript vanilla.
- Idioma e conteúdo da interface: português do Brasil (`pt-BR`).
- O ponto de entrada principal é `index.html`.
- `style.css` contém os estilos compartilhados; `script.js` contém o namespace global `window.WAD` e a lógica de catálogo, carrinho, sessão simulada e acessibilidade.
- Imagens locais ficam em `Assets/`; Bootstrap 5 e Bootstrap Icons são carregados por CDN nas páginas.

## Convenções
- Preserve a estrutura multipágina e os nomes de arquivos existentes.
- Reutilize as funções e chaves de `localStorage` já definidas em `script.js` antes de criar novas abstrações.
- Mantenha textos, labels, atributos ARIA e formatação de preços em pt-BR.
- Use os padrões visuais e variáveis CSS existentes em `style.css`; evite introduzir frameworks ou dependências sem necessidade.
- Não remova alterações existentes do usuário nem faça commits automaticamente.

## Validação
- Como não há build ou suíte de testes configurada, valide JavaScript com `node --check script.js` e teste as páginas diretamente no navegador.
- Ao alterar comportamento compartilhado, confira pelo menos `index.html`, `bebidas.html`, `carrinho.html` e `checkout.html`.
- Ao alterar estilos, verifique desktop e viewport móvel.
