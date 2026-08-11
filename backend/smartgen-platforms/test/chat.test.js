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

/* ------------------------------------------------------------ small talk */
//
// All of these previously fell through to either the off-topic refusal or
// (worse) a full catalogue dump, because greetings/thanks/"how are you"
// tokenize to nothing the retrieval index recognises, and "are you" was
// being matched by the generic SITE_INTENT pattern meant for "are you a
// bot?"-style questions. A live-key run against real Gemini surfaced this;
// these lock the fix in without needing a network call.

test('greetings get a warm reply, not a refusal or a catalogue dump', async () => {
  for (const message of ['hi', 'hello', 'hey', 'hiya', 'good morning', 'hello there']) {
    const result = await answerQuestion({ message }, NO_AI);
    assert.equal(result.kind, 'small_talk', `"${message}" should be small talk`);
    assert.ok(result.answer.length > 0);
    assert.doesNotMatch(result.answer, /free tools, all no-signup/, 'must not be the catalogue tour');
    assert.doesNotMatch(result.answer, /I'm the SmartGen assistant, so I can only help/, 'must not be the refusal');
  }
});

test('"how are you" is small talk, not a catalogue dump', async () => {
  // This was the sharpest bug: SITE_INTENT's bare "are you" matched the "are
  // you" inside "how are you", and with zero retrieval score it fell into the
  // "on-topic but no document" branch, which returns the full tool catalogue.
  const result = await answerQuestion({ message: 'how are you' }, NO_AI);
  assert.equal(result.kind, 'small_talk');
  assert.doesNotMatch(result.answer, /free tools, all no-signup/);
});

test('thanks and farewells are acknowledged, not refused', async () => {
  for (const message of ['thanks', 'thank you', 'thx', 'cheers']) {
    const result = await answerQuestion({ message }, NO_AI);
    assert.equal(result.kind, 'small_talk', `"${message}"`);
    assert.match(result.answer, /welcome/i);
  }
  for (const message of ['bye', 'goodbye', 'see ya']) {
    const result = await answerQuestion({ message }, NO_AI);
    assert.equal(result.kind, 'small_talk', `"${message}"`);
  }
});

test('a real question that happens to open with a greeting is still answered', async () => {
  const result = await answerQuestion({ message: 'hi there, is my data safe' }, NO_AI);
  assert.notEqual(result.kind, 'small_talk');
  assert.match(result.answer, /privacy-first|locally|browser/i);
});

test('self-referential questions get a direct answer, not small talk noise', async () => {
  const result = await answerQuestion({ message: 'are you a bot' }, NO_AI);
  assert.equal(result.kind, 'small_talk');
  assert.match(result.answer, /SmartGen AI Assistant/);
});

test('"what is smartgen" answers from the real FAQ, not an empty or generic reply', async () => {
  // Regression: this intent looked up FAQS.find(...).body, but raw FAQ
  // entries carry the text in `.answer` — the bug shipped an `undefined`
  // answer to every visitor who asked, silently, until a live-key run caught it.
  for (const message of ['what is smartgen', 'what is smartgentools?', 'tell me about smartgen']) {
    const result = await answerQuestion({ message }, NO_AI);
    assert.equal(result.kind, 'about', `"${message}"`);
    assert.equal(typeof result.answer, 'string');
    assert.match(result.answer, /all-in-one digital and web utility platform/, `"${message}"`);
  }
});

test('"who built you" names the real founder, not the catalogue', async () => {
  const result = await answerQuestion({ message: 'who built you' }, NO_AI);
  assert.equal(result.kind, 'about');
  assert.match(result.answer, /Sayad Md Bayezid Hosan/);
  assert.doesNotMatch(result.answer, /free tools, all no-signup/);
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
