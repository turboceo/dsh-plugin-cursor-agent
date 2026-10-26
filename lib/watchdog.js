(() => {
  const STYLE_ID = 'dsh-cursor-agent-theme-override';

  /**
   * Ensure the TodoPanel check-list is expanded and its list visible,
   * regardless of page scroll: the app renders the panel collapsed by
   * default, so we click its header once it appears (aria-expanded="false").
   */
  function expandTodoPanel() {
    if (typeof document === 'undefined') return;
    document
      .querySelectorAll('[data-testid="todo-panel"] button[aria-expanded="false"]')
      .forEach((btn) => btn.click());
  }

  function ensureActive() {
    let tag = document.getElementById(STYLE_ID);
    const needsExpand = Boolean(
      document.querySelector('[data-testid="todo-panel"] button[aria-expanded="false"]')
    );
    // Everything already in place: skip the heavier work.
    if (tag && !needsExpand) return;

    if (!tag) {
      tag = document.createElement('style');
      tag.id = STYLE_ID;
      document.head.appendChild(tag);
    }
    // Always move to the end of head so it overrides all runtime module stylesheets
    if (document.head.lastElementChild !== tag) {
      document.head.appendChild(tag);
    }

    // Ensure body typography uses the calligraphy font variable
    if (document.body) {
      document.body.style.setProperty('--dsw-font-family', 'var(--cursor-yanti-font)');
      document.body.style.setProperty('--dsh-font-family-text', 'var(--cursor-yanti-font)');
    }

    if (needsExpand) expandTodoPanel();
  }

  // Run on load and observe future changes
  if (typeof document !== 'undefined') {
    ensureActive();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureActive);
    }
    const observer = new MutationObserver(() => {
      ensureActive();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Retry expansion briefly in case the panel mounts async
    let tries = 0;
    const timer = setInterval(() => {
      ensureActive();
      if (++tries > 15) clearInterval(timer); // ~15s cap
    }, 1000);
  }
})();