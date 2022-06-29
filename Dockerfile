FROM node:16.13.0-alpine3.14 as builder

RUN mkdir app
WORKDIR /app

COPY . .

RUN yarn add && yarn build

FROM node:16.13.0-alpine3.14
RUN mkdir app
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

RUN yarn add --production

CMD ["npm", "run", "start:prod"]