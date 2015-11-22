'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var ArticleSchema = new Schema({
  content: String,
  url: String,
  author: {type: Schema.Types.ObjectId, ref: "User"},
  category: String
});
ArticleSchema.plugin(timestamps);
module.exports = mongoose.model('Article', ArticleSchema);