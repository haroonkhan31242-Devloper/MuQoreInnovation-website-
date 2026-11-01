/**
 * Discourages casual inspection of the site: blocks the common
 * DevTools / view-source shortcuts and the right-click menu, and leaves a
 * one-time console notice when DevTools looks docked open.
 *
 * This is a deterrent only. DevTools can still be opened from the browser
 * menu or with JavaScript disabled, so nothing secret may live in the
 * frontend; keys and credentials stay on the server (app.ts, mailer.ts).
 */

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

function isInspectShortcut(e: KeyboardEvent) {
  if (e.key === 'F12') return true;
  const key = e.key.toLowerCase();
  // Windows/Linux: Ctrl+Shift+I/J/C/K; macOS: Cmd+Option+I/J/C
  if ((e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey)) {
    if (['i', 'j', 'c', 'k'].includes(key) || ['KeyI', 'KeyJ', 'KeyC', 'KeyK'].includes(e.code)) return true;
  }
  // View source: Ctrl+U, Cmd+Option+U
  if ((e.ctrlKey || (e.metaKey && e.altKey)) && (key === 'u' || e.code === 'KeyU')) return true;
  return false;
}

export function installDevtoolsGuard() {
  window.addEventListener(
    'keydown',
    (e) => {
      if (isInspectShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true },
  );

  // Form fields keep their menu so visitors can still paste into them
  document.addEventListener('contextmenu', (e) => {
    if (!isEditable(e.target)) e.preventDefault();
  });

  // A docked DevTools panel shrinks the viewport well below the window size.
  // Checked only on resize, and the notice is shown once, so it costs nothing.
  let warned = false;
  const checkDocked = () => {
    if (warned) return;
    const gap = Math.max(window.outerWidth - window.innerWidth, window.outerHeight - window.innerHeight);
    if (gap > 200) {
      warned = true;
      console.log(
        '%cMuQore Innovation%c\nThis console is intended for developers. Please do not paste code here that someone sent you.',
        'font-size:18px;font-weight:700;color:#fca311',
        'font-size:13px',
      );
    }
  };
  window.addEventListener('resize', checkDocked, { passive: true });
  checkDocked();
}
