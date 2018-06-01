"use strict"

const request = require("request-promise-native")
const gbkDecoder = require("iconv-lite")
const cheerio = require("cheerio")

function fetch() {
    const option = {
        url: "http://202.118.72.80/web/opentime_show.asp",
        encoding: null
    }
    return request(option)
}

function parse(data) {
    const str = gbkDecoder.decode(data, "GBK")
    const html = cheerio.load(str)
    let timeStr = html("body > p").text()
    let info = {}
    if (timeStr.match(/[0-9]/ig)) {
        const time = timeStr.replace(/[^0-9：-]/ig, "").trim().split(/[：-]/ig)
        info.hastime = true
        info.opentime = time[1] + ":" + time[2]
        info.closetime = time[3] + ":" + time[4]
    } else {
        info.hastime = false,
        info.other = timeStr.trim().split("\n")[0]
    }
    return info
}

module.exports = async cookieJar => {
    try {
        const data = await fetch()
        return parse(data)
    } catch(error) {
        throw error
    }
}