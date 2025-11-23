
FROM node:20-alpine3.19 AS builder

WORKDIR /app


COPY package*.json ./
RUN npm ci --omit=dev

COPY . .



FROM node:20-alpine3.19 AS runner
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production

EXPOSE 5000

HEALTHCHECK CMD wget -qO- http://localhost:5000/ || exit 1

CMD ["npm", "start"]
