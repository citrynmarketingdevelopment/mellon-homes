import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
function check(condition, message) { if (!condition) throw new Error(message); }
async function context(options) {
  const ctx = await browser.newContext(options);
  await ctx.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.reject(new Error('Native pointer lock disabled'));
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    Document.prototype.exitPointerLock = () => {};
  });
  return ctx;
}
try {
  for (const [name, width, height, reduced] of [
    ['desktop',1440,900,false],['tablet',768,1024,false],['phone',390,844,false],['compact',360,640,false],['reduced',1440,900,true]
  ]) {
    const ctx=await context({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
    const page=await ctx.newPage();
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('requestfailed', r=>errors.push(r.url()));
    await page.goto('http://127.0.0.1:3021/',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: overflow`);
    check(await page.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),`${name}: missing images`);
    if(name==='desktop'){
      const bounds=await page.locator('.property-encounter').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight}));
      const states=[];
      for(const [label,p] of [['opening',0],['middle',.36],['resolved',.78]]){
        await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),bounds.top+(bounds.height-height)*p);
        await page.waitForTimeout(180);
        states.push(await page.locator('.door-left').evaluate(el=>getComputedStyle(el).transform));
        await page.locator('.property-figure').screenshot({path:path.join(root,'assets',`reveal-${label}.png`)});
      }
      check(new Set(states).size===3,'Reveal transforms did not change');
      await page.locator('[data-situation=divorce] summary').click();
      await page.waitForTimeout(200);
      check(await page.locator('.guidance h3').innerText()==='A neutral, professional approach.','Divorce guidance did not update');
      await page.getByRole('tab',{name:'Ready to build'}).click();
      check(await page.locator('#ready').isVisible(),'Ready stage unavailable');
      check(await page.locator('#ready article').count()===2,'Incorrect ready project count');
      await page.getByRole('tab',{name:'Ready to build'}).press('ArrowRight');
      check(await page.locator('#planning').isVisible(),'Keyboard stage navigation failed');
      check(await page.locator('#planning article').count()===3,'Incorrect planning count');
      await page.locator('[data-dialog=market]').click();
      check(await page.locator('dialog').isVisible(),'Market preview did not open');
      check((await page.locator('#dialog-copy').innerText()).includes('No search has been submitted.'),'False search result');
      await page.keyboard.press('Escape');
      check(!await page.locator('dialog').isVisible(),'Escape did not close dialog');
      check(await page.locator('[data-dialog=market]').evaluate(el=>document.activeElement===el),'Focus not restored');
    }
    if(width<768||reduced){
      check(await page.locator('.door').first().evaluate(el=>getComputedStyle(el).display==='none'),`${name}: doors should be removed`);
      check(await page.locator('.property-stage').evaluate(el=>getComputedStyle(el).position!=='sticky'),`${name}: pinning remains active`);
    }
    if(width<768){
      await page.locator('[data-situation=probate] summary').click();
      check(await page.locator('[data-situation=probate] .inline-guidance').isVisible(),`${name}: mobile guidance hidden`);
    }
    await page.locator('#seller-support').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(root,'lab',`${name}-support.png`)});
    await page.locator('.process').scrollIntoViewIfNeeded();
    await page.waitForTimeout(850);
    check(await page.locator('.process article').evaluateAll(items=>items.every(el=>getComputedStyle(el).opacity==='1')),`${name}: process steps did not appear`);
    await page.screenshot({path:path.join(root,'lab',`${name}-process.png`)});
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({path:path.join(root,'lab',`${name}-contact.png`)});
    check(await page.locator('a[href="tel:+16618052481"]').count()===1,'Phone link missing');
    check(errors.length===0,`${name}: ${errors.join(', ')}`);
    results.push({name,width,height,reduced,passed:true});
    await ctx.close();
  }
  const ctx=await context({viewport:{width:390,height:844},javaScriptEnabled:false});
  const page=await ctx.newPage();
  await page.goto('http://127.0.0.1:3021/');
  check(await page.locator('.door').first().evaluate(el=>getComputedStyle(el).display==='none'),'No-JS image obscured');
  await page.locator('[data-situation=divorce] summary').click();
  check(await page.locator('[data-situation=divorce] .inline-guidance').isVisible(),'No-JS disclosure unavailable');
  results.push({name:'no-javascript',passed:true});
  await ctx.close();
  await fs.writeFile(path.join(root,'lab','interaction-checks.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally { await browser.close(); }
