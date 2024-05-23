# Note that the context of this dockerfile is set to the root of the project!
# This is, to copy the openapi.yaml file into the container.

#--- BUILD
FROM oven/bun:1-alpine AS build

WORKDIR /usr/semse

##-- Copy everything into the container
COPY ./openapi.yaml ./
COPY ./client ./client

##-- Build the app
WORKDIR /usr/semse/client
RUN bun install --frozen-lockfile
RUN bun run build


#--- DEPLOYMENT
FROM nginx:alpine

##-- Copy app build into nginx
COPY --from=build /usr/semse/client/dist /usr/share/nginx/html
