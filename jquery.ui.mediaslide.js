/*  jQuery.ui.mediaslide.js
 *  Ver: 0.0.1
 *  by Kieran Simkin - http://SlinQ.com/
 *
 *  Copyright (c) 2011-2012, Kieran Simkin
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 
 *  -  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *  -  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

(function( $ ) {
$.widget( "ui.mediaslide", {
	// These options will be used as defaults
	options: { 

		// One of these must be specified:
		"atom_xml_data": null,
		"atom_xml_ajax": null,
		"flickr_data": null,
		"json_data": null,
		"json_ajax": null,

		"start_position": 0, // where to start in the list (zero indexed)
		"num_thumbs": 4, 
		"thumb_width": 200,
		"thumb_spacing": 10,	
		"loading_thumb": "ajaxloader.gif",
		"caption_formatter": function(c) { return c; },
		"position_indicator_formatter": function(c) { return c; },
		"title_formatter": function(c) { return c; },
		"picture_click_handler": function(link) { return true; },
		"quantize_scroll": false,
		"small_captions": true,
		"thumbs_on_top": false,
		"scrollbar_on_top": true,
		"captions_on_top": false,
		"small_top_controls": true,
		"small_bottom_controls": true,
		"show_bottom_controls": true,
		"show_top_controls": true,
		"show_slide_page_controls": true,
		"show_thumbs": true,
		"top_navigation_controls_text": false,
		"bottom_navigation_controls_text": false,
		"top_position_indicator": true,
		"bottom_position_indicator": false,
		"top_media_title": false,
		"bottom_media_title": true
	},
	// Slide to a specific position
	position_slide_to: function(pos) { 
		this.position_slide(pos-this.position);
	},
	// Slide to the next position
	next: function() { 
		this.position_slide(1);
	},
	// Slide to the previous position
	previous: function() { 
		this.position_slide(-1);
	},
	// Slide forward a number of places
	forward: function (num) { 
		this.position_slide(num);
	},
	// Slide backwards a number of places
	backward: function (num) { 
		this.position_slide(0-num);
	},
	// Slide to the beginning
	first: function() { 
		this.position_slide_to(0);
	},
	// Slide to the end
	last: function() { 
		this.position_slide_to(this.d.length-1);
	},
	// Get the current position (zero indexed)
	get_position: function() { 
		return this.position;
	},
	// Get total number of media items
	get_count: function() { 
		return this.d.length;
	},
	// Get the title of the current media item
	get_current_title: function() { 
		return this.d[this.position].title;	
	},
	// Get the id of the current media item
	get_current_id: function() { 
		return this.d[this.position].id;	
	},
	// Get the link of the current media item
	get_current_link: function() { 
		return this.d[this.position].link;	
	},
	// Get the updated date of the current media item
	get_current_updated: function() { 
		return this.d[this.position].updated;	
	},
	// Get the full data object for the current media item
	get_current_object: function() { 
		return this.d[this.position];
	},
	// Skips (without sliding) to a specific image number
	position_skip: function(pos) { 
		var frame=this._get_foreground_pframe();
		this.position=pos;
		this.thumbnails[this.position].hide();
		var me=this;
		jQuery(frame).html('<img class="ui-widget-mediaslide-active-img">').find('.ui-widget-mediaslide-active-img').attr('src',this.d[pos].normal);
		jQuery(frame).find('.ui-widget-mediaslide-active-img').bind("load", function() { 
			me.mainpicture.width(jQuery(frame).width());
			me.mainpicture.height(jQuery(frame).height());
			if (jQuery(frame).width()>me._get_visible_scrollbox_width()) { 
				me.mainpicture.css({left: 0-(jQuery(frame).width()-me._get_visible_scrollbox_width())/2});
			}
		});
		this._begin_update_controls(this.position,true);
		this._update_controls();
	},
	// Slides forwards or backwards a number of positions
	position_slide: function (offset) { 
		if (this.position+offset<0) { 
			//console.log('Mediaslide: Tried to skip past the beginning');
			return false;
		}
		if (this.position+offset>this.d.length-1) { 
			//console.log('Mediaslide: Tried to skip past the end');
			return false;
		}
		if (offset==0) { 
			//console.log('Mediaslide: Tried to move 0 spaces');
			return false;
		}
		if (this.slide_in_progress) { 
			//console.log('Mediaslide: Slide already in progress');
			return false;
		}
		this._trigger("startslide",offset);
		this.slide_in_progress = true;
		this._begin_update_controls(this.position+offset);
		var oldpos=this.position;
		this.position=this.position+offset;
		var tob=this;
		var active_frame = this._get_foreground_pframe();
		var inactive_frame = this._get_background_pframe();
		jQuery(active_frame).css({'z-index': 1});
		jQuery(inactive_frame).css({'z-index': 2}).html('<img class="ui-widget-mediaslide-active-img">').find('.ui-widget-mediaslide-active-img').attr('src',this.d[this.position].normal);
		jQuery(inactive_frame).find('.ui-widget-mediaslide-active-img').bind("load", function() { 
			if (tob.mainpicture.height()!=jQuery(inactive_frame).height() || tob.mainpicture.width()!=jQuery(inactive_frame).width()) { 
				var leftoff=0;
				if (jQuery(inactive_frame).width()>tob._get_visible_scrollbox_width()) { 
					leftoff-=(jQuery(inactive_frame).width()-tob._get_visible_scrollbox_width())/2;
				}
				jQuery(tob.mainpicture).animate({height: jQuery(inactive_frame).height(), width: jQuery(inactive_frame).width(), left: leftoff+'px'},'fast');
			}
			jQuery(inactive_frame).fadeTo('slow', 1.0, 'linear', function() { 
				tob._toggle_pframe();
				jQuery(active_frame).css({opacity: 0}).hide();
				tob.slide_in_progress=false;
				tob._trigger("endslide",this.position);
				tob._update_controls();
			});
			tob._handle_thumb_slide(oldpos);
		});
	},
	// Setup the main HTML
	_do_html_setup: function() { 
		this.element.html('');
		this.top_controls=jQuery('<div></div>')	.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-top-controls-div')
							.css({'z-index': 1,'margin':'auto auto'})
							.prependTo(this.element);
		this._do_top_controls_html_setup();
		if (!this.options.show_top_controls) { 
			this.top_controls.hide();
		}
		this.mainpicture=jQuery('<div></div>')	.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-main-picture-div')
							.css({position: 'relative', overflow: 'hidden', 'z-index': 1,'margin':'auto auto'})
							.appendTo(this.element);
		this.pictureframe1=jQuery('<div></div>').addClass('ui-widget')
							.addClass('ui-widget-mediaslide-pictureframe')
							.addClass('ui-widget-mediaslide-pictureframe1')
							.css({position: 'absolute', 'top': '0px', 'left': '0px','cursor': 'pointer'})
							.click(this._pictureframe_click())
							.appendTo(this.mainpicture);
		this.pictureframe2=jQuery('<div></div>').addClass('ui-widget')
							.addClass('ui-widget-mediaslide-pictureframe')
							.addClass('ui-widget-mediaslide-pictureframe2')
							.css({position: 'absolute', 'top': '0px', 'left': '0px', 'opacity': '0','cursor':'pointer'})
							.click(this._pictureframe_click())
							.appendTo(this.mainpicture);
		this.bottom_controls=jQuery('<div></div>')
							.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-bottom-controls-div')
							.css({'z-index': 1,'margin':'auto auto'})
							.appendTo(this.element);
		this._do_bottom_controls_html_setup();
		if (!this.options.show_bottom_controls) { 
			this.bottom_controls.hide();
		}
		this.thumbslide_scrollbar=jQuery('<div></div>')
							.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-thumbslide-scrollbar')
							.css({'z-index': 1,'margin':'auto auto','margin-bottom':'5px'});
		this.thumbslide_slider=jQuery('<div></div>')
							.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-thumbslide-slider')
							.appendTo(this.thumbslide_scrollbar);
		this.thumbslide=jQuery('<div></div>')	.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-thumbslide')
							.css({'overflow': 'auto','z-index': 2,'margin':'auto auto'});
		this.thumbslide_content=jQuery('<div></div>')
							.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-thumbslide-content')
							.appendTo(this.thumbslide);
		if (this.options.thumbs_on_top) { 
			if (this.options.scrollbar_on_top) { 
				this.thumbslide.prependTo(this.element);
				this.thumbslide_scrollbar.prependTo(this.element);
			} else { 
				this.thumbslide_scrollbar.prependTo(this.element);
				this.thumbslide.prependTo(this.element);
			}
		} else {
			if (this.options.scrollbar_on_top) {  
				this.thumbslide_scrollbar.appendTo(this.element);
				this.thumbslide.appendTo(this.element);
			} else { 
				this.thumbslide.appendTo(this.element);
				this.thumbslide_scrollbar.appendTo(this.element);
			}
		}
		if (!this.options.show_thumbs) { 
			this.thumbslide.hide();
			this.thumbslide_scrollbar.hide();
		}
		this.html_setup=true;
	},
	// Setup the HTML for the top controls
	_do_top_controls_html_setup: function() { 
		var me = this;
		this.top_controls_center=jQuery("<div></div>").css({'position': 'absolute','text-align': 'center'}).appendTo(this.top_controls);
		this.top_controls_rightfloat=jQuery("<div></div>").css({'position': 'absolute','text-align': 'right'}).appendTo(this.top_controls);
		this.top_controls_leftfloat=jQuery("<div></div>").css({'text-align': 'left'}).appendTo(this.top_controls);
		this.top_controls_first_button=jQuery("<div></div>")
							.addClass('ui-widget-mediaslide-top-controls-first-button')
							.html((this.options.top_navigation_controls_text ? 'Beginning' : null))
							.appendTo(this.top_controls_leftfloat)
							.button({icons: { primary: 'ui-icon-arrowthickstop-1-w', secondary: null}, text: this.options.top_navigation_controls_text})
							.click(function() { 
								me.first();
							});
		this.top_controls_previous_button=jQuery("<div></div>")
							.addClass('ui-widget-mediaslide-top-controls-previous-button')
							.html((this.options.top_navigation_controls_text ? 'Previous' : null))
							.appendTo(this.top_controls_leftfloat)
							.button({icons: { primary: 'ui-icon-arrowthick-1-w', secondary: null}, text: this.options.top_navigation_controls_text})
							.click(function() { 
								me.previous();
							});
		this.top_controls_next_button=jQuery("<div></div>")
							.addClass('ui-widget-mediaslide-top-controls-next-button')
							.html((this.options.top_navigation_controls_text ? 'Next' : null))
							.appendTo(this.top_controls_rightfloat)
							.button({icons: { primary: null, secondary: 'ui-icon-arrowthick-1-e'}, text: this.options.top_navigation_controls_text})
							.click(function() { 
								me.next();
							});
		this.top_controls_last_button=jQuery("<div></div>")
							.addClass("ui-widget-mediaslide-top-controls-last-button")
							.html((this.options.top_navigation_controls_text ? 'End' : null))
							.appendTo(this.top_controls_rightfloat)
							.button({icons: { primary: null, secondary: 'ui-icon-arrowthickstop-1-e'}, text: this.options.top_navigation_controls_text})
							.click(function() { 
								me.last();
							});
		this.top_controls_position_indicator=jQuery("<div></div>")
							.addClass("ui-widget")
							.addClass("ui-widget-mediaslide-top-controls-position-indicator")
							.html('Loading')
							.css({'display': 'none'})
							.appendTo(this.top_controls_center);
		this.top_controls_media_title=jQuery("<div></div>")
							.addClass("ui-widget")
							.addClass("ui-widget-mediaslide-top-controls-media-title")
							.html('Loading')	
							.css({'display': 'none'})
							.appendTo(this.top_controls_center);
		if (this.options.small_top_controls) { 
			this.top_controls_first_button.wrap('<small></small>');
			this.top_controls_previous_button.wrap('<small></small>');
			this.top_controls_next_button.wrap('<small></small>');
			this.top_controls_last_button.wrap('<small></small>');
		}
	},
	// Setup the HTML for the bottom controls
	_do_bottom_controls_html_setup: function() { 
		var me = this;
		this.bottom_controls_center=jQuery("<div></div>").css({'position': 'absolute','text-align': 'center'}).appendTo(this.bottom_controls);
		this.bottom_controls_rightfloat=jQuery("<div></div>").css({'position': 'absolute','text-align': 'right'}).appendTo(this.bottom_controls);
		this.bottom_controls_leftfloat=jQuery("<div></div>").css({'text-align': 'left'}).appendTo(this.bottom_controls);
		this.bottom_controls_first_button=jQuery("<div></div>")
							.addClass('ui-widget-mediaslide-bottom-controls-first-button')
							.html((this.options.bottom_navigation_controls_text ? 'Beginning' : null))
							.appendTo(this.bottom_controls_leftfloat)
							.button({icons: { primary: 'ui-icon-arrowthickstop-1-w', secondary: null}, text: this.options.bottom_navigation_controls_text})
							.click(function() { 
								me.first();
							});
		this.bottom_controls_previous_button=jQuery("<div></div>")
							.addClass('ui-widget-mediaslide-bottom-controls-previous-button')
							.html((this.options.bottom_navigation_controls_text ? 'Previous' : null))
							.appendTo(this.bottom_controls_leftfloat)
							.button({icons: { primary: 'ui-icon-arrowthick-1-w', secondary: null}, text: this.options.bottom_navigation_controls_text})
							.click(function() { 
								me.previous();
							});
		this.bottom_controls_next_button=jQuery("<div></div>")
							.addClass('ui-widget-mediaslide-bottom-controls-next-button')
							.html((this.options.bottom_navigation_controls_text ? 'Next' : null))
							.appendTo(this.bottom_controls_rightfloat)
							.button({icons: { primary: null, secondary: 'ui-icon-arrowthick-1-e'}, text: this.options.bottom_navigation_controls_text})
							.click(function() { 
								me.next();
							});
		this.bottom_controls_last_button=jQuery("<div></div>")
							.addClass("ui-widget-mediaslide-bottom-controls-last-button")
							.html((this.options.bottom_navigation_controls_text ? 'End' : null))
							.appendTo(this.bottom_controls_rightfloat)
							.button({icons: { primary: null, secondary: 'ui-icon-arrowthickstop-1-e'}, text: this.options.bottom_navigation_controls_text})
							.click(function() { 
								me.last();
							});
		this.bottom_controls_position_indicator=jQuery("<div></div>")
							.addClass("ui-widget")
							.addClass("ui-widget-mediaslide-bottom-controls-position-indicator")
							.html('Loading')
							.css({'display': 'none'})
							.appendTo(this.bottom_controls_center);
		this.bottom_controls_media_title=jQuery("<div></div>")
							.addClass("ui-widget")
							.addClass("ui-widget-mediaslide-bottom-controls-media-title")
							.html('Loading')	
							.css({'display': 'none'})
							.appendTo(this.bottom_controls_center);
		if (this.options.small_bottom_controls) { 
			this.bottom_controls_first_button.wrap('<small></small>');
			this.bottom_controls_previous_button.wrap('<small></small>');
			this.bottom_controls_next_button.wrap('<small></small>');
			this.bottom_controls_last_button.wrap('<small></small>');
		}

	},
	// Setup the HTML for the thumbnail strip
	_do_thumbnail_html_setup: function() { 
		this.thumbnails=new Array();
		var l = this.thumbnails;
		var t = this.thumbslide_content;
		t.html('');
		var op = this.options;
		var me = this;
		jQuery.each(this.d,function(i,o) { 
			var p=jQuery('<div></div>')	.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-thumb-div')
							.addClass('ui-corner-all')
							.addClass('ui-state-default')
							.css({'float': 'left', 'position': 'relative', 'width': op.thumb_width, 'margin-left': me._get_left_thumb_spacing(),'margin-right': me._get_right_thumb_spacing(), 'text-align': 'center','border': 'none'})
							.html('<img class="ui-widget-mediaslide-thumb-img">')
							.hover(function() { 
								p.addClass('ui-state-hover');
							}, function() { 
								p.removeClass('ui-state-hover');
							})
							.appendTo(t);
			p.find('.ui-widget-mediaslide-thumb-img').wrap('<a href="#" class="ui-widget-mediaslide-thumb-link" />');
			var im=p.find('.ui-widget-mediaslide-thumb-img').attr('src',me.options.loading_thumb);
			im.css({border:'none'}); // For IE
			var an=p.find('.ui-widget-mediaslide-thumb-link').click(function() { 
				me.position_slide_to(i);
				return false;
			});

			an.css({'outline': 0});
			jQuery('<br />').appendTo(an);
			var cap=jQuery("<span></span>")		.addClass('ui-widget')
							.addClass('ui-widget-mediaslide-thumb-caption')
							.css({'width': me.options.thumb_width-10, 'margin-bottom': '5px','display' : 'inline-block', 'margin-left': '5px', 'margin-right': '5px'})
							.html(me.options.caption_formatter(o.title));
			if (me.options.captions_on_top) { 
				cap.prependTo(an);
			} else { 
				cap.appendTo(an);
			}
			if (me.options.small_captions) { 
				cap.wrap("<small></small>");
			}
			l.push(p);

		});
		this.thumbslide.width(this._get_visible_scrollbox_width());
		this.thumbslide_content.width(this._get_total_scrollbox_width()); 
		this.top_controls_rightfloat.width(this._get_visible_scrollbox_width());
		this.top_controls_center.width(this._get_visible_scrollbox_width());
		this.bottom_controls_rightfloat.width(this._get_visible_scrollbox_width());
		this.bottom_controls_center.width(this._get_visible_scrollbox_width());
		this.thumbslide_scrollbar.width(this._get_visible_scrollbox_width());
		this.element.width(this._get_visible_scrollbox_width());
		//scrollpane parts
		var scrollPane = this.thumbslide, scrollContent = this.thumbslide_content;
		this.preloadtimeout=null;
		//build slider
		this.scrollbar = this.thumbslide_slider.slider({step: 0.1, max: (this.d.length-(1+me.options.num_thumbs)),
			slide: function( event, ui ) {
				scrollContent.stop();
				if ( scrollContent.width() > scrollPane.width() ) {
					var tpos =  Math.round(
						ui.value / (me.d.length-(1+me.options.num_thumbs)) * ( scrollPane.width() - scrollContent.width() )
					);
					if (me.options.quantize_scroll) {
						var val=Math.floor((me.options.thumb_width+me.options.thumb_spacing));
						if (tpos % val > val/2) { 
							tpos+=val;
						}
						tpos-=tpos % val;
					}
					scrollContent.animate( {"margin-left": tpos+"px"},300 );
				} else {
					scrollContent.animate({ "margin-left": 0},300);
				}
				var scrollpos=Math.floor(me._get_scroll_position_estimate(ui.value));
				if (me.preloadtimeout!==null) {
					clearTimeout(me.preloadtimeout);
				}
				me.preloadtimeout=setTimeout(function(zme) { 
					if (typeof(zme)=='undefined') { 
						// Stupid IE
						return;
					}
					zme._do_thumbnail_image_loads(Math.floor(zme._get_scroll_position_estimate(ui.value)));
					var val=Math.floor((me.options.thumb_width+me.options.thumb_spacing));
					if (tpos % val > val/2) { 
						tpos+=val;
					}
					tpos-=tpos % val;
				},300,me);
			},
			change: function(event, ui) {
				scrollContent.stop();
				if ( scrollContent.width() > scrollPane.width() ) {
					var tpos= Math.round(
						ui.value / (me.d.length-(1+me.options.num_thumbs)) * ( scrollPane.width() - scrollContent.width() )
					);
					if (me.options.quantize_scroll) {
						var val=Math.floor((me.options.thumb_width+me.options.thumb_spacing));
						if (tpos % val > val/2) { 
							tpos+=val;
						}
						tpos-=tpos % val;
					}
					scrollContent.animate( {"margin-left": tpos+"px"},300 );
				} else {
					scrollContent.animate({ "margin-left": 0},300);
				}
				me._do_thumbnail_image_loads(Math.floor(me._get_scroll_position_estimate(ui.value)));
			}
		});
		var sb=this.scrollbar;
		//append icon to handle
		this.handleHelper = this.scrollbar.find( ".ui-slider-handle" )
		.css({'top': '-1px','height': '0.8em', 'cursor': 'col-resize'})
		.append( "<span class='ui-icon ui-icon-grip-dotted-vertical' style='margin: auto auto; position: relative; top: -1px;'></span>" )
		.wrap( jQuery("<div></div>" ).css({ 'position': 'relative', width: '100%', height: '100%', margin: '0 auto' })).parent();
		//change overflow to hidden now that slider handles the scrolling

		scrollPane.css( "overflow", "hidden" );
		this._size_scrollbar();	
		this._do_thumbnail_image_loads();
	},
	_begin_update_controls: function(pos,initial) { 
		if (initial!==true) { 
			if (this.options.top_position_indicator) { 
				this.top_controls_position_indicator.fadeOut('fast');
			}
			if (this.options.bottom_position_indicator) { 
				this.bottom_controls_position_indicator.fadeOut('fast');
			}
			if (this.options.bottom_media_title) { 
				this.bottom_controls_media_title.fadeOut('fast');
			}
			if (this.options.top_media_title) { 
				this.top_controls_media_title.fadeOut('fast');
			}
		}
		if (pos==0) { 
			this.top_controls_previous_button.attr('disabled',true).addClass('ui-state-disabled');
			this.top_controls_first_button.attr('disabled',true).addClass('ui-state-disabled');
			this.bottom_controls_previous_button.attr('disabled',true).addClass('ui-state-disabled');
			this.bottom_controls_first_button.attr('disabled',true).addClass('ui-state-disabled');
			
		} else {
			this.top_controls_previous_button.attr('disabled',false).removeClass('ui-state-disabled');
			this.top_controls_first_button.attr('disabled',false).removeClass('ui-state-disabled');
			this.bottom_controls_previous_button.attr('disabled',false).removeClass('ui-state-disabled');
			this.bottom_controls_first_button.attr('disabled',false).removeClass('ui-state-disabled');
		}
		if (pos==this.d.length-1) { 
			this.top_controls_next_button.attr('disabled',true).addClass('ui-state-disabled');
			this.top_controls_last_button.attr('disabled',true).addClass('ui-state-disabled');
			this.bottom_controls_next_button.attr('disabled',true).addClass('ui-state-disabled');
			this.bottom_controls_last_button.attr('disabled',true).addClass('ui-state-disabled');
		} else {
			this.top_controls_next_button.attr('disabled',false).removeClass('ui-state-disabled');
			this.top_controls_last_button.attr('disabled',false).removeClass('ui-state-disabled');
			this.bottom_controls_next_button.attr('disabled',false).removeClass('ui-state-disabled');
			this.bottom_controls_last_button.attr('disabled',false).removeClass('ui-state-disabled');
		}
	},
	// Gets executed after a slide to update the controls with the current image's title and position
	_update_controls: function() { 
		if (this.options.top_position_indicator) { 
			this.top_controls_position_indicator.html(this.options.position_indicator_formatter((this.position+1)+' / '+this.d.length));
			this.top_controls_position_indicator.fadeIn('fast');
		}
		if (this.options.bottom_position_indicator) { 
			this.bottom_controls_position_indicator.html(this.options.position_indicator_formatter((this.position+1)+' / '+this.d.length));
			this.bottom_controls_position_indicator.fadeIn('fast');
		}
		if (this.options.bottom_media_title) { 
			this.bottom_controls_media_title.html(this.options.title_formatter(this.get_current_title()));
			this.bottom_controls_media_title.fadeIn('fast');
		}
		if (this.options.top_media_title) { 
			this.top_controls_media_title.html(this.options.title_formatter(this.get_current_title()));
			this.top_controls_media_title.fadeIn('fast');
		}
	},
	_pictureframe_click: function() {
		var me = this;
		return function () { 
			if (me.options.picture_click_handler(me.get_current_link())!==false) {
				location.href=me.get_current_link();
			}
		}
	},
	// Size the scrollbar handle depending on how many media items we have
	_size_scrollbar: function() { 
		var scrollPane = this.thumbslide, scrollContent = this.thumbslide_content;
		var remainder = scrollContent.width() - scrollPane.width();
		var proportion = remainder / scrollContent.width();
		var handleSize = scrollPane.width() - ( proportion * scrollPane.width() );
		this.scrollbar.find( ".ui-slider-handle" ).css({
			width: handleSize,
			"margin-left": -handleSize / 2
		});
		this.handleHelper.width( "" ).width( this.scrollbar.width() - handleSize );
	},
	// Load images centred on a specific position
	_do_thumbnail_image_loads: function(pos) { 
		this.preloadtimeout=null;
		var l=this.thumbnails;
		var t=this.thumbslide_content;
		var d=this.d;
		for (var i=this._get_first_preload_thumb_position(pos);i<=this._get_last_preload_thumb_position(pos);i++) { 
			l[i].find('.ui-widget-mediaslide-thumb-img').bind("load", function() {
				jQuery(this).parent().parent().css({top: (0-jQuery(this).height())+'px',opacity: '0.0'}).animate({top: '0px','opacity':'1.0'},'slow');
			}); 
			if (l[i].find('.ui-widget-mediaslide-thumb-img').attr('src')!=d[i].thumb) { 
				l[i].find('.ui-widget-mediaslide-thumb-img').attr('src',d[i].thumb);
			}
		}
	},
	// Perform the actual animations that show and hide thumbs from the thumbnail strip
	_handle_thumb_slide: function(oldpos) { 
		this._do_thumbnail_image_loads();
		this.scrollbar.slider('value',this._get_position_scroll_estimate());
		this.thumbslide_content.width(this.thumbslide_content.width()+10); // This is a nasty hack to stop linebreaks causing the animation to go glitchy
		var me = this;
		var joff='-150px';
		if (this.options.thumbs_on_top) { 
			joff='150px';
		}
		this.thumbnails[oldpos].width(0).css({'margin-left': '0px', 'margin-right': '0px', 'opacity': 0.0, 'top': joff}).show().animate({width: this.options.thumb_width, 'margin-left': this._get_left_thumb_spacing(),'margin-right': this._get_right_thumb_spacing(), 'opacity': 1.0,'top': '0px'},600,'linear',function() { 

			me.thumbslide_content.width(me.thumbslide_content.width()-10); // This is a nasty hack to stop linebreaks causing the animation to go glitchy
		});
		var me = this;
		var p=me.position;
		this.thumbnails[this.position].animate({'opacity': 0.0, width: '0px', 'margin-left': '0px', 'margin-right': '0px', 'top': joff},600,'linear',function() { 
			me.thumbnails[p].hide();
		});
		
	},
	// Estimate which image position is in the centre of the thumbnail strip
	_get_scroll_position_estimate: function(pcent) { 
		var dec=pcent/(this.d.length-(1+this.options.num_thumbs));
		return (((this.d.length-1)-this.options.num_thumbs)*dec)+this._get_first_thumb_count();
	},
	// Estimate the scrollbar position for a specific image in the thumbnail strip
	_get_position_scroll_estimate: function(pos) { 
		if (typeof(pos)=='undefined') { 
			pos=this.position;
		}
		if (pos<=this._get_first_thumb_count()) {
			return 0;
		} else if (pos>=(this.d.length-1)-this._get_last_thumb_count()) { 
			return this.d.length-(1+this.options.num_thumbs);
		}
		var onethumb=1/(this.d.length-(1+this.options.num_thumbs));
		var p=pos-this._get_first_thumb_count();
		return (onethumb*(p))*(this.d.length-(1+this.options.num_thumbs));
	},
	// Get the picture frame that's currently in the foreground
	_get_foreground_pframe: function() { 
		if (this.pframe_displaying==1) { 
			return this.pictureframe1;
		} else { 
			return this.pictureframe2;
		}
	},
	// Get the picture frame that's not currently visible
	_get_background_pframe: function() { 
		if (this.pframe_displaying==1) { 
			return this.pictureframe2;
		} else { 
			return this.pictureframe1;
		}
	},
	// Get the total width of the thumbnail strip
	_get_total_scrollbox_width: function() { 
		var width=(this.d.length-1)*this.options.thumb_width;
		width+=this.options.thumb_spacing*(this.d.length-1);
		return width;
	},
	// Get the width of the visible section of the thumbnail strip
	_get_visible_scrollbox_width: function() { 
		var width=this.options.num_thumbs*this.options.thumb_width;
		width+=this.options.thumb_spacing*this.options.num_thumbs;
		return width;
	},
	// Switch our record of which picture frame is visible
	_toggle_pframe: function() { 
		if (this.pframe_displaying==1) { 
			this.pframe_displaying=2;
		} else { 
			this.pframe_displaying=1;
		}
	},
	// Work out how much margin-left to apply to each thumbnail
	_get_left_thumb_spacing: function() { 
		var pad=Math.floor(this.options.thumb_spacing/2);
		if (this.options.thumb_spacing % 2 != 0) { 
			pad++;
		}
		return pad;
	},
	// Work out how much margin-right to apply to each thumbnail
	_get_right_thumb_spacing: function() { 
		return Math.floor(this.options.thumb_spacing/2);
	},
	// What's the first image in the range we're loading?
	_get_first_preload_thumb_position: function(pos) { 
		var ret=this._get_first_thumb_position(pos);
		if (ret-1<0) { 
			return 0;
		} else { 
			return ret-1;
		}
	},
	// What's the last image in the range to load?
	_get_last_preload_thumb_position: function(pos) { 
		var ret=this._get_last_thumb_position(pos);
		if (ret+1>this.d.length-1) { 
			return this.d.length-1;
		} else { 
			return ret+1;
		}
	},
	// How many thumbs before the middle
	_get_first_thumb_count: function() { 
		return Math.floor(this.options.num_thumbs/2);
	},
	// How many thumbs after the middle?
	_get_last_thumb_count: function() { 
		var halfthumbs=Math.floor(this.options.num_thumbs/2);
		if (this.options.num_thumbs % 2 != 0) { 
			halfthumbs++;
		}
		return halfthumbs;
	},
	// Used to calculate the range of images to preload when we seek the slider
	_get_first_thumb_position: function(pos) { 
		var position=this.position;
		if (typeof(pos)!='undefined') { 
			position=pos;
		}
		var halfthumbs=Math.floor(this.options.num_thumbs/2);
		var otherhalfthumbs=halfthumbs;
		if (this.options.num_thumbs % 2 != 0) { 
			otherhalfthumbs++;
		}
		var end_position=position+otherhalfthumbs;
		if (end_position > this.d.length-1) { 
			halfthumbs+=end_position-(this.d.length-1)
		}
		var first_position=position-halfthumbs;
		if (first_position<0) { 
			return 0;
		} else { 
			return first_position;
		}
	},
	// Used to calculate 
	_get_last_thumb_position: function(pos) { 
		var position=this.position;
		if (typeof(pos)!='undefined') { 
			position=pos;	
		}
		var halfthumbs=Math.floor(this.options.num_thumbs/2);
		var otherhalfthumbs=halfthumbs;
		if (this.options.num_thumbs % 2 != 0) { 
			halfthumbs++;
		}
		var first_position=position-otherhalfthumbs;
		if (first_position < 0) { 
			halfthumbs+=0-first_position;
		}
		var end_position=position+halfthumbs;
		if (end_position>this.d.length-1) { 
			return this.d.length-1;
		} else {
			return end_position;
		}
		return halfthumbs;
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
	},
	// Set up the widget
	_create: function() {
		this.setup = false;
		this.html_setup = false;
		this.slide_in_progress = false;
		this.position=this.options.start_position;
		this.pframe_displaying=1;
		this._init_data();
	},
	_init_data: function() { 
		o=this;
		if (this.options.atom_xml_data !== null) { 
			this.dataType='atom';
			if (typeof(this.options.atom_xml_data)=='string') { 
				this.data=jQuery.parseXML(this.options.atom_xml_data);
			} else { 
				this.data=this.options.atom_xml_data;
			}
			this._init_display();
		} else if (this.options.atom_xml_ajax !== null) { 
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
		} else if (this.options.json_data!== null) { 
			this.dataType='json';
			if (typeof(this.options.json_data)=='string') { 
				this.data=jQuery.parseJSON(this.options.json_data);
			} else { 
				this.data=this.options.json_data;
			}
			this._init_display();
		} else if (this.options.json_ajax !== null) { 
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
		} else if (this.options.flickr_data !== null) { 
			if (typeof(this.options.flickr_data)!='string') { 
				jQuery.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",{id: this.options.flickr_data.id, format: 'json'}, function(data) { 
					o.data=data;
					o.dataType='flickr';
					o._init_display();	
				});
			} else { 
				jQuery.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",{id: this.options.flickr_data, format: 'json'}, function(data) { 
					o.data=data;
					o.dataType='flickr';
					o._init_display();	
				});
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
		var me = this;
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
			});
			this.d=d;
		} else if (this.dataType=='json') { 
		
		} else if (this.dataType=='flickr') { 
			jQuery.each(this.data.items,function(o,lob) { 
				var normal=null;
				var thumb=null;
				var med=null;
				var repstr='';
				if (typeof(lob.media.m)!='undefined') { 
					med=lob.media.m;
					repstr='_m.';
				} else if (typeof(lob.media.s)!='undefined') {
					med=lob.media.s;
					repstr='_s.';
				} else if (typeof(lob.media.t)!='undefined') { 
					med=lob.media.t;
					repstr='_t.';
				} else if (typeof(lob.media.z)!='undefined') { 
					med=lob.media.z;
					repstr='_z.';
				} else if (typeof(lob.media.b)!='undefined') { 
					med=lob.media.b;
					repstr='_b.';
				} else if (typeof(lob.media.o)!='undefined') { 
					med=lob.media.o;
					repstr='_o.';
				}
				if (me.options.flickr_data.smallthumbs===true) { 
					thumb=med.replace(repstr,'_t.');
					me.options.thumb_width='100';
				} else { 
					thumb=med.replace(repstr,'_m.');
					me.options.thumb_width='240';
				}
				if (me.options.flickr_data.largenormals===true) { 
					normal=med.replace(repstr,'_b.');
				} else { 
					normal=med.replace(repstr,'_z.');
				}
				d.push({
					title: lob.title,
					link: lob.link,
					id: lob.link,
					updated: lob.published,
					normal: normal,
					thumb: thumb
				});
			});
			this.d=d;
		} else {
			alert('unknown data type');
		}
		this._do_thumbnail_html_setup();
	}
});
}(jQuery));
