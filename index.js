// 1. 환경 변수(.env) 파일 불러오기
require("dotenv").config();

// 2. 필요한 라이브러리 가져오기
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cityImageMapping = require("./config/cityImageMapping");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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

// 5. 추천 도시 리스트 (.env에서 불러오기)
const recommendedCityCodes = process.env.RECOMMENDED_CITY_CODES.split(",");

// 6. 숙소 데이터 API (이달의 추천 숙소)
app.get("/api/accommodations", async (req, res) => {
  try {
    const results = await Promise.all(
      recommendedCityCodes.map(async (cityCode) => {
        // (1) 도시별 호텔 리스트 가져오기
        const response = await axios.get(
          `${process.env.ACCOMMODATION_API_BASE_URL}?cityCode=${cityCode}`,
          {
            headers: {
              Authorization: `Bearer ${amadeusAccessToken}`,
            },
          }
        );

        const hotels = response.data.data || [];
        const limitedHotels = hotels.slice(0, 3); // 도시당 최대 3개 호텔만

        // (2) 각각의 hotelId로 상세 이미지 가져오기
        const hotelDetails = await Promise.all(
          limitedHotels.map(async (hotel) => {
            try {
              const detailResponse = await axios.get(
                `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-hotels?hotelIds=${hotel.hotelId}`,
                {
                  headers: {
                    Authorization: `Bearer ${amadeusAccessToken}`,
                  },
                }
              );

              const hotelData = detailResponse.data.data[0];

              // ✅ (3) 이미지 URL 추출 및 검증 (없으면 기본 호텔 이미지 대체)
              const imageUrl = hotelData?.media?.[0]?.uri;

              // 이미지 URL 검증: 실제 이미지 URL인지 확인
              const isValidImageUrl =
                imageUrl &&
                (imageUrl.startsWith("http://") ||
                  imageUrl.startsWith("https://"));

              // 도시 이미지를 매핑에서 가져오기 (랜덤하게 선택)
              const cityImages = cityImageMapping[cityCode] || [];
              const fallbackImage =
                cityImages.length > 0
                  ? cityImages[Math.floor(Math.random() * cityImages.length)]
                  : "https://source.unsplash.com/featured/?hotel,room";

              return {
                hotelId: hotel.hotelId,
                hotelName: hotel.name,
                latitude: hotel.geoCode?.latitude,
                longitude: hotel.geoCode?.longitude,
                imageUrl: isValidImageUrl ? imageUrl : fallbackImage, // 검증된 이미지 URL 또는 대체 이미지
              };
            } catch (error) {
              console.error(
                `❌ 호텔 상세정보 가져오기 실패 (hotelId: ${hotel.hotelId}):`,
                error.message
              );

              // 도시 이미지를 매핑에서 가져오기 (랜덤하게 선택)
              const cityImages = cityImageMapping[cityCode] || [];
              const errorFallbackImage =
                cityImages.length > 0
                  ? cityImages[Math.floor(Math.random() * cityImages.length)]
                  : "https://source.unsplash.com/featured/?hotel,room";

              return {
                hotelId: hotel.hotelId,
                hotelName: hotel.name,
                latitude: hotel.geoCode?.latitude,
                longitude: hotel.geoCode?.longitude,
                imageUrl: errorFallbackImage, // 에러 시 도시별 대체 이미지 사용
              };
            }
          })
        );

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

// 7. 기본 서버 상태 확인 API
app.get("/", (req, res) => {
  res.json({ message: "서버가 정상적으로 실행 중입니다." });
});

// 8. 서버 실행 (AccessToken 먼저 발급받고 시작)
app.listen(PORT, async () => {
  await getAccessToken();
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
