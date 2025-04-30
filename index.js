// 1. 초기 설정
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const amadeusService = require("./02-service/amadeus");
const foreignAccommodationRouter = require("./01-routes/foreignAccommodation");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 라우터 연결
app.use("/api/foreign-accommodations", foreignAccommodationRouter);

// 서버 상태 확인 API
app.get("/", (req, res) => {
  res.json({ message: "서버 정상 작동 중" });
});

// 서버 실행
app.listen(PORT, async () => {
  await amadeusService.getForeignAmadeusToken();
  await amadeusService.fetchForeignHotelData(); // 서버 시작할 때 한번만 호출
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
