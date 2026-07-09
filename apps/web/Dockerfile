FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ── Production image ───────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

RUN addgroup -g 1001 -S webapp && \
    adduser -S webapp -u 1001

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=webapp:webapp /app/dist /usr/share/nginx/html

RUN chown -R webapp:webapp /var/cache/nginx /var/run /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown webapp:webapp /var/run/nginx.pid

USER webapp

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
