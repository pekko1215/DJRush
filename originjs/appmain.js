controlRerquest("data/control.smr", main)

// big1 big2
// jac1
// reg1 reg2

function main() {
    window.scrollTo(0, 0);
    var sbig;
    var notplaypaysound = false;
    var hyperzone = 0;
    var hypergame = 0;
    var lastPay = 0;
    slotmodule.on("allreelstop", function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0) return
            var matrix = e.hityaku[0].flashLine || e.hityaku[0].matrix;
            console.log(e)
            var count = 0;
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
            })
            notplaypaysound = false;
            if (e.hityaku[0].name === "JACIN") {
                slotmodule.setFlash(replaceMatrix(flashdata.syoto, matrix, colordata.LINE_F, null), 1000, function() {
                    slotmodule.clearFlashReservation()
                });
            } else {
                if(/チャンス目/.test(e.hityaku[0].name)||
                    /JACIN/.test(e.hityaku[0].name) || 
                    /REG/.test(e.hityaku[0].name)){
                    var count = 20;
                    slotmodule.freeze();
                    slotmodule.setFlash(null, 0, function(e) {
                        slotmodule.setFlash(flashdata.default, 1)
                        var mat = [[rand(2),rand(2),rand(2)],[rand(2),rand(2),rand(2)],[rand(2),rand(2),rand(2)]];
                        if(count--){
                            slotmodule.setFlash(replaceMatrix(flashdata.default, mat, colordata.LINE_F, null), 1, arguments.callee)
                        }else{
                            slotmodule.resume();
                        }
                    })
                }else{
                    slotmodule.setFlash(null, 0, function(e) {
                        slotmodule.setFlash(flashdata.default, 20)
                        slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                    })
                }
            }
        }
        replayFlag = false;
        var nexter = true;
        var changeBonusFlag = false;
        e.hityaku.forEach(function(d) {
            var matrix = d.matrix;
            switch (gameMode) {
                case 'normal':
                    switch (d.name) {
                        case "リプレイ":
                            replayFlag = true;
                            break;
                        case "BIG1":
                            bonusFlag = null;
                            setGamemode('BIG1');
                            sounder.playSound("big1",true,()=>{},14.276);
                            bonusData = new BonusData.BigBonus5("BIG1",310);
                            break
                        case "BIG2":
                            setGamemode('BIG2');
                            bonusData = new BonusData.BigBonus5("BIG2",300);
                            bonusFlag = null;
                            break
                        case 'REG1': //CZに移行
                            setGamemode('REG1');
                            bonusData = new BonusData.RegularBonus5("REG1",1,1);
                            bonusFlag = null;
                    }
                    break;
                case 'BIG1': //出玉ありボーナス
                    switch(d.name){
                        case 'JACIN':
                            setGamemode('JAC');
                            bonusData.jacIn('JAC',6,6);
                            bonusFlag = null;
                        break
                        case 'リプレイ':
                            replayFlag = true;
                        break
                        case 'REG2':
                            setGamemode('REG2');
                            bonusData = new BonusData.RegularBonus5("REG2",1,1);
                            bonusFlag = null;
                    }
                    break;
                case 'BIG2': //見た目通常
                    switch(d.name){
                        case "リプレイ":
                            replayFlag = true;
                            break;
                        case "REG1":
                            setGamemode('REG1');
                            bonusData = new BonusData.RegularBonus5('REG1',1,1);
                            bonusFlag = null;
                            break
                        case 'REG2':
                            setGamemode('REG2');
                            bonusData = new BonusData.RegularBonus5('REG2',1,1);
                            bonusFlag = null;
                            break
                    }
                break
                case 'REG1':
                case 'REG2':
                    switch(d.name){
                        case 'DJリプレイ':
                            replayFlag = true;
                            break
                        case 'リプレイ':
                            replayFlag = true;
                            break
                    }
            }
        })

        if (nexter) {
            e.stopend()
        }
    })
    slotmodule.on("bonusend", () => {
        sounder.stopSound("bgm")
        setGamemode("normal")
    });
    slotmodule.on("payend", function(e) {
        console.log(e)
        if (gameMode != "normal") {
            bonusData.onNextGame(e.pay)
            console.log(bonusData,e.pay,bonusData.getGameMode())
            setGamemode(bonusData.getGameMode());
            if(bonusData.isEnd == true){
                bonusData = null;
                sounder.stopSound("bgm");
            }
            changeBonusSeg();
        }
    })
    slotmodule.on("leveron", function() {})
    slotmodule.on("bet", function(e) {
        sounder.playSound("3bet")
        if ("coin" in e) {
            (function(e) {
                var thisf = arguments.callee;
                if (e.coin > 0) {
                    coin--;
                    e.coin--;
                    incoin++;
                    changeCredit(-1);
                    setTimeout(function() {
                        thisf(e)
                    }, 70)
                } else {
                    e.betend();
                }
            })(e)
        }
        if (gameMode == "jac") {
            segments.payseg.setSegments(bonusData.jacgamecount)
        } else {
            segments.payseg.reset();
        }
    })
    var loopPaySound = null;
    slotmodule.on("pay", function(e) {
        var pays = e.hityaku.pay;
        var arg = arguments;
        if (!("paycount" in e)) {
            e.paycount = 0
            if(pays >= 2){
                sounder.playSound(loopPaySound = 'pay',true);
            }
        }
        if (pays == 0) {
            if (replayFlag && replayFlag && e.hityaku.hityaku[0].name != "チェリー") {
                sounder.playSound("replay", false, function() {
                    e.replay();
                    slotmodule.emit("bet", e.playingStatus);
                });
            } else {
                if (replayFlag) {
                    e.replay();
                    slotmodule.clearFlashReservation()
                } else {
                    e.payend()
                    if(loopPaySound){
                        sounder.stopSound(loopPaySound);
                        loopPaySound = null;
                    }
                }
            }
        } else {
            e.hityaku.pay--;
            coin++;
            e.paycount++;
            outcoin++;
            if(bonusData != null){
                bonusData.onPay(1);
                changeBonusSeg();
            }
            changeCredit(1);
            segments.payseg.setSegments(e.paycount)
            setTimeout(function() {
                arg.callee(e)
            }, 50)
        }
    })
    var jacFlag = false;
    slotmodule.on("lot", function(e) {
        var ret = -1;
        switch (gameMode) {
            case "BIG2":
                var lot = normalLotter.lot().name
                lot = window.power || lot;
                window.power = undefined
                switch (lot) {
                    case "リプレイ":
                        ret = "リプレイ"
                        break;
                    case "ベル":
                        ret = "ベル"
                        break
                    case "チェリー":
                        ret = "チェリー";
                        break;
                    case "JACIN":
                        ret = "JACIN2";
                        break
                    case "チャンス目1":
                        ret = "チャンス目1";
                    break
                    case "チャンス目2":
                        ret = "チャンス目2";
                    break
                    case "REG1":
                        ret = bonusFlag = "REG1"
                        switch(rand(8)){
                            case 7:
                            case 6:
                            case 5:
                            case 4:
                                ret = "REG1";
                                break
                            case 3:
                            case 2:
                                ret = "チャンス目2"
                                break
                            case 1:
                                ret = "チャンス目1"
                                break
                            case 0:
                                ret = "チェリー"
                                break
                        }
                        break;
                    case "REG2":
                        ret = bonusFlag = "REG2"
                        switch(rand(8)){
                            case 7:
                            case 6:
                            case 5:
                            case 4:
                                ret = "REG1";
                                break
                            case 3:
                            case 2:
                                ret = "チャンス目2"
                                break
                            case 1:
                                ret = "チャンス目1"
                                break
                            case 0:
                                ret = "チェリー"
                                break
                        }
                        break;
                    default:
                        ret = "はずれ"
                        if (bonusFlag != "none") {
                            ret = bonusFlag
                            switch(bonusFlag){
                                case 'REG1':
                                case 'REG2':
                                    if(!rand(6)){
                                        ret = "リプレイ"
                                    }
                                break
                            }
                        }
                }
                break;
            case "BIG1":
                if(bonusFlag != null){
                    console.log("Flag:"+bonusFlag)
                    ret = "リプレイ"
                    if(!rand(4)){
                        ret = bonusFlag;
                        break
                    }
                    break
                }
                if(!rand(8)){
                    ret = "リプレイ"
                    bonusFlag = "REG2";
                    break
                }
                if(!rand(4)){
                    bonusFlag = "JACIN";
                    ret = "リプレイ";
                    break
                }
                ret = !rand(4) ? "JACIN" : "はずれ";
                break;
            case "REG1":
                ret = "DJリプレイ"+(1+rand(3))
                if(!rand(8)){
                    switch(rand(8)){
                        case 0:
                            ret = "チャンス目1";
                        break
                        case 1:
                        case 2:
                            ret = "チャンス目2";
                        break
                        case 3:
                        case 4:
                            ret = "チェリー"
                        case 5:
                        case 6:
                        case 7:
                            ret = "ベル"
                        break
                    }
                }
                break
            case "REG2":
                ret = "リプレイ"
                break
            case "JAC":
                ret = "JACGAME"
                break;
            case "normal":
            if(bonusFlag) {
                ret = bonusFlag;
                break
            }
            switch(slotmodule.playControlData.betcoin){
                case 3:
                    bonusFlag = ret = !rand(5)?"BIG1":"BIG2";
                    break
                case 2:
                    ret = "リプレイ";
                    if(!rand(8)){
                        switch(rand(8)){
                            case 0:
                                ret = "チャンス目1";
                                if(!bonusFlag){
                                    bonusFlag = !rand(20) ? "BIG2" : "BIG1";
                                }
                            break
                            case 1:
                            case 2:
                                ret = "チャンス目2";
                                if(!bonusFlag){
                                    bonusFlag = !rand(5) ? "BIG2" : "BIG1";
                                }
                            break
                            case 3:
                            case 4:
                                ret = "チェリー"
                                if(!bonusFlag){
                                    bonusFlag = rand(3) ? "BIG2" : "BIG1";
                                }
                            case 5:
                            case 6:
                            case 7:
                                ret = "ベル"
                                if(!bonusFlag){
                                    bonusFlag = rand(8) ? "BIG1" : "BIG2";
                                }
                            break
                        }
                    }else{
                        if(bonusFlag == null && !rand(32)){
                            bonusFlag = 'BIG1'
                        }
                    }
                    break
                case 1:
                bonusFlag = ret = "BIG1";
            }
        }
        effect(ret);
        console.log(ret)
        return ret;
    })
    slotmodule.on("reelstop", function() {
        sounder.playSound("stop")
    })
    $("#saveimg").click(function() {
        SaveDataToImage();
    })
    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })
    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })
    $("#dummyfiler").change(function(e) {
        var file = this.files[0];
        var image = new Image();
        var reader = new FileReader();
        reader.onload = function(evt) {
            image.onload = function() {
                var canvas = $("<canvas></canvas>")
                canvas[0].width = image.width;
                canvas[0].height = image.height;
                var ctx = canvas[0].getContext('2d');
                ctx.drawImage(image, 0, 0)
                var imageData = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height)
                var loadeddata = SlotCodeOutputer.load(imageData.data);
                if (loadeddata) {
                    parseSaveData(loadeddata)
                    alert("読み込みに成功しました")
                } else {
                    alert("データファイルの読み取りに失敗しました")
                }
            }
            image.src = evt.target.result;
        }
        reader.onerror = function(e) {
            alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
        }
        reader.readAsDataURL(file)
    })
    slotmodule.on("reelstart", function() {
        if (okure) {
            setTimeout(function() {
                sounder.playSound("start")
            }, 100)
        } else {
            sounder.playSound("start")
        }
        okure = false;
    })
    var okure = false;
    var sounder = new Sounder();
    sounder.addFile("sound/stop.wav", "stop").addTag("se");
    sounder.addFile("sound/start.wav", "start").addTag("se").setVolume(0.5);
    sounder.addFile("sound/bet.wav", "3bet").addTag("se").setVolume(0.5);
    sounder.addFile("sound/yokoku_low.mp3", "yokoku_low").addTag("se");
    sounder.addFile("sound/yokoku_high.mp3", "yokoku_high").addTag("se");
    sounder.addFile("sound/pay.wav", "pay").addTag("se");
    sounder.addFile("sound/replay.wav", "replay").addTag("se");
    sounder.addFile("sound/NormalBIG.wav", "NBIG").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/big15.wav", "pay15")
    sounder.addFile("sound/SBIG.mp3", "SBIG").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/JACNABI.wav", "jacnabi").addTag("se");
    sounder.addFile("sound/big1hit.wav", "big1hit").addTag("se");
    sounder.addFile("sound/moonsuccess.mp3", "moonsuccess").addTag("se");
    sounder.addFile("sound/moonfailed.mp3", "moonfailed").addTag("se");
    sounder.addFile("sound/bell2.wav", "bell2").addTag("se");
    sounder.addFile("sound/nabi.wav", "nabi").addTag("voice").addTag("se");
    sounder.addFile("sound/reg.wav", "reg").addTag("bgm");
    sounder.addFile("sound/big1.mp3", "big1").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/moonstart.mp3", "moonstart").addTag("se").setVolume(0.2);
    sounder.addFile("sound/bigselect.mp3", "bigselect").addTag("se")
    sounder.addFile("sound/syoto.mp3", "syoto").addTag("se")
    sounder.addFile("sound/cherrypay.wav", "cherrypay").addTag("se");
    sounder.addFile("sound/bonuspay.wav", "bonuspay").addTag("voice").addTag("se");
    sounder.addFile("sound/bpay.wav", "bpay").addTag("se").setVolume(0.5);
    // sounder.setVolume("se", 0.2)
    // sounder.setVolume("bgm", 0.2)
    $(window).click(function sounderEvent(){
        if(window.sounder){return}
        sounder.loadFile(function() {
            window.sounder = sounder
            console.log(sounder)
        })
    })
    var normalLotter = new Lotter(lotdata.normal);
    var bigLotter = new Lotter(lotdata.big);
    var jacLotter = new Lotter(lotdata.jac);
    window.gameMode = "BIG2";
    var bonusFlag = null
    var coin = 0;
    window.bonusData = new BonusData.BigBonus5("BIG2",300);
    var replayFlag;
    var isCT = false;
    var CTBIG = false;
    var isSBIG;
    var ctdata = {};
    var regstart;
    var afterNotice;
    var bonusSelectIndex;
    var ctNoticed;
    var playcount = 0;
    var allplaycount = 0;
    var incoin = 0;
    var outcoin = 0;
    var bonuscounter = {
        count: {},
        history: []
    };
    slotmodule.on("leveron", function() {
        if (gameMode != "BIG1") {
            playcount++;
            allplaycount++;
        } else {
            if (playcount != 0) {
                bonuscounter.history.push({
                    bonus: gameMode,
                    game: playcount
                })
                playcount = 0;
            }
        }
        changeCredit(0)
    })

    function stringifySaveData() {
        return {
            coin: coin,
            playcontroldata: slotmodule.getPlayControlData(),
            bonuscounter: bonuscounter,
            incoin: incoin,
            outcoin: outcoin,
            playcount: playcount,
            allplaycount: allplaycount,
            name: "ゲッター7",
            id: "getter7"
        }
    }

    function parseSaveData(data) {
        coin = data.coin;
        // slotmodule.setPlayControlData(data.playcontroldata)
        bonuscounter = data.bonuscounter
        incoin = data.incoin;
        outcoin = data.outcoin;
        playcount = data.playcount;
        allplaycount = data.allplaycount
        changeCredit(0)
    }
    window.SaveDataToImage = function() {
        SlotCodeOutputer.save(stringifySaveData())
    }
    window.SaveData = function() {
        if (gameMode != "normal" || isCT) {
            return false;
        }
        var savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }
    window.LoadData = function() {
        if (gameMode != "normal" || isCT) {
            return false;
        }
        var savedata = localStorage.getItem("savedata")
        try {
            var data = JSON.parse(savedata)
            parseSaveData(data)
            changeCredit(0)
        } catch (e) {
            return false;
        }
        return true;
    }
    window.ClearData = function() {
        coin = 0;
        bonuscounter = {
            count: {},
            history: []
        };
        incoin = 0;
        outcoin = 0;
        playcount = 0;
        allplaycount = 0;
        SaveData();
        changeCredit(0)
    }
    function setGamemode(mode) {
        console.log(`${gameMode} -> ${mode}`)
        switch (mode) {
            case 'normal':
                gameMode = 'normal'
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                break
            case 'BIG1':
                gameMode = 'BIG1';
                slotmodule.setLotMode(1)
                slotmodule.setMaxbet(1);
                break
            case 'BIG2':
                gameMode = 'BIG2';
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                break
            case 'REG1':
                gameMode = 'REG1';
                slotmodule.once('payend',()=>{
                })
                    slotmodule.setLotMode(0)
                slotmodule.setMaxbet(2);
                break
            case 'REG2':
                gameMode = 'REG2';
                slotmodule.once('payend',()=>{
                })
                    slotmodule.setLotMode(0)
                slotmodule.setMaxbet(1);
                break
            case 'JAC':
                gameMode = 'JAC';
                slotmodule.setLotMode(2)
                slotmodule.setMaxbet(1);
                break
        }
    }
    var segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 4)
    }
    var credit = 50;
    segments.creditseg.setSegments(50);
    segments.creditseg.setOffColor(80, 30, 30);
    segments.payseg.setOffColor(80, 30, 30);
    segments.effectseg.setOffColor(5, 5, 5);
    segments.creditseg.reset();
    segments.payseg.reset();
    segments.effectseg.reset();
    var lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        $(".GameData").text("差枚数:" + coin + "枚  ゲーム数:" + playcount + "G  総ゲーム数:" + allplaycount + "G")
        segments.creditseg.setSegments(credit)
    }

    function changeBonusSeg() {
        if(!this.bonusData) return segments.effectseg.setSegments("");
        segments.effectseg.setSegments(bonusData.getBonusSeg());
    }

    function changeCTGameSeg() {
        segments.effectseg.setOnColor(230, 0, 0);
        segments.effectseg.setSegments(ctdata.ctgame);
    }

    function changeCTCoinSeg() {
        segments.effectseg.setOnColor(50, 100, 50);
        segments.effectseg.setSegments(200 + ctdata.ctstartcoin - coin);
    }
    var LampInterval = {
        right: -1,
        left: -1,
        counter: {
            right: true,
            left: false
        }
    }

    function setLamp(Flags, timer) {
        Flags.forEach(function(f, i) {
            if (!f) {
                return
            }
            LampInterval[["left", "right"][i]] = setInterval(function() {
                if (LampInterval.counter[["left", "right"][i]]) {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(200%)"
                    })
                } else {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(100%)"
                    })
                }
                LampInterval.counter[["left", "right"][i]] = !LampInterval.counter[["left", "right"][i]];
            }, timer)
        })
    }

    function setLampBrightness(selector, parsent) {
        $(selector).css({
            filter: `brightness(${parsent}%)`
        })
    }

    function setLampColor(selector, color) {
        $(selector).attr({
            src: `img/lamp/` + color + '.png'
        })
    }

    function effect(lot) {
        switch (gameMode) {
            case 'normal':
                var effectReserve = null;
                switch (lot) {
                    case 'はずれ':
                        if (!rand(128)) {
                            effectReserve = {
                                color: null,
                                sound: 'low'
                            }
                            if (!rand(4)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        break
                    case 'リプレイ':
                        if (!rand(6)) {
                            effectReserve = {
                                color: 'blue',
                                sound: 'low'
                            }
                            if (!rand(4)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        if (bonusFlag) {
                            if (rand(3)) {
                                effectReserve = {
                                    color: 'red',
                                    sound: 'low'
                                }
                                if (!rand(2)) {
                                    effectReserve.sound = 'high'
                                }
                            }
                        }
                        break
                    case 'ベル':
                        if (!rand(6)) {
                            effectReserve = {
                                color: 'yellow',
                                sound: 'low'
                            }
                            if (!rand(4)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        if (bonusFlag) {
                            if (rand(3)) {
                                effectReserve = {
                                    color: 'green',
                                    sound: 'low'
                                }
                                if (!rand(2)) {
                                    effectReserve.sound = 'high'
                                }
                            }
                        }
                        break
                    case 'スイカ':
                        effectReserve = {
                            color: 'green',
                            sound: 'low'
                        }
                        if (!rand(4)) {
                            effectReserve.sound = 'high'
                        }
                        break
                    case 'チェリー':
                        if (!rand(10)) {
                            effectReserve = {
                                color: 'red',
                                sound: 'low'
                            }
                            if (!rand(64)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        if (bonusFlag&& rand(2)) {
                            effectReserve = {
                                color: 'red',
                                sound: ['low', 'high'][rand(2)]
                            }
                        }
                        break
                    case 'BIG1':
                        if (!rand(3)) {
                            effectReserve = {
                                color: null,
                                sound: 'low'
                            }
                            if (!rand(3)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        break;
                    case 'BIG2':
                        if (rand(3)) {
                            var efTable = [10, 10, 0, 0, 10, 15, 25, 30, 0, 0]
                            var r = rand(100);
                            var e = efTable.findIndex(f => {
                                r -= f;
                                return r < 0
                            });
                            effectReserve = {
                                color: [null, 'blue', 'yellow', 'green', 'red'][parseInt(e / 2)],
                                sound: ['low', 'high'][e % 2]
                            }
                        }
                        break;
                    case 'BIG3':
                        if (rand(3)) {
                            var efTable = [10, 10, 0, 0, 25, 30, 10, 15, 0, 0]
                            var r = rand(100);
                            var e = efTable.findIndex(f => {
                                r -= f;
                                return r < 0
                            });
                            effectReserve = {
                                color: [null, 'blue', 'yellow', 'green', 'red'][parseInt(e / 2)],
                                sound: ['low', 'high'][e % 2]
                            }
                        }
                        break
                    case 'BIG4':
                        if (rand(3)) {
                            var efTable = [10, 10, 10, 30, 0, 0, 0, 0, 10, 30]
                            var r = rand(100);
                            var e = efTable.findIndex(f => {
                                r -= f;
                                return r < 0
                            });
                            effectReserve = {
                                color: [null, 'blue', 'yellow', 'green', 'red'][parseInt(e / 2)],
                                sound: ['low', 'high'][e % 2]
                            }
                        }
                        break
                }
                if (effectReserve) {
                    sounder.playSound('yokoku_' + effectReserve.sound);
                    var img = effectReserve.color;
                    if (!img) {
                        setLampColor('#moon', 'moon');
                    } else {
                        setLampColor('#moon', 'moon_' + img);
                    }
                    slotmodule.once('allreelstop', () => {
                        setLampColor('#moon', 'moon');
                    })
                }
                break
            case 'big':
            case 'jac':
                if (sbig) {
                    sounder.playSound('nabi')
                    for (var i = 1; i <= 3; i++) {
                        if (i == lot.slice(-1)) {
                            setLampBrightness('#nabi' + i, 100)
                        } else {
                            setLampBrightness('#nabi' + i, 20)
                        }
                    }
                    slotmodule.once('bet', () => {
                        for (var i = 1; i <= 3; i++) {
                            setLampBrightness('#nabi' + i, 20)
                        }
                    })
                }
                break
        }
    }
    $(window).bind("unload", function() {
        SaveData();
    });
    LoadData();
    setInterval(function lanpAnimation() {
        switch (hyperzone) {
            case 0:
                setLampBrightness('#fire', 20);
                break
            case 1:
                setLampBrightness('#fire', rand(20, 40));
                break
            case 2:
                setLampBrightness('#fire', rand(20, 60));
                break
            case 3:
                setLampBrightness('#fire', rand(20, 80));
                break
        }
    }, 500)
}

function and() {
    return Array.prototype.slice.call(arguments).every(function(f) {
        return f
    })
}

function or() {
    return Array.prototype.slice.call(arguments).some(function(f) {
        return f
    })
}

function rand(m, n = 0) {
    return Math.floor(Math.random() * m) + n;
}

function replaceMatrix(base, matrix, front, back) {
    var out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function(m, i) {
        m.forEach(function(g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function flipMatrix(base) {
    var out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}

function segInit(selector, size) {
    var cangvas = $(selector)[0];
    var sc = new SegmentControler(cangvas, size, 0, -3, 50, 30);
    sc.setOffColor(120, 120, 120)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}