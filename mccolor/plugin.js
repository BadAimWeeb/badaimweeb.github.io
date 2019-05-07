function a(text) {
    var color = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    var index = 0;
    var text1 = text.split("").map(function(x) { var data = "&" + color[index] + "&l" + x; index++; if (index == color.length) index = 0; return data; }).join("");
	var index = 0;
	var text2 = text.split("").map(function(x) { var data = "&" + color[index] + x; index++; if (index == color.length) index = 0; return data; }).join("");
	if (text1.length > 256) {
		return [text2, false, text2.length];
    } else {
		return [text1, true, text1.length];
    }
}

function b(text) {
    var color = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"].reverse();
    var index = 0;
    var text1 = text.split("").map(function(x) { var data = "&" + color[index] + "&l" + x; index++; if (index == color.length) index = 0; return data; }).join("");
	var index = 0;
	var text2 = text.split("").map(function(x) { var data = "&" + color[index] + x; index++; if (index == color.length) index = 0; return data; }).join("");
	if (text1.length > 256) {
		return [text2, false, text2.length];
    } else {
		return [text1, true, text1.length];
    }
}

function c(text) {
    var color = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"].reverse();
    var text1 = text.split("").map(function(x) { var data = "&" + color[Math.ceil(Math.random() * color.length) - 1] + "&l" + x; return data; }).join("");
	var text2 = text.split("").map(function(x) { var data = "&" + color[Math.ceil(Math.random() * color.length) - 1] + x; return data; }).join("");
	if (text1.length > 256) {
		return [text2, false, text2.length];
    } else {
		return [text1, true, text1.length];
    }
}