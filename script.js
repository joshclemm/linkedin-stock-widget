// ==UserScript==
// @name		LinkedIn Homepage Stock Widget
// @version		0.5.0
// @namespace	com.joshclemm.linkedin.apps
// @description Keep track of your investments on LinkedIn's homepage
// @match		http://*.linkedin.com/?trk*
// @match		http://*.linkedin.com/home*
// @match		http://*.linkedin.com/
// @include		http://*.linkedin.com/?trk*
// @include		http://*.linkedin.com/home*
// @include		http://*.linkedin.com/
// ==/UserScript==

/*
Limitations/Still to come:
   * We need to add auto refreshing of data at some predetermined interval
   * A slick hover popup that shows the daily chart and/or news articles
   * A better way to manage stocks (better looking way?)
*/
addStyle = function(css) {
    var style = document.createElement('style');
    style.textContent = css;
    document.getElementsByTagName('head')[0].appendChild(style);
}

addStyle(".leo-module.stocks { box-shadow: 0 -2px 1px #fff inset; background: -moz-linear-gradient(top, #FFF 70%, #EEE 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(70%,#FFF), color-stop(100%,#EEE)); background: -webkit-linear-gradient(top, #FFF 75%,#EEE 100%); -webkit-box-shadow: 0 1px 1px rgba(0,0,0,0.15),-1px 0 0 rgba(0,0,0,0.03),1px 0 0 rgba(0,0,0,0.03),0 1px 0 rgba(0,0,0,0.12); }" +
".stocks table { font-size: 11px; color: #333; width: 100%; }"+
".stocks thead th { color: #999; font-weight: normal; padding-bottom: 3px; }"+
".stocks th, .stocks td { padding: 5px 0 5px 5px; border-bottom: 1px dashed #DDD; }"+
".stocks th { font-weight: bold; }"+
".stocks tr:last-of-type th, .stocks tr:last-of-type td { border: 0; }"+
".stocks .stock-health { padding: 0 0 0 12px; }"+
".stocks .stock-up { color: #080; }"+
".stocks .stock-down { color: #c00; }"+
".stocks .stock-up:before { content: \"\"; width: 0; height: 0; position: relative; top: -9px; left: -4px; border: 4px solid #080; border-color: transparent transparent #080 transparent; }"+
".stocks .stock-down:before { content: \"\"; width: 0; height: 0; position: relative; top: 9px; left: -4px; border: 4px solid #C00; border-color: #C00 transparent transparent; }"+
".stocks input { box-shadow: 1px 1px 0 #FFF; }"+
".stocks input[type=\"text\"] { border: 1px solid #CCC; padding: 3px; margin: 0 6px 0 4px; font-size: 12px; }"+
".stocks input[type=\"submit\"] { font-weight: bold; font-size: 15px; padding: 0 7px; }"+
".stocks form { padding: 5px 5px 5px 0; margin-top: 5px; }"+
".stocks .in-logo { display: inline-block; border: 1px solid #0076b4; background: #0076b4; color: #fff !important; border-radius: 2px; padding: 0 1px 0 2px; margin: 0 1px 0 0; height: 13px; line-height: 13px; background: -moz-linear-gradient(top, #76bcda 0%, #0075b3 50%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#76bcda), color-stop(50%,#0075b3)); background: -webkit-linear-gradient(top, #76bcda 0%,#0075b3 50%); }"+
".stocks .hide { background: url(\"https://static.licdn.com/scds/common/u/img/sprite/sprite_global_v6.png\") no-repeat scroll 100% -1496px transparent; cursor: pointer; text-indent: -12345px; float: right; width: 12px; height: 12px; }"+
".stocks .adjust-settings { float: right; cursor: pointer; margin: 5px 0 0; font-size: 11px; }"
);

var module = document.createElement('div');
module.setAttribute('class', "leo-module mod-util mod-custom stocks profile");

var header = document.createElement('div');
header.setAttribute('class', 'header');
header.innerHTML = '<h3><span class="in-logo">in</span>vestments <span class="icon-beta">beta</span></h3>';
module.appendChild(header);

var content = document.createElement('div');
content.setAttribute('class', 'content');
content.innerHTML = '<table><thead><tr><th>Company</th><th>Price</th><th>Change</th></tr></thead><tbody id="stock-table"></tbody></table>';
var form = document.createElement('form');
form.setAttribute('action', '');
form.setAttribute('method', 'post');
form.setAttribute('id', 'add-stock-form');
form.innerHTML = '<a onclick="modifyStockPrompt();" class="adjust-settings">Manage &#187;</a><input type="text" placeholder="Add a stock ticker" id="symbol"/><input type="submit" value="+" class="btn-primary" />';
//form.innerHTML = '<input type="submit" value="Edit" class="btn-primary" />';
content.appendChild(form);
module.appendChild(content);

var side = document.getElementById('extra');
side.insertBefore(module, side.firstChild);

function addJSCode(js) {
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.textContent = js.toString();
  document.body.appendChild(script);
};

function getCookie(c_name) {
	  var i,x,y,ARRcookies=document.cookie.split(";");
	  for (i=0;i<ARRcookies.length;i++) {
		 x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		 y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		 x=x.replace(/^\s+|\s+$/g,"");
		 if (x==c_name) {
			 return unescape(y);
		  }
	   }
};

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
 };
 
function getInStocks() {
	var stocks = getCookie('inStocks');
	 if(stocks==null) {
		 stocks="LNKD,AAPL,GOOG"
	 };
	 return stocks;
}

function createInStocksCookie(stocks) {
	createCookie('inStocks',escape(stocks),3000);
}

function addStock(symbol) {
	var stocks = getInStocks();
	
	//validate
	var values = stocks.split(",");
	  for(var i = 0 ; i < values.length ; i++) {
	    if(values[i] == symbol) {
		  alert('Duplicate symbol found: ' + symbol); //make this more beautiful
		  return false;
	    }
	  }
	
	stocks += "," + symbol;
	 if(stocks != "" && stocks != null) {
		createInStocksCookie(stocks);
		history.go(0); //simply refreshes the page - this could be improved
		return true;
	 }
	 else {
		 return false;
	 }
};

// HANDLE modify stocks
function modifyStockPrompt() {
	var stocks = getInStocks();
	var newValue=prompt(stocks,stocks);
	if(newValue != "" && newValue != null) {
		createInStocksCookie(newValue);
		//document.cookie='inStocks='+escape(newValue) + '; expires=Thu, 2 Aug 2001 20:47:11 UTC;';
		history.go(0);
	 }
	 else {
		 return false;
	 }
};

function removeStockRow(symbol) {
  
	var removeValue = function(list, value, separator) {
	  separator = separator || ",";
	  var values = list.split(",");
	  for(var i = 0 ; i < values.length ; i++) {
	    if(values[i] == value) {
	      values.splice(i, 1);
	      return values.join(",");
	    }
	  }
	  return list;
	}
	var stocks = getInStocks();
	
	var newValue=removeValue(stocks,symbol);
	if(newValue != "" && newValue != null) {
		createInStocksCookie(newValue);
		var h = document.getElementById("stockWidget-"+symbol);
		h.parentNode.removeChild(h);
	    return true;
	 }
	else {
		return false;
	}
};

// the guts of this userscript
function runInStocks() {
  var stocks = getInStocks();
    var query = "select * from csv where url='http://download.finance.yahoo.com/d/quotes.csv?s=" + stocks + "&f=snl1c1p2&e=.csv' and columns='symbol,name,price,change,percent'";
    var escapedQuery = escape(query);

    $.getJSON("//query.yahooapis.com/v1/public/yql?q=" + escapedQuery + "&format=json",
    function (data) {
        if(data) {
        var results = data.query.results.row;
        for (i = 0; i < results.length; ++i) {
            var row = $('<tr id=\'stockWidget-' + results[i].symbol + '\'><th><a href="http://finance.yahoo.com/q?s=' + results[i].symbol + '" target="_blank">' + results[i].name.substring(0, 13) + "</a> (" + results[i].symbol + ")" + '</th><td class="stock-price">' + parseFloat(results[i].price).toFixed(2) + '</td><td class="stock-health ' + (results[i].change > 0 ? 'stock-up' : 'stock-down') + '">' + parseFloat(results[i].change).toFixed(2) + "  (" + results[i].percent + ")" + '<span class="hide" onclick="removeStockRow(\'' + results[i].symbol + '\');"></span></td></tr>');
            $('#stock-table').append(row);
        }
        }
    });
    
    // HANDLE adding stocks
    var interceptLink = function (e) {
        e.preventDefault();
        var symbol = $('#symbol').val();
        //validate
        addStock(symbol);
        return false;
    }

    //suppress default form behavior
    $("#add-stock-form").on("submit", interceptLink);
}

document.body.appendChild(document.createComment("** INVESTMENTS STOCK WIDGET **"));
addJSCode(getCookie);
addJSCode(createCookie);
addJSCode(getInStocks);
addJSCode(createInStocksCookie);
addJSCode(addStock);
addJSCode(modifyStockPrompt);
addJSCode(removeStockRow);
addJSCode(runInStocks);
runInStocks();
return;
