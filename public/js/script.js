function correctSizes()
{
	var containerWidth = $("#itemsContainer").width();
	var coloredPartWidth = $(".orange").width();
	var all = document.getElementsByClassName('orange');
	for (var i = 0; i < all.length; i++) {
		all[i].style.left = (containerWidth-coloredPartWidth) + "px";
	}
}

document.getElementsByTagName("BODY")[0].onresize = function() {
	correctSizes();
};

$(function() {correctSizes();});

let techId;
let template;
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
	if(data.status == 'not-delivered'){
		return moment(data.startDate).format('[Shaped on ]dddd L [at] LT')
	}else if(data.status == 'pre'){
		return 'Awaiting For Item'
	}else{
		return moment(data.lastDate).format('[Delivered on ]dddd L [at] LT')
	}
})

Handlebars.registerHelper("expected", function(data) {
	if(data.status == 'not-delivered'){
		return 'Expected in ' + moment.duration(moment(data.expected).diff(moment())).humanize()
	}else if(data.status == 'pre'){
		return 'Awaiting!'
	}else{
		return 'Complete!'
	}
})

Handlebars.registerHelper("expectedDate", function(data) {
	if(data.status == 'not-delivered'){
		return  moment(data.expected).format('L')
	}else if(data.status == 'pre'){
		return 'Unknown'
	}else{
		return moment(data.lastDate).format('L')
	}
})

Handlebars.registerHelper("config", function(data, arg1, arg2, options) {
	$("head").append('<style type="text/css"></style>');
	if(data.status == 'not-delivered'){
		let color, percent = Math.round((moment.duration(moment().diff(moment(data.startDate))).asMinutes() / moment.duration(moment(data.expected).diff(moment(data.startDate))).asMinutes()) * 80) +10
		if(percent >= 50) color = '#ff9b5d'
		else color = '#ff485c'
		$("head").children(':last').html('#part' + arg1 + arg2 + '{background: linear-gradient(to right, ' + color + ' ' + percent +'%, #F6F6F6 2%)}');
	}else{
		 $("head").children(':last').html('#part' + arg1 + arg2 +'{background: linear-gradient(to right, #00C5B0 100%, #F6F6F6 2%)}');
	}
})

function pageInit(res){
	pageReset()
	$('.data').show()
	template = $('#result-template').html();
	$('body').css('pointer-events', 'auto')
	$('#loader').modal('hide')
	//*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/
	var html = Handlebars.compile(template)( {
			res:res
	});
	$('#data-item').remove()
	$('.data').prepend(html)
	correctSizes();
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
	$('input').val('')
	$('body').css('pointer-events', 'none')
	$('#loader').modal()
	$.ajax({url: '/allTech',
	method: 'get',
	success: function(res){
		pageInit(res)
		$('body').css('pointer-events', 'auto')
		$('#loader').modal('hide')
		template = $('#technician-template').html()
		addTechSuccess(res, template)
	},
	error: function(e){
		pageReset()
		$('body').css('pointer-events', 'auto')
		$('#loader').modal('hide')
		template = $('#technician-template').html()
		var html = Handlebars.compile(template)({
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
		$('body').css('pointer-events', 'none')
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
			$('body').css('pointer-events', 'auto')
			$('#loader').modal('hide')
			$('#addData-msg').text(`Part ID: ${res.partId}\nTracking Code: ${res.trackCode}`)
			$('#addData-header').text('Track Data was added successfuly ')
			$('.addData-res').show()
		},
		error: function(err){
			pageReset('error')
			$('body').css('pointer-events', 'auto')
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
	}	else{
		$('body').css('pointer-events', 'none')
		$('#loader').modal()
		$('#addTechErr').text('')
		$.ajax({url: '/technician/add',
		method: 'post',
		data: {
			name: techName
		},
		success: function(res){
			pageReset()
			$('body').css('pointer-events', 'auto')
			$('#loader').modal('hide')
			addTechSuccess(res, template)
		},
		error: function(err){
			pageReset('error')
			$('body').css('pointer-events', 'auto')
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


$('.arrow-down').click(function(e){
	addProceed(e)

})

$('.search_form').submit(function(e){
	e.preventDefault();

	if($('.search').val().length < 3 && $('.search').val().length != 0)
		$('.search-err-msg').text('*Part ID Can\'t be empty')
	else if($('.search').val().length == 0){
		location.reload()
	}else{
		$('.search-err-msg').text('')
		$('body').css('pointer-events', 'none')
		$('#loader').modal()
		$.ajax({url: '/search?partId=' + $('.search').val(),
		method: 'get',
		success: function(res){
			pageInit([{
				name: res.techName.name,
				datas: [res]
			}])
		},
		error: function(err){
			pageReset('error')
			$('body').css('pointer-events', 'auto')
			$('#loader').modal('hide')
			$('#addData-header').text('There was an error, please fix and TRY AGAIN')
			$('#addData-msg').text(err.responseJSON.msg)
			$('.addData-res').show()
		}
		})
	}
})
var lastTech = "";
function lastTechName(techName){
    lastTech = techName;
}

function deleteTech(){
	$.ajax({url: '/technician/delete/' + lastTech,
		method: 'get',
		success: function(res){
			location.reload()
		},
		error: function(err){
			location.reload()
		}
	})
}
