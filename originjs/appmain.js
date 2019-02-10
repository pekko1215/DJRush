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
    var renCount = 0;
    var lastBonusCount = 0;
    slotmodule.on("allreelstop",async function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0) return
            var matrix = e.hityaku[0].flashLine || e.hityaku[0].matrix;
            var count = 0;
            var {name} = e.hityaku[0];
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
            })
            notplaypaysound = false;
            switch(name){
                case 'JACIN':
                    slotmodule.setFlash(
                        replaceMatrix(
                            flashdata.syoto,
                            matrix,
                            colordata.LINE_F,
                            null
                        ), 1000, function() {
                        slotmodule.clearFlashReservation()
                    });
                break
                case 'チャンス目':
                    var count = 10;
                    slotmodule.freeze();
                    slotmodule.setFlash(null, 0, function(e) {
                        slotmodule.setFlash(flashdata.default, 1)
                        var mat = [[rand(2),rand(2),rand(2)],[rand(2),rand(2),rand(2)],[rand(2),rand(2),rand(2)]];
                        if(count--){
                            slotmodule.setFlash(replaceMatrix(flashdata.default, mat, colordata.LINE_F, null), 2, arguments.callee)
                        }else{
                            slotmodule.resume();
                        }
                    })
                    break
                case 'BIG1':
                    slotmodule.setFlash(null, 0, function(e) {
                        slotmodule.setFlash(flashdata.default, 3)
                        slotmodule.setFlash(replaceMatrix(flashdata.syoto, matrix, colordata.RED_B, null), 3, arguments.callee)
                    })
                break
                case 'JACIN2':
                case 'REG1':
                case 'JACIN':
                    slotmodule.setFlash(replaceMatrix(flashdata.syoto, matrix, colordata.LINE_F, null), 1000, function() {
                        slotmodule.clearFlashReservation()
                    });
                    break
                default:
                    slotmodule.setFlash(null, 0, function(e) {
                        slotmodule.setFlash(flashdata.default, 20)
                        slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                    })
            }
        }
        replayFlag = false;
        var nexter = true;
        var changeBonusFlag = false;
        for(var i=0;i < e.hityaku.length;i++){
            var d = e.hityaku[i];
            // var matrix = d.matrix;
            switch (gameMode) {
                case 'normal':
                    switch (d.name) {
                        case 'リプレイ':
                            replayFlag = true;
                            break
                        case "BIG1":
                            renCount++;
                            bonusFlag = null;
                            setGamemode('BIG1');
                            var t = 4000/(310 - lastBonusCount);
                            if(renCount == 1) lastBonusCount = 0;
                            var countUpFn;
                            var count = lastBonusCount;
                            setTimeout(countUpFn = ()=>{
                                segments.effectseg.setSegments(''+count);
                                count++;
                                if(count != 311) setTimeout(countUpFn,t);
                            },t);
                            if(renCount == 1){
                                lastBonusCount = 0;
                                await sounder.playSound('fan1');
                            }else{
                                await sounder.playSound('fan2');
                            }
                            sounder.playSound("big1",true,()=>{},14.276);
                            bonusData = new BonusData.BigBonus5("BIG1",310);
                            isEffected = false;
                            $('#disk').removeClass('show');
                            voltageReset();
                            break
                        case "BIG2":
                            setGamemode('BIG2');
                            renCount = 0;
                            bonusData = new BonusData.BigBonus5("BIG2",300);
                            bonusFlag = null;
                            isEffected = false;
                            $('#disk').removeClass('show');
                            voltageReset();
                            break
                        case 'REG1': //CZに移行
                            setGamemode('REG1');
                            bonusData = new BonusData.RegularBonus5("REG1",1,1);
                            bonusFlag = null;
                            isEffected = false;
                            $('#disk').removeClass('show');
                            voltageReset();
                    }
                    break;
                case 'BIG1': //出玉ありボーナス
                    switch(d.name){
                        case 'JACIN':
                            setGamemode('JAC');
                            bonusData.jacIn('JAC',6,6);
                            bonusFlag = null;
                            sounder.playSound('hitchance')
                        break
                        case 'リプレイ':
                            replayFlag = true;
                        break
                        case 'REG2':
                            lastBonusCount = bonusData.maxPay - bonusData.payd;
                            setGamemode('REG2');
                            bonusData = new BonusData.RegularBonus5("REG2",1,1);
                            bonusFlag = null;
                            sounder.stopSound('bgm');
                            sounder.playSound('win');
                            $('#disk').addClass('show');
                            $('#geki').removeClass('show');
                            isEffected = true;
                    }
                    break;
                case 'BIG2': //見た目通常
                case 'JAC2':
                    switch(d.name){
                        case "リプレイ":
                            replayFlag = true;
                            break;
                        case "REG1":
                            sounder.playSound('chance');
                            setGamemode('REG1');
                            bonusData = new BonusData.RegularBonus5('REG1',1,1);
                            bonusFlag = null;
                            break
                        case 'REG2':
                            setGamemode('REG2');
                            bonusData = new BonusData.RegularBonus5('REG2',1,1);
                            bonusFlag = null;
                            sounder.playSound('win');
                            $('#disk').addClass('show');
                            $('#geki').removeClass('show');
                            isEffected = true;
                            break
                        case 'JACIN2':
                            setGamemode('JAC2');
                            bonusData.jacIn('JAC2',12,1);
                            bonusFlag = null;
                            sounder.playSound('chance');
                    }
                break
                case 'REG1':
                case 'REG2':
                    switch(d.name){
                        case 'DJリプレイ':
                            replayFlag = true;
                            notplaypaysound = true;
                            (async ()=>{
                                slotmodule.freeze();
                                await sounder.playSound('hitchance')
                                await delay(500);
                                slotmodule.resume();
                                sounder.playSound('chancezone',true);
                            })();
                            break
                        case 'リプレイ':
                            replayFlag = true;
                            break
                    }
            }
        }

        if (nexter) {
            e.stopend()
        }
    })
    slotmodule.on("bonusend", () => {
        sounder.stopSound("bgm")
        setGamemode("normal")
    });
    slotmodule.on("payend", function(e) {
        // console.log(e)
        if (gameMode != "normal") {
            bonusData.onNextGame(e.pay)
            // console.log(bonusData,e.pay,bonusData.getGameMode())
            setGamemode(bonusData.getGameMode());
            if(bonusData.isEnd == true && bonusData.name == 'BIG1'){
                sounder.stopSound("bgm");
                bonusData = null;
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
    slotmodule.on("pay", async (e)=>{
        var pays = e.hityaku.pay;
        var loopPaySound = null;
        var payCount = 0;
        if(pays >= 2 && !notplaypaysound) sounder.playSound(loopPaySound = 'pay',true);
        if (replayFlag) {
            if(!notplaypaysound){
                await sounder.playSound('replay');
            }
            e.replay();
            slotmodule.emit("bet", e.playingStatus);
            return
        }
        while(pays--){
            coin++;
            payCount++;
            outcoin++;
            if(bonusData != null){
                bonusData.onPay(1);
                changeBonusSeg();
            }
            changeCredit(1);
            segments.payseg.setSegments(payCount)
            await delay(50);
        }
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
                        if(bonusFlag){
                            ret = bonusFlag;
                            break
                        }
                        ret = bonusFlag = "JACIN2";
                        break
                    case "チャンス目1":
                        ret = "チャンス目1";
                    break
                    case "チャンス目2":
                        ret = "チャンス目2";
                    break
                    case "REG1":
                        if(bonusFlag){
                            ret = bonusFlag;
                            break
                        }
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
                        if(bonusFlag){
                            ret = bonusFlag;
                            break
                        }
                        ret = bonusFlag = "REG2"
                        switch(rand(8)){
                            case 7:
                            case 6:
                            case 5:
                            case 4:
                                ret = "REG2";
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
                        if (bonusFlag) {
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
            case 'JAC2':
                ret = "JACGAME2"
                break;
            case "BIG1":
                if(bonusFlag != null){
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
                    ret = "ベル"
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
                        ret = 'ベル';
                        if(!bonusFlag){
                            bonusFlag = !rand(4) ? 'BIG1' : 'BIG2';
                        }
                    }else{
                        if(bonusFlag == null && !rand(12)){
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
    sounder.addFile("sound/chance.mp3", "chance").addTag("se").setVolume(0.5);
    sounder.addFile("sound/hitchance.mp3", "hitchance").addTag("se").setVolume(0.5);
    sounder.addFile("sound/fan1.mp3", "fan1").addTag("se").setVolume(0.5);
    sounder.addFile("sound/fan2.mp3", "fan2").addTag("se").setVolume(0.5);
    sounder.addFile("sound/chancezone.mp3", "chancezone").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/chancezoneend.mp3", "chancezoneend").addTag("se")
    sounder.addFile("sound/voltageup.mp3", "voltageup").addTag("se")
    sounder.addFile("sound/leverstart.mp3", "leverstart").addTag("se")
    sounder.addFile("sound/leverpush.mp3", "leverpush").addTag("se")
    sounder.addFile("sound/win.mp3", "win").addTag("se")
    sounder.addFile("sound/lose.mp3", "lose").addTag("se")
    sounder.addFile("sound/geki.mp3", "geki").addTag("se")
    sounder.addFile("sound/title.mp3", "title").addTag("se")
    sounder.addFile("sound/type.mp3", "type").addTag("se")
    // sounder.setVolume("se", 0.2)
    // sounder.setVolume("bgm", 0.2)
    sounder.loadFile(function() {
        window.sounder = sounder
        console.log(sounder)
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
        var savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }
    window.LoadData = function() {
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
        // console.log(`${gameMode} -> ${mode}`)
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
            case 'JAC2':
                gameMode = 'JAC2';
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(2);
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
        if(this.bonusData instanceof BonusData.RegularBonus5) return;
        segments.effectseg.setSegments(bonusData.getBonusSeg());
        if(bonusData.isJacin){
            segments.payseg.setSegments(""+bonusData.payCount)
        }
    }
    const VoltageMap = {
        CZ:{
            low:[
                [50,49,1 ,0 ,0, ],
                [0 ,50,49,1 ,0, ],
                [0 ,0 ,60,40,0, ],
                [0 ,0 ,0 ,99,1, ],
                [0 ,0 ,0 ,0 ,100],
            ],
            high:[
                [30,62,7 ,1 ,0  ],
                [0 ,30,62,7 ,1  ],
                [0 ,0 ,59,40,1  ],
                [0 ,0 ,0 ,80,15 ],
                [0 ,0 ,0 ,0 ,100 ],
            ],
        },
        normal:{
            'はずれ':     [979,20,1  ,0,0],
            'リプレイ':     [68 ,30,2 ,0,0],
            'ベル':       [ 20, 0,70,10,0],
            'チェリー':     [ 20, 0,70,10,0],
            'チャンス目1':  [ 10, 5, 1,70,14],
            'チャンス目2':  [ 5 , 5, 1,60,29],
            'JACIN2':     [15 , 1,60,20, 4],
            'REG1':      [15 , 1,30,40,14],
            'REG2':      [15 , 1, 0,30,54]
        }
    }
    function ArrayLot(list){
        var sum = list.reduce((a,b)=>a+b);
        var r = rand(sum);
        return list.findIndex(n=>{
            return (r-=n) < 0;
        })
    }

    const voltageElements = [...$('.colorBar')].map($);

    async function upVoltage(from,to){

        while(from < to){
            voltageElements[from].addClass('show');
            await sounder.playSound('voltageup')
            from++;
        }
    }

    function voltageReset(){
        $('.colorBar').removeClass('show');
    }

    async function bonusKokuti(isGet){
        if(isEffected) return;
        isEffected = true;
        var typewritter = false;
        $('#renda').removeClass('show');
        $('#geki').removeClass('show');
        $('#itigeki').removeClass('show');
        if(!rand(32) && isGet){
            typewritter = true;
            isGet = false;
            slotmodule.once('reelstop',()=>{
                slotmodule.freeze();
                Typewriter("ボーナス確定!!",{
                    speed:150,
                    delay:5000,
                }).change((t)=>{
                    t!="\n"&&sounder.playSound('type');
                }).title(()=>{
                    sounder.playSound('title');
                }).finish((e)=>{
                    e.parentNode.removeChild(e);
                    setTimeout(()=>{
                        $('#disk').addClass('show');
                        slotmodule.resume();
                    },1000)
                });
            })
        }
        if(isGet){
            $('#disk').addClass('show');
            await sounder.playSound('win');
        }else{
            $('#disk').removeClass('show');
            await sounder.playSound('lose');
        }
        slotmodule.resume();
    }

    async function leverChance(isGet){
        const typeTable = {true:[20,80],false:[80,20]}[isGet];
        var downEvent;
        var fn;
        const gekiFlag = !!ArrayLot({true:[95,5],false:[99,1]}[isGet]);
        window.addEventListener('keydown',downEvent = (e)=>{
            if(fn && e.keyCode == 32){
                fn();
            }
        })
        $('canvas')[0].addEventListener('touchstart',downEvent);
        const $disk = $('#disk');
        slotmodule.freeze();
        if(gekiFlag){
            sounder.playSound('geki');
            $('#geki').addClass('show')
        }
        await sounder.playSound('leverstart');
        if(ArrayLot(typeTable) == 0){
            $('#renda').addClass('show');
            var pushCount = isGet ? 1 + rand(15) : -1;
            fn = async ()=>{
                pushCount--;
                sounder.playSound('leverpush');
                if(!$disk.hasClass('show')){
                    $disk.addClass('show');
                    setTimeout(()=>{
                        if(!isEffected) $disk.removeClass('show');
                    },100)
                }
                if(pushCount != 0) return;
                window.removeEventListener('keydown',downEvent);
                $('canvas')[0].removeEventListener('touchstart',downEvent);
                await bonusKokuti(isGet);
            }
            if(!isEffected){
                setTimeout(async ()=>{
                    window.removeEventListener('keydown',downEvent);
                    $('canvas')[0].removeEventListener('touchstart',downEvent);
                    await bonusKokuti(isGet);
                },3000)
            }
        }else{
            $('#itigeki').addClass('show');
            fn = async ()=>{
                sounder.playSound('leverpush')
                window.removeEventListener('keydown',downEvent);
                $('canvas')[0].removeEventListener('touchstart',downEvent);
                await bonusKokuti(isGet);
            }
        }
    }

    var voltageIndex;
    var isEffected = false;
    var isGekiLamp;
    async function effect(lot) {
        switch (gameMode) {
            case 'normal':
                switch(slotmodule.playControlData.betcoin){
                    case 3:
                        if(!isEffected){
                            await leverChance(bonusFlag == 'BIG1');
                        }
                    break
                    case 2:
                        var voltageMode = bonusFlag == 'BIG1' ? 'high' : 'low';
                        var next;
                        if(lot == 'リプレイ'){
                            next = ArrayLot(VoltageMap.CZ[voltageMode][voltageIndex]);
                        }else{
                            next = voltageIndex;
                            for(var i = 0; i < 3;i ++){
                                next = ArrayLot(VoltageMap.CZ[voltageMode][next]);
                            }
                        }
                        slotmodule.once('bet',async ()=>{
                            slotmodule.freeze();
                            await upVoltage(voltageIndex,next);
                            voltageIndex = next;
                            if(lot == 'リプレイ'){
                                return slotmodule.resume();
                            }
                            sounder.stopSound('bgm')
                            return slotmodule.resume();
                        })
                    break
                }
                break
            case 'REG1':
                voltageIndex = 0;
                voltageReset();
                break
            case 'BIG2':
                voltageReset();
                var vol = ArrayLot(VoltageMap.normal[lot]);
                if(!vol) break;
                upVoltage(0,vol);
                var gekiList = {'JACIN':[1,99],'REG1':[2,99],'REG2':[50,50]}[lot];
                if(!gekiList) break;
                if(ArrayLot(gekiList)) return
                sounder.playSound('geki');
                $('#geki').addClass('show');
                break
            case 'BIG1':
                if(!bonusFlag || isGekiLamp) return;
                var gekiFlag = !rand({
                    true:16,
                    false:200
                }[bonusFlag == 'REG2']);
                if(!gekiFlag) return;
                isGekiLamp = true;
                sounder.playSound('geki');
                $('#geki').addClass('show');
                break
            case 'JAC':
                isEffected = false;
                $('#geki').removeClass('show');
        }
    }
    $(window).bind("unload", function() {
        SaveData();
    });
    LoadData();
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

function delay(ms){
    return new Promise(r=>{
        setTimeout(r,ms);
    })
}