"use strict"

const request = require("request-promise-native")
const cheerio = require("cheerio")
const gbkDecoder = require("iconv-lite")

function fetch(cookieJar) {
    let option = {
        url: "http://zhjw.dlut.edu.cn/ksApCxAction.do?oper=getKsapXx",
        encoding: null,
        jar: cookieJar
    }
    return request(option)
}

function parse(data) {
    let tests = []
    let str = gbkDecoder.decode(data, "GBK")
    let html = cheerio.load(str)
    let table = html("#user > tbody")[1]
    let testSource = html("tr", table)
    testSource.each((i, elem) => {
        let source = html("td", elem)
        let test = {}
        test.name = html(source[4]).text()
        test.teachweek = html(source[0]).text().replace(/[^0-9]/ig, "")
        test.date = html(source[5]).text()
        test.time = html(source[6]).text()
        test.place = html(source[2]).text() + html(source[3]).text()
        tests.push(test)
    })
    return tests
}

module.exports = async cookieJar => {
    try {
        const data = await fetch(cookieJar)
        return parse(data)
    } catch(error) {
        throw error
    }
}