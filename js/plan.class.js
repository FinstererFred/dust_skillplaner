function Plan()
{
	this.used = [];
}

Plan.prototype.ale = function ()
{
	alert('fufu');
	
	return true;
}

Plan.prototype.addToPlan = function(id, startLevel, endLevel)
{
	startLevel = typeof startLevel !== 'undefined' ? startLevel : 0;
			
	endLevel = typeof endLevel !== 'undefined' ? endLevel : 0;

	var _addnew = ( id.indexOf('u_') != -1) ? false : true;
	
	var _isTrenner = ( data[ id ]['skill_id']  == 1000) ? true : false;	

	var newEntry = '';

	var _ob = $.extend({'sort':(used.length+1)}, data[ id ]);

	if(_addnew)
	{
		_ob.start_level = startLevel; 

		_ob.end_level = endLevel;

		this.used.push( _ob );

		if(_isTrenner == false)
		{
			newEntry = '<div id="u_'+this.used.length+'" class="btor" title="'+desc[ id ][lang]+'"> <span class="start">'+startLevel+'</span><span class="pfeile"><img src="gfx/p_hoch.png" class="up"/><img src="gfx/p_runter.png" class="down"/></span>  <span class="end">'+endLevel+'</span><span class="pfeile"><img src="gfx/p_hoch.png" class="up"/><img src="gfx/p_runter.png" class="down"/></span>  <span class="name">'+trans[ id ][lang]+' ('+data[ id ].multiplier+'x)</span> <span class="x">x</span><span class="currsp">0</span></div>';
		}
		else
		{
			newEntry = '<div id="u_'+this.used.length+'" class="btor trenner" title="'+desc[ id ][lang]+'">  <span class="name"> </span> <span class="x">x</span></div>';
		}

		$('#dragTarget').append( newEntry );
		
		$('#dragTarget').sortable({ items: "div:not(.headline)" });
	}
	else { /*resort*/; }
}

Plan.prototype.loadPlan = function (planid)
{
	var _this = this;

	$.getJSON('ajax/loadplan.php?planNr='+planid+'&action=skills', function(retval)
	{
		for (_index in retval)
		{
			var _id = 'd'+retval[_index]['skillID'];

			var _multi = data[ _id ]['multiplier'];
			
			_this.addToPlan(_id, retval[_index]['startLvl'], retval[_index]['endLvl']);
			
			$('.pfeile').addClass('hide');
			
			$('.x').addClass('hide');
		}

		updateTotalSkillPoints();
	});
}

Plan.prototype.loadPlanDetails = function (planid)
{
	$.getJSON('ajax/loadplan.php?planNr='+planid+'&action=details', function(retval)
	{
		$('#name').val(retval.desc)		

		$('#name').attr('disabled','disabled');
	});

}

Plan.prototype.checkUnlock = function (planid, pw)
{
	$.getJSON('ajax/unlockplan.php?planNr='+planid+'&pw='+pw, function(retval)
	{
		if(retval['unlock'] == true)
		{
			doUnlock();
		}
	});
}

Plan.prototype.updateTotalSkillPoints = function ()
{
	var _totalSP = 0;

	for( _index in this.used )
	{

		var start_level = skills[ this.used[_index]['multiplier'] ][ this.used[_index]['start_level'] ];

		var end_level = skills[ this.used[_index]['multiplier'] ][ this.used[_index]['end_level'] ];
		
		var cursp = (end_level - start_level > 0) ? (end_level - start_level) : 0 ;
		
		var target = '#u_'+( Number(_index)+1);

		$(target).find('.currsp').html(cursp);

		_totalSP += cursp;

	}

	$('#skillout').html(_totalSP);

	updateSkillTime(_totalSP);
	
}

Plan.prototype.translatePlan = function ()
{
	var _this = this;

	$('#dragTarget .btor').each(function () 
	{
		var _index = Number( $(this).attr('id').split('u_')[1] ) - 1;
		
		$(this).find('.name').text( trans['d'+ _this.used[_index]['skill_id']][lang] + ' ('+ _this.used[_index]['multiplier']+'x)' );
		
	});
}

var plan = new Plan();
