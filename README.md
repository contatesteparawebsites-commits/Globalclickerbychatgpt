# Global Clicker

Um Global Clicker realtime com um único botão: cada clique vale exatamente +1.

## O que foi feito

- Interface completa em `index.html`
- Servidor realtime em `server.js`
- Nenhum Supabase
- Nenhum Firebase
- Nenhum banco de dados
- Server-Sent Events para atualizar todos os navegadores conectados
- Fila de cliques no navegador para suportar cliques programáticos em grande quantidade
- Um único botão visível de clique
- Contador global compartilhado enquanto o servidor estiver rodando

## Como funciona

O navegador mostra o clique imediatamente e acumula os cliques pendentes. Em seguida envia lotes para o servidor.

O servidor mantém um único contador global e transmite o novo valor para todos os clientes conectados.

Isso significa que, se duas pessoas estiverem abertas ao mesmo tempo, ambas enxergam o mesmo número.

## Teste pelo console

O site não tem botão especial para 1000 ou 10000.

Para testar o próprio botão pelo DevTools:

```js
for(let i=0;i<10000;i++)document.querySelector("#clickButton").click()
```

O cliente agrupa esses cliques antes de sincronizar, então o teste não cria uma requisição de rede para cada clique individual.

## Rodando

É necessário Node.js 18 ou superior.

```bash
npm start
```

Depois abra:

`http://localhost:3000`

## GitHub Pages

GitHub Pages serve arquivos estáticos e não executa Node.js. Portanto, o repositório contém tanto o frontend quanto o backend, mas um Global Clicker realmente compartilhado precisa executar o `server.js` em um host que aceite Node.js.

Se você abrir somente o `index.html` pelo GitHub Pages, não existe servidor global por trás dele.

## Persistência

A versão atual guarda o número na memória do processo.

Se o servidor reiniciar, o contador volta para zero.

Isso é proposital nesta versão para manter o projeto simples e totalmente sem Supabase.

## Importante

Este é um experimento aberto. O servidor aceita o número de cliques enviado pelo cliente, portanto não é uma prova de cliques humanos reais. Uma pessoa pode usar o console ou chamar a API diretamente.

Para uma versão pública de grande escala, seria necessário adicionar persistência, rate limiting e controles contra abuso.

## Arquivos

- `index.html` — interface completa
- `server.js` — contador global e realtime
- `package.json` — configuração Node.js
