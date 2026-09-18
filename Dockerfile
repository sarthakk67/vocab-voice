FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js agent.js learner.js notifier.js words.js index.html ./
# Hosted defaults: demo banner on, reminders delivered in the page (no macOS notifications on a server).
ENV NODE_ENV=production DEMO=1 NOTIFY=page
EXPOSE 4480
CMD ["node", "server.js"]
