FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY serviceAccountKey.json ./serviceAccountKey.json

COPY . .

CMD ["npm", "run", "dev"]
