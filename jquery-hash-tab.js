// Plugin para deixa a tab ativa e inativa 
;(function($){
	'use strict';

	function tab(el, options) {
		this.defaults = $.extend({
			segment: 0,
			initTab: 0,
			showInitTab: true,
			filterClass: "", 
			activeLinkClass: "active", 
			contentClass: "",
			speedAnimation: 300,
			beforeTabActive: function() {},
			beforeTabInactive: function() {},
			afterTabActive: function() {},
			afterTabInactive: function() {}
		}, options);
		this.$target  = null;
		this.$wrapper = $(el);

		if(this.defaults.filterClass) {
			if(this.defaults.filterClass.indexOf(".") !== -1) {
				this.defaults.filterClass = "a" + this.defaults.filterClass;
			} else {
				this.defaults.filterClass = "a." + this.defaults.filterClass;
			}
		} else {
			this.defaults.filterClass = "a";
		}
		
		this.$links = this.$wrapper.find(this.defaults.filterClass);
	}

	tab.prototype = {
		init: function() {		
			this.hideElements(); 
			this.bindUI();
			this.run();
		},

		hideElements: function() {
			var self      = this;
			var contentId = "";
			self.$links.each(function(i){
				// Pega o id do conteudo usando o href do link
				contentId = "#" + self.getContentId(this.getAttribute('href').split('#')[1]);
				$(this).attr('data-content-id', contentId);

				// Esconde todos menos a tab configurada como inicial
				if(self.defaults.showInitTab && self.$target == null) { // showInitTab deve ser true e a hash não pode ter setado ninguem como target
					if(self.defaults.initTab != i) {
						$(contentId).hide();
					}
				} else {
					$(contentId).hide();
				}
			})
		},

		bindUI: function() {
			var self = this;

			$(window).hashchange(function(){
				var hash = window.location.hash;
				if(hash) {
					self.$target = self.$links.filter("[href$='" + self.getHash(hash) + "']");
					if(self.$target.length && !self.$target.hasClass(self.defaults.activeLinkClass)) {
						self.run();
					}
				}
			});
		},

		run: function() {
			if(this.getSegment()) {
	  			this.changeTab();
	  		} else {
	  			if(this.defaults.showInitTab) {
	  				this.activeInitTab();
	  			}
	  		}
		},

		// Pega a hash dependendo do segmento utilizado, usado para filtrar o link que contem aquela hash
		// Ex: segment: 0; url: #!segment1/segement2/segment3; return #!segment1
		// Ex: segment: 1; url: #!segment1/segement2/segment3; return #!segment1/segment2
		getHash: function(hash) {
			if(!hash) {
				return "";
			}

			if(hash.indexOf("/") === -1) {
				if(this.defaults.segment == 0) { 
					return hash;
				} 
				return "";
			}
			
			hash = hash.split("/");
			
			if(this.defaults.segment == 0) {
				return hash[0];
			} 
			
			return hash.slice(0, (this.defaults.segment + 1)).join("/");
		},

		// Qual segmento/pedaço da hash deve ser usado, pra saber se existe um elemento a ser buscado
		getSegment: function() {
			if(this.$target && this.$target.length) {
				if(this.defaults.segment > 0 && this.$target.attr('href').indexOf("/") !== -1) {
					return this.$target.attr('href').split("/")[this.defaults.segment];
				} 
				return this.$target.attr('href');
			} 
		},   

		// Pega o id do conteudo da tab através da hash
		getContentId: function(hash) {
			if(typeof hash == "undefined") {
				return;
			}

			hash = hash.replace("!", "");

			if(this.defaults.segment > 0 && hash.indexOf("/") !== -1) {
				return hash.split("/")[this.defaults.segment];
			}

			return hash;
		},

		// Se showInitTab for true, ativa a tab que foi clicada e inativa a que estiver aberta, somente se forem diferentes
		// Se showInitTab for false, ativa a tab que clicada e desativa a ativa, se forem iguais a ativa e fechada
		changeTab: function() {
			if(!this.defaults.showInitTab && this.$target.hasClass(this.defaults.activeLinkClass)) {
				this.inactiveTab(this.$target);
			} else {
				this.inactiveTab(this.$links.filter('.' + this.defaults.activeLinkClass));
				this.activeTab(this.$target);
			}
		},

		// Ativa a tab e chama o callback para tab ativa
		activeTab: function(tab) {
			if(tab.length) {
				tab.addClass(this.defaults.activeLinkClass);
				this.defaults.beforeTabActive(tab, this.$links.index(tab));
				$(tab.attr('data-content-id')).stop(true, true).fadeIn(this.defaults.speedAnimation);
				this.defaults.afterTabActive(tab, this.$links.index(tab));
			}
		},

		// Inativa a tab e chama o callback para tab inativa
		inactiveTab: function(tab) {
			if(tab.length) {
				tab.removeClass(this.defaults.activeLinkClass);
				this.defaults.beforeTabInactive(tab, this.$links.index(tab));
				$(tab.attr('data-content-id')).stop(true, true).fadeOut(this.defaults.speedAnimation);
				this.defaults.afterTabInactive(tab, this.$links.index(tab));
			}
		},

		// Se houver alguma tab ativa, desativa ela e etiva a tab configurada como tab inicial
		activeInitTab: function() {
			this.inactiveTab(this.$links.filter('.' + this.defaults.activeLinkClass));
			if(this.$links.eq(this.defaults.initTab).length) {
				this.activeTab(this.$links.eq(this.defaults.initTab));
			} 
		}
		
	};

	$.fn.tab = function(options) {
		return this.each(function() {
			new tab(this, options).init();
	    });
	};


})(jQuery);
