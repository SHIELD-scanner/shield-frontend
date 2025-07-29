#!/usr/bin/env node
/**
 * Script to scan the app for translation keys and add missing keys to all language files.
 * Usage: npm run i18n:sync
 */
const fs = require("fs");
const path = require("path");

const LANG_DIR = path.join(__dirname, "..", "src", "lib", "i18n");
const LANGS = ["en", "nl", "de"]; // Add more language codes here as needed

function getAllFiles(dir, ext = ".tsx", files = []) {
  fs.readdirSync(dir).forEach((file) => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, ext, files);
    } else if (full.endsWith(ext) || full.endsWith(".ts")) {
      files.push(full);
    }
  });
  return files;
}

function extractKeysFromFile(file) {
  const content = fs.readFileSync(file, "utf8");
  const regex = /t\(['"`]([\w.-]+)['"`]\)/g;
  const keys = [];
  let match;
  while ((match = regex.exec(content))) {
    keys.push(match[1]);
  }
  return keys;
}

function loadLangFile(lang) {
  const file = path.join(LANG_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveLangFile(lang, obj) {
  const file = path.join(LANG_DIR, `${lang}.json`);
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function main() {
  const srcDir = path.join(__dirname, "..", "src");
  const files = getAllFiles(srcDir);
  const allKeys = new Set();
  files.forEach((f) => extractKeysFromFile(f).forEach((k) => allKeys.add(k)));

  LANGS.forEach((lang) => {
    const obj = loadLangFile(lang);
    let changed = false;
    allKeys.forEach((key) => {
      if (!(key in obj)) {
        obj[key] = lang === "en" ? key : "";
        changed = true;
      }
    });
    if (changed) {
      saveLangFile(lang, obj);
      console.log(`Updated ${lang}.ts with missing keys.`);
    }
  });
  console.log("i18n sync complete.");
}

main();
