FROM node:26-slim AS base

FROM base AS build
COPY --from=ghcr.io/pnpm/pnpm:12 /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm check-types
RUN pnpm lint
RUN pnpm build
RUN pnpm install --prod --frozen-lockfile

FROM base AS translate
COPY --from=build /app/dist /app/dist
COPY --from=build /app/drizzle /app/drizzle
COPY --from=build /app/node_modules /app/node_modules
ENV NODE_ENV=production
WORKDIR /app
EXPOSE 3000
CMD ["node", "dist/server/index.mjs"]
