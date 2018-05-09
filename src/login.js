"use strict";
const request = require("request-promise-native");
const cheerio = require("cheerio");
const gbkDecoder = require("iconv-lite");

function fetchCookie(cookieJar) {
    let option = {
        url: "https://sso.dlut.edu.cn/cas/login?service=https%3A%2F%2Fportal.dlut.edu.cn%2Ftp%2F",
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar
    };
    return request(option);
}

function postLogin(studentNumber, password, cookieJar, data) {
    let cookies = cookieJar.getCookies("https://sso.dlut.edu.cn");
    let cookieString = "jsessionid=";
    for (let cookie of cookies) {
        if (cookie["key"] == "JESSIONID") {
            cookieString += cookie["vlaue"];
            break;
        }
    }
    let html = cheerio.load(data);
    let lt_ticket = html("#lt").attr("value");
    let url = "https://sso.dlut.edu.cn/cas/login;" + cookieString + "?service=https%3A%2F%2Fportal.dlut.edu.cn%2Ftp%2F";
    let desEncode = require("./des.js");
    let option = {
        url: url,
        method: "POST",
        form: {
            "rsa": desEncode(studentNumber + password + lt_ticket, "1", "2", "3"),
            "ul": 9,
            "pl": 14,
            "lt": lt_ticket,
            "execution": "e1s1",
            "_eventId": "submit"
        },
        headers: {
            "User-Agent": "cirl/7.54.0"
        },
        jar: cookieJar,
        simple: false,
        resolveWithFullResponse: true
    };
    return request(option);
}

function authJump(cookieJar, rsp) {
    let option = {
        url: rsp.headers.location,
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar,
        simple: false,
        followAllRedirects: false
    };
    return request(option);
}

module.exports = (studentNumber, password) => {
    let cookieJar = request.jar();
    let session = {
        "cookieJar": cookieJar
    };
    return new Promise((resolve, reject) => {
        fetchCookie(cookieJar)
        .then( data => {
            return postLogin(studentNumber, password, cookieJar, data);
        }).then( rsp => {
            return authJump(cookieJar, rsp);
        }).then( rsp => {
            resolve(session);
        }).catch( error => {
            reject(error);
        })
    });
}
