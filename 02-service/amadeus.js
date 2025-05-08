const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

//////////////////////////////
// 1. 티켓용 Amadeus API
//////////////////////////////

let cachedActivityData = [];

const fetchActivityData = async () => {
  try {
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
    console.log("✅ [티켓] Access Token 발급 완료");

    const response = await axios.get(
      "https://test.api.amadeus.com/v1/shopping/activities",
      {
        params: {
          latitude: "37.5665",
          longitude: "126.9780",
          radius: 50,
          limit: 100,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    cachedActivityData = response.data.data.map((activity) => ({
      id: activity.id,
      name: activity.name,
      description: activity.shortDescription || activity.description,
      location: { name: "서울" },
      rating: activity.rating || 4,
      reviewCount: activity.bookingCount || 0,
      price: {
        amount: activity.price.amount,
        currencyCode: activity.price.currencyCode,
      },
      pictures: activity.pictures || [],
      bookingLink: true,
      options: [
        { name: "성인 입장권", desc: "만 13세 이상", original: 30000, price: 22000 },
        { name: "소인 입장권", desc: "36개월~12세", original: 20000, price: 15000 },
      ],
      notice: ["현장 상황에 따라 이용 가능", "미사용시 환불 가능"],
      description: ["API 기반 상세 설명이 부족해 더미 추가"],
      refund: ["유효기간 내 환불 가능"],
      info: {
        location: "서울시 마포구",
        useTime: "10:00~18:00",
        useMethod: ["QR코드 제시 후 입장"],
        extra: ["주의사항 없음"],
        age: ["성인: 만 13세 이상", "소인: 36개월 이상 ~ 만 12세 이하"],
      },
      reviews: [],
      related: [],
    }));

    const jsonFilePath = path.join(__dirname, "..", "04-json", "tickets.json");
    const jsonData = {
      tickets: cachedActivityData,
    };

    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), "utf8");
    console.log(`✅ 액티비티 ${cachedActivityData.length}건 JSON 저장 완료`);

    return cachedActivityData;
  } catch (error) {
    console.error("❌ [티켓] 액티비티 데이터 실패:", error.message);
    throw error;
  }
};

const getCachedActivityData = () => {
  try {
    const jsonFilePath = path.join(__dirname, "..", "04-json", "tickets.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    return jsonData.tickets;
  } catch (error) {
    console.error("❌ [티켓] JSON 읽기 실패:", error.message);
    return cachedActivityData;
  }
};

//////////////////////////////
// 2. 해외숙소용 Amadeus API
//////////////////////////////

let foreignAmadeusAccessToken = null;
let cachedForeignHotelData = null;

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
      "✅ [숙소] Access Token 발급 완료:",
      foreignAmadeusAccessToken.slice(0, 20) + "..."
    );
    return foreignAmadeusAccessToken;
  } catch (error) {
    console.error("❌ [숙소] Access Token 발급 실패:", error.message);
    throw error;
  }
};

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
    console.log("✅ [숙소] 호텔 데이터 초기화 완료");
    return cachedForeignHotelData;
  } catch (error) {
    console.error("❌ [숙소] 호텔 데이터 실패:", error.message);
    throw error;
  }
};

const getCachedForeignHotelData = () => cachedForeignHotelData;

//////////////////////////////
// export
//////////////////////////////

module.exports = {
  // 티켓용
  fetchActivityData,
  getCachedActivityData,
  // 숙소용
  getForeignAmadeusToken,
  fetchForeignHotelData,
  getCachedForeignHotelData,
};
