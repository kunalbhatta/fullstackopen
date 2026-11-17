FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY part3/package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node part3/index.js ./
COPY --chown=node:node part3/models ./models
USER node
EXPOSE 3001
CMD ["node", "index.js"]
