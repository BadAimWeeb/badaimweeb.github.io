function updateChart(e, t, a) {
    dps.push({
            x: e,
            y: t,
            color: a
        }), dps[dps.length - 2] && (dps[
                dps.length - 2].lineColor =
            a), dps.length > 1e3 && dps
        .shift(), chart.render()
}

function hideStatic() {
    document.getElementById("static").hidden = !
        0
}

function showStatic() {
    document.getElementById("static").hidden = !
        1
}

function min() {
    $("#basebetAmount").val(1e-8.toFixed(
        8))
}

function start() {
    run = !0, startTime = new Date,
        basebetAmount = parseFloat($(
            "#basebetAmount").val()),
        overBalance = parseFloat($(
            "#overBalance").val()),
        underBalance = parseFloat($(
            "#underBalance").val()),
        betAmount = basebetAmount,
        ballsArray = [2, 3, 4, 5, 6], $(
            "#notification").html(
            "Start!"), $(
            "#basebetAmount").val(
            basebetAmount.toFixed(8)),
        $("#basebetAmount").prop(
            "disabled", !0), $(
            "#overBalance").val(
            overBalance.toFixed(8)), $(
            "#overBalance").prop(
            "disabled", !0), $(
            "#underBalance").val(
            underBalance.toFixed(8)), $(
            "#underBalance").prop(
            "disabled", !0), $("#min").prop(
            "disabled", !0), $("#start")
        .prop("disabled", !0), $(
            "#stop").prop("disabled", !
            1), $("#reset").prop(
            "disabled", !0), doBet()
}

function stop() {
    run = !1, $("#basebetAmount").prop(
            "disabled", !1), $(
            "#overBalance").prop(
            "disabled", !1), $(
            "#underBalance").prop(
            "disabled", !1), $("#min").prop(
            "disabled", !1), $("#start")
        .prop("disabled", !1), $(
            "#stop").prop("disabled", !
            0), $("#reset").prop(
            "disabled", !1)
}

function reset() {
    run = !1, basebetAmount = 0,
        balance = 0, overBalance = 0,
        maxbetAmount = 0,
        maxbetAmountLose = 0,
        underBalance = 0,
        largestBalance = 0, betAmount =
        0, ballsArray = [], win = 0,
        winStreak = 0, maxWinStreak = 0,
        lose = 0, loseStreak = 0,
        maxLoseStreak = 0, bet = 0,
        wagered = 0, profit = 0,
        profitWagered = 0, startTime =
        0, onTime = 0, playTime = 0,
        playDay = 0, playHour = 0,
        playMinute = 0, playSecond = 0,
        speed = 0, round = 0, dsp = [],
        chart = "", color = "", $.getScript(
            "https://canvasjs.com/assets/script/canvasjs.min.js"
        ).done(function(e, t) {
            dps = [{
                    x: 0,
                    y: 0
                }], chart = new CanvasJS
                .Chart("chart", {
                    theme: "light2",
                    zoomEnabled:
                        !0,
                    axisX: {
                        title: "bet",
                        includeZero:
                            !1
                    },
                    axisY: {
                        title: "profit",
                        includeZero:
                            !1
                    },
                    title: {
                        text: " ",
                        fontSize: 20,
                        padding: 20
                    },
                    data: [{
                        type: "stepLine",
                        dataPoints: dps
                    }]
                }), chart.render()
        }), $("#static").html("..."), $(
            "#notification").html(
            "Reseted!")
}

function doBet() {
    return run !== !0 ? void $(
        "#notification").html(
        "Stopped!") : void jQuery.ajax({
        url: "/ajx/",
        type: "POST",
        dataType: "html",
        timeout: 6e4,
        data: {
            game: "balls",
            coin: $("#coin").val(),
            session: getCookie("SESSION"),
            betAmount: betAmount,
            ballsArray: ballsArray,
            clientSeed: $(
                "#clientSeed"
            ).val(),
            serverSeedHash: $(
                "#serverSeedHash"
            ).html(),
            action: "playBet",
            hash: user.hash
        },
        success: function(e) {
            var e = JSON.parse(
                e);
            if (result = e.result,
                result ===
                !0) {
                if (bet++,
                    onTime =
                    (new Date)
                    .getTime(),
                    playTime =
                    onTime -
                    startTime,
                    playDay =
                    Math.floor(
                        playTime /
                        864e5
                    ),
                    playHour =
                    Math.floor(
                        playTime %
                        864e5 /
                        36e5
                    ),
                    playMinute =
                    Math.floor(
                        playTime %
                        36e5 /
                        6e4
                    ),
                    playSecond =
                    Math.floor(
                        playTime %
                        6e4 /
                        1e3
                    ),
                    speed =
                    parseFloat(
                        bet /
                        playTime *
                        1e3
                    ),
                    balance =
                    parseFloat(
                        e.balance
                    ),
                    wagered +=
                    parseFloat(
                        betAmount
                    ),
                    profit +=
                    parseFloat(
                        e.profit
                    ),
                    profitWagered =
                    .1 *
                    wagered /
                    100,
                    balance >
                    largestBalance &&
                    (
                        largestBalance =
                        balance
                    ),
                    "win" ===
                    e.gameResult ?
                    (win++,
                        winStreak++,
                        loseStreak =
                        0,
                        color =
                        "#352482"
                    ) : (
                        lose++,
                        loseStreak++,
                        winStreak =
                        0,
                        betAmount >=
                        maxbetAmountLose &&
                        (
                            maxbetAmountLose =
                            betAmount
                        ),
                        color =
                        "#f49578"
                    ),
                    betAmount >
                    maxbetAmount &&
                    (
                        maxbetAmount =
                        betAmount
                    ),
                    winStreak >=
                    maxWinStreak &&
                    (
                        maxWinStreak =
                        winStreak
                    ),
                    loseStreak >=
                    maxLoseStreak &&
                    (
                        maxLoseStreak =
                        loseStreak
                    ), $(
                        "#serverSeedHash"
                    ).html(
                        e.serverSeedHash
                    ), $(
                        "#notification"
                    ).html(
                        "Betting " +
                        betAmount
                        .toFixed(
                            8
                        ) +
                        " roll " +
                        e.resultBall +
                        " " +
                        e.gameResult +
                        " " +
                        parseFloat(
                            e
                            .profit
                        ).toFixed(
                            8
                        )),
                    $(
                        "#static"
                    ).html(
                        '<span style="float: left;">game = balls</span> <span style="float: right;">coin = ' +
                        $(
                            "#coin"
                        ).val() +
                        '</span><br> <span style="float: left;">time = ' +
                        playDay +
                        ":" +
                        playHour +
                        ":" +
                        playMinute +
                        ":" +
                        playSecond +
                        '</span> <span style="float: right;">speed = ' +
                        speed
                        .toFixed(
                            2
                        ) +
                        '</span><br> <span style="float: left;">balance = ' +
                        balance
                        .toFixed(
                            8
                        ) +
                        '</span> <span style="float: right;">wagered = ' +
                        wagered
                        .toFixed(
                            8
                        ) +
                        '</span><br> <span style="float: left;">profit = ' +
                        profit
                        .toFixed(
                            8
                        ) +
                        '</span> <span style="float: right;">profitWagered = ' +
                        profitWagered
                        .toFixed(
                            8
                        ) +
                        '</span><br> <span style="float: right;">loseStreak = ' +
                        loseStreak +
                        '</span><br> <span style="float: right;">maxLoseStreak = ' +
                        maxLoseStreak +
                        '</span> <br> <span style="float: right;">maxbetAmount = ' +
                        maxbetAmountLose
                        .toFixed(
                            8
                        ) +
                        '</span><br> <span style="float: right;">winStreak = ' +
                        winStreak +
                        '</span><br> <span style="float: right;"> maxWinStreak = ' +
                        maxWinStreak +
                        '</span> <br> <span style="float: right;">Ball # 33 </span>'
                    ),
                    updateChart(
                        bet,
                        profit,
                        color
                    ),
                    betAmount >=
                    balance
                ) return stop(),
                    void $(
                        "#notification"
                    ).html(
                        "Lose!"
                    );
                if (0 !=
                    overBalance &&
                    balance >=
                    overBalance
                ) return stop(),
                    void $(
                        "#notification"
                    ).html(
                        "Over balance!"
                    );
                if (0 !=
                    underBalance &&
                    balance <=
                    underBalance
                ) return stop(),
                    void $(
                        "#notification"
                    ).html(
                        "Under balance!"
                    );
                "win" ===
                e.gameResult ?
                    (round =
                        0,
                        randomizeSeed(),
                        c =
                        Math
                        .floor(
                            4 *
                            Math
                            .random()
                        ) +
                        1,
                        b =
                        Math
                        .floor(
                            2 *
                            Math
                            .random()
                        ) +
                        1,
                        1 ===
                        c &&
                        (
                            ballsArray = [
                                0 +
                                b,
                                1 +
                                b,
                                2 +
                                b,
                                3 +
                                b,
                                4 +
                                b,
                                5 +
                                b,
                                6 +
                                b,
                                7 +
                                b
                            ]
                        ),
                        2 ===
                        c &&
                        (
                            ballsArray = [
                                0 +
                                b,
                                1 +
                                b,
                                2 +
                                b,
                                3 +
                                b,
                                4 +
                                b,
                                5 +
                                b,
                                6 +
                                b
                            ]
                        ),
                        3 ===
                        c &&
                        (
                            ballsArray = [
                                0 +
                                b,
                                1 +
                                b,
                                2 +
                                b,
                                3 +
                                b,
                                4 +
                                b,
                                5 +
                                b,
                                6 +
                                b,
                                7 +
                                b,
                                8 +
                                b
                            ]
                        ),
                        4 ===
                        c &&
                        (
                            ballsArray = [
                                1 +
                                b,
                                2 +
                                b,
                                3 +
                                b,
                                4 +
                                b,
                                5 +
                                b,
                                6 +
                                b,
                                7 +
                                b,
                                8 +
                                b
                            ]
                        ),
                        1 ===
                        winStreak ?
                        (
                            betAmount =
                            5 *
                            basebetAmount,
                            a =
                            Math
                            .floor(
                                3 *
                                Math
                                .random()
                            ) +
                            1
                        ) :
                        winStreak ===
                        a +
                        2 ?
                        betAmount =
                        4 *
                        basebetAmount :
                        winStreak ===
                        a +
                        5 ?
                        betAmount =
                        3 *
                        basebetAmount :
                        winStreak ===
                        a +
                        10 ?
                        betAmount =
                        2 *
                        basebetAmount :
                        winStreak ===
                        a +
                        25 ?
                        betAmount =
                        2 *
                        basebetAmount :
                        winStreak ===
                        a +
                        29 ?
                        betAmount =
                        2 *
                        basebetAmount :
                        winStreak ===
                        a +
                        37 ?
                        betAmount =
                        2 *
                        basebetAmount :
                        winStreak ===
                        a +
                        42 ?
                        betAmount =
                        2 *
                        basebetAmount :
                        winStreak ===
                        a +
                        47 ?
                        betAmount =
                        2 *
                        basebetAmount :
                        winStreak ===
                        a +
                        57 ?
                        betAmount =
                        basebetAmount :
                        betAmount =
                        basebetAmount
                    ) : (
                        resultBall >
                        5 ?
                        ballsArray = [
                            6,
                            7,
                            8,
                            9,
                            10
                        ] :
                        ballsArray = [
                            0,
                            1,
                            2,
                            3,
                            4
                        ],
                        betAmount *=
                        2),
                    doBet()
            } else
                randomizeSeed(),
                setInterval(
                    doBet(),
                    1e3)
        },
        error: function(e, t, a) {
            randomizeSeed(),
                setInterval(
                    doBet(),
                    1e3)
        },
        timeout: function(e, t,
            a) {
            randomizeSeed(),
                setInterval(
                    doBet(),
                    1e3)
        },
        abetort: function(e, t,
            a) {
            randomizeSeed(),
                setInterval(
                    doBet(),
                    1e3)
        }
    })
}
$("#gameContainer").html(
        '<center><span id="notification">...</span></center><br> <span style="float: left;"><input id="basebetAmount" value="0.00000000" style="background: none; text-align: center; color: #fff;" placeholder="basebetAmount" autocomplete="off"> <input id="overBalance" value="0.00000000" style="background: none; text-align: center; color: #fff;" placeholder="overBalance" autocomplete="off"> <input id="underBalance" value="0.00000000" style="background: none; text-align: center; color: #fff;" placeholder="underBalance" autocomplete="off"></span> <span style="float: right;"><button id="min" onclick="min();">min()</button> <button id="start" onclick="start();">start()</button> <button id="stop" onclick="stop();">stop()</button> <button id="reset" onclick="reset();">reset()</button> <button id="hideStatic" onclick="hideStatic();">hideStatic()</button> <button id="showStatic" onclick="showStatic();">showStatic()</button></span><br><br> <div id="chart" style="height: 320px;"></div><br> <div id="static">...</div>'
    ), $("#gameContainer").css("width",
        "75%"), $("#gameContainer").css(
        "height", "100%"), $(
        "#gameContainer").css("color",
        "#fff"), $("#gameContainer").css(
        "font-size", "16px"), $(
        "#gameContainer").css("margin",
        "auto"), $("#static").css(
        "text-align", "center"), $(
        "#body").css("background",
        "linear-gradient(to bottom right,#352482,#f49578)"
    ), $("#header").css("display",
        "none"), $("#news").css(
        "display", "none"), $(
        "#content").css("background",
        "none"), $("#main").css(
        "min-width", "100%"), $(
        "#controlContainer").css(
        "display", "none"), $(
        "#listContainer").css("display",
        "none"), $("#frontText").css(
        "display", "none"), $("#footer")
    .css("display", "none"), $(
        "#notification").html(
        "Applied!"), $("#stop").prop(
        "disabled", !0), randomizeSeed(),
    hideStatic();
var run = !1;
basebetAmount = 0, maxbetAmount = 0,
    balance = 0, overBalance = 0,
    maxbetAmountLose = 0, underBalance =
    0, largestBalance = 0, betAmount =
    0, ballsArray = [], bet = 0,
    wagered = 0, profit = 0,
    profitWagered = 0, startTime = 0,
    resultBall = 0, win = 0, a = 0, b =
    0, c = 0, winStreak = 0,
    maxWinStreak = 0, lose = 0,
    loseStreak = 0, maxLoseStreak = 0,
    onTime = 0, playTime = 0, playDay =
    0, playHour = 0, playMinute = 0,
    playSecond = 0, speed = 0, round =
    0, dsp = [], chart = "", color = "",
    $.getScript(
        "https://canvasjs.com/assets/script/canvasjs.min.js"
    ).done(function(e, t) {
        dps = [{
                x: 0,
                y: 0
            }], chart = new CanvasJS
            .Chart("chart", {
                theme: "light2",
                zoomEnabled: !0,
                axisX: {
                    title: "Bet",
                    includeZero:
                        !1
                },
                axisY: {
                    title: "Profit",
                    includeZero:
                        !1
                },
                title: {
                    text: "LuckyGames Bot - Script ID 0x04 - https://lequanglam.github.io",
                    fontSize: 16,
                    padding: 20
                },
                data: [{
                    type: "stepLine",
                    dataPoints: dps
                }]
            }), chart.render()
    });
