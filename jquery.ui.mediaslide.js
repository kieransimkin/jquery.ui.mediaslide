

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
			if (this.options.atom_xml_ajax.length!=null) { 
				jQuery.ajax(this.options.atom_xml_ajax.url,this.options.atom_xml_ajax.options,function(data) { 
					o.data=data;
					o.dataType='atom';
					o._init_display();
				});
			} else { 
				jQuery.ajax(this.options.atom_xml_ajax,{},function(data) { 
					o.data=data;
					o.dataType='atom';
					o._init_display();
				});
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
			if (this.options.json_ajax.length!=null) { 
				jQuery.getJSON(this.options.json_ajax.url,this.options.json_ajax.options,function(data) { 
					o.data=data;
					o.dataType='json';
					o._init_display();
				});
			} else { 
				jQuery.getJSON(this.options.json_ajax,{}, function(data) { 
					o.data=data;
					o.dataType='json';
					o._init_display();
				});
			}
		} else {
			alert('No data specified.');
		}
	},
	_init_display: function() { 
		alert('got to display');
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
