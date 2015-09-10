/*jslint forin: true */

;(function($) {
    $.fn.extend({
        mention: function(options) {
            this.opts = {
                users: [],
                delimiter: '@',
                sensitive: true,
                queryBy: 'name',
                typeaheadOpts: {}
            };

            var settings = $.extend({}, this.opts, options),
                _checkDependencies = function() {
                    if (typeof $ == 'undefined') {
                        throw new Error("jQuery is Required");
                    }
                    else {
                        if (typeof $.fn.typeahead == 'undefined') {
                            throw new Error("Typeahead is Required");
                        }
                    }
                    return true;
                },
                _extractCurrentQuery = function(query, caratPos) {
                    var i;
                    for (i = caratPos; i >= 0; i--) {
                        if (query[i] == settings.delimiter) {
                            break;
                        }
                    }
                    return query.substring(i, caratPos);
                },
                _matcher = function () {
                    if (this.query.toLowerCase().indexOf(settings.delimiter) > -1) {
                        var lastQuery = this.query.toLowerCase().substring(this.query.toLowerCase().lastIndexOf(settings.delimiter) + 1);
                        if (lastQuery.indexOf(' ') == -1 && lastQuery.length > 0) {
                            return true;
                        }
                    }
                    return false;
                },
                _updater = function(item) {
                    var data = this.query,
                        caratPos = this.$element[0].selectionStart,
                        i;
                    
                    for (i = caratPos; i >= 0; i--) {
                        if (data[i] == settings.delimiter) {
                            break;
                        }
                    }
                    var replace = data.substring(i, caratPos),
                    	textBefore = data.substring(0, i),
                    	textAfter = data.substring(caratPos),
                    	data = textBefore + settings.delimiter + item + textAfter;
                    	
                    this.tempQuery = data;
                    return data;
                },
                _sorter = function(items) {
                    if (items.length && settings.sensitive) {
                        var currentUser = _extractCurrentQuery(this.query, this.$element[0].selectionStart).substring(1),
                            i, len = items.length,
                            priorities = {
                                highest: [],
                                high: [],
                                med: [],
                                low: []
                            }, finals = [];
                        if (currentUser.length == 1) {
                            for (i = 0; i < len; i++) {
                                var currentRes = items[i];

                                if ((currentRes.name[0] == currentUser)) {
                                    priorities.highest.push(currentRes);
                                }
                                else if ((currentRes.name[0].toLowerCase() == currentUser.toLowerCase())) {
                                    priorities.high.push(currentRes);
                                }
                                else if (currentRes.name.indexOf(currentUser) != -1) {
                                    priorities.med.push(currentRes);
                                }
                                else {
                                    priorities.low.push(currentRes);
                                }
                            }
                            for (i in priorities) {
                                var j;
                                for (j in priorities[i]) {
                                    finals.push(priorities[i][j]);
                                }
                            }
                            return finals;
                        }
                    }
                    return items;
                },
                _render = function (items) {
                    var that = this;
                    items = $(items).map(function(i, item) {

                        i = $(that.options.item).attr('data-value', item.name);

                        var _linkHtml = $('<div />');

                        if (item.image) {
                            _linkHtml.append('<img class="mention_image" src="' + item.image + '">');
                        }
                        if (item.name) {
                            _linkHtml.append('<b class="mention_name">' + item.name + '</b>');
                        }

                        i.find('a').html(that.highlighter(_linkHtml.html()));
                        return i[0];
                    });

                    items.first().addClass('active');
                    this.$menu.html(items);
                    return this;
                };

            $.fn.typeahead.Constructor.prototype.render = _render;

            return this.each(function() {
                var _this = $(this);
                if (_checkDependencies()) {
                    _this.typeahead($.extend({
                        source: settings.users,
                        matcher: _matcher,
                        updater: _updater,
                        sorter: _sorter
                    }, settings.typeaheadOpts));
                }
            });
        }
    });
})(jQuery);
