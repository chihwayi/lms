FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_URL=$API_URL
RUN npm install
RUN npx turbo run build --filter=@eduflow/web...

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV production
EXPOSE 3000
CMD ["npm", "start", "--workspace=@eduflow/web"]
