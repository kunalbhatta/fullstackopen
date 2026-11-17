FROM node:22-alpine
WORKDIR /app
COPY part2/phonebook/package*.json ./
RUN npm ci
COPY part2/phonebook/ .
ENV VITE_PHONEBOOK_API_URL=/api/persons
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
