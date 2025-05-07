const axios = require("axios");
require("dotenv").config();

// Amadeus Access Token 저장 (해외 숙소용)
let foreignAmadeusAccessToken = null;

// 메모리에 해외 호텔 데이터 저장
let cachedForeignHotelData = null;

// Amadeus Access Token 발급 함수 (해외 숙소용)
const getForeignAmadeusToken = async () => {
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
    foreignAmadeusAccessToken = response.data.access_token;
    console.log(
      "✅ 해외 숙소 Access Token 발급 완료:",
      foreignAmadeusAccessToken.slice(0, 20) + "..."
    );
    return foreignAmadeusAccessToken;
  } catch (error) {
    console.error("❌ 해외 숙소 Access Token 발급 실패:", error.message);
    throw error;
  }
};

// 해외 호텔 데이터 가져오기 함수
const fetchForeignHotelData = async () => {
  try {
    const recommendedCityCodes = process.env.RECOMMENDED_CITY_CODES.split(",");
    const cityImageMapping = require("../03-config/cityImageMapping");

    const results = await Promise.all(
      recommendedCityCodes.map(async (cityCode) => {
        const response = await axios.get(
          `${process.env.ACCOMMODATION_API_BASE_URL}?cityCode=${cityCode}`,
          {
            headers: {
              Authorization: `Bearer ${foreignAmadeusAccessToken}`,
            },
          }
        );

        const hotels = response.data.data || [];

        return {
          cityCode,
          hotels: hotels.map((hotel) => {
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
    cachedForeignHotelData = results;
    console.log("✅ 해외 호텔 데이터 초기화 완료");
    return cachedForeignHotelData;
  } catch (error) {
    console.error("❌ 해외 호텔 데이터 가져오기 실패:", error.message);
    throw error;
  }
};

// 캐시된 해외 호텔 데이터 가져오기
const getCachedForeignHotelData = () => cachedForeignHotelData;

module.exports = {
  getForeignAmadeusToken,
  fetchForeignHotelData,
  getCachedForeignHotelData,
};
