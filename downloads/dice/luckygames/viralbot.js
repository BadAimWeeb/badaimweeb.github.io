'use strict';
$('#header').html('profit = <span id="profit">0.00000000</span> | largest bet = <span id="largestBetAmount">0.00000000</span>');
$('#header').css('color', '#fff');
$('#header').css('font-size', '18px');
$('#header').css('text-align', 'center');
$('#header').css('padding', '6px');
$('#news').css('display', 'none');
$('#gameContainer').html('<div id="chart"></div>');
$('#gameContainer').css('width', '1000px');
$('#gameContainer').css('margin', 'auto');
let baseBetAmount = prompt('input base bet amount', '0.00000000');
let betAmount = baseBetAmount;
let largestBetAmount = 0;
let prediction = 0;
let direction = 'over';
let clientSeed = $('#clientSeed').val();
let serverSeedHash = $('#serverSeedHash').html();
let bet = 0;
let win = 0;
let lose = 0;
let balance = 0;
let largestBalance = 0;
let profit = 0;
let round = 0;
var selectRound = 0;
let multi = 0;
let dps = [];
let chart;
let color = '';
$.getScript('https://canvasjs.com/assets/script/canvasjs.min.js').done(function(script, textStatus) {
    dps = [{
        x: 0,
        y: 0
    }];
    chart = new CanvasJS.Chart('chart', {
        theme: 'light2',
        zoomEnabled: true,
        axisX: {
            title: 'Bet',
            includeZero: false,
        },
        axisY: {
            title: 'Profit',
            includeZero: false,
        },
        title: {
            text: '0x06 - LuckyGames Bot by Mai Hoàng Quốc Bảo - lequanglam.github.io',
            fontSize: 16,
            padding: 20
        },
        data: [{
            type: 'stepLine',
            dataPoints: dps
        }]
    });
    chart.render();
});

function draw() {
    dps.push({
        x: bet,
        y: profit,
        color: color
    });
    if (dps[dps.length - 2]) {
        dps[dps.length - 2].lineColor = color;
    }
    if (dps.length > 1000) {
        dps.shift();
    }
    chart.render();
}

function log() {
    $('#profit').html(parseFloat(profit).toFixed(8));
    $('#largestBetAmount').html(parseFloat(largestBetAmount).toFixed(8));
}
setTimeout(function dobet() {
    jQuery.ajax({
        url: 'https://trustdice.com/viralbot/v3/',
        type: 'GET',
        data: {
            userName: "datprovip123",
            clientSeed: clientSeed,
            serverSeedHash: serverSeedHash
        },
        success: function(trustdice) {
            let trust = JSON.stringify(trustdice);
            let trd = JSON.parse(trust);
            if (trd.result === true) {
                selectRound = trd.round;
                multi = trd.multi;
                if (trd.resultNumber > 98) {
                    prediction = 98;
                } else if (trd.resultNumber < 1) {
                    prediction = 1;
                } else {
                    prediction = trd.resultNumber;
                }
                jQuery.ajax({
                    url: 'https://play.' + user.domain + '/ajx/',
                    type: 'POST',
                    dataType: 'html',
                    timeout: 6e4,
                    data: {
                        game: 'dice',
                        session: getCookie('SESSION'),
                        coin: $('#coin').val(),
                        betAmount: betAmount,
                        prediction: prediction,
                        direction: direction,
                        clientSeed: clientSeed,
                        serverSeedHash: serverSeedHash,
                        action: 'playBet',
                        hash: user.hash
                    },
                    success: function(luckygames) {
                        let lucky = JSON.parse(luckygames);
                        if (lucky.result === true) {
                            $('#balance').val(lucky.balance);
                            bet++;
                            balance = parseFloat(lucky.balance);
                            profit += parseFloat(lucky.profit);
                            serverSeedHash = lucky.serverSeedHash;
                            if (lucky.gameResult === 'win') {
                                win += 1;
                                color = 'green';
                            } else {
                                lose += 2;
                                color = 'red';
                            }
                            if (bet % 2 === 0) {
                                direction = 'under';
                            } else {
                                direction = 'over';
                            }
                            draw();
                            log();
                            betAmount >= largestBetAmount ? largestBetAmount = betAmount : largestBetAmount = largestBetAmount;
                            balance >= largestBalance ? largestBalance = balance : largestBalance = largestBalance;
                            if (balance >= largestBalance) {
                                betAmount = baseBetAmount;
                            } else {
                                round += 1;
                                if (round % selectRound === 0) {
                                    betAmount *= 1.1;
                                } else {
                                    betAmount = betAmount;
                                }
                            }
                            setTimeout(dobet(), 3e2);
                        } else {
                            setInterval(dobet(), 5e2);
                        }
                    }
                });
            } else {
                alert(trd.msg);
                window.location.reload();
            }
        }
    });
}, 1e3);
