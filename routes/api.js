var express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const { Lecture, LectureBusan } = require("../models/lecture");
var router = express.Router();

const url =
  "http://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api?serviceKey=psND%2BKTjDcvdXSPe9ZRAvZ6pjfdakMwL7P19bq1LBGE%2BgiK8am8MZ%2FpktwJqU7N2znrzcwXGLyofCiPbY5TgeQ%3D%3D&pageNo=1&numOfRows=1000&type=xml";

const url_busan =
  "https://apis.data.go.kr/6260000/BusanTblIeduScedService/getTblIeduScedInfo?serviceKey=qXPgVSHxQjlnhkX%2Bk8J5QMlTkEF4%2BHx2ACMZ%2BCP7oP93Gd8%2BWqQqBl2EGIjkN1kwMQknwKyMZxW6qHaU8nzQMg%3D%3D&pageNo=1&numOfRows=1000&resultType=json";

router.get("/", function (req, res) {
  res.send("/api");
});

const apiKey = "AIzaSyDhdx0e6xmovgxkM9mL4vhLVUSymlZ-O3o";

function getGeoCodeUrl(address) {
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;
}

/* GET users listing. */
router.get("/lecture", async function (req, res) {
  try {
    // Delete previous data
    await Lecture.deleteMany({});
    // Fetch data from the API
    const items = (await axios.get(url)).response?.body?.items;
    res.send(items ? items : "not found.");
    // console.log(items);
    // if (!items) return res.send("items not found.");
    // await Lecture.insertMany(items);
    // res.send(`${items.length} items saved successfully.`);
  } catch (error) {
    console.log(error);
  }
});

function getStreetViewImage(lat, lng) {
  return `https://maps.googleapis.com/maps/api/streetview?size=200x200&location=${lat},${lng}&key=AIzaSyDhdx0e6xmovgxkM9mL4vhLVUSymlZ-O3o`;
}

router.get("/fetchBusanLectures", async function (req, res) {
  try {
    // Delete previous data
    await LectureBusan.deleteMany({});
    // Fetch data from the API
    const items = (await axios.get(url_busan)).data.getTblIeduScedInfo.body
      .items.item;
    if (!items) return res.send("not found.");

    const lectures = items.map((item) => {
      item.streetViewUrl = getStreetViewImage(item.lat, item.lng);
      console.log(item);
      return new LectureBusan(item);
    });

    await LectureBusan.insertMany(lectures);
    res.send(`${lectures.length} items saved successfully.`);
  } catch (error) {
    console.log(error);
  }
});

router.get("/fetchAllLectures", async function (req, res) {
  try {
    // Delete previous data
    await Lecture.deleteMany({});
    let currentPage = 1;
    let totalItems = 0;
    const apiKey =
      "psND%2BKTjDcvdXSPe9ZRAvZ6pjfdakMwL7P19bq1LBGE%2BgiK8am8MZ%2FpktwJqU7N2znrzcwXGLyofCiPbY5TgeQ%3D%3D";
    const baseUrl =
      "http://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api";

    // Fetch and process all pages
    while (true) {
      console.log(currentPage);
      const url = `${baseUrl}?serviceKey=${apiKey}&pageNo=${currentPage}&numOfRows=1000&type=json`;
      const response = await axios.get(url);
      const items = response.data?.response?.body?.items;

      if (!items || items.length === 0) {
        break; // Exit the loop if there are no more items
      }

      // Filter items based on edcStartDay
      const filteredItems = items.filter((item) => {
        const edcStartDay = new Date(item.edcStartDay);
        const today = new Date();

        // Calculate the date range
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 90);
        return edcStartDay >= thirtyDaysAgo && edcStartDay <= thirtyDaysFromNow;
      });

      const updatedItems = filteredItems.map((item) => {
        return axios
          .get(getGeoCodeUrl(item.edcRdnmadr))
          .then((res) => {
            const results = res.data.results;
            const location = results[0].geometry.location;
            item.lat = location.lat;
            item.lng = location.lng;
            return item;
          })
          .catch((e) => console.log(e));
      });
      const resolvedItems = await Promise.all(updatedItems);
      console.log(resolvedItems);
      totalItems += resolvedItems.length;
      await Lecture.insertMany(resolvedItems);

      currentPage++;
    }

    res.send(`${totalItems} items saved successfully.`);
  } catch (error) {
    console.log(error);
  }
});

// api for app
router.get("/getBusanLecture", async function (req, res) {
  try {
    const today = new Date();
    const result = await LectureBusan.find({ eduSdate: { $gt: today } });
    if (!result) return res.send("not found.");
    console.log(result);
    res.json({
      totalCount: result.length,
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});

// Schedule the API fetch once a day
cron.schedule("0 0 * * *", () => {
  axios
    .get(url)
    .then((response) => {
      console.log("Data fetched successfully");
    })
    .catch((error) => {
      console.error("An error occurred while fetching data:", error);
    });
});

module.exports = router;
