"use strict"

const request = require("request-promise-native")

function fetchYear(cookieJar) {
    let option = {
        url: "https://portal.dlut.edu.cn/tp/up/widgets/getLearnweekbyDate",
        method: "POST",
        body: {
            "mapping":"getSemesterbyDate"
        },
        json: true,
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar,
        simple: false
    }
    return request(option)
}

function fetchAllCourse(cookieJar, data) {
    let body = data
    delete body.isHoliday
    let option = {
        url: "https://portal.dlut.edu.cn/tp/up/widgets/getClassbyUserInfo",
        method: "POST",
        body: data,
        json: true,
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar,
        simple: false
    }
    return request(option)
}

function fetch(cookieJar, body, allCourse, week) {
    let option = {
        url: "https://portal.dlut.edu.cn/tp/up/widgets/getClassbyTime",
        method: "POST",
        body: {
            "classList": allCourse,
            "learnWeek": week,
            "schoolYear": body.schoolYear,
            "semester": body.semester
        },
        json: true,
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar,
        simple: false
    }
    return request(option)
}

function unique(arr) {
    let result = {};
    for(let i = 0; i < arr.length; ++i) {
        result[arr[i]["KCH"] + arr[i]["SKXQ"]] = arr[i];
    }
    return Object.values(result)
}

function transToCourse(arr) {
    const courses =  arr.map( element => {
        let course = {}
        course.name = element.KCMC.split("/")[0]
        course.teacher = element.JSXM.split("/")[0]
        let time = {}
        time.place = element.JXDD.split("/")[0]
        time.startsection = parseInt(element.SKJC)
        time.endsection = time.startsection + parseInt(element.CXJC) - 1
        time.startweek = element.QSZ
        time.endweek = element.ZZZ
        time.weekday = parseInt(element.SKXQ)
        course.time = [time]
        return course
    })
    let result = {}
    for(let i = 0; i < courses.length; ++i) {
        if(result[courses[i].name]) {
            result[courses[i].name].time.push(courses[i].time[0])
        } else {
            result[courses[i].name] = courses[i]
        }
    }
    return Object.values(result)
}

module.exports = async cookieJar => {
    try {
        const body = await fetchYear(cookieJar)
        const allCourse = await fetchAllCourse(cookieJar, body)
        if (typeof(allCourse) != 'object') {
            return
        }
        let weekArray = Array.from(new Array(20), (_, index) => { return index + 1 })
        const courseArray = await Promise.all(weekArray.map( week => {
            return fetch(cookieJar, body, allCourse, week)
        }))
        const data = transToCourse(unique(courseArray.reduce( (sum, arr) => { return sum.concat(arr) })))
        return data
    } catch(error) {
        throw error
    }
}