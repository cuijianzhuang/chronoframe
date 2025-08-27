FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build:deps
RUN pnpm run build
RUN pnpm deploy --filter=chronoframe --prod /prod/chronoframe

FROM base AS chronoframe
RUN apk add --no-cache perl exiftool
COPY --from=build /prod/chronoframe /app
COPY --from=build /usr/src/app/.output /app/.output
COPY --from=build /usr/src/app/packages/webgl-image/dist /app/packages/webgl-image/dist
COPY --from=build /usr/src/app/scripts /app/scripts
COPY --from=build /usr/src/app/server/database/migrations /app/server/database/migrations
WORKDIR /app

EXPOSE 3000
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

CMD ["sh", "-c", "node scripts/migrate.mjs && node .output/server/index.mjs"]
