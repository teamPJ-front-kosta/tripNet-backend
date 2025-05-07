const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 해외 숙소 전용 API
router.get("/", async (req, res) => {
  try {
    // JSON 파일 경로
    const jsonPath = path.join(__dirname, "../04-json/hotellist.json");

    // 파일 읽기
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const hotelData = JSON.parse(jsonData);

    console.log("✅ Mock 호텔 데이터 응답 완료");
    res.json(hotelData);
  } catch (error) {
    console.error("❌ 호텔 데이터 읽기 실패:", error.message);
    res.status(500).json({
      error: "호텔 정보를 가져오는데 실패했습니다.",
      details: error.message,
    });
  }
});

module.exports = router;
