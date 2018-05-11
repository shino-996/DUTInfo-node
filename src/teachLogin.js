"use strict";

const request = require("request-promise-native");
const cheerio = require("cheerio");

function jumpTeachPage(cookieJar) {
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

module.exports = cookieJar => {
    return new Promise((resolve, reject) => {
        jumpTeachPage(cookieJar)
        .then( data => {
            return teachAuth(cookieJar, data);
        }).then( data => {
            resolve(cookieJar);
        }).catch( error => {
            reject(error);
        });
    })
}