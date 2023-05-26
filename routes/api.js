var express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const { Lecture, LectureBusan } = require("../models/lecture");
var router = express.Router();

const url =
  "http://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api?serviceKey=psND%2BKTjDcvdXSPe9ZRAvZ6pjfdakMwL7P19bq1LBGE%2BgiK8am8MZ%2FpktwJqU7N2znrzcwXGLyofCiPbY5TgeQ%3D%3D&pageNo=1&numOfRows=100&type=json";

const url_busan =
  "https://apis.data.go.kr/6260000/BusanTblIeduScedService/getTblIeduScedInfo?serviceKey=qXPgVSHxQjlnhkX%2Bk8J5QMlTkEF4%2BHx2ACMZ%2BCP7oP93Gd8%2BWqQqBl2EGIjkN1kwMQknwKyMZxW6qHaU8nzQMg%3D%3D&pageNo=1&numOfRows=1000&resultType=json";

router.get("/", function (req, res) {
  res.send("/api");
});

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

router.get("/lectureBusan", async function (req, res) {
  try {
    // Delete previous data
    await LectureBusan.deleteMany({});
    // Fetch data from the API
    const items = (await axios.get(url_busan)).data.getTblIeduScedInfo.body
      .items.item;
    if (!items) return res.send("not found.");

    const lectures = items.map((item) => {
      return new LectureBusan(item);
    });
    await LectureBusan.insertMany(lectures);

    res.send(`${lectures.length} items saved successfully.`);
  } catch (error) {
    console.log(error);
  }
});

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
