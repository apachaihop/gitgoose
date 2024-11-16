FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

RUN mkdir -p repositories && chmod 777 repositories

CMD ["npm", "run", "start:prod"]