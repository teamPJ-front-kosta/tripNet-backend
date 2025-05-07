const express = require("express");
const router = express.Router();
const { getCachedActivityData } = require("../02-service/amadeus");

// ✅ 전체 티켓 리스트 조회
router.get("/", async (req, res) => {
  try {
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

// ✅ 개별 티켓 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const activities = getCachedActivityData();
    const ticket = activities.find(t => String(t.id) === req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: "해당 ID의 티켓을 찾을 수 없습니다." });
    }

    res.json(ticket);
  } catch (error) {
    console.error("에러 발생:", error.message);
    res.status(500).json({ 
      error: "상세 데이터 조회 실패", 
      message: error.message 
    });
  }
});

module.exports = router;
