var parseXML = require('xml2js').parseString,
  GG = require("good-guy-http")(),
  Q = require('q'),
  _ = require('lodash'),
  cheerio = require('cheerio'),
  moment = require('moment');

var TVDB_RSS_URL = "http://thetvdb.com/rss/newtoday.php",
  SHORT_LIST_URL = "http://pogdesign.co.uk/cat/",
  _cache,
  _cacheShort;

module.exports = {
  getShows: getShows,
  getShortShows: getShortShows
};

function getShortList(URLSuffix) {
  var deferred = Q.defer();
  var url  = URLSuffix
    ? SHORT_LIST_URL + URLSuffix
    : SHORT_LIST_URL;

  if (_cacheShort) {
    deferred.resolve(_cacheShort);
  } else {
    GG(url)
      .then(function (response) {
        _cacheShort = response;
        deferred.resolve(response);
      });
  }
  return deferred.promise;
}

function getTodaysShows() {
  var deferred = Q.defer();
  if (_cache) {
    deferred.resolve(_cache);
  } else {
    GG(TVDB_RSS_URL)
      .then(function (response) {
        _cache = response;
        deferred.resolve(response);
      });
  }
  return deferred.promise;
}

function isAnotherMonth(today, otherDay) {
  return today.month() !== otherDay.month();
}

function getURLSuffix(date) {
  return date.format('M-YYYY');
}

function getShortShows(when) {
  var deferred = Q.defer();
  var date = moment().add(when, 'days');
  var urlSuffix;

  if (isAnotherMonth(moment(), date)) {
    urlSuffix = getURLSuffix(date);
  }

  getShortList(urlSuffix)
    .then(function (response) {
      $ = cheerio.load(response.body);
      var shows = $('#d' + date.format('_D_M_YYYY') + ' .ep');
      var episodes = [];
      shows.each(function(){
        var title = $(this).find('a:first-child').text().trim();
        var episodeNumer = $(this).find('a:last-child').text().trim();
        episodes.push(title + " [" + episodeNumer + "]");
      });
      deferred.resolve(episodes);
    });
  return deferred.promise;
}

function getShows() {
  var deferred = Q.defer();
  getTodaysShows()
    .then(function (response) {
      parseXML(response.body, function (err, result) {
        var shows = result.rss.channel[0].item
          .map(function (showInfo) {
            return showInfo.title.join();
          });
        deferred.resolve(shows);
      })
    });
  return deferred.promise;
}
