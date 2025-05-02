const axios = require("axios");
require("dotenv").config();

let cachedActivityData = [];

const fetchActivityData = async () => {
  try {
    // 토큰 발급
    const tokenResponse = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      `grant_type=client_credentials&client_id=${process.env.AMADEUS_API_KEY}&client_secret=${process.env.AMADEUS_API_SECRET}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const token = tokenResponse.data.access_token;
    console.log("✅ 토큰 발급 완료");

    // 액티비티 데이터 가져오기
    const response = await axios.get(
      "https://test.api.amadeus.com/v1/shopping/activities",
      {
        params: {
          latitude: "37.5665",  // 서울 위도
          longitude: "126.9780", // 서울 경도
          radius: 50,
          limit: 100
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    cachedActivityData = response.data.data.map(activity => ({
      id: activity.id,
      name: activity.name,
      description: activity.shortDescription || activity.description,
      location: { name: "서울" },
      rating: activity.rating || 4,
      reviewCount: activity.bookingCount || 0,
      price: {
        amount: activity.price.amount,
        currencyCode: activity.price.currencyCode
      },
      pictures: activity.pictures || [],
      bookingLink: true
    }));

    console.log(`✅ 액티비티 ${cachedActivityData.length}건 캐싱 완료`);
    return cachedActivityData;
  } catch (error) {
    console.error("❌ 액티비티 데이터 가져오기 실패:", error.message);
    throw error;
  }
};

const getCachedActivityData = () => cachedActivityData;

module.exports = {
  fetchActivityData,
  getCachedActivityData
};
