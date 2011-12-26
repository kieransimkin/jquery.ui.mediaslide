

(function( $ ) {
$.widget( "ui.mediaslide", {
	// These options will be used as defaults
	options: { 
		"atom_xml_data": null,
		"atom_xml_ajax": null,
		"json_data": null,
		"json_ajax": null,
		"start_position": 0
	},

	// Set up the widget
	_create: function() {
		this.setup = false;
		this.html_setup = false;
		this.position=this.options.start_position;
		this._init_data();
	},
	_init_data: function() { 
		o=this;
		if (this.options.atom_xml_data != null) { 
			this.dataType='atom';
			if (typeof(this.options.atom_xml_data)=='string') { 
				this.data=jQuery.parseXML(this.options.atom_xml_data);
			} else { 
				this.data=this.options.atom_xml_data;
			}
			this._init_display();
		} else if (this.options.atom_xml_ajax != null) { 
			if (typeof(this.options.atom_xml_ajax)!='string') { 
				jQuery.ajax(this.options.atom_xml_ajax.url,{data: this.options.atom_xml_ajax.options, complete: function(data) { 
					o.data=data;
					o.dataType='atom';
					o._init_display();
				}, error: function(j,t,e) { 
					alert(t);
				}});
			} else { 
				jQuery.ajax(this.options.atom_xml_ajax,{complete: function(data) { 
					o.data=data;
					o.dataType='atom';
					o._init_display();
				}, error: function(j,t,e) { 
					alert(t);
				}});
			}
		} else if (this.options.json_data!= null) { 
			this.dataType='json';
			if (typeof(this.options.json_data)=='string') { 
				this.data=jQuery.parseJSON(this.options.json_data);
			} else { 
				this.data=this.options.json_data;
			}
			this._init_display();
		} else if (this.options.json_ajax != null) { 
			if (typeof(this.options.json_ajax)!='string') { 
				jQuery.getJSON(this.options.json_ajax.url,{data: this.options.json_ajax.options, complete: function(data) { 
					o.data=data;
					o.dataType='json';
					o._init_display();
				}, error: function (j,t,e) { 
					alert(t);
				}});
			} else { 
				jQuery.getJSON(this.options.json_ajax,{complete: function(data) { 
					o.data=data;
					o.dataType='json';
					o._init_display();
				}, error: function (j,t,e) { 
					alert(t);
				}});
			}
		} else {
			alert('No data specified.');
		}
	},
	_init_display: function() { 
		if (!this.html_setup) { 
			this._do_html_setup();
		}
		this.position_skip(this.position);
		this.setup=true;
	},
	_do_html_setup: function() { 
		// setup element HTML here
		this.mainpicture=jQuery('<div></div>')	.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-main-picture-div')
							.css({position: 'relative'})
							.prependTo(this.element);
		this.pictureframe1=jQuery('<div></div>').addClass('ui-widget')
							.addClass('ui-widget-mediaslide-pictureframe')
							.addClass('ui-widget-mediaslide-pictureframe1')
							.css({position: 'absolute', 'top': '0px', 'left': '0px'})
							.appendTo(this.mainpicture);
		this.pictureframe2=jQuery('<div></div>').addClass('ui-widget')
							.addClass('ui-widget-mediaslide-pictureframe')
							.addClass('ui-widget-mediaslide-pictureframe2')
							.css({position: 'absolute', 'top': '0px', 'left': '0px','display': 'none'})
							.appendTo(this.mainpicture);
		this.html_setup=true;
	},
	// Skips (without sliding) to a specific image number
	position_skip: function(pos) { 

	},
	// Slides forwards or backwards a number of positions
	position_slide: function (offset) { 
		
	},
	next: function() { 
		this.position_slide(1);
	},
	previous: function() { 
		this.position_slide(-1);
	},
	forward: function (num) { 
		this.position_slide(num);
	},
	backward: function (num) { 
		this.position_slide(0-num);
	},
	// Use the _setOption method to respond to changes to options
	_setOption: function( key, value ) {
		switch( key ) {
			case "atom_xml_data":
			case "atom_xml_ajax":
			case "json_data":
			case "json_ajax":
				this._init_data();
				break;
		}
		 
		// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
		$.Widget.prototype._setOption.apply( this, arguments );

	},
 
	// Use the destroy method to clean up any modifications your widget has made to the DOM
	destroy: function() {
		$.Widget.prototype.destroy.call( this );
	}
});
}(jQuery));
