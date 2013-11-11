jQuery.noConflict();
(function($) {
	$(function() {

	$('#splash').on('pageshow', function(){
       var hideSplash = function() {
           $.mobile.changePage($("#home"));
       };
      setTimeout(hideSplash, 2000);
  });

	// Visible Function
		function visible(){
			(function(c){ c.fn.visible=function(e){ var a=c(this), b=c(window), f=b.scrollTop(); b=f+b.height(); var d=a.offset().top; a=d+a.height(); var g=e===true?a:d; return(e===true?d:a)<=b&&g>=f; }; })(jQuery);
		}
		visible();

	// Global Variable
		var ytm = {};

		ytm.theBody = $('#body-container');
		ytm.theLogo = $('#logo');

		ytm.menuIcon = $('#masthead').find('.icon');

		ytm.fullscreenIcon = $('#fullscreen-icon');

		ytm.searchHeader = $('#search-results-header');
		ytm.searchIcon = $('#search-icon');
		ytm.searchInput = $('#search-input');
		ytm.searchSubmit = $('#search-submit');
		ytm.searchList = $('#results-list');
		ytm.searchLoadTrigger = $('#search-load-trigger');
		ytm.searchQuery = $('#search-query');
		ytm.searchResults = $('#search-results');
		
		ytm.sidebarContainer = $('#sidebar-container');
		ytm.sidebarInnerContainer = $('#sidebar-inner-container');
		ytm.sidebarIcon = $('#sidebar-icon');
		ytm.sidebarHeader = $('#sidebar-header');
		ytm.relatedList = $('#related-list');
		ytm.relatedLoadTrigger = $('#related-load-trigger');

		ytm.playlist = $('#playlist');
		ytm.playlistInnerContainer = $('#playlist-inner-wrap');
		ytm.playlistCount = $('#playlist-count');
		ytm.playlistIcon = $('#playlist-icon');
		ytm.playlistList = $('#playlist-list');
		ytm.playlistMessage = ytm.playlist.find($('.message-empty'));

		ytm.watchHistory = $('#watch-history');
		ytm.watchHistoryInnerContainer = $('#watch-history-inner-wrap');
		ytm.watchHistoryIcon = $('#watch-history-icon');
		ytm.watchHistoryList = $('#watch-history-list');

		ytm.viewContainer = $('#viewer-container');

		ytm.nowPlaying = $('#now-playing');

		ytm.fullscreenClass = 'fullscreen';
		ytm.hideSidebarClass = 'hide-sidebar';
		ytm.listClass = 'yta-list';
		ytm.listItemClass = 'list';
		ytm.playlistAddClass = 'add-to-playlist';
		ytm.playlistClass = 'playlist-list';
		ytm.sidebarInitClass = 'sidebar-init';
		ytm.hideSearchClass = 'hide-search';
		ytm.scrollSelectClass = 'scroll-selected';
		ytm.selectedItemClass = 'selected';
		ytm.vidClickClass = 'vid-click-play';

		ytm.modalCover = $('#modal-cover');

		ytm.alreadyWatched = [];

	// Functions
		ytm.videoPlayClick = function(obj) {
			var ele = obj.closest('.'+ytm.listItemClass);

			if(ytm.sidebarContainer.hasClass(ytm.sidebarInitClass)) {
				ytm.sidebarContainer.removeClass(ytm.sidebarInitClass);
				ytm.sidebarIcon.addClass('active');
				ytm.theBody.removeClass(ytm.hideSidebarClass);
			}

			if(!ele.hasClass('currently-playing')) {
				var title = ele.find('.title').text(),
					id = ele.data('video-id'),
					user = ele.find('.user').data('username');
				ytm.videoEmbed(id);
				ytm.nowPlaying.html('<strong>'+title+'</strong> <small>by ' +user+'</small><span class="video-id hidden">'+id+'</span>');
				$('.'+ytm.scrollSelectClass).removeClass(ytm.scrollSelectClass);
				ele.closest('.'+ytm.listClass).parent().addClass(ytm.scrollSelectClass);
				ytm.sidebarInnerContainer.scrollTop(0);
				ytm.relatedList.height(ytm.relatedList.height()).empty();
				ytm.searchFetch(id, 'related', 'first');	
				ytm.alreadyWatched.push(id);
				ytm.watchHistoryItemAdd(ele);
				ytm.playlistActionCloseTrigger();
				ytm.watchHistoryActionCloseTrigger();
				$('.'+ytm.listItemClass).removeClass('currently-playing '+ytm.selectedItemClass);
				ele.addClass('currently-playing '+ytm.selectedItemClass);
			}

		};

		ytm.videoEmbed = function(id) {
			var embed = '<iframe width="1280" height="720" src="http://www.youtube.com/embed/'+id+'?autoplay=1&vq=hd720" frameborder="0" allowfullscreen></iframe>';
			ytm.viewContainer.html(embed);
		};

		ytm.searchFail = function(){
			var returnVal = ytm.searchQuery.val();
			ytm.searchList.empty();
			ytm.searchHeader.html("<h5 class='text-thin'>Something went wrong <strong>:(</strong>. <br>We couldn't find anything for <strong>"+returnVal+"</strong>.</h5>");
		};

		ytm.searchFetchTrigger = function(){
			if(ytm.searchLoadTrigger.visible(true) === true) {
				var i = ytm.searchQuery.val();
				ytm.searchFetch(i);
			}
		};

		ytm.relatedFetchTrigger = function(){
			if(ytm.relatedLoadTrigger.visible(true) === true) {
				var i = ytm.nowPlaying.find('.video-id').text();
				ytm.searchFetch(i, 'related');
			}	
		};

		ytm.searchUserTrigger = function(username) {
			ytm.searchList.empty();
			ytm.searchQuery.val('u:'+username);
			ytm.searchFetch(username, 'user');
		};

		ytm.searchUser = function(){
			$('.user span').on('click', function() {
				var username = $(this).closest('.user').data('username');
				ytm.searchUserTrigger(username);
			});	
		};

		ytm.scrollOffset = function(list, direction){
			var a = list.find('.'+ytm.selectedItemClass),
				b = list,
				br = list.height(),
				p = a.prevAll(),
				ps = p.size(),
				h = a.outerHeight(),
				total;
			if(direction === 'up') {
				if( a.offset().top < (h * 2) ) {
					b.scrollTop(ps * h - h);
				} else if (ps === 0) {
					b.scrollTop(0);
				}
			} else if (direction === 'down') {
				total = h;
				$.each(p, function(){
					total += $(this).outerHeight();
				});
				if(a.offset().top > br) {
					b.scrollTop(total - h);
				}
			} else if (direction === 'reset') {
				b.scrollTop(ps * a.outerHeight());
			} else {
				return false;
			}
		};

		ytm.searchFetch = function(query, type, fetchSeq) {
			var apiFeeds, offset, searchVars, maxResults, searchUrl, searchType, searchUser;

			apiFeeds = 'http://gdata.youtube.com/feeds/api/';
			maxResults = 15;

			if(type === 'related') {
				maxResults = 10;
				offset = parseInt(ytm.relatedList.find('li').size(), 10) + 1;
			} else {
				offset = parseInt(ytm.searchList.find('li').size(), 10) + 1;
			}
			if (offset === null || fetchSeq === 'first' ) { offset = 1; }		

			searchVars = 'max-results='+maxResults+'&start-index='+offset+'&alt=json';
			
			if(type === 'user') {
				var userSearch = ytm.searchQuery.val().split(':');
				searchUser = userSearch[1];				
				searchType = 'user';
				searchUrl = apiFeeds+'users/'+searchUser+'/uploads?'+searchVars+'&v=2';
			} else if(type === 'related') {
				searchType = 'related';
				searchUrl = 'http://gdata.youtube.com/feeds/videos/'+query+'/related?'+searchVars;
			} else {
				searchType = 'search';
				searchUrl = apiFeeds+'videos?q='+query+'&'+searchVars+'&v=2';
			}

			$.getJSON(searchUrl, function(data) {
				var embedLocation = ytm.searchList;
				if(searchType === 'search') {
					ytm.searchHeader.html('<h5 class="text-thin">Search results for "<strong>'+query+'</strong>"</h5>');
				} else if(searchType === 'related') {
					ytm.sidebarHeader.html('<h5 class="text-thin">Related Videos</h5>');
					embedLocation = ytm.relatedList;
				} else if(searchType === 'user') {
					var userSearch = ytm.searchQuery.val().split(':');
					searchUser = userSearch[1];
					ytm.searchHeader.html('<h5 class="text-thin">Latest Videos from <strong>'+searchUser+'</strong></h5>');
				} else {}

				var feed = data.feed,
					entries = feed.entry;

				if(feed.hasOwnProperty('entry')) {
					$.each(entries, function(i,data) {
						var title = data.title.$t,
							id = data.id.$t.split(':')[3],
							user = data.author[0].name.$t,
							userid = data.author[0].uri.$t.split('/')[6],
							date = new Date(data.published.$t),
							description = data.media$group.media$description.$t,
							thumb = data.media$group.media$thumbnail[0].url;
						if(searchType === 'related') {
							id = data.id.$t.split('/')[5];
							userid = data.author[0].uri.$t.split('/')[5];
						}
						embedLocation.append('<li data-video-id="'+id+'" class="list"><div class="thumbnail"><i class="icon-plus add-to-playlist"></i><img src="'+thumb+'" width="120" height="90" class="'+ytm.vidClickClass+'"></div><div class="content"><div class="title '+ytm.vidClickClass+'"><strong>'+title+'</strong></div><div class="user" data-username="'+userid+'">by <span>'+userid+'</span></div></div></li>');
					});
					ytm.relatedList.css('height', 'auto');
					if(!$('.'+ytm.scrollSelectClass).find('li').hasClass(ytm.selectedItemClass) && ytm.playlist.hasClass('hidden')){
						$('.'+ytm.scrollSelectClass).find('li').first().addClass(ytm.selectedItemClass);
					}
					ytm.searchUser();	
					setTimeout(function(){
						$('.'+ytm.listItemClass).each(function(){
							var id = $(this).data('video-id');
							if($.inArray(id, ytm.alreadyWatched) > -1) {
								$(this).addClass('watched');
							}
						});
					}, 1);
				} else {
					ytm.searchFail();
				}
			}).fail(function() {
				ytm.searchFail();
			});
		};

		ytm.menuIconTrigger = function(obj) {
			var $this = obj;
			if(ytm.theBody.hasClass(ytm.fullscreenClass)) {
				if($this.hasClass('fullscreen-click')) {
					$this.removeClass('active');
				}
				return false;
			} else {
				$this.toggleClass('active');				
			}
		};

		ytm.actionListTrigger = function(action, container, list, obj, icon) {
			var open = function() {
				$('.'+ytm.scrollSelectClass).addClass('pre-'+ytm.scrollSelectClass).removeClass(ytm.scrollSelectClass);
				container.addClass(ytm.scrollSelectClass);
				if($('.'+ytm.selectedItemClass).length && list.find('.'+ytm.listItemClass).length) {
					$('.'+ytm.selectedItemClass).addClass('pre-'+ytm.selectedItemClass).removeClass(ytm.selectedItemClass);
					list.find('.'+ytm.listItemClass).first().addClass(ytm.selectedItemClass);
				}
			};
			var close = function(attr) {
				$('.pre-'+ytm.selectedItemClass).addClass(ytm.selectedItemClass).removeClass('pre-'+ytm.selectedItemClass);
				list.find('.'+ytm.listItemClass).removeClass(ytm.selectedItemClass);
				container.removeClass(ytm.scrollSelectClass);
				$('.pre-'+ytm.scrollSelectClass).addClass(ytm.scrollSelectClass).removeClass('pre-'+ytm.scrollSelectClass);
				icon.removeClass('active');
				obj.addClass('hidden');
				if(!ytm.modalCover.hasClass('hidden')) {
					ytm.modalCover.addClass('hidden');				
				}
			};
			if(action === 'open') { open();	} 
			else if(action === 'close') { close(); }
			else { return false; }
		};

		ytm.fullscreenTrigger = function() {
			ytm.theBody.toggleClass(ytm.fullscreenClass);
			ytm.fullscreenIcon.toggleClass('icon-resize-shrink').toggleClass('icon-resize-enlarge');
		};

		ytm.playlistAddItem = function(item) {
			if(!item) { item = $('.'+ytm.selectedItemClass); }
			if($('.'+ytm.selectedItemClass).length && ytm.playlist.hasClass('hidden')) {
				if(!$('.'+ytm.selectedItemClass).parent().hasClass(ytm.playlistList)) {
					item.clone(true).appendTo(ytm.playlistList);
					ytm.playlistList.find('li').removeClass(ytm.selectedItemClass);
				}
			}
			ytm.playlistCountUpdate();
		};

		ytm.playlistCountUpdate = function() {
			var pCount = ytm.playlist.find('.'+ytm.listItemClass).size();
			ytm.playlistCount.text(pCount);
			if(pCount === 0) {
				ytm.playlistMessage.removeClass('hidden');
				ytm.playlistCount.removeClass('update');
			} else {
				ytm.playlistMessage.addClass('hidden');
				ytm.playlistCount.addClass('update');
			}
		};

		ytm.playlistActionCloseTrigger = function(){
			ytm.actionListTrigger(
				'close', 
				ytm.playlistInnerContainer, 
				ytm.playlistList, 
				ytm.playlist,
				ytm.playlistIcon
			);
		}

		ytm.playlistItemDeleteTrigger = function(item, action) {
			var p = ytm.playlist, pi;
			if(!p.hasClass('hidden') && p.find('.'+ytm.listItemClass).length) {
				ytm.searchQuery.blur();
				ytm.playlist.focus();
				if(action !== 'delete') {
					item = p.find('.'+ytm.selectedItemClass);
				}
				if(item.index() === 0) {
					pi = item.next();
				} else {
					pi = item.prev();
				}
				pi.addClass('prev-sel');
				item.remove();
				p.find('.prev-sel').addClass(ytm.selectedItemClass);
				ytm.playlistCountUpdate();
			}
		}

		ytm.playlistTrigger = function() {
			var p = ytm.playlist,
				pl = ytm.playlistList;
			ytm.playlist.toggleClass('hidden');
			ytm.modalCover.toggleClass('hidden');
			pl.find('.'+ytm.playlistAddClass).each(function(){
				$(this).parent().append('<i class="add-to-playlist icon-minus"></i>');
				$(this).remove();
			});
			if(!p.hasClass('hidden')) {
				ytm.actionListTrigger('open', ytm.playlistInnerContainer, ytm.playlistList);
			} else {
				ytm.playlistActionCloseTrigger();
			}
			if(pl.find('li').length) {
				ytm.playlistMessage.addClass('hidden');
			} else {
				ytm.playlistMessage.removeClass('hidden');
			}
		};

		ytm.searchBarTrigger = function(){
			if(ytm.theBody.hasClass(ytm.fullscreenClass)) {
				ytm.theBody.removeClass(ytm.fullscreenClass);
				ytm.fullscreenIcon.removeClass('active');
			} else {
				ytm.theBody.toggleClass('hide-search');
			}
		};

		ytm.searchSubmitTrigger = function() {
			ytm.searchResults.removeClass('subtle');
			var i = ytm.searchQuery.val();
			ytm.searchList.empty();
			if(i.indexOf("u:") !== -1) {
				ytm.searchFetch(i, 'user');
			} else {
				ytm.searchFetch(i);
			}
			ytm.searchQuery.blur();
			ytm.relatedList.focus();
		};

		ytm.sidebarTrigger = function() {
			if(ytm.theBody.hasClass(ytm.fullscreenClass)) {
				ytm.theBody.removeClass(ytm.fullscreenClass);
				ytm.fullscreenIcon.removeClass('active');
			} else {
				ytm.theBody.toggleClass(ytm.hideSidebarClass);
			}
		};

		ytm.sidebarSwitchSelected = function(ele, val) {
			if(!ytm.theBody.hasClass(val)) {
				$('.'+ytm.scrollSelectClass).removeClass(ytm.scrollSelectClass);
				$('.'+ytm.selectedItemClass).removeClass(ytm.selectedItemClass);
				ele.scrollTop(0).addClass(ytm.scrollSelectClass);
				ele.find('li').first().addClass(ytm.selectedItemClass);				
			}
		};

		ytm.watchHistoryActionCloseTrigger = function() {
			ytm.actionListTrigger(
				'close', 
				ytm.watchHistoryInnerContainer, 
				ytm.watchHistoryList, 
				ytm.watchHistory,
				ytm.watchHistoryIcon
			);
		};

		ytm.watchHistoryItemAdd = function(item){
			if(ytm.watchHistory.hasClass('hidden')) {
				item.clone(true).removeClass(ytm.selectedItemClass).appendTo(ytm.watchHistoryList);
			}
		}

		ytm.watchHistoryTrigger = function() {
			ytm.watchHistory.toggleClass('hidden');
			if(!ytm.watchHistory.hasClass('hidden')) {
				ytm.actionListTrigger(
					'open', 
					ytm.watchHistoryInnerContainer, 
					ytm.watchHistoryList
				);
			} else {
				ytm.watchHistoryActionCloseTrigger();
			}
		};

	// Click Actions
		$(document).on('click', '.'+ytm.playlistAddClass, function(e){
			e.stopPropagation();
			if(!$(this).closest('.'+ytm.listClass).hasClass('playlist-list')) {
				var item = $(this).closest('.'+ytm.listItemClass);
				ytm.playlistAddItem(item);
			}
		});

		$(document).on('click', '.'+ytm.vidClickClass, function(){
			ytm.videoPlayClick($(this));
		});

		ytm.playlist.on('click', '.'+ytm.playlistAddClass, function(e){
			e.stopPropagation();
			ytm.playlistItemDeleteTrigger($(this), 'click');
		});

		ytm.playlist.on('click', '.'+ytm.vidClickClass, function(){
			ytm.videoPlayClick($(this));
		});

		ytm.menuIcon.on('click', function() {
			ytm.menuIconTrigger($(this));
		});

		ytm.modalCover.on('click', function(){
			ytm.playlistActionCloseTrigger();
		});

		ytm.fullscreenIcon.on('click', function(){
			ytm.fullscreenTrigger();
		});

		ytm.playlist.on('click', function(e){
			e.stopPropagation();
		});

		ytm.playlistIcon.on('click', function(){
			ytm.playlistTrigger();
		});

		ytm.searchInput.submit(function(e){
			e.preventDefault();
			ytm.searchSubmitTrigger();
		});

		ytm.searchIcon.on('click', function() {
			ytm.searchBarTrigger();
		});

		ytm.searchResults.on('scroll', function() {
			ytm.searchFetchTrigger();
		});	

		ytm.sidebarIcon.on('click', function(){
			ytm.sidebarTrigger();
		});

		ytm.sidebarInnerContainer.on('scroll', function() {
			ytm.relatedFetchTrigger();
		});	

		ytm.searchSubmit.on('click', function(e){
			e.preventDefault();
			ytm.searchSubmitTrigger();
		});

		ytm.watchHistoryIcon.on('click', function(){
			ytm.watchHistoryTrigger();
		});

		ytm.theLogo.on('click', function(){
			location.reload();
		});

	// jQuery UI Actions
		ytm.playlistList.sortable();

		ytm.searchQuery.focus();

	});
})(jQuery);