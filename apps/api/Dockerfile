FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo run build --filter=@eduflow/api...

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV production
EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
