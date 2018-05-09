"use strict";

const request = require("request-promise-native");
const gbkDecoder = require("iconv-lite");
const cheerio = require("cheerio");

function fetch() {
    let option = {
        url: "http://202.118.72.80/web/opentime_show.asp",
        encoding: null
    };
    return request(option);
}

function parse(data) {
    let str = gbkDecoder.decode(data, "GBK");
    let html = cheerio.load(str);
    let time = html("body > p").text().replace(/[^0-9：-]/ig, "").trim().split(/[：-]/ig);
    let info = {
        "opentime": time[1] + ":" + time[2],
        "closetime": time[3] + ":" + time[4]
    };
    return info;
}

module.exports = session => {
    return new Promise((resolve, reject) => {
        fetch()
        .then( data => {
            session.library = parse(data);
            resolve(session);
        }).catch( error => {
            reject(error);
        });
    });
}