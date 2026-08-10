import test from 'node:test';
import assert from 'node:assert/strict';

import { searchKnowledge, resolveTool, buildContextBlock, TOOLS } from '../src/lib/knowledge.js';
import { answerQuestion } from '../src/lib/chat.js';

/** No GEMINI_API_KEY → the retrieval-only path, which must still be useful. */
const NO_AI = {};

test('retrieval finds the right tool for everyday phrasings', async () => {
  const cases = [
    ['how do I make a qr code', 'qr-generator'],
    ['I need to shrink a photo before uploading', 'image-compressor'],
    ['generate a strong password', 'password-generator'],
    ['check my keyword density', 'keyword-density-checker'],
    ['validate some messy json', 'json-formatter-validator'],
    ['audit my website seo', 'seo-audit-tool'],
    ['what will my loan instalment be', 'emi-calculator'],
    ['pick colours out of an image', 'color-palette-extractor'],
  ];

  for (const [query, expectedId] of cases) {
    const hits = searchKnowledge(query);
    const ids = hits.tools.map((t) => t.id);
    assert.ok(
      ids.includes(expectedId),
      `"${query}" should surface ${expectedId}; got [${ids.slice(0, 4).join(', ')}]`
    );
  }
});

test('the best match ranks first for unambiguous questions', () => {
  assert.equal(searchKnowledge('qr code generator').tools[0].id, 'qr-generator');
  assert.equal(searchKnowledge('pomodoro timer').tools[0].id, 'pomodoro-timer');
  assert.equal(searchKnowledge('uuid generator').tools[0].id, 'uuid-generator');
});

test('every retrieved tool carries a real absolute URL', () => {
  const hits = searchKnowledge('seo tools for my website');
  assert.ok(hits.tools.length > 0);
  for (const tool of hits.tools) {
    assert.match(tool.url, /^https:\/\/smartgentools\.com\//, `${tool.id} has a bad URL`);
  }
});

test('resolveTool only resolves ids that exist', () => {
  assert.equal(resolveTool('qr-generator').title, 'QR Code Generator');
  assert.equal(resolveTool('totally-made-up-tool'), null);
  assert.equal(resolveTool(''), null);
  assert.equal(resolveTool(undefined), null);
});

test('the context block never leaks anything outside the catalogue', () => {
  const hits = searchKnowledge('compress an image');
  const block = buildContextBlock(hits);
  const ids = [...block.matchAll(/id:([a-z0-9-]+)/g)].map((m) => m[1]);
  assert.ok(ids.length > 0);
  for (const id of ids) {
    assert.ok(resolveTool(id), `context mentioned unknown tool id ${id}`);
  }
});

/* ------------------------------------------------------------- scoping */

test('off-topic questions are refused without calling the model', async () => {
  const offTopic = [
    'who won the world cup in 2022',
    'write me a python script to sort a list',
    'what is the capital of France',
    'give me stock tips',
  ];

  for (const question of offTopic) {
    const result = await answerQuestion({ message: question }, NO_AI);
    assert.equal(result.kind, 'off_topic', `"${question}" should be refused`);
    assert.match(result.answer, /SmartGen/);
    assert.ok(result.followUps.length > 0, 'a refusal should still offer a way forward');
  }
});

test('questions about SmartGen itself are always on topic', async () => {
  for (const question of ['what is smartgen?', 'who built this site?', 'what can you do?']) {
    const result = await answerQuestion({ message: question }, NO_AI);
    assert.notEqual(result.kind, 'off_topic', `"${question}" should be answered`);
  }
});

test('tool questions answer with sources even when the AI is unavailable', async () => {
  const result = await answerQuestion({ message: 'how do I compress an image' }, NO_AI);

  assert.equal(result.kind, 'retrieval_only');
  assert.ok(result.answer.length > 20);
  assert.ok(result.sources.length > 0);
  for (const source of result.sources) {
    assert.ok(resolveTool(source.id), `source ${source.id} is not a real tool`);
    assert.match(source.url, /^https:\/\/smartgentools\.com\//);
  }
});

test('an exact FAQ question is answered verbatim, no model needed', async () => {
  const result = await answerQuestion({ message: 'Is SmartGen really free?' }, NO_AI);
  assert.equal(result.kind, 'faq');
  assert.match(result.answer, /100% free/i);
});

test('empty and oversized input are handled without throwing', async () => {
  assert.equal((await answerQuestion({ message: '   ' }, NO_AI)).kind, 'empty');
  const long = await answerQuestion({ message: 'qr code '.repeat(500) }, NO_AI);
  assert.ok(long.answer.length > 0);
});

/* ------------------------------------------------------------ catalogue */

test('the generated index covers the whole site', () => {
  assert.ok(TOOLS.length >= 120, `expected 120+ tools, found ${TOOLS.length}`);
  const ids = new Set();
  for (const tool of TOOLS) {
    assert.ok(tool.id && tool.title && tool.url, `incomplete entry: ${JSON.stringify(tool)}`);
    assert.ok(!ids.has(tool.id), `duplicate tool id ${tool.id}`);
    ids.add(tool.id);
    assert.match(tool.url, /^https:\/\/smartgentools\.com\//);
  }
});

test('the SEO audit tool is in the chatbot index', () => {
  const tool = resolveTool('seo-audit-tool');
  assert.ok(tool, 'the new SEO audit tool must be discoverable by the chatbot');
  assert.equal(tool.url, 'https://smartgentools.com/seo-audit-tool/');
});
