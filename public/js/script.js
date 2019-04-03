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

Handlebars.registerHelper("status", function(data) {
	// console.log(res);
	if(data.expected){
		return moment(data.startDate).format('[Shaped on ]dddd L [at] LT')
	}else{
		return moment(data.lastDate).format('[Delivered on ]dddd L [at] LT')
	}
})

Handlebars.registerHelper("expected", function(data) {
	// console.log(res);
	if(data.expected){
		return 'Expected in ' + moment.duration(moment(data.expected).diff(moment())).humanize()
	}else{
		return 'Complete!'
	}
})

Handlebars.registerHelper("expectedDate", function(data) {
	// console.log(res);
	if(data.expected){
		return  moment(data.expected).format('L')
	}else{
		return moment(data.lastDate).format('L')
	}
})

Handlebars.registerHelper("config", function(data) {
	$("head").append('<style type="text/css"></style>');
	if(data.expected){
		let color, percent = Math.round((moment.duration(moment().diff(moment(data.startDate))).asMinutes() / moment.duration(moment(data.expected).diff(moment(data.startDate))).asMinutes()) * 80) +10
		if(percent >= 50) color = '#ff9b5d'
		else color = '#ff485c'
		$("head").children(':last').html('#' + data.partId + '{background: linear-gradient(to right, ' + color + ' ' + percent +'%, #F6F6F6 2%)}');
	}else{
		 $("head").children(':last').html('#' + data.partId +'{background: linear-gradient(to right, #00C5B0 100%, #F6F6F6 2%)}');
		// $('#' + data.partId).css('background', '')

		console.log($('#test'));
		console.log('Delivered');
	}
})

function pageInit(res){
	pageReset()
	$('.data').show()
	template = $('#result-template').html();
	$('#loader').modal('hide')
	//*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/
	console.log(res);


	var html = Handlebars.compile(template)( {
		// techName: res.techName.name,
		// partId: res.partId,
		// trackCode: res.trackCode,
		// status: status,
		// expected: expected,
		// expectedDate: expectedDate
		res:res
	});
	$('#data-item').remove()
	console.log('whyy');
	$('.data').prepend(html)
	console.log(res);
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
			var html = Handlebars.compile(template)({
				msg: 'There\'s no Technicians, Add to proceed'
			});
		}else {
			var html = Handlebars.compile(template)({
				names: res
			});
		}
		$('.items').html(html)
		$('.name-blue').click(function(e){
			e.preventDefault()
			$('.selected').removeClass('selected')
			$(this).addClass('selected')
			techId = $('span', this).text()
		})
}

$(document).ready(function(){
	$('.data').show()
	$('input').val('')
	template = $('#technician-template').html();
	$('#loader').modal()
	$.ajax({url: '/allTech',
	method: 'get',
	success: function(res){
		pageInit(res)
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
