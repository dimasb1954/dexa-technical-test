FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_AUTH_URL=http://localhost:3001
ARG VITE_ATTENDANCE_URL=http://localhost:3002
ENV VITE_AUTH_URL=$VITE_AUTH_URL \
    VITE_ATTENDANCE_URL=$VITE_ATTENDANCE_URL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80