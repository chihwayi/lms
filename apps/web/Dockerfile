FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo run build --filter=@eduflow/web...

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV production
EXPOSE 3000
CMD ["npm", "start", "--workspace=@eduflow/web"]
