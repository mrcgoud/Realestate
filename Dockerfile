FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for frontend
COPY frontend/package*.json ./frontend/
RUN npm --prefix frontend ci

# Copy frontend source and build
COPY frontend ./frontend
RUN npm --prefix frontend run build

FROM node:20-alpine

WORKDIR /app

# Install production deps for frontend
COPY frontend/package*.json ./frontend/
RUN npm --prefix frontend ci --only=production

# Copy built output from builder
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/next.config.js ./frontend/next.config.js
COPY --from=builder /app/frontend/package.json ./frontend/package.json

WORKDIR /app/frontend
EXPOSE 3000
CMD ["npm", "start"]
