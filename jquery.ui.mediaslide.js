

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
		this.pframe_displaying=1;
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
				jQuery.ajax(this.options.atom_xml_ajax.url,{data: this.options.atom_xml_ajax.options, success: function(data) { 
					o.data=jQuery(data);
					o.dataType='atom';
					o._init_display();
				}, error: function(j,t,e) { 
					alert(t);
				}});
			} else { 
				jQuery.ajax(this.options.atom_xml_ajax,{success: function(data) { 
					o.data=jQuery(data);
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
				jQuery.getJSON(this.options.json_ajax.url,{data: this.options.json_ajax.options, success: function(data) { 
					o.data=jQuery(data);
					o.dataType='json';
					o._init_display();
				}, error: function (j,t,e) { 
					alert(t);
				}});
			} else { 
				jQuery.getJSON(this.options.json_ajax,{success: function(data) { 
					o.data=jQuery(data);
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
			this.pframe_displaying=1;
		}
		this._parse_data();
		this.position_skip(this.position);
		this.setup=true;
	},
	_parse_data: function() { 
		var d=new Array();
		
		if (this.dataType=='atom') { 
			this.data.find('entry').each(function(i,ob) { 
				var normal=null;
				var thumb=null;
				jQuery(ob).find('link').each(function (o,lob) { 
					if (jQuery(lob).attr('title')=='normal') { 
						normal=jQuery(lob).attr('href');
					} else if (jQuery(lob).attr('title')=='thumb') { 
						thumb=jQuery(lob).attr('href');
					}
				});
				d.push({
					title: jQuery(ob).find('title').text(),
					link: jQuery(ob).find('link').attr('href'),
					id: jQuery(ob).find('id').text(),
					updated: jQuery(ob).find('updated').text(),
					normal: normal,
					thumb: thumb
				});
				//alert(o.html());
			});
			this.d=d;
		} else if (this.dataType=='json') { 

		} else {
			alert('unknown data type');
		}
	},
	_do_html_setup: function() { 
		// setup element HTML here
		this.element.html('');
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
							.css({position: 'absolute', 'top': '0px', 'left': '0px', 'opacity': '0'})
							.appendTo(this.mainpicture);
		this.html_setup=true;
	},
	_get_foreground_pframe: function() { 
		if (this.pframe_displaying==1) { 
			return this.pictureframe1;
		} else { 
			return this.pictureframe2;
		}
	},
	_get_background_pframe: function() { 
		if (this.pframe_displaying==1) { 
			return this.pictureframe2;
		} else { 
			return this.pictureframe1;
		}
	},
	_toggle_pframe: function() { 
		if (this.pframe_displaying==1) { 
			this.pframe_displaying=2;
		} else { 
			this.pframe_displaying=1;
		}
	},
	// Skips (without sliding) to a specific image number
	position_skip: function(pos) { 
		var frame=this._get_foreground_pframe();
		jQuery(frame).html('<img class="ui-widget-mediaslide-active-img">').find('.ui-widget-mediaslide-active-img').attr('src',this.d[pos].normal);
		this.mainpicture.width(jQuery(frame).width());
		this.mainpicture.height(jQuery(frame).height());
		this.position=pos;
	},
	// Slides forwards or backwards a number of positions
	position_slide: function (offset) { 
		if (this.position+offset<0) { 
			console.log('Tried to skip past the beginning');
			return false;
		}
		if (this.position+offset>this.d.length-1) { 
			console.log('Tried to skip past the end');
			return false;
		}
		var active_frame = this._get_foreground_pframe();
		var inactive_frame = this._get_background_pframe();
		var tob=this;
		jQuery(active_frame).css({'z-index': 1});
		jQuery(inactive_frame).css({'z-index': 2}).html('<img class="ui-widget-mediaslide-active-img">').find('.ui-widget-mediaslide-active-img').attr('src',this.d[this.position+offset].normal);
		jQuery(inactive_frame).fadeTo('slow', 1.0, function() { 
			tob._toggle_pframe();
			jQuery(active_frame).hide();
			tob.position=tob.position+offset;
			if (tob.mainpicture.height()!=jQuery(inactive_frame).height()) { 
				jQuery(tob.mainpicture).animate({height: jQuery(inactive_frame).height()},'fast');
			}
			if (tob.mainpicture.width()!=jQuery(inactive_frame).width()) { 
				jQuery(tob.mainpicture).animate({width: jQuery(inactive_frame).width()},'fast');
			}
		});
		//alert('slide: '+offset.toString());	
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
