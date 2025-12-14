# Imagem base leve (Slim version of Node 20)
FROM node:20-slim

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Instalar dependências do sistema necessárias (opcional, mas bom para deps nativas)
# RUN apt-get update && apt-get install -y build-essential python3

# Copiar apenas os arquivos de dependência primeiro (para aproveitar cache do Docker)
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Copiar o restante do código fonte
COPY . .

# Variável de ambiente para node
ENV NODE_ENV=production

# Comando de inicialização
CMD ["node", "src/index.js"]