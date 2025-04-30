// 1. 초기 설정
require("dotenv").config();

const cityImageMapping = require("./03-config/cityImageMapping");

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 2. Amadeus Access Token 저장
let amadeusAccessToken = null;

// 3. 메모리에 호텔 데이터 저장
let cachedHotelData = null;

// 4. Amadeus Access Token 발급 함수
const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    amadeusAccessToken = response.data.access_token;
    console.log(
      "✅ Access Token 발급 완료:",
      amadeusAccessToken.slice(0, 20) + "..."
    );
  } catch (error) {
    console.error("❌ Access Token 발급 실패:", error.message);
  }
};

// 5. 호텔 데이터 가져오기 함수
const fetchHotelData = async () => {
  try {
    const recommendedCityCodes = process.env.RECOMMENDED_CITY_CODES.split(",");
    const results = await Promise.all(
      recommendedCityCodes.map(async (cityCode) => {
        const response = await axios.get(
          `${process.env.ACCOMMODATION_API_BASE_URL}?cityCode=${cityCode}`,
          {
            headers: {
              Authorization: `Bearer ${amadeusAccessToken}`,
            },
          }
        );

        const hotels = response.data.data || [];

        return {
          cityCode,
          hotels: hotels.map((hotel) => {
            // 도시별 이미지 배열에서 랜덤하게 선택
            const cityImages = cityImageMapping[cityCode] || [];
            const randomImageUrl =
              cityImages.length > 0
                ? cityImages[Math.floor(Math.random() * cityImages.length)]
                : "https://source.unsplash.com/featured/?hotel";

            return {
              hotelId: hotel.hotelId,
              hotelName: hotel.name,
              latitude: hotel.geoCode?.latitude,
              longitude: hotel.geoCode?.longitude,
              imageUrl: randomImageUrl,
            };
          }),
        };
      })
    );
    cachedHotelData = results;
    console.log("✅ 호텔 데이터 초기화 완료");
  } catch (error) {
    console.error("❌ 호텔 데이터 가져오기 실패:", error.message);
  }
};

// 6. 추천 숙소 API
app.get("/api/accommodations", async (req, res) => {
  if (!cachedHotelData) {
    return res.status(500).json({ error: "호텔 데이터가 없습니다." });
  }
  res.json(cachedHotelData);
});

// 6-1. 해외 숙소 전용 API (새 엔드포인트)
app.get("/api/foreign-accommodations", async (req, res) => {
  if (!cachedHotelData) {
    return res.status(500).json({ error: "호텔 데이터가 없습니다." });
  }

  // 지금은 모든 데이터가 해외 숙소이므로 그대로 반환
  // (나중에 국내숙소와 구분 필요시 필터링 로직 추가)
  res.json(cachedHotelData);
});

// 7. 서버 상태 확인 API
app.get("/", (req, res) => {
  res.json({ message: "서버 정상 작동 중" });
});

// 8. 서버 실행
app.listen(PORT, async () => {
  await getAccessToken();
  await fetchHotelData(); // 서버 시작할 때 한번만 호출
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
