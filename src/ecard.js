"use strict"

const request = require("request-promise-native")

function fetch(cookieJar) {
    let option = {
        url: "https://portal.dlut.edu.cn/tp/up/subgroup/getCardMoney",
        method: "POST",
        body: {},
        json: true,
        headers: {
            "User-Agent": "curl/7.54.0"
        },
        jar: cookieJar,
        simple: false
    }
    return request(option)
}

module.exports = async cookieJar => {
    try {
        const data = await fetch(cookieJar)
        return data
    } catch(error) {
        throw error
    }
}