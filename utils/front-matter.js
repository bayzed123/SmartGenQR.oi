'use strict';

const yaml = require('js-yaml');

const FRONT_MATTER_PATTERN = /^(?:\ufeff)?---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/;

function parseFrontMatter(input) {
  const source = String(input || '');
  const match = FRONT_MATTER_PATTERN.exec(source);
  if (!match) {
    return { data: {}, content: source, attributes: {}, body: source };
  }

  const parsed = yaml.load(match[1]) || {};
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new TypeError('Front matter must be a YAML object');
  }

  const content = source.slice(match[0].length);
  return { data: parsed, content, attributes: parsed, body: content };
}

module.exports = parseFrontMatter;
module.exports.test = (input) => FRONT_MATTER_PATTERN.test(String(input || ''));
