var locked = true;

var used = [];

$(function() 
{
	lang = ( typeof(util.getCookie('lang')) == 'undefined') ? lang : util.getCookie('lang');

	util.setLanguage(lang);

	data =  init.sortGroups();

	urlvars = util.parseUrlVars();

	init.loadSkillList();

	$('#filter').on('keyup', function() 
	{
		var _searchstring = $(this).val().toLowerCase();

		if( _searchstring.length > 0 ) 
		{
			init.loadSkillList( _searchstring );				
		}
		else if( _searchstring.length == 0)
		{
			init.loadSkillList();				
		}
	});

	$('.filterx').on('click', function () 
	{ 
		$('#filter').val('');

		init.loadSkillList();
	});
	
	if( typeof(urlvars['planid']) != 'undefined' && urlvars['planid'] > 0)
	{
		plan.loadPlan(urlvars['planid']);
		
		plan.loadPlanDetails(urlvars['planid']);

		$('#action').html('<span class="is_ml" id="ml_unlock">Entsperren<span id="spinner_target"><img src="gfx/unlock.png" /></span></span>');

		$('#mode').html('<span style="color:red">Ansicht</span>');

		$('#action').on('click', function () 
		{
			plan.checkUnlock( urlvars['planid'] , $('#password').val() );
		});

		$('#dragSource .anchor').addClass('ansicht');

		plan.checkLogin( urlvars['planid'] );
	}
	else
	{
		doUnlock();
	}

	$('.en').on('click', function(event) { event.preventDefault();	util.setLanguage('en'); });
	
	$('.de').on('click', function(event) { event.preventDefault();	util.setLanguage('de'); });

	$('#overcap').on('click', function() { if($(this).val() == 0) $(this).val('') }).keydown(function(event)
	{
		if ( (event.keyCode >= 48 && event.keyCode <= 57) || 
			event.keyCode == 8 || 
			event.keyCode == 37 || 
			event.keyCode == 39 || 
			event.keyCode == 36 ||
			 (event.keyCode >= 96 && event.keyCode <= 105) )
		{
    		return;
        }
        else
        {
        	event.preventDefault();
        }

	}).keyup(function() 
	{  
		plan.updateTotalSkillPoints();
	});

});

function doUnlock(fromLogin) 
{
	fromLogin = typeof fromLogin !== 'undefined' ? fromLogin : false;

	locked = false;

	$('.pfeile').removeClass('hide');

	$('.x').removeClass('hide');

	$('#dragSource div').removeClass('ansicht');

	$('#dragTarget').sortable({ items: "div:not(.headline)" });

	$('#mode').html('<span style="color:green">Bearbeiten</span>');

	$('#action').html('<span class="is_ml" id="ml_save">Speichern<span id="spinner_target"><img src="gfx/save.png" /></span></span>').off().on('click', function()
	{
		ajax.savePlan();
	});

	$('#name').removeAttr('disabled');

	$('#dragTarget').on('click', '.x', function() 
	{ 
		var _usedId = ( $(this).parent().attr('id').split('_')[1] - 1); 
		
		plan.used.splice(_usedId,1);
		
		plan.updateTotalSkillPoints();

		$(this).parent().remove();
	});

	$('#dragTarget').on('click', '.up', function() 
	{ 
		var _usedId = ( $(this).parent().parent().attr('id').split('_')[1] - 1); 
		
		var _type = $(this).parent().prev().attr('class');

		if(plan.used[_usedId][_type+'_level'] < 5)
		{
			plan.used[_usedId][_type+'_level'] = Number(plan.used[_usedId][_type+'_level'])+1;
		}

		plan.updateTotalSkillPoints();
		
		util.calculateTrenner();

		$(this).parent().parent().find('.'+_type).html(plan.used[_usedId][_type+'_level']);
	});

	$('#dragTarget').on('click', '.down', function() 
	{ 
		var _usedId = ( $(this).parent().parent().attr('id').split('_')[1] - 1); 
		
		var _type = $(this).parent().prev().attr('class');

		if( plan.used[_usedId][_type+'_level'] > 0)
		{
			plan.used[_usedId][_type+'_level'] = Number(plan.used[_usedId][_type+'_level'])-1;
		}

		plan.updateTotalSkillPoints();
		util.calculateTrenner();

		$(this).parent().parent().find('.'+_type).html(plan.used[_usedId][_type+'_level']);
	});

	if(fromLogin)
	{
		$('#password').attr('disabled', 'disabled').addClass('disabled');

		$('#mode').append(' | <span id="logout" onclick="util.logout();">logout</span>');
	}

	$('#dragTarget').droppable({drop: handleDropEvent, hoverClass: 'drophover'});

	$('#dragSource .anchor').draggable( { containment: 'document', helper: myHelper} );
}

function myHelper( event ) { return '<div class="helpor">&raquo;</div>'; }

function handleDropEvent( event, ui ) {	plan.addToPlan( $(ui.draggable).attr('id') ); }

function updateSkillTime(totalSP)
{
	var _overcap = Number( $('#overcap').val() ) > 0 ? Number( $('#overcap').val() ) : 0;

	var _time = (totalSP / (190400+24000*7 + _overcap )).toFixed(2);
	
	var _boost1 = (totalSP / ( (190400*1.5) + 24000*7 + _overcap ) ).toFixed(2);
	
	var _boost2 = (totalSP / ( (190400) + (24000*7*1.5))).toFixed(2);
	
	var _boost3 = (totalSP / ( (190400*1.5) + (24000*7*1.5) + _overcap) ).toFixed(2);

	var _out = _time+ ' (ohne Booster)<br/> ' + _boost1 + ' (nur aktiv)<br/>' + _boost2 +' (nur passiv)<br/>'+ _boost3 +' (beide)<br/>';

	$('#skilltime').html(_out);
}

window['init'] =  
{
	'loadSkillList' : function ( filtertext )
	{
		var _out = '';
		
		var patt =	new RegExp(".*"+filtertext+".*", "i")

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

	sortGroups : function ()
	{
		var _outObj = {};
		
		var mappedHash = Object.keys( data ).sort(function( a, b ) { return data[ a ].group - data[ b ].group; });

		for(var _i = 0; _i<mappedHash.length; _i++)
		{
			
			_outObj[mappedHash[_i]] = data[mappedHash[_i]];
		
		}
		
		return _outObj;
	}
}

window['ajax'] = 
{
	'savePlan' : function ()
	{
		var _usedSkillsA = [];
		
		$('#dragTarget .btor').each(function() {
			var _id = Number( $(this).attr('id').split('u_')[1] ) -1;
			_usedSkillsA.push( plan.used[_id] );
		});

		var _usedSkills= JSON.stringify( _usedSkillsA, null, 2);

		var _pw = $('#password').val();

		var _name = $('#name').val();

		var _overcap = Number( $('#overcap').val() );

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

		$('#spinner_target').html('<img src="gfx/spinner.gif" />');

		$.ajax({
		  type: "POST",
		  url: "ajax/writeplan.php",
		  data: { usedSkills: _usedSkills, pw: _pw, planNr :  _planid, name : _name, overcap : _overcap }
		}).done(function( msg ) 
		{
		  $('#spinner_target').html('<img src="gfx/save.png" />');
		  if(msg == 'omg') 
		  	$('#output').html('<span style="color:red">Speichern fehlgeschlagen</span>')
		  else if(msg == 'ok')
		  	$('#output').html('<span style="color:green">Speichern erfolgreich</span>')
		  else if(msg.indexOf('dir') > 0)
		  	{ window.location = 'index.html?planid='+msg.split('::')[1]; }
		});

	}
}
