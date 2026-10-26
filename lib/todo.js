import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * dsh-plugin-cursor-agent-todo
 *
 * Separate plugin entry (fresh module URL => imported immediately, no stale
 * module cache) that injects the client watchdog which auto-expands the
 * TODO check-list panel and pins it above the composer.
 *
 * The script text is read from disk on every render (same trick as
 * styles.css in the main plugin), so edits to watchdog.js apply on the next
 * page refresh without restarting the app.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const WATCHDOG_PATH = join(__dirname, 'watchdog.js');

let cachedWatchdog = '';
try {
  cachedWatchdog = readFileSync(WATCHDOG_PATH, 'utf8');
} catch (e) {
  console.error('[dsh-plugin-cursor-agent-todo] Failed to read watchdog.js:', e);
}

export const name = 'dsh-plugin-cursor-agent-todo';

export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    let watchdog = cachedWatchdog;
    try {
      watchdog = readFileSync(WATCHDOG_PATH, 'utf8');
    } catch {
      watchdog = cachedWatchdog;
    }

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