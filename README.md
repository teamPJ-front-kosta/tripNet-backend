# tripNet 백엔드

![tripNet Backend](https://via.placeholder.com/800x400?text=tripNet+Backend)

## 📝 프로젝트 소개

tripNet 백엔드는 호텔 및 숙소 검색 서비스의 API 서버입니다.  
이 프로젝트는 Amadeus API를 활용하여 전 세계 다양한 도시의 호텔 정보를 가져오고, 이를 프론트엔드 애플리케이션에 제공합니다.

## ✨ 주요 기능

- Amadeus API를 활용한 호텔 데이터 가져오기
- 도시별 추천 호텔 제공
- 호텔 이미지 및 상세 정보 제공
- 목적지 검색 기능

## 🔧 기술 스택

- **Node.js**: 서버 환경
- **Express**: API 서버 프레임워크
- **Axios**: HTTP 클라이언트 (외부 API 호출)
- **dotenv**: 환경 변수 관리
- **Amadeus API**: 실제 호텔 데이터 소스

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

루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가:

```
# Amadeus API 인증
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret

# 서버 포트
PORT=3001

# Amadeus Base URL
ACCOMMODATION_API_BASE_URL=https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city

# 이달의 추천 숙소 도시 리스트
RECOMMENDED_CITY_CODES=PAR,TYO,SEL,BKK,HNL,CEB,OSA,SGN
```

### 서버 실행

```bash
# 개발 모드 실행
npm run dev

# 또는 일반 실행
npm start
```

서버는 기본적으로 http://localhost:3001 에서 실행됩니다.

## 📜 API 엔드포인트

### 1. 추천 숙소 목록 조회

```
GET /api/accommodations
```

**응답 예시:**

```json
[
  {
    "cityCode": "PAR",
    "hotels": [
      {
        "hotelId": "HSPARHAT",
        "hotelName": "Hotel Atala Champs Elysees",
        "latitude": 48.87229,
        "longitude": 2.3076,
        "imageUrl": "https://example.com/hotel-image.jpg"
      }
    ]
  }
]
```

### 2. 목적지 검색

```
GET /api/destinations?query=도쿄
```

**응답 예시:**

```json
["도쿄"]
```

### 3. 서버 상태 확인

```
GET /
```

**응답 예시:**

```json
{
  "message": "서버가 정상적으로 실행 중입니다.",
  "environment": "development"
}
```

## 🔄 외부 API 연동

### Amadeus API

tripNet은 Amadeus API를 사용하여 호텔 정보를 가져옵니다:

#### 1. 인증 토큰 획득:

```javascript
const getAccessToken = async () => {
  const response = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data.access_token;
};
```

#### 2. 호텔 정보 가져오기:

```javascript
const response = await axios.get(
  `${process.env.ACCOMMODATION_API_BASE_URL}?cityCode=${cityCode}`,
  {
    headers: {
      Authorization: `Bearer ${amadeusAccessToken}`,
    },
  }
);
```

## 📂 디렉토리 구조

```
tripNet-backend/
├── config/                   # 설정 파일
│   └── cityImageMapping.js   # 도시별 이미지 매핑
├── .env                      # 환경 변수 파일 (git에서 제외됨)
├── .gitignore                # git 제외 파일 목록
├── index.js                  # 메인 서버 파일
├── package.json              # 프로젝트 메타데이터 및 의존성
└── README.md                 # 이 문서
```

## 📊 데이터 흐름

1. 서버 시작 시 Amadeus API에서 Access Token 획득
2. 클라이언트에서 API 요청 수신
3. Amadeus API에 호텔 정보 요청
4. 응답 데이터 가공 후 클라이언트에 전송
5. 이미지 URL이 유효하지 않은 경우 도시별 대체 이미지 제공

## 🌿 브랜치 전략

프로젝트는 다음과 같은 Git 브랜치 전략을 사용합니다:

### 기본 브랜치

- **main**: 배포 가능한 최종 코드 (항상 안정 상태)
- **develop**: (선택) 여러 기능을 합쳐서 테스트하는 통합 개발 브랜치 (현재는 `main` 위주 사용)

---

### 작업 브랜치

> 🖥️ 프론트엔드 작업: **개인 이름 기반 브랜치 사용**

- 예시: `username-pages`, `username-home`, `username-ticket`
- 이유: 프론트는 페이지/컴포넌트 단위 작업이 많아 개인별로 분리 관리

> 🛠️ 백엔드 작업: **기능 중심 브랜치 사용**

- 예시: `feature/accommodation-api`, `feature/payment-api`
- 예시: `fix/access-token-error`, `fix/hotel-image-null`
- 이유: 백엔드는 모든 기능이 하나의 서버에 합쳐지므로 기능 단위로 관리해야 깔끔

---

### 브랜치 이름 작성 예시

- **새 기능 개발 시:** `feature/해외숙소-api`, `feature/결제-api`
- **버그 수정 시:** `fix/토큰-갱신`, `fix/호텔-이미지-오류`

---

### 기본 작업 흐름

1. `main` 최신 상태 Pull
2. 자신의 브랜치 생성 후 작업
3. 커밋하고 푸시
4. GitHub에서 Pull Request(PR) 생성
5. 리뷰 및 병합

---

### 주의사항

- `main`에는 직접 커밋 금지
- PR 생성 시 간단한 작업 설명 추가
- 커밋은 한 기능 단위로 묶어서 깔끔하게

## 👨‍💻 개발팀 소개

- **조윤빈**: 프론트엔드 개발
- **이병규**: 백엔드 개발
- **황환성**: 디자인 및 프론트엔드 개발
- **이혜은**: 프로젝트 관리 및 API 연동

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.
