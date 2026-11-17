FROM node:22-alpine
WORKDIR /app
COPY part3/package*.json ./
RUN npm ci
COPY part3/ .
CMD ["npm", "run", "dev"]
