# Dockerfile

# Stage 1: Build the Svelte application
FROM node:20-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Stage 2: Create the final image to run the application
FROM node:20-slim
WORKDIR /app
# For SvelteKit, copy the 'build' output
COPY --from=build /app/build ./build 
# For plain Svelte, you might copy 'dist' or 'public' depending on your build output
# COPY --from=build /app/dist ./dist 

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --prod --frozen-lockfile

# Or the port your Svelte app serves on
EXPOSE 3000 
CMD ["node", "build"] # For SvelteKit, replace with your server start command (e.g., node build/index.js)
# For plain Svelte, you might serve static files using a small web server like serve or Nginx