"use strict";

const http = require("http");
const login = require("./src/login.js");

let funcMap = {
    "net": require("./src/net.js"),
    "ecard": require("./src/ecard.js"),
    "course": require("./src/course.js"),
    "person": require("./src/person.js"),
    "library": require("./src/library.js")
};

function processPost(res, json) {
    let studentNumber = json.studentnumber;
    let password = json.password;
    let fetches = json["fetch"];
    if (!studentNumber ||
        !password ||
        !fetches) {
        res.writeHead(400);
        res.end("400 error: cant't read the post body");
        return;
    }
    let funcArray = fetches.map( elem => {
        if (elem == "person") {
            return funcMap[elem](studentNumber);
        }
        return funcMap[elem];
    });
    funcArray.push( session => {
        let data = session
        delete data.cookieJar;
        res.writeHead(200, {
            "Content-Type": "application/json; charset=UTF-8"
        });
        res.end(JSON.stringify(data));
    });
    let master = [];
    master[0] = login(studentNumber, password);
    for (let i of funcArray.keys()) {
        master[i + 1] = master[i].then(funcArray[i]);
    }
    master[master.length - 1].catch( error => {
        res.end("auth error");
    })
}

let server = new http.Server();
server.on("request", (req, res) => {
    if (req.method != "POST") {
        res.writeHead(405);
        res.end("405 error: only support post method");
        return;
    }
    let postData = [];
    req.on("data", chunk => {
        postData.push(chunk);
    });
    req.on("end", () => {
        let data = Buffer.concat(postData);
        let json = JSON.parse(data);
        processPost(res, json);
    })
});
server.listen(10000, error => {
    if (error) {
        console.log("server listen error");
        console.log(error);
    }
});