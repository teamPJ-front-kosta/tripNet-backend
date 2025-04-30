// 1. 환경 변수(.env) 파일 불러오기
require("dotenv").config();

// 2. 필요한 라이브러리 가져오기
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cityImageMapping = require("./config/cityImageMapping");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 추가
app.use(cors({
  origin: true, // 모든 origin 허용
  credentials: true
}));
app.use(express.json());

// 3. Amadeus Access Token 저장 변수
let amadeusAccessToken = null;

// 4. Access Token 발급 함수
const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
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
// 12
// 5. 추천 도시 리스트 (.env에서 불러오기)
const recommendedCityCodes = process.env.RECOMMENDED_CITY_CODES.split(",");

// 6. 숙소 데이터 API (이달의 추천 숙소)
app.get("/api/accommodations", async (req, res) => {
  try {
    const results = await Promise.all(
      recommendedCityCodes.map(async (cityCode) => {
        // (1) 도시별 호텔 리스트 가져오기
        const response = await axios.get(
          `${process.env.ACCOMMODATION_API_BASE_URL}/by-city?cityCode=${cityCode}`,
          {
            headers: {
              Authorization: `Bearer ${amadeusAccessToken}`,
            },
          }
        );

        console.log('호텔 API 응답:', JSON.stringify(response.data, null, 2));

        const hotels = response.data.data || [];
        const limitedHotels = hotels.slice(0, 3); // 도시당 최대 3개 호텔만

        // 호텔 정보 변환
        const hotelDetails = limitedHotels.map(hotel => {
          // 도시 이미지를 매핑에서 가져오기 (랜덤하게 선택)
          const cityImages = cityImageMapping[cityCode] || [];
          const fallbackImage = cityImages.length > 0
            ? cityImages[Math.floor(Math.random() * cityImages.length)]
            : "https://source.unsplash.com/featured/?hotel,room";

          return {
            hotelId: hotel.hotelId,
            hotelName: hotel.name,
            latitude: hotel.geoCode?.latitude,
            longitude: hotel.geoCode?.longitude,
            imageUrl: fallbackImage
          };
        });

        return {
          cityCode: cityCode,
          hotels: hotelDetails,
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error("❌ 숙소 API 호출 실패:", error.message);
    res.status(500).json({ error: "API 호출 실패" });
  }
});

// 액티비티 데이터 API
app.get("/api/activities", async (req, res) => {
  try {
    // 서울의 액티비티 검색
    const response = await axios.get(
      "https://test.api.amadeus.com/v1/shopping/activities",
      {
        params: {
          latitude: "37.5665",  // 서울 위도
          longitude: "126.9780", // 서울 경도
          radius: 50,  // 50km 반경으로 확대
          limit: 100  // 최대 100개 결과 요청
        },
        headers: {
          Authorization: `Bearer ${amadeusAccessToken}`,
        },
      }
    );

    //console.log('Amadeus API 응답:', JSON.stringify(response.data, null, 2));
    console.log('검색된 액티비티 수:', response.data.data ? response.data.data.length : 0);

    const activities = response.data.data.map(activity => ({
      id: activity.id,
      name: activity.name,
      pictures: activity.pictures,
      location: { name: "서울" },
      description: activity.shortDescription || activity.description,
      price: {
        amount: activity.price.amount,
        currencyCode: activity.price.currencyCode
      },
      bookingLink: true,
      rating: activity.rating,
      reviewCount: activity.bookingCount || Math.floor(Math.random() * 100) + 10
    }));

    res.json(activities);
  } catch (error) {
    console.error("❌ 액티비티 API 호출 실패:", error.message);
    res.status(500).json({ error: "API 호출 실패" });
  }
});

// 7. 기본 서버 상태 확인 API
app.get("/", (req, res) => {
  res.json({ message: "서버가 정상적으로 실행 중입니다." });
});

// 8. 서버 실행 (AccessToken 먼저 발급받고 시작)
app.listen(PORT, async () => {
  await getAccessToken();
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});