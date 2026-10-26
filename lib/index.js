import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STYLES_PATH = join(__dirname, 'styles.css');
const WATCHDOG_PATH = join(__dirname, 'watchdog.js');

let cachedCss = '';
try {
  cachedCss = readFileSync(STYLES_PATH, 'utf8');
} catch (e) {
  console.error('[dsh-plugin-cursor-agent] Failed to read styles.css:', e);
}

let cachedWatchdog = '';
try {
  cachedWatchdog = readFileSync(WATCHDOG_PATH, 'utf8');
} catch (e) {
  console.error('[dsh-plugin-cursor-agent] Failed to read watchdog.js:', e);
}

export const name = 'dsh-plugin-cursor-agent';

/**
 * Client watchdog script that ensures Cursor Agent overrides and YanTi font
 * always maintain top specificity and cascade priority even when other plugins
 * dynamically inject CSS modules during hydration. It also auto-expands the
 * TODO check-list panel and pins it above the composer.
 *
 * NOTE: this file is read from disk on every `webserver/index-inject` render
 * (like styles.css), so edits apply on the next page refresh without needing
 * the plugin module to be re-imported.
 */

/**
 * DeepSeek Harness Plugin entry for Cursor Agent Theme & YanTi Typography.
 * Injects Cursor Light styling and YanTi calligraphy CSS rules into the Web UI.
 * 
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {object} [config]
 */
export function apply(ctx, config) {
  ctx.on('webserver/index-inject', (table) => {
    let css = cachedCss;
    try {
      css = readFileSync(STYLES_PATH, 'utf8');
    } catch {
      css = cachedCss;
    }

    let watchdog = cachedWatchdog;
    try {
      watchdog = readFileSync(WATCHDOG_PATH, 'utf8');
    } catch {
      watchdog = cachedWatchdog;
    }

    // 1. Injected style in head
    table.push({
      kind: 'style',
      placement: 'head',
      text: css
    });

    // 2. Client watchdog script in body
    table.push({
      kind: 'script',
      placement: 'body',
      text: watchdog
    });
  });
}

export default {
  name,
  apply
};
