const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { getCachedActivityData } = require("../02-service/amadeus");

router.get("/", async (req, res) => {
  try {
    // JSON 파일에서 티켓 데이터 읽기
    const activities = getCachedActivityData();
    
    if (!activities || activities.length === 0) {
      throw new Error("활동 데이터를 찾을 수 없습니다.");
    }

    res.json(activities);
  } catch (error) {
    console.error("에러 발생:", error.message);
    res.status(500).json({ 
      error: "데이터 조회 실패", 
      message: error.message 
    });
  }
});

module.exports = router;