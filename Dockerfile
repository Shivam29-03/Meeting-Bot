FROM node:20-alpine AS base
ARG ENVIRONMENT=prod

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
ARG ENVIRONMENT=prod
ARG NEXTAUTH_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=build-placeholder
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV GOOGLE_CLIENT_ID=build-placeholder
ENV GOOGLE_CLIENT_SECRET=build-placeholder
ENV MONGODB_URI=mongodb+srv://user:password@example.mongodb.net/
ENV RECALL_API=build-placeholder
ENV RECALL_REGION=ap-northeast-1
ENV RECALL_WEBHOOK_SECRET=whsec_build_placeholder
ENV OPENAI_API_KEY=build-placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN rm -rf .next
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
