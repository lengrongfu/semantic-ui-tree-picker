(function() {
  $.fn.treePicker = function(options) {
    var config, count, initialize, initializeNodes, initializeTree, loadNodes, modal, nodeClicked, nodeIsPicked, nodes, pickNode, picked, recursiveNodeSearch, renderList, renderTree, showPicked, showSearch, showTree, tabs, unpickNode, updatePickedIds, widget;
    widget = $(this);
    picked = [];
    nodes = [];
    tabs = {};
    modal = $("<div class=\"ui tree-picker modal\">\n  <i class=\"close icon\"></i>\n  <div class=\"header\">\n    " + options.name + "\n\n    <div class=\"ui menu\">\n      <a class=\"active tree item\">\n        <i class=\"list icon\"></i> Выбрать\n      </a>\n      <a class=\"picked item\">\n        <i class=\"checkmark icon\"></i> Выбранные <span class=\"count\"></span>\n      </a>\n    </div>\n  </div>\n  <div class=\"ui search form\">\n    <div class=\"field\">\n      <div class=\"ui icon input\">\n        <input type=\"text\" placeholder=\"Поиск\">\n        <i class=\"search icon\"></i>\n      </div>\n    </div>\n  </div>\n  <div class=\"content\">\n    <div class=\"ui active inverted dimmer\"><div class=\"ui text loader\">Loading data</div></div>\n    <div class=\"tree-tab\">\n      <div style=\"height: 400px\"></div>\n    </div>\n\n    <div class=\"search-tab\">\n    </div>\n\n    <div class=\"picked-tab\">\n    </div>\n  </div>\n  <div class=\"actions\">\n    <a class=\"ui blue button accept\">Accept</a>\n    <a class=\"ui button close\">Close</a>\n  </div>\n</div>").modal({
      duration: 200
    });
    count = $('.count', modal);
    tabs = {
      tree: $('.tree-tab', modal),
      search: $('.search-tab', modal),
      picked: $('.picked-tab', modal)
    };
    config = {
      displayFormat: function(picked) {
        return options.name + " (Выбрано " + picked.length + ")";
      }
    };
    $.extend(config, options);
    initialize = function() {
      if (widget.attr("data-picked-ids")) {
        config.picked = widget.attr("data-picked-ids").split(",");
      }
      if (config.picked) {
        widget.html(config.displayFormat(config.picked));
      }
      widget.on('click', function(e) {
        modal.modal('show');
        if (!nodes.length) {
          $('.ui.active.dimmer', modal).removeClass('active');
          if (config.url) {
            loadNodes(config.url, {}, function(nodes) {
              return initializeNodes(nodes);
            });
          }
          if (config.data) {
            nodes = config.data;
            return initializeNodes(nodes);
          }
        }
      });
      $('.actions .accept', modal).on('click', function(e) {
        modal.modal('close');
        if (config.onSubmit) {
          return config.onSubmit(picked);
        }
      });
      $('.menu .tree', modal).on('click', function(e) {
        return showTree();
      });
      $('.menu .picked', modal).on('click', function(e) {
        return showPicked();
      });
      return $('.search input', modal).on('keyup', function(e) {
        return showSearch($(this).val());
      });
    };
    loadNodes = function(url, params, success) {
      if (params == null) {
        params = {};
      }
      return $.get(url, params, function(response) {
        if (response.constructor === String) {
          nodes = $.parseJSON(response);
        } else {
          nodes = response;
        }
        return success(nodes);
      });
    };
    initializeNodes = function(nodes) {
      var i, id, len, ref, searchResult, tree;
      if (config.picked) {
        picked = [];
        ref = config.picked;
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          searchResult = recursiveNodeSearch(nodes, function(node) {
            return ("" + node.id) === ("" + id);
          });
          if (searchResult.length) {
            picked.push(searchResult[0]);
          }
        }
      }
      tree = renderTree(nodes, {
        height: '400px',
        overflowY: 'scroll'
      });
      tabs.tree.html(tree);
      return initializeTree(tree);
    };
    showTree = function() {
      $('.menu .item', modal).removeClass('active');
      $('.menu .tree', modal).addClass('active');
      tabs.tree.show();
      tabs.search.hide();
      return tabs.picked.hide();
    };
    showSearch = function(query) {
      var foundNodes, list;
      if (query !== null && query !== "") {
        foundNodes = recursiveNodeSearch(nodes, function(node) {
          return node.name && node.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
        });
        list = renderList(foundNodes, {
          height: '400px',
          overflowY: 'scroll'
        });
        $('.menu .item', modal).removeClass('active');
        tabs.search.show().html(list);
        tabs.tree.hide();
        tabs.picked.hide();
        initializeTree(list);
        return $('.name', list).each(function() {
          var name, regex;
          name = $(this).text();
          regex = RegExp('(' + query + ')', 'gi');
          name = name.replace(regex, "<strong class='search-query'>$1</strong>");
          return $(this).html(name);
        });
      } else {
        return showTree();
      }
    };
    showPicked = function() {
      var list;
      list = renderList(picked, {
        height: '400px',
        overflowY: 'scroll'
      });
      $('.menu .item', modal).removeClass('active');
      $('.menu .picked', modal).addClass('active');
      tabs.picked.show().html(list);
      tabs.tree.hide();
      tabs.search.hide();
      return initializeTree(list);
    };
    renderTree = function(nodes, css) {
      var i, len, node, nodeElement, tree;
      if (css == null) {
        css = {};
      }
      tree = $('<div class="ui tree-picker tree"></div>').css(css);
      for (i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        nodeElement = $("<div class=\"node\" data-id=\"" + node.id + "\" data-name=\"" + node.name + "\">\n  <div class=\"head\">\n    <i class=\"add circle icon\"></i>\n    <i class=\"minus circle icon\"></i>\n    <i class=\"radio icon\"></i>\n    <a class=\"name\">" + node.name + "</a>\n    <i class=\"checkmark icon\"></i>\n  </div>\n  <div class=\"content\"></div>\n</div>").appendTo(tree);
        if (node.nodes && node.nodes.length) {
          $('.content', nodeElement).append(renderTree(node.nodes));
        } else {
          nodeElement.addClass("childless");
        }
      }
      return tree;
    };
    renderList = function(nodes, css) {
      var i, len, list, node, nodeElement;
      if (css == null) {
        css = {};
      }
      list = $('<div class="ui tree-picker list"></div>').css(css);
      for (i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        nodeElement = $("<div class=\"node\" data-id=\"" + node.id + "\" data-name=\"" + node.name + "\">\n  <div class=\"head\">\n    <a class=\"name\">" + node.name + "</a>\n    <i class=\"checkmark icon\"></i>\n  </div>\n  <div class=\"content\"></div>\n</div>").appendTo(list);
      }
      return list;
    };
    initializeTree = function(tree) {
      return $('.node', tree).each(function() {
        var content, head, node;
        node = $(this);
        head = $('>.head', node);
        content = $('>.content', node);
        $('>.name', head).on('click', function(e) {
          return nodeClicked(node);
        });
        if (nodeIsPicked(node)) {
          node.addClass('picked');
        }
        if (!node.hasClass('childless')) {
          $('>.icon', head).on('click', function(e) {
            node.toggleClass('opened');
            return content.slideToggle();
          });
        }
        return updatePickedIds();
      });
    };
    nodeClicked = function(node) {
      node.toggleClass('picked');
      if (node.hasClass('picked')) {
        return pickNode(node);
      } else {
        return unpickNode(node);
      }
    };
    pickNode = function(node) {
      var id;
      id = node.attr('data-id');
      picked.push({
        id: id,
        name: node.attr('data-name')
      });
      updatePickedIds();
      return $(".node[data-id=" + id + "]", modal).addClass('picked');
    };
    unpickNode = function(node) {
      var id;
      id = node.attr('data-id');
      picked = picked.filter(function(n) {
        return n.id !== id;
      });
      updatePickedIds();
      return $(".node[data-id=" + id + "]", modal).removeClass('picked');
    };
    nodeIsPicked = function(node) {
      return picked.filter(function(n) {
        return ("" + n.id) === node.attr('data-id');
      }).length;
    };
    updatePickedIds = function() {
      widget.attr('data-picked-ids', picked.map(function(n) {
        return n.id;
      }));
      widget.html(config.displayFormat(picked));
      if (picked.length) {
        count.closest('.item').addClass('highlighted');
        return count.html("(" + picked.length + ")");
      } else {
        count.closest('.item').removeClass('highlighted');
        return count.html("");
      }
    };
    recursiveNodeSearch = function(nodes, comparator) {
      var i, len, node, results;
      results = [];
      for (i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        if (comparator(node)) {
          results.push({
            id: node.id,
            name: node.name
          });
        }
        if (node.nodes && node.nodes.length) {
          results = results.concat(recursiveNodeSearch(node.nodes, comparator));
        }
      }
      return results;
    };
    return initialize();
  };

}).call(this);
