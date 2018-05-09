"use strict";

const request = require("request-promise-native");
const cheerio = require("cheerio");
const gbkDecoder = require("iconv-lite");

function jumpTeachPate(cookieJar) {
    let option = {
        url: "https://sso.dlut.edu.cn/cas/login?service=https%3A%2F%2Fportal.dlut.edu.cn%2Fsso%2Fsso_jw.jsp",
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar
    };
    return request(option);
}

function teachAuth(cookieJar, data) {
    let html = cheerio.load(data);
    let option = {
        url: "http://zhjw.dlut.edu.cn",
        method: "POST",
        form: {
            "logintype": html("#logintype").attr("value"),
            "un": html("#un").attr("value"),
            "verify": html("#verify").attr("value"),
            "time": html("#time").attr("value"),
            "url": html("#url").attr("value")
        },
        encoding: null,
        jar: cookieJar
    };
    return request(option);
}

function fetch(cookieJar) {
    let option = {
        url: "http://zhjw.dlut.edu.cn/xkAction.do?actionType=6",
        encoding: null,
        jar: cookieJar
    };
    return request(option);
}

function parse(data) {
    let courses = [];
    let str = gbkDecoder.decode(data, "GBK");
    let html = cheerio.load(str);
    let courseSource = html("tbody > tr.odd", "#user");
    courseSource.each( (i, elem) => {
        let source = html("td", elem);
        if(source.length > 7) {
            let course = {};
            course.name = html(source[2]).text().trim();
            course.teacher = html(source[7]).text().replace("*", "").trim();
            let teachWeek = html(source[11]).text().replace(/[^0-9-]/ig, "").trim();
            if (teachWeek.length != 0) {
                var time = {};
                time.place = html(source[16]).text().trim();
                time.startsection = parseInt(html(source[13]).text().trim());
                time.endsection = time.startsection - 1 + parseInt(html(source[14]).text().trim());
                time.week = parseInt(html(source[12]).text().trim());
                let startTeachWeek = parseInt(teachWeek.split("-")[0]);
                let endTeachWeek = parseInt(teachWeek.split("-")[1]);
                time.teachweek = [];
                for (let i = 0; i <= endTeachWeek - startTeachWeek; ++i) {
                    time.teachweek.push(startTeachWeek + i);
                }
                course.time = [time];
            }
            courses.push(course);
        } else {
            let course = courses.pop();
            let teachWeek = html(source[0]).text().replace(/[^0-9-]/ig, "");
            if (teachWeek.length != 0) {
                var time = {};
                time.place = html(source[5]).text().trim();
                time.startsection = parseInt(html(source[2]).text().trim());
                time.endsection = time.startsection - 1 + parseInt(html(source[3]).text().trim());
                let startTeachWeek = parseInt(teachWeek.split("-")[0]);
                let endTeachWeek = parseInt(teachWeek.split("-")[1]);
                time.teachweek = [];
                for (let i = 0; i <= endTeachWeek - startTeachWeek; ++i) {
                    time.teachweek.push(startTeachWeek + i);
                }
                course.time.push(time);
            }
            if (course.time.length == 0) {
                delete course.time;
            }
            courses.push(course);
        }
    });
    return courses;
}

module.exports = session => {
    let cookieJar = session.cookieJar;
    return new Promise((resolve, reject) => {
        jumpTeachPate(cookieJar)
        .then( data => {
            return teachAuth(cookieJar, data);
        }).then( data => {
            return fetch(cookieJar);
        }).then( data => {
            session.course = parse(data);
            resolve(session);
        }).catch( error => {
            reject(error);
        });
    });
}