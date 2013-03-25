function Util() { }

Util.prototype.setCookie = function(c_name,value,exdays)
{
	var exdate = new Date();
	
	exdate.setDate(exdate.getDate() + exdays);
	
	var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	
	document.cookie = c_name + "=" + c_value;
}

Util.prototype.getCookie = function (c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	
	for (i=0;i<ARRcookies.length;i++)
	{
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));

	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);

	  x=x.replace(/^\s+|\s+$/g,"");

	  if (x==c_name)
	  {
	    return unescape(y);
	  }
	}
}

Util.prototype.parseUrlVars = function()
{
    var vars = [], hash;

    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        
        vars.push(hash[0]);
        
        vars[hash[0]] = hash[1];
    }

    return vars;
}


Util.prototype.translatePlan = function ()
{
    var _this = this;

    $('#dragTarget .btor').each(function () 
    {
        var _index = Number( $(this).attr('id').split('u_')[1] ) - 1;
        
        if( plan.used[_index]['skill_id'] != 1000)
        {
            $(this).find('.name').text( trans['d'+ plan.used[_index]['skill_id']][lang] + ' ('+ plan.used[_index]['multiplier']+'x)' );
        }
    });
}


Util.prototype.setLanguage = function (_lang)
{
	util.setCookie('lang', _lang, 180);

	lang = _lang;

	init.loadSkillList();

	this.translatePlan();

	$(".is_ml").each(function() 
	{
    	try { $(this).html( ui[ $(this).attr('id') ][lang] ); }
    	catch(e) { ; }
  	});
}

Util.prototype.calculateTrenner = function ()
{
    var _act;

    var _trennerPoints;
  
    $('#dragTarget .trenner').each(function () 
    {
        _trennerPoints = 0;
        
        _act = $(this).prev();

        while( $(_act).data('type') == 'skill' )
        {
            _trennerPoints += Number( $(_act).find('.currsp').text() );
            
            _act = $(_act).prev();
        }

        $(this).find('.currsp').html(_trennerPoints);

    });
}

Util.prototype.logout = function ()
{
 
   $.ajax({
        type: 'GET',
        url: 'ajax/logout.php',
        success: function() 
        { 
              console.log('k');
              window.location.reload()
        }, 
        async:true});
}

var util = new Util();

Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        DontEnumsLength = DontEnums.length;
  
    return function (o) {
        if (typeof o != "object" && typeof o != "function" || o === null)
            throw new TypeError("Object.keys called on a non-object");
     
        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }
     
        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }  
        }
     
        return result;
    };
})();