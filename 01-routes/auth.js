const express = require("express");
const session = require("express-session");
const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const NaverStrategy = require("passport-naver").Strategy;
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 🔹 serialize / deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// 🔹 DB 연동 함수
const saveUserToJson = (userData, provider) => {
  const dbPath = path.join(__dirname, "../tripNet-backend/db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

  const exists = db.users.find((u) => u.id === userData.id);
  if (!exists) {
    db.users.push({
      id: userData.id,
      username: userData.name || userData.nickname || "사용자",
      provider,
    });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
};

// ✅ Kakao 전략
passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_REST_API_KEY,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken;
      saveUserToJson(profile._json, "kakao");
      done(null, profile);
    }
  )
);

// ✅ Naver 전략
passport.use(
  new NaverStrategy(
    {
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken;
      saveUserToJson(profile._json, "naver");
      done(null, profile);
    }
  )
);

// ✅ 로그인 경로
app.get("/auth/kakao", passport.authenticate("kakao", { prompt: "login" }));
app.get("/auth/naver", passport.authenticate("naver"));

// ✅ 콜백
app.get(
  "/auth/kakao/callback",
  passport.authenticate("kakao", {
    successRedirect: "http://localhost:5173/",
    failureRedirect: "/login",
  })
);

app.get(
  "/auth/naver/callback",
  passport.authenticate("naver", {
    successRedirect: "http://localhost:5173/",
    failureRedirect: "/login",
  })
);

// ✅ 프로필 확인
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send("Not logged in");
  res.json({
    ...req.user._json,
    accessToken: req.user.accessToken,
    provider: req.user.provider || req.user._json.provider || "local", // 🔥 여기가 핵심!
  });
});

// ✅ 로그아웃
app.get("/logout", async (req, res) => {
  const provider = req.user?.provider || "local"; // 네이버/카카오 체크를 위한 provider 정보

  try {
    // 카카오 로그아웃 처리
    if (provider === "kakao") {
      const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
      const redirectUri = "http://localhost:5173"; // 카카오 로그아웃 후 리디렉션 URL
      return res.redirect(
        `https://kauth.kakao.com/oauth/logout?client_id=${kakaoRestApiKey}&logout_redirect_uri=${redirectUri}`
      );
    }

    // 네이버 로그아웃 처리
    if (provider === "naver") {
      // 네이버 로그아웃 URL 처리
      return res.redirect(
        "https://nid.naver.com/nidlogin.logout?returl=http://localhost:5173/"
      );
    }

    // 자체 로그인 시, 세션 정리 후 메인으로 리디렉션
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("http://localhost:5173");
      });
    });
  } catch (err) {
    console.error("Logout error", err);
    res.status(500).send("Error logging out");
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
