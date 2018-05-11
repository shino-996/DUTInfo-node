"use strict";

const request = require("request-promise-native");
const desEncoder = require("./des.js");

function fetch(studentNumber, cookieJar) {
    let option = {
        url: "https://portal.dlut.edu.cn/tp/sys/uacm/profile/getUserById",
        method: "POST",
        body: {
            "BE_OPT_ID": desEncoder(studentNumber, "tp", "des", "param")
        },
        json: true,
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar,
        simple: false
    };
    return request(option);
}

module.exports = (studentNumber) => {
    return cookieJar => {
        return new Promise((resolve, reject) => {
            fetch(studentNumber, cookieJar)
            .then( data => {
                let person = data["USER_NAME"];
                resolve(person);
            }).catch( error => {
                reject(error);
            });
        });
    }
}