"use strict";

const request = require("request-promise-native");

function fetch(cookieJar) {
    let option = {
        url: "https://portal.dlut.edu.cn/tp/up/subgroup/getTrafficList",
        method: "POST",
        body: {},
        json: true,
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar,
        simple: false
    };
    return request(option);
}

module.exports = cookieJar => {
    return new Promise((resolve, reject) => {
        fetch(cookieJar)
        .then( data => {
            resolve(data[0]);
        }).catch( error => {
            reject(error);
        })
    });
}