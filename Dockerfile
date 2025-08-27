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
COPY --from=build /prod/chronoframe /prod/chronoframe
COPY --from=build /usr/src/app/.output /prod/chronoframe/.output
COPY --from=build /usr/src/app/packages/webgl-image/dist /prod/chronoframe/packages/webgl-image/dist
WORKDIR /prod/chronoframe

EXPOSE 3000

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
