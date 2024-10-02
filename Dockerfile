FROM node:20.17.0

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm run build

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]