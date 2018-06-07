"use strict"

const http = require("http")
const login = require("./src/login.js")
const teachLogin = require("./src/teachLogin.js")

let funcMap = {
    "net": require("./src/net.js"),
    "ecard": require("./src/ecard.js"),
    // "course": require("./src/course.js"),
    "test": require("./src/test.js"),
    "person": require("./src/person.js"),
    "library": require("./src/library.js"),
    "course": require("./src/portal_course.js")
}

async function processPost(res, json) {
    const studentNumber = json.studentnumber
    const password = json.password
    const fetches = json["fetch"]
    if (!studentNumber || !password || !fetches) {
        res.writeHead(400)
        res.end("400 error: cant't read the post body")
        return
    }
    let funcArray = fetches.map( elem => {
        if (elem == "person") {
            return funcMap[elem](studentNumber)
        }
        return funcMap[elem]
    })
    try {
        let cookieJar = await login(studentNumber, password)
        if (funcArray.includes(funcMap["course"]) || funcArray.includes(funcMap["test"])) {
            await teachLogin(cookieJar)
        }
        let infoData = await Promise.all( funcArray.map( func => {
            return func(cookieJar)
        }))
        const info = infoData.reduce( (info, data) => {
            info[fetches[infoData.indexOf(data)]] = data
            return info
        }, {})
        res.writeHead(200, {
            "Content-Type": "application/json charset=UTF-8"
        })
        res.end(JSON.stringify(info))
    } catch(error) {
        console.log(error)
        res.writeHead(504)
        res.end("504 error: portal site auth error")
    }
}

let server = new http.Server()
server.on("request", (req, res) => {
    if (req.method != "POST") {
        res.writeHead(405)
        res.end("405 error: only support post method")
        return
    }
    let postData = []
    req.on("data", chunk => {
        postData.push(chunk)
    })
    req.on("end", () => {
        let data = Buffer.concat(postData)
        let json = JSON.parse(data)
        processPost(res, json)
    })
})
server.listen(10000, "0.0.0.0", error => {
    if (error) {
        console.log("server listen error")
        console.log(error)
    }
})