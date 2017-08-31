const moment = require("moment")

test("15s", "2017-08-27T00:00:00.000-07:00", "00:00:15", "HH:mm:ss")
test("later", "2017-08-27T00:00:00.000-07:00", "Sun 3AM")
test("later", "2017-08-27T22:00:00.000-07:00", "Mon 1AM")
test("next morning", "2017-08-27T00:00:00.000-07:00", "Sun 9AM")
test("next morning", "2017-08-27T12:00:00.000-07:00", "Mon 9AM")
test("next afternoon", "2017-08-27T05:00:00.000-07:00", "Sun 2PM")
test("next afternoon", "2017-08-27T12:00:00.000-07:00", "Sun 2PM")
test("next afternoon", "2017-08-27T15:00:00.000-07:00", "Mon 2PM")
test("next afternoon", "2017-08-27T20:00:00.000-07:00", "Mon 2PM")
test("next evening", "2017-08-27T00:00:00.000-07:00", "Sun 7PM")
test("next evening", "2017-08-27T12:00:00.000-07:00", "Sun 7PM")
test("next evening", "2017-08-27T20:00:00.000-07:00", "Mon 7PM")
test("next evening", "2017-08-27T20:00:00.000-07:00", "Mon 7PM")
test("next weekend", "2017-08-28T00:00:00.000-07:00", "Sat Sep 2nd 9AM", "ddd MMM Do hA")
test("next weekend", "2017-09-01T00:00:00.000-07:00", "Sat Sep 2nd 9AM", "ddd MMM Do hA")
test("next weekend", "2017-09-02T10:00:00.000-07:00", "Sat Sep 9th 9AM", "ddd MMM Do hA")
test("next week", "2017-08-27T00:00:00.000-07:00", "Mon Aug 28th 9AM", "ddd MMM Do hA")
test("next week", "2017-08-29T12:00:00.000-07:00", "Mon Sep 4th 9AM", "ddd MMM Do hA")
test("next week", "2017-09-01T00:00:00.000-07:00", "Mon Sep 4th 9AM", "ddd MMM Do hA")
test("next week", "2017-09-02T00:00:00.000-07:00", "Mon Sep 4th 9AM", "ddd MMM Do hA")
test("first of next month", "2017-08-27T00:00:00.000-07:00", "Fri Sep 1st 9AM", "ddd MMM Do hA")
test("first of next month", "2017-09-01T12:00:00.000-07:00", "Sun Oct 1st 9AM", "ddd MMM Do hA")
test("first of next month", "2017-09-02T00:00:00.000-07:00", "Sun Oct 1st 9AM", "ddd MMM Do hA")

function calcSnoozeTime (funcName, startTime) {
  const snoozeOptions = {
    "15s": date => moment(date).add(15, "seconds"),
    "later": date => moment(date).add(3, "hours"),
    "next morning": date => moment(date).startOf("day").add({hours: 9, days: moment(date).hours() >= 9 ? 1 : 0}),
    "next afternoon": date => moment(date).startOf("day").add({hours: 14, days: moment(date).hours() >= 14 ? 1 : 0}),
    "next evening": date => moment(date).startOf("day").add({hours: 19, days: moment(date).hours() >= 19 ? 1 : 0}),
    "next weekend": date => moment(date).add(moment(date).isoWeekday() >= 6 ? 1 : 0, "week").startOf("isoWeek").add(5, "days").add(9, "hours"),
    "next week": date => moment(date).add(1, "week").startOf("isoWeek").add(9, "hours"),
    "first of next month": date => moment(date).add(1, "month").startOf("month").add(9, "hours"),
  }
  const newTimeFunc = snoozeOptions[funcName]
  if (newTimeFunc) return newTimeFunc(startTime)
}

function test (name, startTimeString, expected, format = "ddd hA") {
  const actual = calcSnoozeTime(name, startTimeString).format(format)
  return console.log(actual === expected ? "√" : "X", name, moment(startTimeString).format(format), "->", actual, actual !== expected ? "!=" : "", actual !== expected ? expected : "")
}
