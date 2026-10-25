FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./

ENV NODE_ENV=production
ENV PORT=3000

USER 1000:1000

EXPOSE 3000

CMD ["node", "server.js"]
