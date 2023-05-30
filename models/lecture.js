const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  lctreNm: String,
  instrctrNm: String,
  edcStartDay: Date,
  edcEndDay: Date,
  edcStartTime: String,
  edcColseTime: String,
  lctreCo: String,
  edcTrgetType: String,
  edcMthType: String,
  operDay: String,
  edcPlace: String,
  psncpa: Number,
  lctreCost: Number,
  edcRdnmadr: String,
  operInstitutionNm: String,
  operPhoneNumber: String,
  rceptStartDate: Date,
  rceptEndDate: Date,
  rceptMthType: String,
  slctnMthType: String,
  homepageUrl: String,
  oadtCtLctreYn: String,
  pntBankAckestYn: String,
  lrnAcnutAckestYn: String,
  referenceDate: Date,
  insttCode: String,
  lat: Number,
  lng: Number,
  streetViewUrl: String,
});

const lectureBusanSchema = new mongoose.Schema({
  eduNm: String,
  eduSdate: Date,
  eduFdate: Date,
  eduTime: String,
  eduLoc: String,
  people: String,
  eduExp: String,
  months: String,
  target: String,
  period: String,
  tel: String,
  days: String,
  gugun: String,
  dataDay: Date,
  roadAddr: String,
  addr: String,
  lat: String,
  lng: String,
  streetViewUrl: String,
});

const Lecture = mongoose.model("Lecture", lectureSchema);
const LectureBusan = mongoose.model("LectureBusan", lectureBusanSchema);

module.exports = { Lecture, LectureBusan };
