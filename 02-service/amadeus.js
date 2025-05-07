const axios = require("axios");
const fs = require("fs");
const path = require("path");
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
      bookingLink: true,
    
      // ✅ 아래 필드를 추가해줘야 ticketDetail에서 오류 안 남
      options: [
        { name: '성인 입장권', desc: '만 13세 이상', original: 30000, price: 22000 },
        { name: '소인 입장권', desc: '36개월~12세', original: 20000, price: 15000 }
      ],
      notice: ['현장 상황에 따라 이용 가능', '미사용시 환불 가능'],
      description: ['API 기반 상세 설명이 부족해 더미 추가'],
      refund: ['유효기간 내 환불 가능'],
      info: {
        location: '서울시 마포구',
        useTime: '10:00~18:00',
        useMethod: ['QR코드 제시 후 입장'],
        extra: ['주의사항 없음'],
        age: ['성인: 만 13세 이상', '소인: 36개월 이상 ~ 만 12세 이하']
      },
      reviews: [],
      related: []
    }));
    

    // JSON 파일에 데이터 저장
    const jsonFilePath = path.join(__dirname, "..", "04-json", "tickets.json");
    const jsonData = {
      tickets: cachedActivityData
    };

    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), "utf8");
    console.log(`✅ 액티비티 ${cachedActivityData.length}건 JSON 파일 저장 완료`);

    return cachedActivityData;
  } catch (error) {
    console.error("❌ 액티비티 데이터 가져오기 실패:", error.message);
    throw error;
  }
};

const getCachedActivityData = () => {
  // JSON 파일에서 데이터 읽기
  try {
    const jsonFilePath = path.join(__dirname, "..", "04-json", "tickets.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    return jsonData.tickets;
  } catch (error) {
    console.error("❌ JSON 파일 읽기 실패:", error.message);
    return cachedActivityData;
  }
};

module.exports = {
  fetchActivityData,
  getCachedActivityData
};
