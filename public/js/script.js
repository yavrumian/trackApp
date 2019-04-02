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

function pageReset(res){
	$('.data').hide();
	$('#msg_alert').hide()
	if(res){

		if(res == 'error'){
			$('#msg_alert').removeClass('alert-success')
			$('#msg_alert').addClass('alert-danger')
		}else if(res == 'success'){
			$('#msg_alert').removeClass('alert-danger')
			$('#msg_alert').addClass('alert-success')
		}
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
			$('.selected').removeClass('selected')
			$(this).addClass('selected')
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
		pageReset()
		$('#loader').modal('hide')
		addTechSuccess(res, template)
	},
	error: function(e){
		pageReset()
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
			pageReset('success')
			$('#loader').modal('hide')
			//SUCCESS CASE ********************************************
			// $( "#msg_alert" ).addClass( "alert-success" );
			// $( "#msg_alert" ).removeClass( "alert-danger" );
			console.log("vvvvvvvvvvvvvvvvvvvvv");
			$('#addData-msg').text(`Part ID: ${res.partId}\nTracking Code: ${res.trackCode}`)
			$('#addData-header').text('Track Data was added successfuly ')
			$('.addData-res').show()
			console.log(res);
		},
		error: function(err){
			pageReset('error')
			//ERROR CASE ********************************************
			$('#loader').modal('hide')
			// $( "#msg_alert" ).addClass( "alert-danger" );
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
			pageReset()
			$('#loader').modal('hide')
			addTechSuccess(res, template)
		},
		error: function(err){
			pageReset('error')
			//ERROR CASE ********************************************
			$('#loader').modal('hide')
			// $( "#msg_alert" ).addClass( "alert-danger" );
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
			let status, expected, expectedDate;
			pageReset()
			$('.data').show()
			template = $('#result-template').html();
			$('#loader').modal('hide')
			//*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/
			if(res.expected){
				let color, percent = Math.round((moment.duration(moment(res.expected).diff(moment())).asMinutes() / moment.duration(moment(res.expected).diff(moment(res.startDate))).asMinutes()) * 100)
				$("head").append('<style type="text/css"></style>');
				if(percent >= 50)
					color = '#ff9b5d'
				else color = '#ff485c'
				$("head").children(':last').html('.blue{background: linear-gradient(to right, ' + color + ' ' + percent +'%, #F6F6F6 2%)}');
				expected = 'Expected in ' + moment.duration(moment(res.expected).diff(moment())).humanize()
				expectedDate = moment(res.expected).format('L')
				status = moment(res.startDate).format('[Shaped on ]dddd L [at] LT')
			}else{
				 $("head").append('<style type="text/css"></style>');
				 $("head").children(':last').html('.blue{background: linear-gradient(to right, #00C5B0 100%, #F6F6F6 2%)}');
				console.log($('.blue'));
				expected = 'Complete!';
				expectedDate = moment(res.lastDate).format('L')
				status = moment(res.lastDate).format('[Delivered on ]dddd L [at] LT')
				console.log('Delivered');
			}

			var html = Mustache.render(template, {
				techName: res.techName.name,
				partId: res.partId,
				trackCode: res.trackCode,
				status: status,
				expected: expected,
				expectedDate: expectedDate
			});
			$('#data-item').remove()
			$('.data').prepend(html)
			console.log(res);
		},
		error: function(err){
			pageReset('error')
			//ERROR CASE ********************************************
			$('#loader').modal('hide')
			// $( "#msg_alert" ).addClass( "alert-danger" );
			$('#addData-header').text('There was an error, please fix and TRY AGAIN')
			$('#addData-msg').text(err.responseJSON.msg)
			$('.addData-res').show()
		}
		})
	}
})
