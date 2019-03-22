$(document).ready(function(){
	
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

$('.form_block').submit(function(e){
	e.preventDefault();
	// if($('.add_form')[0].val() )
	if(!$('#trackCode').val() || !$('#partId').val())
		$('.add-err-msg').text('*Inputs Can\'t be empty')
	else{
		$('#myModal').modal()
	}
	// $.ajax({url: '/test',
	// method: 'post',
	// data: {
	// 	name: 'heey'
	// },
	// success: function(res){
	// 	console.log(res);
	// }})
})
$('.search_form').submit(function(e){
	e.preventDefault();
	// if($('.add_form')[0].val() )
	if(!$('.search').val())
		$('.search-err-msg').text('*Part ID Can\'t be empty')
	else{

	}
})
