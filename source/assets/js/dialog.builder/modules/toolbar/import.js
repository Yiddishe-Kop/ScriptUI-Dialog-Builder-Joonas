
// IMPORT EVENT
$('#toolbar .import').on("click", function() {
	
	var content =
		'<div id="import-box">' +
			'<h2>Import.jsx</h2>' +
			'<div class="ta">' +
				'<div class="placeholder">' +
					'<span class="important">The current dialog will be overwritten on a successful import.</span> <br><br>' +
					'You should be able to find the JSON from the top of the exported code unless it has been disabled in the export settings. <br>' +
					'You can only import JSON generated by this tool on export. Your old dialog code written in Javascript will <strong>not</strong> work! <br><br>' +
					'Valid JSON is beautified on paste, so that it is easier to read if necessary. <br></br>' +
					'<strong>Paste below</strong> <br>' +
					'<strong>↓</strong></div>' +
				'<div class="code"></div>' +
			'</div>' +
			'<div data-enter class="import-btn animated infinite">' +
				'<i class="fas fa-arrow-right"></i>' +
				'<i class="fas fa-times"></i>' +
			'</div>' +
		'</div>';
	
	modal.init( content );
	
	var importCode;
	codeMirrorInit();
	
	function codeMirrorInit() {
		
		var myCodeMirror = CodeMirror(
			$("#import-box .code")[0]
		, {
			mode: {
			  name: 'javascript',
			  json: true
			},
			theme: 'monokai',
			autofocus: true,
			lineNumbers: true
		});
		
		myCodeMirror.on("change", function( a, b ) {
			
			var paste = b.origin === "paste";
			if ( paste ) {
				
				/*eslint no-empty: "error"*/
				try {
					var rawCode = myCodeMirror.getValue();
					importCode = rawCode;
					// Poor man's 'beautify' on paste
					// var jsonifiedCode = JSON.parse( rawCode );
					// var beautifiedCode = JSON.stringify(jsonifiedCode, null, 3);
					
					myCodeMirror.getDoc().setValue(
						/*global js_beautify*/
						/*eslint no-undef: ["error", { "typeof": true }] */
						js_beautify( rawCode, {
							indent_size: 2
						})
					);
				} catch(e){
					// continue regardless of error
				}
				
				
			}
			
			// This section makes sure the #export-box doesn't spill past the viewport
			setTimeout(function() {
				var winH = $(window).height();
				var importBox = $('#import-box');
				var importBoxH = importBox.outerHeight(true);
				var extraMargins = 20;
				if ( winH < importBoxH+extraMargins ) {
					var cmMaxHeight = $(window).height() - ( importBoxH-importBox.find('.CodeMirror').height() );
					var cmMaxHeightMargins = cmMaxHeight - (extraMargins*2);
					var newHeight = winH < cmMaxHeightMargins ? cmMaxHeight-20 : cmMaxHeightMargins;
					importBox.find('.code').css({ maxHeight: newHeight });
				}
			}, 10);

		});
		
	}
	
	var importBox = $('#import-box');
	importBox.find('.import-btn').on('click', function() {
		
		/*eslint no-empty: "error"*/
		var data;
		try {
			var jsonString = importCode.trim();
			data = JSON.parse( jsonString );
		} catch(e) {
			// continue regardless of error
		}
		
		// Failed to parse JSON
		if ( data === undefined ) {
			
			// Show a red X telling the used it failed for what ever reason....
			var importBox = $('#import-box');
			importBox.find('.fa-arrow-right').hide();
			importBox.find('.import-btn').addClass('tada');
			setTimeout(function() {
				importBox.find('.fa-arrow-right').show();
				importBox.find('.import-btn').removeClass('tada');
			}, 1900);
			
		}
		// JSON parsed succesfully
		else {
			local_storage.remove('dialog');
			local_storage.set('dialog', data );
			modal.remove();
			loadingScreen.init( null, function() {
				location.reload();
			});
		}

	});
	
});
