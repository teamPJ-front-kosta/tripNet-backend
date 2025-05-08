require("dotenv").config();

const express = require("express");
const cors = require("cors");

const foreignAccommodationRouter = require("./01-routes/foreignAccommodation");
const domesticAccommodationRouter = require("./01-routes/domesticAccommodation");
const ticketsRouter = require("./01-routes/tickets");
const { fetchActivityData } = require("./02-service/amadeus");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정
const corsOptions = {
  origin: 'http://localhost:3000', // React 앱 주소
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ 라우터 연결
app.use("/api/foreign-accommodations", foreignAccommodationRouter);
app.use("/api/domestic-accommodations", domesticAccommodationRouter);
app.use("/api/tickets", ticketsRouter);

// ✅ 서버 상태 확인 API
app.get("/", (req, res) => {
  res.json({ message: "서버 정상 작동 중" });
});

// ✅ 서버 실행 + 티켓 데이터 초기화
let isInitialized = false;

app.listen(PORT, async () => {
  if (!isInitialized) {
    try {
      await fetchActivityData(); // 티켓용 활동 데이터 초기화
      isInitialized = true;
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    }
  }
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
