# 1) Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

# ⭐ Copy file env FE vào image
COPY .env.local .env.local

RUN npm run build
