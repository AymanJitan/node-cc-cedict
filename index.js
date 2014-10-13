var _ = require('underscore');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(null, null, null, {
  dialect: 'sqlite',
  storage: './db/cc-cedict.sqlite'
});

var Word = sequelize.define('Word', {
  traditional: Sequelize.STRING,
  simplified: Sequelize.STRING,
  pronunciation: Sequelize.STRING,
  definitions: Sequelize.STRING
});

// convert between traditional and simplified
var cnchars = require('cn-chars');
// prettify the pinyin default (letters + numbers) in CC-CEDICT
var pinyin = require('prettify-pinyin');

module.exports.searchByChinese = function(str, cb){
  var simplified = str.slice().split('');
  var traditional = str.slice().split('');
  for (var i = 0; i < str.length; i++){
    simplified[i] = cnchars.toSimplifiedChar(str[i]);
    traditional[i] = cnchars.toTraditionalChar(str[i]);
  }
  simplified = simplified.join('');
  traditional = traditional.join('');

  // default search is simplified unless input string is traditional
  var query = {
    where: {simplified: simplified}
  };
  if (traditional === str){
    query.where = {traditional: traditional};
  }

  Word
    .findAll(query)
    .then(function(words){
      var results = [];
      _.each(words, function(word){
        var pronunciation = word.pronunciation;
        var prettified = pinyin.prettify(pronunciation.slice(1, pronunciation.length - 1));
        results.push({
          traditional: word.traditional,
          simplified: word.simplified,
          pronunciation: prettified,
          definitions: word.definitions
        });
      });
      cb(results);
  });
};

module.exports.searchByEnglish = function(str, cb){
  // TODO
};