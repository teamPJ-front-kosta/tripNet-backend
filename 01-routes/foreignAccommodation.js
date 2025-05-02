const express = require("express");
const router = express.Router();
const amadeusService = require("../02-service/amadeus");

// 해외 숙소 전용 API
router.get("/", async (req, res) => {
  const foreignHotelData = amadeusService.getCachedForeignHotelData();

  if (!foreignHotelData) {
    return res.status(500).json({ error: "해외 호텔 데이터가 없습니다." });
  }

  // 지금은 모든 데이터가 해외 숙소이므로 그대로 반환
  // (나중에 국내숙소와 구분 필요시 필터링 로직 추가)
  res.json(foreignHotelData);
});

module.exports = router;
