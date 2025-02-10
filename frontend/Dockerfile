# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./

RUN npm install

COPY . .

# Copy the certificates
COPY certs/frontend.crt /app/certs/frontend.crt
COPY certs/frontend.key /app/certs/frontend.key

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
