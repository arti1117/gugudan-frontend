# Base image를 ARM64로 명시
FROM --platform=linux/arm64 node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install --frozen-lockfile --loglevel=error

# 앱 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 포트 설정
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
