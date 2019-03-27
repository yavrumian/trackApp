let techId;
let template
function addProceed(e){
	e.preventDefault();
	if($('#trackCode').val().length < 3 || $('#partId').val().length < 3)
	$('.add-err-msg').text('*Inputs must have at least 3 character')
	else{
		$('.add-err-msg').text('')
		$('#myModal').modal()
	}
}

function addTechSuccess(res, template){
		if(!res[0]){
			var html = Mustache.render(template, {
				msg: 'There\'s no Technicians, Add to proceed'
			});
		}else {
			var html = Mustache.render(template, {
				names: res
			});
		}
		$('.items').html(html)
		$('.name').click(function(e){
			e.preventDefault()
			$('.blue').removeClass('blue')
			$(this).addClass('blue')
			techId = $('span', this).text()
		})
}

$(document).ready(function(){
	$('input').val('')
	template = $('#technician-template').html();
	$('#loader').modal()
	$.ajax({url: '/allTech',
	method: 'get',
	success: function(res){
		$('#loader').modal('hide')
		addTechSuccess(res, template)
	},
	error: function(e){
		$('#loader').modal('hide')
		var html = Mustache.render(template, {
			msg: 'There was an error. Please check you connection',
		});
		$('#technician').prepend(html)
	}})
})

$('.continue').click(function (e) {
	e.preventDefault()
	$('.addTrack-form').submit()
})

$('.addTrack-form').submit(function(e){
	e.preventDefault()
	if(!techId){
		$('#addTechErr').text('*Please choose technician')
	}else{
		$('#myModal').modal('hide')
		$('#loader').modal()
		$.ajax({url: '/trackData/add',
		method: 'post',
		data: {
			partId: $('#partId').val(),
			techName: techId,
			trackCode: $('#trackCode').val()
		},
		success: function(res){
			$('#loader').modal('hide')

			$('#addData-msg').text(`Part ID: ${res.partId}\nTracking Code: ${res.trackCode}`)
			$('#addData-header').text('Track Data was added successfuly ')
			$('.addData-res').show()
			console.log(res);
		},
		error: function(err){
			$('#loader').modal('hide')
			$('#addData-header').text('There was an error, please fix and TRY AGAIN')
			$('#addData-msg').text(err.responseJSON.msg)
			$('.addData-res').show()
		}
		})
	}
})

$('.addTechBtn').click(function(e){
	e.preventDefault()
	$('.addTech').submit()
})

$('.addTech').submit(function(e){
	template = $('#technician-template').html();
	e.preventDefault()
	let techName = $('.techName').val()
	if(techName.length < 3){
		$('#addTechErr').text('*Technician name must contain at least 3 characters')
	}else{
		$('#loader').modal()
		$('#addTechErr').text('')
		$.ajax({url: '/technician/add',
		method: 'post',
		data: {
			name: techName
		},
		success: function(res){
			$('#loader').modal('hide')
			addTechSuccess(res, template)
		},
		error: function(err){
			$('#loader').modal('hide')
			$('#addData-header').text('There was an error, please fix and TRY AGAIN')
			$('#addData-msg').text(err.responseJSON.msg)
			$('.addData-res').show()
		}
		})
	}
})

$('.addForm').keypress(function(e){
	if(e.which === 13){
		addProceed(e)
	}
})

$('#refresh').click(function(e){
    deg += 180;
    console.log('ok');
    e.preventDefault()
    $(this).css({
        '-webkit-transform' : 'rotate(' + deg + 'deg)',
        '-moz-transform' : 'rotate(' + deg + 'deg)',
        '-ms-transform' : 'rotate(' + deg + 'deg)',
        '-o-transform' : 'rotate(' + deg + 'deg)',
        'transform' : 'rotate(' + deg + 'deg)'
    })
})

$('.arrow-down').click(function(e){
	addProceed(e)

})

// $('.form_block').submit(function(e){
	// $.ajax({url: '/test',
	// method: 'post',
	// data: {
	// 	name: 'heey'
	// },
	// success: function(res){
	// 	console.log(res);
	// }})
// })
$('.search_form').submit(function(e){
	e.preventDefault();

	if($('.search').val() < 3)
		$('.search-err-msg').text('*Part ID Can\'t be empty')
	else{
		$('.search-err-msg').text('')
		$('#loader').modal()
		$.ajax({url: '/search?partId=' + $('.search').val(),
		method: 'get',
		success: function(res){
			template = $('#result-template').html();
			$('#loader').modal('hide')
			var html = Mustache.render(template, {
				techName: res.techName.name,
				partId: res.partId,
				trackCode: res.trackCode
			});
			$('.data').prepend(html)
			console.log(res);
		},
		error: function(err){
			$('#loader').modal('hide')
			$('#addData-header').text('There was an error, please fix and TRY AGAIN')
			$('#addData-msg').text(err.responseJSON.msg)
			$('.addData-res').show()
		}
		})
	}
})
