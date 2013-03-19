var locked = true;

$(function() 
{
	lang = ( typeof(getCookie('lang')) == 'undefined') ? lang : getCookie('lang');

	setLanguage(lang);

	data =  init.sortGroups();

	urlvars = init.parseUrlVars();

	init.loadList();

	$('#filter').on('keyup', function() 
	{
		var _val = $(this).val().toLowerCase();

		if( _val.length > 0 ) 
		{
			init.loadList( _val );				
		}
		else if(_val.length == 0)
		{
			init.loadList();				
		}
	});

	$('.filterx').on('click', function () 
	{ 
		$('#filter').val('');

		init.loadList();
	});
	
	if( typeof(urlvars['planid']) != 'undefined' && urlvars['planid'] > 0)
	{
		init.loadPlan(urlvars['planid']);

		$('#action').html('Entsperren');

		$('#mode').html('<span style="color:red">Ansicht</span>');

		$('#action').on('click', function () 
		{
			unlock( urlvars['planid'], $('#password').val() );		
		});

		$('#dragSource .anchor').addClass('ansicht');
	}
	else
	{
		doUnlock();
	}

	$('.en').on('click', function(event) { event.preventDefault();	setLanguage('en'); });
	
	$('.de').on('click', function(event) { event.preventDefault();	setLanguage('de'); });

});

function setLanguage(_lang)
{
	setCookie('lang', _lang, 180);

	lang = _lang;

	init.loadList();

	init.rewritePlan();

	$(".is_ml").each(function() 
	{
    	try { $(this).html( ui[ $(this).attr('id') ][lang] ); }
    	catch(e) { ; }
  	});
}


function unlock(planid, pw) 
{
	ajax.checkUnlock(planid,pw)
}

function doUnlock() 
{
	locked = false;

	$('.pfeile').removeClass('hide');

	$('.x').removeClass('hide');

	$('#dragSource div').removeClass('ansicht');

	$( "#dragTarget" ).sortable({ items: "div:not(.headline)" });

	$('#mode').html('<span style="color:green">Bearbeiten</span>');

	$('#action').html('Speichern');

	$('#name').removeAttr('disabled');

	$('#dragTarget').on('click', '.x', function() 
	{ 
		var _usedId = ( $(this).parent().attr('id').split('_')[1] - 1); 
		
		used.splice(_usedId,1);
		
		updateTotalSkillPoints();

		$(this).parent().remove();
	});

	$('#dragTarget').on('click', '.up', function() 
	{ 
		var _usedId = ( $(this).parent().parent().attr('id').split('_')[1] - 1); 
		
		var _type = $(this).parent().prev().attr('class');

		if(used[_usedId][_type+'_level'] < 5)
		{
			used[_usedId][_type+'_level'] = Number(used[_usedId][_type+'_level'])+1;
		}

		updateTotalSkillPoints();

		$(this).parent().parent().find('.'+_type).html(used[_usedId][_type+'_level']);
	});

	$('#dragTarget').on('click', '.down', function() 
	{ 
		var _usedId = ( $(this).parent().parent().attr('id').split('_')[1] - 1); 
		
		var _type = $(this).parent().prev().attr('class');

		if( used[_usedId][_type+'_level'] > 0)
		{
			used[_usedId][_type+'_level'] = Number(used[_usedId][_type+'_level'])-1;
		}

		updateTotalSkillPoints();

		$(this).parent().parent().find('.'+_type).html(used[_usedId][_type+'_level']);
	});

	$('#action').off().on('click', function()
	{
		savePlan();
	})

	$('#dragTarget').droppable({drop: handleDropEvent, hoverClass: 'drophover'});

	$('#dragSource .anchor').draggable( { containment: 'document', helper: myHelper} );
}

function myHelper( event ) { return '<div class="helpor">&raquo;</div>'; }

function savePlan() 
{
	ajax.savePlan();
}

function updateTotalSkillPoints()
{
	var _totalSP = 0;

	for(  _index in used)
	{

		var start_level = skills[ used[_index]['multiplier'] ][ used[_index]['start_level'] ];

		var end_level = skills[ used[_index]['multiplier'] ][ used[_index]['end_level'] ];
		
		var cursp = (end_level - start_level > 0) ? (end_level - start_level) : 0 ;
		
		var target = '#u_'+( Number(_index)+1);

		$(target).find('.currsp').html(cursp);

		_totalSP += cursp;

	}

	$('#skillout').html(_totalSP);

	updateSkillTime(_totalSP);

	return true;
}

function updateSkillTime(totalSP)
{
	var _time = (totalSP / (190400+24000*7)).toFixed(2);
	
	var _boost1 = (totalSP / ( (190400*1.5) +	24000*7)).toFixed(2);
	
	var _boost2 = (totalSP / ( (190400) + 	(24000*7*1.5))).toFixed(2);
	
	var _boost3 = (totalSP / ( (190400*1.5) + (24000*7*1.5))).toFixed(2);

	var _out = _time+ ' (ohne Booster)<br/> ' + _boost1 + ' (nur aktiv)<br/>' + _boost2 +' (nur passiv)<br/>'+ _boost3 +' (beide)<br/>';

	$('#skilltime').html(_out);
}

function handleDropEvent( event, ui ) 
{
	var draggable = ui.draggable;

	var _addnew = true;
	
	var _id = $(draggable).attr('id');

	if( _id.indexOf('u_') != -1) { _addnew = false;	}

	if(_addnew)
	{
		var _ob = $.extend({'sort':(used.length+1)}, data[$(draggable).attr('id')]);

				
		var _isTrenner = ( data[$(draggable).attr('id')]['skill_id']  == 1000) ? true : false;	

		used.push( _ob );

		init.writeEntry(_id, 0, 0, _isTrenner);

		$( "#dragTarget" ).sortable({ items: "div:not(.headline)" });
	}
}

function setCookie(c_name,value,exdays)
{
	var exdate = new Date();
	
	exdate.setDate(exdate.getDate() + exdays);
	
	var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	
	document.cookie = c_name + "=" + c_value;
}


function getCookie(c_name)
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

window['init'] =  
{
	'loadList' : function ( filtertext )
	{
		var _out = '';
		
		var patt =	new RegExp(".*"+filtertext+".*", "g")

		var _outStr = '';

		var _i = 1;
		
		var _group = -1;

		var _first = true;

		var _multi = '';

		for(_index in data)
		{
			_outStr = '';

			 _multi = ' ('+data[_index].multiplier+'x)';

			if(_group != data[_index].group && !filtertext && data[_index].group != 1000 && _group != 1000)
			{
				_group = data[_index].group;

				if( _first ) _first = false;
				
				else _outStr += '</div>';

				_outStr += '<div class="folder">'+groups['g'+_group][lang]+'</div><div class="group">';

			}

			else if(data[_index].group == 1000 )  
			{
				_outStr += '</div>';

				_multi = '';
			}


			_outStr += '<div class="anchor" id="d'+data[_index].skill_id+'" title="'+desc[_index][lang]+'">'+trans[_index][lang]+_multi+'</div>';	

			if( filtertext )
			{
				
				if(!patt.test( trans[_index][lang].toLowerCase() ) )
				{
					_outStr = '';	
				}
			}
			
			_out += _outStr;
		
			_i++;
		}
		
		$('#dragSource').html(_out + '</div>' );

		$('#dragSource .anchor').draggable( { containment: 'document', helper: myHelper} );

		$('#dragSource .folder').on('click', function () { $(this).next().toggle();	$(this).toggleClass('minus'); });

		return true;
	}, 

	'loadPlan' : function (planid)
	{
		ajax.writePlan(planid);

		ajax.planDetails(planid);
	},

	'parseUrlVars': function()
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
	}, 

	'writeEntry' : function(id, start_level, end_level, is_trenner)
	{
		start_level = typeof start_level !== 'undefined' ? start_level : 0;
			
		end_level = typeof end_level !== 'undefined' ? end_level : 0;

		if(is_trenner == false)
		{
			$('#dragTarget').append('<div id="u_'+used.length+'" class="btor" title="'+desc[ id ][lang]+'"> <span class="start">'+start_level+'</span><span class="pfeile"><img src="gfx/p_hoch.png" class="up"/><img src="gfx/p_runter.png" class="down"/></span>  <span class="end">'+end_level+'</span><span class="pfeile"><img src="gfx/p_hoch.png" class="up"/><img src="gfx/p_runter.png" class="down"/></span>  <span class="name">'+trans[ id ][lang]+' ('+data[ id ].multiplier+'x)</span> <span class="x">x</span><span class="currsp">0</span></div>');
		}
		else
		{
			$('#dragTarget').append('<div id="u_'+used.length+'" class="btor trenner" title="'+desc[ id ][lang]+'">  <span class="name"> </span> <span class="x">x</span></div>');
		}
	}, 

	sortGroups : function ()
	{
		var _outObj = {};
		
		var mappedHash = Object.keys( data ).sort(function( a, b ) { return data[ a ].group - data[ b ].group; });

		for(var _i = 0; _i<mappedHash.length; _i++)
		{
			
			_outObj[mappedHash[_i]] = data[mappedHash[_i]];
		
		}
		
		return _outObj;
	}, 

	rewritePlan : function ()
	{
		$('#dragTarget .btor').each(function () 
		{
			var _index = Number( $(this).attr('id').split('u_')[1] ) - 1;
			
			$(this).find('.name').text( trans['d'+used[_index]['skill_id']][lang] + ' ('+used[_index]['multiplier']+'x)' );
			
		});
	}
}

window['ajax'] = 
{
	'writePlan' : function (planid)
	{
		$.getJSON('ajax/loadplan.php?planNr='+planid+'&action=skills', function(retval)
		{
			for (_index in retval)
			{
				 
				var _id = 'd'+retval[_index]['skillID'];

				var _multi = data[ _id ]['multiplier'];
				
				used.push( {'start_level' : retval[_index]['startLvl'] , 'end_level' : retval[_index]['endLvl'], 'multiplier' : _multi, 'skill_id': retval[_index]['skillID']} );
			
				if( retval[_index]['skillID'] != 1000)
				{	
					init.writeEntry( _id, retval[_index]['startLvl'], retval[_index]['endLvl'], false);
				}
				else 
				{
					init.writeEntry( _id, 0, 0, true);
				}
				
				$('.pfeile').addClass('hide');
				
				$('.x').addClass('hide');
			}

			updateTotalSkillPoints();
		});
	},

	'planDetails' : function (planid)
	{
		$.getJSON('ajax/loadplan.php?planNr='+planid+'&action=details', function(retval)
		{
			$('#name').val(retval.desc)		

			$('#name').attr('disabled','disabled');
		});
	}, 

	'checkUnlock' : function (planid, pw)
	{
		$.getJSON('ajax/unlockplan.php?planNr='+planid+'&pw='+pw, function(retval)
		{
			if(retval['unlock'] == true)
			{
				doUnlock();
			}
		});
	}, 

	'savePlan' : function ()
	{
		var _usedSkillsA = [];
		
		$('#dragTarget .btor').each(function() {
			var _id = Number( $(this).attr('id').split('u_')[1] ) -1;
			_usedSkillsA.push( used[_id] );
		});

		var _usedSkills= JSON.stringify( _usedSkillsA, null, 2);

		var _pw = $('#password').val();

		var _name = $('#name').val();

		if(_name.length < 5)
		{
			alert('Bitte mind. 5 Zeichen als Name');
			return false;
		}

		if( RegExp(/[^A-Za-z0-9-_ ]/).test( _name) )
		{
			alert('Bitte nur die Zeichen A-Z, a-z, 0-9, _- im Namen');
			return false;
		}

		if(_pw.length < 5)
		{
			alert('Bitte mind. 5 Zeichen als Passwort');
			return false;
		}

		var _planid = (urlvars['planid'] > 0) ? urlvars['planid'] : 0;

		$.ajax({
		  type: "POST",
		  url: "ajax/writeplan.php",
		  data: { usedSkills: _usedSkills, pw: _pw, planNr :  _planid, name : _name }
		}).done(function( msg ) 
		{
		  if(msg == 'omg') 
		  	$('#output').html('<span style="color:red">Speichern fehlgeschlagen</span>')
		  else if(msg == 'ok')
		  	$('#output').html('<span style="color:green">Speichern erfolgreich</span>')
		  else if(msg.indexOf('dir') > 0)
		  	{ window.location = 'index.html?planid='+msg.split('::')[1]; }
		});

	}
}

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