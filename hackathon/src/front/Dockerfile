FROM node:20-alpine

WORKDIR /usr/src/app

# 依存解決はキャッシュが効くように package.json のみコピー
COPY package.json ./

RUN npm install --silent

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

