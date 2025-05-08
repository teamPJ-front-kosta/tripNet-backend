# 🛠 tripNet 백엔드

![tripNet Backend](https://via.placeholder.com/800x400?text=tripNet+Backend)

## 📝 프로젝트 소개

`tripNet-backend`는 여행 숙소 검색 웹 플랫폼의 API 서버입니다.
Amadeus API를 활용하여 실시간 해외 호텔 데이터를 가져오고, 프론트엔드에 맞게 가공해 제공합니다.
추가적으로 `json-server`를 이용해 로그인, 마이페이지, 예약 등 목업 데이터 기반 기능을 지원합니다.

## ✨ 주요 기능

- Amadeus API 연동하여 호텔 목록 및 상세정보 제공
- 추천 도시별 호텔 리스트 반환 (cityCode 기반)
- 호텔 상세/옵션 검색 기능 (호텔 ID, 날짜 기준)
- 로그인 API (카카오/네이버 OAuth 연동 예정)
- json-server 기반 유저 데이터/예약 정보 관리
- 투어/티켓 상품 JSON 데이터 제공

## 🔧 기술 스택

- **Node.js**: 서버 실행 환경
- **Express.js**: REST API 서버 프레임워크
- **Axios**: Amadeus API 호출용 HTTP 클라이언트
- **dotenv**: 민감한 환경변수 관리 (.env)
- **json-server**: 사용자 및 예약 정보 mock API 제공
- **Amadeus API**: 호텔 실시간 데이터 제공

## 🚀 설치 및 실행 방법

### 사전 요구사항

- Node.js (v14 이상)
- Amadeus API 계정 및 API Key/Secret ([공식 사이트](https://developers.amadeus.com/))

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/tripNet-backend.git
cd tripNet-backend

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일 생성 후 다음 정보 입력:

```env
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
PORT=3001
ACCOMMODATION_API_BASE_URL=https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city
RECOMMENDED_CITY_CODES=PAR,TYO,SEL,BKK,HNL,CEB,OSA,SGN
```

### 서버 실행

```bash
# 메인 API 서버 (포트 3001)
npm start

# json-server (포트 3002)
npx json-server --watch db.json --port 3002
```

## 📜 API 엔드포인트 요약

### 1. 해외 숙소 API

```bash
# 추천 도시별 호텔 리스트 조회
GET /api/foreign-accommodations

# 호텔 상세/옵션 검색
GET /api/foreign-accommodations/search

Query Parameters:
  - hotelId (필수)
  - checkInDate
  - checkOutDate
  - adults (기본값: 1)
```

### 2. 티켓/투어 상품

```bash
GET /api/tickets
```

### 3. 로그인 관련 API (OAuth 예정)

```bash
POST /api/auth/kakao
POST /api/auth/naver
```

### 4. 서버 상태 확인

```bash
GET /
```

### 예시 호출

```bash
curl http://localhost:3001/api/foreign-accommodations
curl "http://localhost:3001/api/foreign-accommodations/search?hotelId=HTPAR001&checkInDate=2025-06-16&checkOutDate=2025-06-18&adults=2"
```

## 📂 디렉토리 구조

```
tripNet-backend/
├── 01-routes/                     # 라우터 정의
│   ├── foreignHotelListRouter.js   # 추천 호텔 리스트 제공
│   ├── foreignHotelSearchRouter.js # 특정 호텔 검색 및 상세 정보
│   └── auth.js                     # 로그인 관련 API (카카오/네이버)
├── 02-service/                    # 비즈니스 로직 (API 연동 등)
│   ├── amadeus.js
│   └── foreignHotelSearchService.js
├── 03-config/
│   └── cityImageMapping.js         # 도시코드별 이미지 매핑
├── 04-json/                       # 목업 데이터
│   ├── tickets.json
│   └── users.json
├── db.json                         # json-server용 메인 DB
├── index.js                        # 서버 진입점
├── .env                            # 환경변수 파일
└── README.md                       # 설명서
```

## 🔄 데이터 흐름 요약

1. 서버 시작 시 Amadeus API 토큰 발급
2. `/api/*` 경로로 요청 수신
3. 외부 API (Amadeus) 또는 JSON(mock) 응답
4. 호텔 목록/상세/옵션별 필터링 처리
5. 응답 반환 (프론트에서 fetch)

## 🌿 브랜치 전략

| 브랜치명            | 목적             |
| ------------------- | ---------------- |
| feature/foreign-api | 호텔 API 개발용  |
| fix/token-error     | 토큰 이슈 해결용 |
| hyeeun-api          | 개인 작업 브랜치 |
| bg-auth             | 로그인 기능 작업 |

- main 브랜치 직접 커밋 ❌
- 기능 단위 브랜치 → PR → Merge ✅

## 👥 팀원 역할 분담

| 이름   | 역할           | 구현 내용                                                          |
| ------ | -------------- | ------------------------------------------------------------------ |
| 이혜은 | 해외 숙소 API  | `/api/foreign-accommodations` 라우터 구현 + Amadeus API 연동       |
| 황환성 | 국내 숙소 API  | `/api/domestic-accommodations` 준비 중 (tourapi 또는 json 기반)    |
| 조윤빈 | 투어/티켓      | `tickets.json` 작성 + `/api/tickets` 라우터 구현                   |
| 이병규 | 로그인 및 인증 | `/api/auth` 카카오/네이버 로그인 구현 + `db.json` 사용자 정보 구성 |

📌 각자 작업은 `01-routes/` 내 파일로 분리하고, JSON 데이터는 `04-json/`에 저장 후 라우터에 연결하는 방식으로 협업했습니다.
