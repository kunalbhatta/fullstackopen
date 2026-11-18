FROM node:22-alpine AS build
WORKDIR /app
COPY part2/phonebook/package*.json ./
RUN npm ci
COPY part2/phonebook/ .
ENV VITE_PHONEBOOK_API_URL=/api/persons
RUN npm run build -- --mode part3

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
