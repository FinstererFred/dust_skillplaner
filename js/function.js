var locked = true;

var used = [];

$(function() 
{
	lang = ( typeof(util.getCookie('lang')) == 'undefined') ? lang : util.getCookie('lang');

	setLanguage(lang);

	data =  init.sortGroups();

	urlvars = util.parseUrlVars();

	init.loadSkillList();

	$('#filter').on('keyup', function() 
	{
		var _val = $(this).val().toLowerCase();

		if( _val.length > 0 ) 
		{
			init.loadSkillList( _val );				
		}
		else if(_val.length == 0)
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
		
		plan.updateTotalSkillPoints();

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

		plan.updateTotalSkillPoints();

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

		plan.updateTotalSkillPoints();

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

function unlock(planid, pw) { plan.checkUnlock(planid,pw) }

function savePlan() { ajax.savePlan(); }

function handleDropEvent( event, ui ) {	plan.addToPlan( $(ui.draggable).attr('id') ); }

function updateSkillTime(totalSP)
{
	var _time = (totalSP / (190400+24000*7)).toFixed(2);
	
	var _boost1 = (totalSP / ( (190400*1.5) +	24000*7)).toFixed(2);
	
	var _boost2 = (totalSP / ( (190400) + 	(24000*7*1.5))).toFixed(2);
	
	var _boost3 = (totalSP / ( (190400*1.5) + (24000*7*1.5))).toFixed(2);

	var _out = _time+ ' (ohne Booster)<br/> ' + _boost1 + ' (nur aktiv)<br/>' + _boost2 +' (nur passiv)<br/>'+ _boost3 +' (beide)<br/>';

	$('#skilltime').html(_out);
}

window['init'] =  
{
	'loadSkillList' : function ( filtertext )
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
		plan.loadPlan(planid);

		plan.loadPlanDetails(planid);
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
