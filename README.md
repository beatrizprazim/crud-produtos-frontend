# CRUD de Produtos Mobile

Aplicativo React Native + Expo com CRUD completo de produtos e persistência no MongoDB via API Node.js/Express/Mongoose.

## Executar no celular
1. Instale Node.js e Expo Go.
2. Clone este repositório.
3. Execute `npm install` na pasta.
4. Execute `npx expo start --tunnel` e abra o QR Code no Expo Go.

## Funcionalidades
- Listar produtos: GET /produtos
- Cadastrar: POST /produtos
- Editar: PUT /produtos/:id
- Excluir com confirmação: DELETE /produtos/:id

Cada produto contém nome, categoria, preço e quantidade.

## API
A URL em `App.js` aponta para `https://crud-produtos-backend-72mh.onrender.com/produtos`.
A API precisa estar online e conectada ao MongoDB. Ajuste a constante `API` se necessário.

## Backend
https://github.com/beatrizprazim/crud-produtos-backend

## Observação
Os arquivos `index.html`, `app.js` e `style.css` são a versão web anterior e foram preservados. A versão mobile começa em `App.js`.
