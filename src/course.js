"use strict"

const request = require("request-promise-native")
const cheerio = require("cheerio")
const gbkDecoder = require("iconv-lite")

function fetch(cookieJar) {
    let option = {
        url: "http://zhjw.dlut.edu.cn/xkAction.do?actionType=6",
        encoding: null,
        jar: cookieJar
    }
    return request(option)
}

function parse(data) {
    let courses = []
    let str = gbkDecoder.decode(data, "GBK")
    let html = cheerio.load(str)
    let courseSource = html("tbody > tr.odd", "#user")
    courseSource.each((i, elem) => {
        let source = html("td", elem)
        if(source.length > 7) {
            let course = {}
            course.name = html(source[2]).text().trim()
            course.teacher = html(source[7]).text().replace("*", "").trim()
            let teachWeek = html(source[11]).text().replace(/[^0-9-]/ig, "").trim()
            if (teachWeek.length != 0) {
                var time = {}
                time.place = html(source[16]).text().trim() + " " + html(source[17]).text().trim()
                time.startsection = parseInt(html(source[13]).text().trim())
                time.endsection = time.startsection - 1 + parseInt(html(source[14]).text().trim())
                time.weekday = parseInt(html(source[12]).text().trim())
                time.startweek = parseInt(teachWeek.split("-")[0])
                time.endweek = parseInt(teachWeek.split("-")[1])
                course.time = [time]
            }
            courses.push(course)
        } else {
            let course = courses.pop()
            let teachWeek = html(source[0]).text().replace(/[^0-9-]/ig, "")
            if (teachWeek.length != 0) {
                var time = {}
                time.place = html(source[5]).text().trim() + " " + html(source[17]).text().trim()
                time.startsection = parseInt(html(source[2]).text().trim())
                time.endsection = time.startsection - 1 + parseInt(html(source[3]).text().trim())
                time.weekday = parseInt(html(source[1]).text().trim())
                time.startweek = parseInt(teachWeek.split("-")[0])
                time.endweek = parseInt(teachWeek.split("-")[1])
                course.time.push(time)
            }
            if (course.time.length == 0) {
                delete course.time
            }
            courses.push(course)
        }
    })
    return courses
}

module.exports = async cookieJar => {
    try {
        let courseData = await fetch(cookieJar)
        return parse(courseData)
    } catch(error) {
        throw error
    }
}