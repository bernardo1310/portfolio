# Portfólio — Bernardo França Coelho

Site pessoal estático com meus projetos, formação e experiência em tecnologia.

**Site:** https://bernardo1310.github.io/portfolio/

## Stack

- HTML e CSS puros, sem frameworks nem etapa de build
- JavaScript leve (`motion.js`) só para as animações de rolagem, a barra de progresso e o efeito do cursor
- Hospedagem no GitHub Pages

## Estrutura

| Arquivo | Função |
| --- | --- |
| `index.html` | Conteúdo e metadados (SEO, Open Graph) |
| `style.css` | Estilos, responsividade e animações |
| `motion.js` | Revelação ao rolar, barra de progresso e spotlight |
| `og.png` | Imagem de prévia ao compartilhar o link |
| `robots.txt`, `sitemap.xml` | Indexação em buscadores |

## Decisões

- **CSP restritiva:** a página só carrega scripts, estilos e imagens do próprio domínio.
- **Acessibilidade:** link "pular para o conteúdo", foco visível e `prefers-reduced-motion` respeitado, então quem desativa animações no sistema vê tudo estático.
- **Sem dependências externas:** nenhuma fonte, biblioteca ou rastreador de terceiros.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Contato

- E-mail: coelhobernardo199@gmail.com
- LinkedIn: https://www.linkedin.com/in/bernardo-fran%C3%A7a-coelho-45230121b/
- GitHub: https://github.com/bernardo1310
