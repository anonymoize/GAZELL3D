import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './harness.mjs';

const profile = `<main class="page__user-profile--show"><article>
  <section class="panelV2"><div class="user-profile-card__banner">
    <div class="user-profile-card__buttons"><div x-data="dialog"><button type="button">Gift BON</button><dialog><form><input name="amount" value="10"></form></dialog></div></div>
    <div class="user-profile-card__left-block"><div class="user-profile-card__avater-username"><img class="user-profile-card__avatar"><span class="user-profile-card__username"><a href="/users/example">Example</a></span></div><div class="user-profile-card__title">Member title</div></div>
    <div class="user-profile-card__right-block"><div class="user-profile-card__meta">Public stats</div></div>
  </div></section>
  <section class="panelV2" id="about"><h2>About</h2><div>Member biography</div></section>
  <section class="user-profile__section" id="traffic"><div class="user-profile__column--traffic">Traffic</div><div class="user-profile__column--bon">BON</div></section>
  <section class="user-profile__section" id="badges"><div class="user-profile__column--badges"><a href="/badges/1">Badge</a></div></section>
  <section class="panelV2" id="warnings" x-data="warningTabs"><button type="button">Warnings</button></section>
</article></main>`;

test('profile assembly retains form state, live handlers and complete host scopes across retries', t => {
  const h = harness(profile);
  t.after(() => h.window.close());
  const page = h.document.querySelector('main');
  const button = page.querySelector('[x-data="dialog"] button');
  const scope = button.parentNode;
  const input = scope.querySelector('input');
  input.value = '25';
  let clicks = 0;
  button.addEventListener('click', () => clicks++);
  const warnings = page.querySelector('#warnings');
  const badge = page.querySelector('#badges a');
  assert.equal(h.buildUserProfileLayout(page), true);
  assert.equal(h.buildUserProfileLayout(page), true);
  assert.equal(page.querySelectorAll('.gz-profile-layout').length, 1);
  assert.equal(button.parentNode, scope);
  assert.equal(input.value, '25');
  assert.equal(page.querySelector('dialog').parentNode, scope);
  button.click();
  assert.equal(clicks, 1);
  assert.equal(page.querySelector('.gz-profile-content #warnings'), warnings);
  assert.equal(page.querySelector('.gz-profile-content #badges a'), badge);
  assert.ok(page.querySelector('.gz-profile-sidebar #traffic'));
  assert.ok(page.querySelector('.gz-profile-header .user-profile-card__username'));
});

test('profile assembly tolerates private sections being absent and waits for identity markup', t => {
  const h = harness('<main class="page__user-profile--show"><article></article></main>');
  t.after(() => h.window.close());
  const page = h.document.querySelector('main');
  assert.equal(h.buildUserProfileLayout(page), false);
  page.querySelector('article').innerHTML = '<section class="panelV2"><div class="user-profile-card__banner"><span class="user-profile-card__username">Private member</span></div></section>';
  assert.equal(h.buildUserProfileLayout(page), true);
  assert.equal(page.querySelector('.gz-profile-heading').textContent, 'Private member');
  assert.equal(page.querySelector('.gz-profile-sidebar').textContent, '');
});
