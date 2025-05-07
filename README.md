# tripNet 백엔드

![tripNet Backend](https://via.placeholder.com/800x400?text=tripNet+Backend)

## 📝 프로젝트 소개

tripNet 백엔드는 호텔 및 숙소 검색 서비스의 API 서버입니다.  
Amadeus API를 활용하여 전 세계 다양한 도시의 호텔 정보를 가져오고, 이를 프론트엔드 애플리케이션에 제공합니다.

## ✨ 주요 기능

- Amadeus API를 활용한 호텔 데이터 가져오기
- 도시별 추천 호텔 제공
- 호텔 이미지 및 상세 정보 제공
- 목적지 검색 기능
- 로그인 기능 (카카오/네이버 OAuth 연동)
- 마이페이지용 json-server API 제공 (회원정보, 예약 내역 등)
- 티켓/투어 상품 JSON 연동

## 🔧 기술 스택

- **Node.js**: 서버 환경
- **Express**: API 서버 프레임워크
- **Axios**: HTTP 클라이언트 (API 호출)
- **dotenv**: 환경 변수 관리
- **Amadeus API**: 호텔 데이터 제공
- **json-server**: 가짜 REST API 생성용 (프론트 개발 보조)

## 🚀 설치 및 실행 방법

### 사전 요구사항

- Node.js (v14.0.0 이상)
- npm (v6.0.0 이상)
- Amadeus API 계정 및 API 키 (https://developers.amadeus.com/)

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/tripNet-backend.git

# 디렉토리 이동
cd tripNet-backend

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 만들고 다음 내용 입력:

```
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
PORT=3001
ACCOMMODATION_API_BASE_URL=https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city
RECOMMENDED_CITY_CODES=PAR,TYO,SEL,BKK,HNL,CEB,OSA,SGN
```

### 서버 실행

```bash
# 메인 API 서버 실행 (3001)
npm start

# json-server 실행 (3002)
npx json-server --watch db.json --port 3002
```

## 📜 API 엔드포인트 요약

### 1. 해외 숙소 API

```bash
# 추천 도시별 호텔 리스트 조회
GET /api/foreign-accommodations

# 특정 호텔 상세 검색
GET /api/foreign-accommodations/search
Query Parameters:
  - hotelId: 호텔 ID (필수)
  - checkInDate: 체크인 날짜 (YYYY-MM-DD)
  - checkOutDate: 체크아웃 날짜 (YYYY-MM-DD)
  - adults: 성인 인원 수 (기본값: 1)
```

### 2. 티켓/투어 상품 JSON

```bash
GET /api/tickets
```

### 3. 로그인 관련 API (카카오/네이버)

```bash
POST /api/auth/kakao
POST /api/auth/naver
```

### 4. 서버 상태 확인

```bash
GET /
```

### API 사용 예시

```bash
# 1. 추천 호텔 리스트 조회
curl http://localhost:3001/api/foreign-accommodations

# 2. 특정 호텔 검색 (체크인/아웃 날짜 지정)
curl "http://localhost:3001/api/foreign-accommodations/search?hotelId=HTPAR001&checkInDate=2024-03-20&checkOutDate=2024-03-25&adults=2"
```

## 📂 디렉토리 구조

```
tripNet-backend/
├── 01-routes/
│   ├── foreignHotelListRouter.js    # 메인 도시/호텔 리스트 API
│   └── foreignHotelSearchRouter.js  # 호텔 검색/상세 API
├── 02-service/
│   ├── amadeus.js                   # 아마데우스 토큰 발급
│   └── foreignHotelSearchService.js # 호텔 검색 서비스
├── 03-config/               # 공통 설정값 및 도시별 이미지 매핑
│   └── cityImageMapping.js
├── 04-json/                 # 프론트 개발 보조용 JSON 데이터
│   ├── tickets.json             # 티켓/투어용 목업 데이터
│   └── users.json               # (예정) 마이페이지용 유저 정보 데이터
├── db.json                  # json-server 전용 데이터베이스 파일 (예약/회원 등)
├── index.js                 # 서버 진입점 - 서버 실행 및 기본 라우팅 연결
├── .env                     # 환경변수 파일 (비공개)
└── README.md                # 프로젝트 설명서
```

## 🔄 데이터 흐름 요약

1. 서버 시작 시 Amadeus API 토큰 발급
2. `/api/*`로 프론트 요청 수신
3. 외부 API 또는 JSON 데이터 응답
4. 필요 시 랜덤 이미지 삽입 등 후처리
5. 응답 반환

## 🌿 브랜치 전략

| 브랜치 유형 | 예시                | 설명                    |
| ----------- | ------------------- | ----------------------- |
| 기능 개발   | feature/foreign-api | API 구현용 브랜치       |
| 버그 수정   | fix/token-error     | 이슈 해결 브랜치        |
| 개인 작업   | bg-auth, hyeeun-api | 이름 기반 브랜치도 허용 |

- `main` 직접 커밋 ❌
- PR 작성 시 명확한 설명 ✅
- 하나의 기능 단위로 커밋 ✅

## 👨‍💻 개발자 역할

| 이름       | 역할          | 구현 내용                                                                  |
| ---------- | ------------- | -------------------------------------------------------------------------- |
| **이혜은** | 해외 숙소     | Amadeus API 연동 + 추천 숙소 API `/api/foreign-accommodations`             |
| **황환성** | 국내 숙소     | 국내 숙소 API `/api/domestic-accommodations` 준비 중 (json or tourapi)     |
| **조윤빈** | 티켓/투어     | `tickets.json` 작성 및 `/api/tickets` 라우트 제공 (json-server 연동 예정)  |
| **이병규** | 로그인 & 인증 | 카카오/네이버 API `/api/auth` 구현 및 `db.json` 사용자 인증 mock 서버 구성 |

> 각 팀원은 `01-routes/` 내 파일을 생성하여 작업하고, 중복되지 않도록 명확한 이름으로 구성합니다.

---

📌 팀원이 새 기능을 구현하거나 JSON 데이터를 추가할 경우, `04-json/` 또는 `routes`에 명확하게 구분된 파일을 생성하고 라우터에 연결해주세요.

예) 티켓 상품: `tickets.json` + `routes/tickets.js` → `/api/tickets` 제공

> 이렇게 하면 협업 중 충돌 없이 각자 맡은 기능을 관리할 수 있습니다.
