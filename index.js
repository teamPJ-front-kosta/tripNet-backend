require("dotenv").config();

const express = require("express");
const cors = require("cors");

const ticketsRouter = require("./01-routes/tickets");
const { fetchActivityData } = require("./02-service/amadeus");

const app = express();
const PORT = process.env.PORT || 3001;

// index.js
const corsOptions = {
  origin: 'http://localhost:3000', // React 앱이 실행되는 주소
  credentials: true, // withCredentials 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ 라우터 등록
app.use("/api/tickets", ticketsRouter);

// ✅ 상태 확인용 API
app.get("/", (req, res) => {
  res.json({ message: "서버 정상 작동 중" });
});

// 서버 시작 전 한 번만 데이터 초기화
let isInitialized = false;

// ✅ 서버 실행 + 활동 데이터 캐시 초기화
app.listen(PORT, async () => {
  if (!isInitialized) {
    try {
      await fetchActivityData();  // 활동 데이터 초기화
      isInitialized = true;
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    }
  }
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
