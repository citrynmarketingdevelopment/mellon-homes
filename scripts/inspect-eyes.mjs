import { chromium } from 'playwright-core';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1400,height:1250},deviceScaleFactor:3});
await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject();Element.prototype.setPointerCapture=()=>{};Element.prototype.releasePointerCapture=()=>{};});
const page=await context.newPage();
await page.goto('http://127.0.0.1:3010/images/mellon-mascot.png');
await page.evaluate(()=>{document.body.style.margin='0';const image=document.querySelector('img');image.style.cssText='display:block;width:1312px;height:1199px;max-width:none;';});
await page.screenshot({path:'assets/previews/landing/original-eyes-detail.png',clip:{x:480,y:460,width:480,height:210}});
await browser.close();
