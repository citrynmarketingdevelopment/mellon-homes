(() => {
  const root = document.querySelector('#motion-study');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('enhanced');
  ScrollCraft.mount(root);

  // Expose the painted transforms, rather than progress alone, to the review harness.
  const encounter = root.querySelector('.property-encounter');
  const stage = encounter.querySelector('.property-stage');
  function reportPaintedState() {
    const left = getComputedStyle(encounter.querySelector('.door-left'));
    const right = getComputedStyle(encounter.querySelector('.door-right'));
    const photo = getComputedStyle(encounter.querySelector('.exterior'));
    stage.dataset.scVerifyState = [left.display, left.transform, right.transform, photo.transform].join('|');
    const open = Number(getComputedStyle(encounter).getPropertyValue('--sc-p')) >= 0.72;
    stage.dataset.scVerifyHold = String(reduce.matches || innerWidth < 768 || open);
  }
  const paintObserver = new MutationObserver(reportPaintedState);
  paintObserver.observe(encounter, { attributes: true, attributeFilter: ['style'] });
  reportPaintedState();

  const guidance = document.querySelector('.guidance-copy');
  const situations = [...document.querySelectorAll('[data-situation]')];
  let currentSituation = 'delinquency';
  for (const detail of situations) {
    detail.addEventListener('toggle', () => {
      if (!detail.open || currentSituation === detail.dataset.situation) return;
      currentSituation = detail.dataset.situation;
      const source = detail.querySelector('.inline-guidance');
      guidance.replaceChildren(source.querySelector('h3').cloneNode(true), source.querySelector('p').cloneNode(true));
      guidance.classList.remove('changed');
      if (!reduce.matches) requestAnimationFrame(() => guidance.classList.add('changed'));
    });
  }
  const tabs = [...document.querySelectorAll('[role=tab]')];
  function selectStage(tab, focus = false) {
    for (const item of tabs) {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      panel.hidden = !active;
      panel.classList.remove('changed');
      if (active && !reduce.matches) requestAnimationFrame(() => panel.classList.add('changed'));
    }
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStage(tab));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectStage(tabs[next], true);
    });
  });
  const dialog = document.querySelector('#preview-dialog');
  let opener;
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    const listing = button.dataset.dialog === 'listing';
    document.querySelector('#dialog-title').textContent = listing ? 'Mellon listings' : 'Your home search';
    document.querySelector('#dialog-copy').textContent = listing
      ? 'These photographs illustrate an identical build. Contact Ian to confirm which Mellon properties are available, their pricing, and current details.'
      : `Design preview: ${document.querySelector('#area').value}, ${document.querySelector('#budget').value.toLowerCase()}. An approved listing feed has not been connected. No search has been submitted.`;
    dialog.showModal();
  }));
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  dialog.querySelector('a').addEventListener('click', () => dialog.close());
})();
