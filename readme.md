[DUTInfo][dutinfo]的 nodejs 版本, 可以放在有校园网条件的服务器上运行. 刚开始看 nodejs, 配置都是硬编码, 慢慢改.

``` text
监听端口: 10000

POST 格式:
{
    "studentnumber": "学号",
    "password": "校园门户密码",
    "fetch": ["course", "net", "ecard", "person", "library", "test"] // 选择需要的获取
}

request 格式
{
    "net":
    {
        "fee": "3.45",
        "flag": "success",
        "account": "学号就不显示了",
        "usedTraffic": "11851.52"
    },
    "person": "王梓浓",
    "library":
    {
        "hastime": true,
        "opentime": "7:50",
        "closetime": "21:30"
    },
    "course": [
    {
        "name": "嵌入式系统设计",
        "teacher": "丁男 董校",
        "time": [
        {
            "place": "综合教学2号楼",
            "startsection": 1,
            "endsection": 2,
            "weekday": 4,
            "startweek": 1,
            "endweek": 8
        },
        {
            "place": "综合教学2号楼",
            "startsection": 5,
            "endsection": 6,
            "weekday": 1,
            "startweek": 1,
            "endweek": 8
        }]
    }],
    "test":[
    {
        "name": "嵌入式系统设计-01 ",
        "teachweek": "8",
        "date": "2018-04-26",
        "time": "08:00-09:40",
        "place": "第一教学馆1-209"
    }],
    "ecard":
    {
        "flag": "success",
        "cardbal": "81.58",
        "paybal": "0.00"
    }
}
```

[dutinfo]:https://github.com/shino-996/DUTInfo