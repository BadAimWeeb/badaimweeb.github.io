$('#body').css('background', 'rgba(0, 0, 0, 1');
$('#main').css('min-width', '100%');
$('#header').css('display', 'none');
$('#news').css('display', 'none');
$('#content').css('background', 'none');
$('#gameContainer').html('<br><span id="notification">...</span><br><br> <span style="float: left;"><input id="basebetAmount" value="0.00000000" style="background: none; text-align: center; color: #fff; border: 1px solid #fff;" placeholder="basebetAmount" autocomplete="off"> <input id="overBalance" value="0.00000000" style="background: none; text-align: center; color: #fff; border: 1px solid #fff;" placeholder="overBalance" autocomplete="off"> <input id="underBalance" value="0.00000000" style="background: none; text-align: center; color: #fff; border: 1px solid #fff;" placeholder="underBalance" autocomplete="off"></span> <span style="float: right;"><button id="min" onclick="min();" style="border: 1px solid #fff; padding: 2px;">min</button> <button id="play" style="border: 1px solid #fff; padding: 2px;">start</button> <button id="reset" onclick="reset();" style="border: 1px solid #fff; padding: 2px;">reset</button> <button id="showChart" style="border: 1px solid #fff; padding: 2px;">showChart</button> <button id="showStatic" style="border: 1px solid #fff; padding: 2px;">showStatic</button></span><br><br> <div id="chart" style="height: 320px;"></div><br> <div id="static">...</div>');
$('#gameContainer').css('width', '75%');
$('#gameContainer').css('height', '100%');
$('#gameContainer').css('color', '#fff');
$('#gameContainer').css('font-size', '16px');
$('#gameContainer').css('margin', 'auto');
$('#gameContainer').css('padding', '0px');
$('#notification').html('Bot has applied!');
$('#static').css('text-align', 'center');
$('#controlContainer').css('display', 'none');
$('#listContainer').css('display', 'none');
$('#frontText').css('display', 'none');
$('#footer').css('display', 'none');
$('#notification').html('Bot has applied');
$('#static').html('...');
document.getElementById('chart').hidden = true;
document.getElementById('static').hidden = true;
randomizeSeed();
console.clear();
var run = false;
hideChart = true;
hideStatic = true;
basebetAmount = 0;
betAmount = 0;
maxbetAmount = 0;
prediction = 0;
direction = '';
balance = 0;
overBalance = 0;
underBalance = 0;
bet = 0;
win = 0;
lose = 0;
winStreak = 0;
loseStreak = 0;
maxWinStreak = 0;
maxLoseStreak = 0;
wagered = 0;
profitWagered = 0;
profit = 0;
largestProfit = 0;
startTime = new Date();
onTime = 0;
playTime = 0;
playDay = 0;
playHour = 0;
playMinute = 0;
playSecond = 0;
speed = 0;
round = 0;
dsp = [];
chart = '';
color = '';
type = 0;
$.getScript('https://canvasjs.com/assets/script/canvasjs.min.js').done(function (script, textStatus) {
	dps = [{
			x: 0,
			y: 0
		}
	];
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
				text: 'LuckyGames Bot - Script ID 0x05 - http://lequanglam.github.io',
				fontColor: '#000000',
				fontSize: 12,
				padding: 2e1
			},
			data: [{
					type: 'stepLine',
					dataPoints: dps
				}
			]
		});
	chart.render();
});
function updateChart(bet, profit, color) {
	dps.push({
		x: bet,
		y: profit,
		color: color
	});
	if (dps[dps.length - 2]) {
		dps[dps.length - 2].lineColor = color;
	}
	if (dps.length > 1e3) {
		dps.shift();
	}
	chart.render();
}
function min() {
	$('#basebetAmount').val((0.00000001).toFixed(8));
}
$('#play').on('click', function () {
	run == true ? play(this, "start", false, false) : play(this, "stop", true, true);
	basebetAmount = parseFloat($('#basebetAmount').val());
	overBalance = parseFloat($('#overBalance').val());
	underBalance = parseFloat($('#underBalance').val());
	betAmount = basebetAmount;
	prediction = 49;
	direction = 'under';
	type = 0;
	$('#basebetAmount').val(basebetAmount.toFixed(8));
	$('#overBalance').val(overBalance.toFixed(8));
	$('#underBalance').val(underBalance.toFixed(8));
	doBet();
});
function play(e, d, v) {
	$(e).html(d);
	run = v;
	$('#basebetAmount').prop('disabled', v);
	$('#overBalance').prop('disabled', v);
	$('#underBalance').prop('disabled', v);
	$('#min').prop('disabled', v);
	$('#reset').prop('disabled', v);
}
$('#showChart').on('click', function () {
	hideChart == true ? showChart(this, "hideChart", false) : showChart(this, "showChart", true);
});
function showChart(e, d, v) {
	$(e).html(d);
	hideChart = v;
	document.getElementById('chart').hidden = v;
}
$('#showStatic').on('click', function () {
	hideStatic == true ? showStatic(this, "hideStatic", false) : showStatic(this, "showStatic", true);
});
function showStatic(e, d, v) {
	$(e).html(d);
	hideStatic = v;
	document.getElementById('static').hidden = v;
}
function reset() {
	randomizeSeed();
	basebetAmount = 0;
	betAmount = 0;
	maxbetAmount = 0;
	prediction = 0;
	direction = '';
	balance = 0;
	overBalance = 0;
	underBalance = 0;
	bet = 0;
	win = 0;
	lose = 0;
	winStreak = 0;
	loseStreak = 0;
	maxWinStreak = 0;
	maxLoseStreak = 0;
	wagered = 0;
	profitWagered = 0;
	profit = 0;
	largestProfit = 0;
	startTime = new Date();
	onTime = 0;
	playTime = 0;
	playDay = 0;
	playHour = 0;
	playMinute = 0;
	playSecond = 0;
	speed = 0;
	round = 0;
	dsp = [];
	chart = '';
	color = '';
	$.getScript('https://canvasjs.com/assets/script/canvasjs.min.js').done(function (script, textStatus) {
		dps = [{
				x: 0,
				y: 0
			}
		];
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
				text: 'LuckyGames Bot - Script ID 0x05 - http://lequanglam.github.io',
				fontColor: '#000000',
				fontSize: 12,
				padding: 2e1
			},
			data: [{
					type: 'stepLine',
					dataPoints: dps
				}
			]
		});
		chart.render();
	});
	$('#notification').html('Bot has reset');
	$('#static').html('...');
	return;
}
var streaktype0 = false;
var streaktype2 = false;
var xyz = 0;
function doBet() {
	if (run === true) {
		jQuery.ajax({
			url: "https://play.luckygames.io/ajx/",
			type: "POST",
			dataType: "html",
			timeout: 6e4,
			data: {
				game: "dice",
				coin: $('#coin').val(),
				session: getCookie("SESSION"),
				betAmount: betAmount,
				prediction: prediction,
				direction: direction,
				clientSeed: $('#clientSeed').val(),
				serverSeedHash: $('#serverSeedHash').html(),
				action: "playBet",
				hash: user.hash
			},
			success: function (data) {
				var data = JSON.parse(data);
				if (data.result === true) {
					bet++;
					onTime = new Date().getTime();
					playTime = onTime - startTime;
					playDay = Math.floor(playTime / (1e3 * 6e1 * 6e1 * 24));
					playHour = Math.floor((playTime % (1e3 * 6e1 * 6e1 * 24)) / (1e3 * 6e1 * 6e1));
					playMinute = Math.floor((playTime % (1e3 * 6e1 * 6e1)) / (1e3 * 6e1));
					playSecond = Math.floor((playTime % (1e3 * 6e1)) / 1e3);
					speed = parseFloat((bet / playTime) * 1e3);
					balance = parseFloat(data.balance);
					wagered += parseFloat(betAmount);
					profit += parseFloat(data.profit);
					profitWagered = (wagered * 0.1) / 1e2;
					if (profit > largestProfit) {
						largestProfit = profit;
					}
					if (data.gameResult === 'win') {
						if (type < 10 && streaktype0) {
							type += 1;
							if (type == 10) {
								betAmount = basebetAmount / 20;
							} else {
								betAmount = basebetAmount * 5;	
							}
							streaktype0 = false;
						} else if (type == 10) {
							type += 1;
							betAmount = basebetAmount * 10;
						} else if (type < 16 && streaktype2) {
							type += 1;
							if (type == 16) {
								betAmount = basebetAmount;
							} else {
								betAmount = basebetAmount * 10;	
							}
							streaktype2 = false;
						} else if (type == 16) {
							type = 0;
							betAmount = basebetAmount * 8;
						}
						win++;
						winStreak++;
						loseStreak = 0;
						color = 'green';
					} else {
						xyz++;
						if (type < 10) {
							streaktype0 = true;
							betAmount = betAmount * 2 + basebetAmount * (loseStreak / 1.8);
						} else if (type == 10) {
							betAmount *= 1.035;
						} else if (type < 16) {
							streaktype2 = true;
							betAmount *= 5.16666666;
						} else if (type == 16) {
							betAmount *= 1.091;
						}
						lose++;
						loseStreak++;
						winStreak = 0;
						color = 'red';
						randomizeSeed();
					}
					if (winStreak >= maxWinStreak) {
						maxWinStreak = winStreak;
					}
					if (loseStreak >= maxLoseStreak) {
						maxLoseStreak = loseStreak;
					}
					if (betAmount >= maxbetAmount) {
						maxbetAmount = betAmount;
					}
					$('#serverSeedHash').html(data.serverSeedHash);
					$('#notification').html('Bot on running with prediction = ' + prediction);
					$('#static').html('<span style="float: left;">time = ' + playDay + ':' + playHour + ':' + playMinute + ':' + playSecond + '</span> <span style="float: right;">speed = ' + speed.toFixed(2) + '</span><br> <span style="float: left;">balance = ' + balance.toFixed(8) + '</span> <span style="float: right;">profit = ' + profit.toFixed(8) + '</span><br> <span style="float: left;">wagered = ' + wagered.toFixed(8) + '</span> <span style="float: right;">maxbetAmount = ' + maxbetAmount.toFixed(8) + '</span><br> <span style="float: left;">winStreak = ' + winStreak + '</span> <span style="float: right;">loseStreak = ' + loseStreak + '</span><br> <span style="float: left;">maxWinStreak = ' + maxWinStreak + '</span> <span style="float: right;">maxLoseStreak = ' + maxLoseStreak + '</span>');
					updateChart(bet, profit, color);
					if (betAmount >= balance) {
						stop();
						$('#notification').html('You lose');
						return;
					} else {
						if (overBalance != 0 && balance >= overBalance) {
							stop();
							$('#notification').html('Over balance!');
							return;
						} else if (underBalance != 0 && balance <= underBalance) {
							stop();
							$('#notification').html('Under balance!');
							return;
						} else {
							if (type < 10) {
								if (bet % 2 === 0) {
									prediction = 49;
									direction = 'under';
								} else {
									prediction = 50;
									direction = 'over';
								}
							} else if (type == 10) {
								if (bet % 2 === 0) {
									prediction = 1;
									direction = 'under';
								} else {
									prediction = 98;
									direction = 'over';
								}
							} else if (type < 16) {
								if (bet % 2 === 0) {
									prediction = 80;
									direction = 'under';
								} else {
									prediction = 19;
									direction = 'over';
								}
							} else if (type == 16) {
								if (bet % 2 === 0) {
									prediction = 5;
									direction = 'under';
								} else {
									prediction = 94;
									direction = 'over';
								}
							}
							round++;
						}
					}
					doBet();
				} else {
					randomizeSeed();
					setInterval(doBet(), 1e3);
				}
			},
			error: function (xhr, ajaxOptions, throwagerednError) {
				randomizeSeed();
				setInterval(doBet(), 1e3);
			},
			timeout: function (xhr, ajaxOptions, throwagerednError) {
				randomizeSeed();
				setInterval(doBet(), 1e3);
			},
			abetort: function (xhr, ajaxOptions, throwagerednError) {
				randomizeSeed();
				setInterval(doBet(), 1e3);
			}
		});
	} else {
		$('#notification').html('Bot has stopped');
		return;
	}
}
