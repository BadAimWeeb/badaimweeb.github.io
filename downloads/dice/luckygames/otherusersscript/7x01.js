$('#news').css('display', 'none');
$('#body').css('background', 'url(https://luckygames.io/tml/luckygames/images/space.jpg) repeat-y 50% 0');
$('#content').css('background', 'url(https://luckygames.io/tml/luckygames/images/space.jpg) repeat-y 50% 0');
$('#gameContainer').html('<center><font style="color: #2eab5b; font-size: 16px;"><b style="font-size: 30px;">Dice BOT Luckygames</b><br> Strategy by <a style="color: #058bd8;" href="https://www.facebook.com/trungcut.lon" target="_blank">Dat Tran</a><br>&copy; 2018 powered by <a style="color: #058bd8;" href="https://www.facebook.com/mhqbz" target="_blank">Mai Hoang Quoc Bao</a><br>Patched by <a style="color: #058bd8;" href="https://fb.me/lql.minefact" target="_blank">LQL</a><br><div id="chart" style="height: 320px; width: 949px;"></div></font>');
$('#gameContainer').css('height', '440px');
$('#listContainer').css('display', 'none');
$('#frontText').css('display', 'none');
$('.betContainer').html('<center><input id="basebet" type="text" value="0.00000000" style="text-align: center;"> <input id="target" type="text" value="0.00000000" style="text-align: center;"> <input id="stoploss" type="text" value="0.00000000" style="text-align: center;"><br> <button id="startbutton" onclick="startbot();">Start BOT</button> <button id="stopbutton" onclick="stopbot();">Stop BOT</button> <button id="exitbutton" onclick="resetbot();">Reset BOT</button> <button id="exitbutton" onclick="location.reload();">Exit BOT</button> <p style="color: #2eab5b; font-size: 16px;">Speed bet = <span id="speedbet">0</span> bet/s<br> Play time = <span id="playday">0</span> day <span id="playhour">0</span> hour <span id="playminute">0</span> minute <span id="playsecond">0</span> second<br> Profit = <span id="profit">0.00000000</span> - Max bet = <span id="maxbet">0.00000000</span><br> Bet = <span id="bet">0</span> - Win = <span id="win">0</span> - Lose = <span id="lose">0</span><br> Win streak = <span id="wintreak">0</span> - Max win streak = <span id="maxwintreak">0</span><br>  Lose streak = <span id="losestreak">0</span> - Max lose streak = <span id="maxlosestreak">0</span></p></center>');
randomizeSeed();
document.title = "\u004C\u0075\u0063\u006B\u0079\u0067\u0061\u006D\u0065\u0073\u0020\u002D\u0020\u0050\u0061\u0074\u0063\u0068\u0065\u0064\u0020\u0062\u0079\u0020\u004C\u0051\u004C"
alert('BOT has applied');
var _startbalance = parseFloat($('#balance').val());
var _onbalance = 0;
var _profit = 0;
var _target = parseFloat($('#target').val());
var _stoploss = parseFloat($('#stoploss').val());
var _chance = 50;
var _previouschance = 0;
var _basebet = parseFloat($('#basebet').val());
var _nextbet = _basebet;
var _previousbet = 0;
var _maxbet = 0;
var _direction = 'under';
var _bet = 0;
var _win = 0;
var _wintreak = 0;
var _maxwintreak = 0;
var _lose = 0;
var _losestreak = 0;
var _maxlosestreak = 0;
var _starttime = 0;
var _ontime = 0;
var _playtime = 0;
var _playday = 0;
var _playhour = 0;
var _playminute = 0;
var _playsecond = 0;
var _speedbet = 0;
var _stoped = true;
var _coin = $('#coin').val();
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
				text: '',
				fontColor: '#6d49d8',
				fontSize: 2e1,
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
function startbot(){
	_stoped = false;
	_starttime = new Date();
   _basebet = parseFloat($('#basebet').val());
   _target = parseFloat($('#target').val());
   _nextbet = _basebet;
	_stoploss = parseFloat($('#stoploss').val());
	$('#basebet').val(_basebet.toFixed(8));
	$('#basebet').prop('disabled', true);
	$('#target').val(_target.toFixed(8));
	$('#target').prop('disabled', true);
	$('#stoploss').val(_stoploss.toFixed(8));
	$('#stoploss').prop('disabled', true);
   dobet();
}
function stopbot(){
	_stoped = true;
	$('#basebet').prop('disabled', false);
	$('#target').prop('disabled', false);
	$('#stoploss').prop('disabled', false);
}
function resetbot() {
	randomizeSeed();
	_startbalance = parseFloat($('#balance').val());
	_onbalance = 0;
	_profit = 0;
	_target = parseFloat($('#target').val());
	_stoploss = parseFloat($('#stoploss').val());
	_chance = 50;
	_previouschance = 0;
	_basebet = parseFloat($('#basebet').val());
	_nextbet = _basebet;
	_previousbet = 0;
	_maxbet = 0;
	_direction = "under";
	_bet = 0;
	_win = 0;
	_wintreak = 0;
	_maxwintreak = 0;
	_lose = 0;
	_losestreak = 0;
	_maxlosestreak = 0;
	_ontime = 0;
	_playtime = 0;
	_playday = 0;
	_playhour = 0;
	_playminute = 0;
	_playsecond = 0;
	_speedbet = 0;
	_stoped = true;
	$('#speedbet').html(_speedbet);
	$('#playday').html(_playday);
	$('#playhour').html(_playhour);
	$('#playminute').html(_playminute);
	$('#playsecond').html(_playsecond);
	$('#profit').html(_profit.toFixed(8));
	$('#maxbet').html(_maxbet.toFixed(8));
	$('#bet').html(_bet);
	$('#win').html(_win);
	$('#lose').html(_lose);
	$('#wintreak').html(_wintreak);
	$('#maxwintreak').html(_maxwintreak);
	$('#losestreak').html(_losestreak);
	$('#maxlosestreak').html(_maxlosestreak);
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
				text: '',
				fontColor: '#6d49d8',
				fontSize: 2e1,
				padding: 2e1
			},
			data: [{
					type: 'stepLine',
					dataPoints: dps
				}
			]
		});
	chart.render();
}
function dobet() {
	if (_stoped === false) {
		jQuery.ajax({
			url: 'https://play.luckygames.io/ajx/',
			type: 'POST',
			dataType: 'html',
			timeout: 2e4,
			data: {
				game: 'dice',
				coin: _coin,
				session: getCookie("SESSION"),
				betAmount: _nextbet,
				prediction: _chance,
				direction: _direction,
				clientSeed: $("#clientSeed").val(),
				serverSeedHash: $("#serverSeedHash").html(),
				action: "playBet",
				hash: user.hash
			},
			success: function(data) {
				var _a = JSON.parse(data);
				var _result = _a.result;
				if (_result === true) {
					var _gameresult = _a.gameResult;
					var _resultnumber = _a.resultNumber;
					$('#serverSeedHash').html(_a.serverSeedHash);
					$('#prevServerSeed').html(_a.prevServerSeed);
					$('#prevServerSeedHash').html(_a.prevServerSeedHash);
					$('#prevClientSeed').html(_a.prevClientSeed);
					$('#balance').animateBalance(_a.balance);
					var _onbalance = _a.balance;
					var _profit = _onbalance - _startbalance;
					var _previouschance = _chance;
					var _previousbet = _nextbet;
					_ontime = new Date().getTime();
                   _playtime = _ontime - _starttime;
					_playday = Math.floor(_playtime / (1000 * 60 * 60 * 24));
					_playhour = Math.floor((_playtime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
					_playminute = Math.floor((_playtime % (1000 * 60 * 60)) / (1000 * 60));
					_playsecond = Math.floor((_playtime % (1000 * 60)) / 1000);
					_bet++;
					_speedbet = parseFloat((_bet / _playtime) * 1000);
					if (_gameresult == 'win') {
						_win++;
						_wintreak++;
						_losestreak = 0;
						updateChart(_bet, _profit, 'green');
					} else {
						_lose++;
						_losestreak++;
						_wintreak = 0;
						updateChart(_bet, _profit, 'red');
					}
					if (_target > 0 && _profit > _target) {
						stopbot();
						alert('Target done! Bot stopped.');
					} else {
						if (_stoploss > 0 && _onbalance <= _stoploss) {
							stopbot();
							alert('Under balance! Bot stopped.');
						} else {
							if (_gameresult == 'win') {
								_chance = 50;
								_nextbet = _basebet;
							} else {
								if (_losestreak == 1){
									_chance = 49;
									_nextbet = _previousbet * 2;
								}
								if (_losestreak == 2){
									_chance = 48;
									_nextbet = _previousbet * 2;
								}
								if (_losestreak == 3){
									_chance = 30;
									_nextbet = _previousbet * 2;
								}
								if (_losestreak == 4){
									_chance = 29;
									_nextbet = _previousbet * 2;
								}
								if (_losestreak == 5){
									_chance = 35;
									_nextbet = _previousbet * 2;
								}
								
								if (_losestreak == 6){
									_chance = 20;
									_nextbet = _previousbet *1.4;
								}
								if (_losestreak == 7){
									_chance = 19;
									_nextbet = _previousbet * 1.4;
								}
								if (_losestreak == 8){
									_chance = 5;
									_nextbet = _previousbet * 1.4;
								}
								if (_losestreak == 9){
									_chance = 10
									_nextbet = _previousbet * 1.4;
								}
								if (_losestreak == 10){
									_chance = 5;
									_nextbet = _previousbet * 1.4;
								}
								if (_losestreak == 11){
									_chance = 15;
									_nextbet = _previousbet *1.4;
								}
								if (_losestreak == 12){
									_chance = 10;
									_nextbet = _previousbet * 1.2;
								}
								if (_losestreak == 13){
									_chance = 6;
									_nextbet = _previousbet *1.2;
								}
								if (_losestreak >= 14){
									_chance = 5;
									_nextbet = _previousbet * 1.1;
								}
								if (_losestreak >= 20){
									_chance = 9;
									_nextbet = _previousbet * 1.3;
								}
								if (_losestreak >= 25){
									_chance = 15;
									_nextbet = _previousbet * 1.4;
								}
								if (_losestreak >= 30){
									_chance = 10;
									_nextbet = _previousbet * 1.3;
								}
								if (_losestreak >= 35){
									_chance = 9;
									_nextbet = _previousbet * 1.2;
								}
								if (_losestreak >= 40){
									_chance = 8;
									_nextbet = _previousbet * 1.2;
								}
							}
						}
					}
					if (_nextbet > _maxbet) {
						_maxbet = _nextbet;
					}
					if (_wintreak > _maxwintreak) {
						_maxwintreak = _wintreak;
					}
					if (_losestreak > _maxlosestreak) {
						_maxlosestreak = _losestreak;
					}
					$('#speedbet').html(_speedbet.toFixed(2));
					$('#playday').html(_playday);
					$('#playhour').html(_playhour);
					$('#playminute').html(_playminute);
					$('#playsecond').html(_playsecond);
					$('#profit').html(_profit.toFixed(8));
					$('#maxbet').html(_maxbet.toFixed(8));
					$('#bet').html(_bet);
					$('#win').html(_win);
					$('#lose').html(_lose);
					$('#wintreak').html(_wintreak);
					$('#maxwintreak').html(_maxwintreak);
					$('#losestreak').html(_losestreak);
					$('#maxlosestreak').html(_maxlosestreak);
					console.log('Betting ' + _previousbet.toFixed(8) + ' at ' + _previouschance + ', roll ' + _resultnumber + ' : ' + _gameresult);
					dobet();
				} else {
					
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {

			},
			timeout: function(xhr, ajaxOptions, thrownError) {
				check = true;
			},
			abort: function(xhr, ajaxOptions, thrownError) {
				check = true;
			}
		});
	} else {
		
	}
}
