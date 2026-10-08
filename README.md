## Clone o projeto:

- git clone https://github.com/vinicius-soares-dev/vg-empregos-backend.git

## Entre na pasta do projeto:

- cd vg-jobs-backend

## Suba o banco de dados com Docker:

- docker compose up -d
- docker ps (comando para verificar se está rodando)

## Instale as dependências do projeto:

- npm install

## Configure as variaveis de ambiente:

1- Crie um arquivo chamado .env na raiz da pasta vg-jobs-backend.
2- Adicione a seguinte linha de conexão do PostgreSQL dentro desse arquivo:
`bash
  DATABASE_URL="postgresql://root:root@localhost:5432/vgjobs?schema=public"
`

## Execute as migrações do Prisma:

- npx prisma migrate dev --name init

## Inspecione o banco de dados:

- docker exec -it vgjobs-db psql -U root -d vgjobs

## Rode o projeto:

- node server.js
