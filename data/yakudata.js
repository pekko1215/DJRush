/**
 * Created by pekko1215 on 2017/07/15.
 */

var dummnyLines = {
    "中段":[
        [0,0,0],
        [1,1,1],
        [0,0,0]
    ],
    "上段":[
        [1,1,1],
        [0,0,0],
        [0,0,0]
    ],
    "下段":[
        [0,0,0],
        [0,0,0],
        [1,1,1]
    ],
    "右下がり":[
        [1,0,0],
        [0,1,0],
        [0,0,1]
    ],
    "右上がり":[
        [0,0,1],
        [0,1,0],
        [1,0,0]
    ],
    "なし":[
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ]
}

var YakuData = [
    {
        name: "はずれ",
        pay: [0, 0, 0]
    },
    {
        name: "リプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["右下がり"]
    },
    {
        name: "リプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["右下がり"]
    },
    {
        name: "リプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["上段"]
    },
    {
        name: "リプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["上段"]
    },
    {
        name: "ベル",
        pay: [15, 15, 15],
        flashLine:dummnyLines["下段"]
    },
    {
        name: "ベル",
        pay: [15, 15, 15],
        flashLine:dummnyLines["下段"]
    },
    {
        name: "ベル",
        pay: [15, 15, 15],
        flashLine:dummnyLines["右上がり"]
    },
    {
        name: "ベル",
        pay: [15, 15, 15],
        flashLine:dummnyLines["右上がり"]
    },
    {
        name: "チェリー",
        pay: [15, 15, 15],
        flashLine:[[0,0,0],[0,0,0],[1,0,0]]
    },
    {
        name: "チャンス目",
        pay: [1, 1, 1],
        flashLine:dummnyLines["右上がり"]
    },
    {
        name: "チャンス目",
        pay: [1, 1, 1],
        flashLine:dummnyLines["下段"]
    },
    {
        name: "REG1",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "REG1",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "DJリプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["右下がり"]
    },
    {
        name: "DJリプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["右下がり"]
    },
    {
        name: "DJリプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["上段"]
    },
    {
        name: "DJリプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["上段"]
    },
    {
        name: "DJリプレイ",
        pay: [0, 0, 0]
    },
    {
        name: "BIG1",
        pay: [0, 0, 0]
    },
    {
        name: "BIG2",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "JACIN",
        pay: [0, 0, 0]
    },
    {
        name: "JACGAME",
        pay: [15, 15, 15],
        flashLine:dummnyLines["右下がり"]
    },
    {
        name: "REG2",
        pay: [0, 0, 0]
    },
    {
        name: "DJリプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["下段"]
    },
    {
        name: "DJリプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["右上がり"]
    },
]