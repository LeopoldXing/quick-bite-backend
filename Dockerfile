FROM node:18.16.0-alpine3.17
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .
RUN npm install && npm run build
EXPOSE 8080
CMD [ "npm", "run", "start"]