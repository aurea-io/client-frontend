FROM node:22-bookworm-slim AS build

WORKDIR /app
ARG VITE_CLIENT_API_URL
ARG VITE_BUSINESS_API_URL
ENV VITE_CLIENT_API_URL=${VITE_CLIENT_API_URL}
ENV VITE_BUSINESS_API_URL=${VITE_BUSINESS_API_URL}

COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
