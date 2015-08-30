var AlfredNode = require('alfred-workflow-nodejs');
var actionHandler = AlfredNode.actionHandler;
var workflow = AlfredNode.workflow;
workflow.setName("tvshow-calendar");
var Item = AlfredNode.Item;

var TVDB = require('./tvdb');
var _query;

function filterAndDisplayShows(shows) {
  shows
    .filter(function (show) {
      var re = new RegExp(_query, 'i');
      return re.test(show);
    })
    .forEach(function (show, i) {
      var item = new Item({
        title: show,
        arg: 'query'
      });
      workflow.addItem(item);
    });
  workflow.feedback();
}

function filterAndDisplayShortList(shows) {
  shows
    .forEach(function (show, i) {
      var item = new Item({
        title: show,
        arg: 'query'
      });
      workflow.addItem(item);
    });
  workflow.feedback();
}

(function main() {
  actionHandler.onAction("shortList", function (query) {
    var when;
    _query = query;

    switch (query) {
      case 'yesterday':
        when = -1;
        break;
      case 'tomorrow':
        when = 1;
        break;
    }
    TVDB
      .getShortShows(when)
      .then(filterAndDisplayShortList);
  });

  actionHandler.onAction("longList", function (query) {
    _query = query;
    TVDB
      .getShows()
      .then(filterAndDisplayShows);

  });

  AlfredNode.run();
})();