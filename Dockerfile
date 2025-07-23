# Use official Node.js image as the base
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Production image
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DISABLE_OPENCOLLECTIVE=1
ENV ADBLOCK=1
ENV DISABLE_NPM_UPDATE_NOTIFIER=1

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["npm", "start"]
