const express = require("express");
const router = express.Router();
const amadeusService = require("../02-service/amadeus");
const axios = require("axios");

// 해외 숙소 전용 API
router.get("/good-hotels", async (req, res) => {
    try {
        const token = await amadeusService.getForeignAmadeusToken();
        const cityImageMapping = require("../03-config/cityImageMapping");
        let recommendedCityCodes = ["PUS", "SEL", "CJU"];

        const results = await Promise.all(
            recommendedCityCodes.map(async (cityCode) => {
                const response = await axios.get(
                    `${process.env.ACCOMMODATION_API_BASE_URL}?cityCode=${cityCode}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
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
        res.json(results);
    } catch (error) {
        console.error("Error fetching good hotels:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});

router.get("/search-hotels/:cityCode/:checkInDate/:checkOutDate/:adults/:children", async (req, res) => {
    const { cityCode, checkInDate, checkOutDate, adults, children } = req.params;
    const token = await amadeusService.getForeignAmadeusToken();
    const response = await axios.get(
        `${process.env.ACCOMMODATION_API_BASE_URL}?cityCode=${cityCode}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const hotels = response.data.data || [];
    const hotelIds = hotels.map((hotel) => hotel.hotelId);
    console.log("hotelIds:", hotelIds.join(","));
    console.log("adults:", adults, "children:", children);
    const hotelOffersResponse = await axios.get(
        `https://test.api.amadeus.com/v3/shopping/hotel-offers`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                hotelIds: hotelIds.join(","),
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                adults: Number(adults) + Number(children)
            },
        }
    );
    return res.json(hotelOffersResponse.data);
});

router.get("/hotel-details/:hotelId", async (req, res) => {
    const { hotelId } = req.params;
    const token = await amadeusService.getForeignAmadeusToken();
    const response = await axios.get(
        `https://test.api.amadeus.com/v3/shopping/hotel-offers/${hotelId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.json(response.data);
});

module.exports = router;