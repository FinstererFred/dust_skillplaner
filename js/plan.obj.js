function Plan()
{
	this.used = [];
}

Plan.prototype.addToPlan = function(id, startLevel, endLevel)
{
	
	startLevel = typeof startLevel !== 'undefined' ? startLevel : 0;
			
	endLevel = typeof endLevel !== 'undefined' ? endLevel : 0;

	var _addnew = ( id.indexOf('u_') != -1) ? false : true;

	if(_addnew)
	{
		var _isTrenner = ( data[ id ]['skill_id']  == 1000) ? true : false;	

		var newEntry = '';

		var _ob = $.extend({'sort':(this.used.length+1)}, data[ id ]);

		_ob.start_level = startLevel; 

		_ob.end_level = endLevel;

		this.used.push( _ob );

		if(_isTrenner == false)
		{
			newEntry = '<div data-type="skill" id="u_'+this.used.length+'" class="btor" title="'+desc[ id ][lang]+'"> <span class="start">'+startLevel+'</span><span class="pfeile"><img src="gfx/p_hoch.png" class="up"/><img src="gfx/p_runter.png" class="down"/></span>  <span class="end">'+endLevel+'</span><span class="pfeile"><img src="gfx/p_hoch.png" class="up"/><img src="gfx/p_runter.png" class="down"/></span>  <span class="name">'+trans[ id ][lang]+' ('+data[ id ].multiplier+'x)</span> <span class="x">x</span><span class="currsp">0</span></div>';
		}
		else
		{
			newEntry = '<div data-type="trenner" id="u_'+this.used.length+'" class="btor trenner" title="'+desc[ id ][lang]+'">  <span class="name"> </span> <span class="x">x</span><span class="currsp">0</span></div>';
		}

		$('#dragTarget').append( newEntry );
		
		util.calculateTrenner();

		$('#dragTarget').sortable(
			{ items: "div:not(.headline)" 
			 , update: function(event, ui) 
			{ 
	            var _isTrenner = $(ui.item.data('type') == 'trenner') ? true : false;

				if(_isTrenner)
				{
					util.calculateTrenner();
				}
	       	} 
		       	
		});
	}
	else 
	{ 
		/*resort*/
	}
}

Plan.prototype.loadPlan = function (planid)
{
	var _this = this;

	$.ajax({
	    type: 'GET',
	    url: 'ajax/loadplan.php?planNr='+planid+'&action=skills',
	    dataType: 'json',
	    success: function(retval) 
	    {
	    	for (_index in retval)
	    	{
	    		var _id = 'd'+retval[_index]['skillID'];

	    		var _multi = data[ _id ]['multiplier'];
	    		
	    		_this.addToPlan(_id, retval[_index]['startLvl'], retval[_index]['endLvl']);
	    		
	    		$('.pfeile').addClass('hide');
	    		
	    		$('.x').addClass('hide');

	    	}

	    	_this.updateTotalSkillPoints();

	    	util.calculateTrenner();
	    },
	    async: false
	});	

}

Plan.prototype.loadPlanDetails = function (planid)
{

	$.ajax({
	    type: 'GET',
	    url: 'ajax/loadplan.php?planNr='+planid+'&action=details',
	    dataType: 'json',
	    success: function(retval) 
	    { 
		    $('#name').val(retval.desc)		
			$('#name').attr('disabled','disabled');

			$('#overcap').val(retval.overcap);
	    },
	    async: false
	});

}

Plan.prototype.checkUnlock = function (planid, pw)
{
	$('#spinner_target img').attr('src', 'gfx/spinner.gif');
	$.getJSON('ajax/unlockplan.php?planNr='+planid+'&pw='+pw, function(retval)
	{
		if(retval['unlock'] == true)
		{
			doUnlock(true);
		}
		else 
		{
			$('#spinner_target img').attr('src', 'gfx/unlock.png');
		}
	});
}

Plan.prototype.checkLogin = function ( planid )
{

	$.ajax({
	    type: 'GET',
	    url: 'ajax/checkLogin.php?planNr='+planid,
	    dataType: 'json',
	    success: function(retval) 
	    { 
		    if(retval['unlock'] == true)
			{
				doUnlock(true);
			}
	    },
	    async: false
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
		
		var target = '#u_'+ ( Number( _index ) + 1 );

		if( $(target).data('type') != 'trenner' )
		{
			$(target).find('.currsp').html( cursp );

			_totalSP += cursp;
		}

	}

	$('#skillout').html(_totalSP);

	updateSkillTime(_totalSP);
	
}

Plan.prototype.savePlan = function () 
{ 
	window['ajax'].savePlan(); 
}

var plan = new Plan();
