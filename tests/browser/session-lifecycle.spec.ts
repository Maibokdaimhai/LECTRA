import { test, expect } from '@playwright/test';
test('late pre-logout bootstrap must not reinstall authenticated state after confirmed logout', async ({page})=>{
 let release!:()=>void, seen!:()=>void; const held=new Promise<void>(r=>release=r), reached=new Promise<void>(r=>seen=r);let calls=0, loggedOut=false;
 const auth={authenticated:true,user:{id:'owner-a',role:'OWNER',displayName:'Private owner identity'},csrfToken:'old-token',expiresAt:new Date(Date.now()+3600000).toISOString()};
 let releaseReads!:()=>void;const reads=new Promise<void>(r=>releaseReads=r);
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/api/auth/session'){
   calls++;if(calls===2){seen();await held;return route.fulfill({json:{data:auth}});}
   return route.fulfill({json:{data:loggedOut?{authenticated:false,user:null,csrfToken:'guest',expiresAt:null}:auth}});
  }
  if(path==='/api/auth/logout'){loggedOut=true;return route.fulfill({status:204});}
  if(path==='/api/health')return route.fulfill({json:{data:{status:'ok'}}});
  if(loggedOut){await reads;return route.fulfill({status:401,json:{error:{code:'AUTH_REQUIRED',message:'Unauthorized'}}});}
  return route.fulfill({json:{data:{items:[],pagination:{total:0,limit:20,offset:0}}}});
 });
 try{
  await page.goto('/');await expect(page.getByRole('button',{name:'Log out',exact:true})).toBeVisible();
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await reached;
  await page.getByRole('button',{name:'Log out',exact:true}).click();
  await expect.poll(()=>loggedOut).toBe(true);release();
  await expect(page.getByRole('heading',{name:'Log in',exact:true})).toBeVisible({timeout:1500});
  await expect(page.getByText('Private owner identity · Instructor',{exact:true})).toHaveCount(0);
 }finally{release();releaseReads();}
});
test('failed logout must keep private workspace hidden even if reconnect returns the still-valid session', async ({page})=>{
 let failCheck=false, loggedOut=false;let bootCalls=0;const auth={authenticated:true,user:{id:'owner-a',role:'OWNER',displayName:'Private owner identity'},csrfToken:'old-token',expiresAt:new Date(Date.now()+3600000).toISOString()};
 await page.route('**/api/**',route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/api/auth/session'){bootCalls++;return failCheck?route.fulfill({status:503,json:{error:{code:'AUTH_SERVICE_UNAVAILABLE',message:'Unavailable'}}}):route.fulfill({json:{data:loggedOut?{authenticated:false,user:null,csrfToken:'guest',expiresAt:null}:auth}});}
  if(path==='/api/auth/logout')return failCheck?route.fulfill({status:503,json:{error:{code:'AUTH_SERVICE_UNAVAILABLE',message:'Revocation failed'}}}):(loggedOut=true,route.fulfill({status:204}));
  if(path==='/api/health')return route.fulfill({json:{data:{status:'ok'}}});
  return route.fulfill({json:{data:{items:[],pagination:{total:0,limit:20,offset:0}}}});
 });
 await page.goto('/');await expect(page.getByRole('button',{name:'Log out',exact:true})).toBeVisible();
 failCheck=true;await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 await expect(page.getByRole('button',{name:'Check session / reconnect',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Log out',exact:true}).click();
 await expect(page.getByRole('button',{name:'Retry sign-out',exact:true})).toBeEnabled();
 const before=bootCalls;await expect(page.getByRole('button',{name:'Check session / reconnect',exact:true})).toHaveCount(0);
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));expect(bootCalls).toBe(before);
 await expect(page.getByRole('button',{name:'Retry sign-out',exact:true})).toBeVisible({timeout:1500});
 await expect(page.getByText('Private owner identity · Instructor',{exact:true})).toHaveCount(0);
 failCheck=false;await page.getByRole('button',{name:'Retry sign-out',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Log in',exact:true})).toBeVisible();
});
test('logout failure while an earlier session check is held must leave retry available',async({page})=>{
 let calls=0,release!:()=>void,reached!:()=>void;const held=new Promise<void>(r=>release=r),seen=new Promise<void>(r=>reached=r);
 const auth={authenticated:true,user:{id:'owner-a',role:'OWNER',displayName:'Private owner identity'},csrfToken:'token',expiresAt:new Date(Date.now()+3600000).toISOString()};
 await page.route('**/api/**',async route=>{const path=new URL(route.request().url()).pathname;
 if(path==='/api/auth/session'){calls++;if(calls===2){reached();await held;}return route.fulfill({json:{data:auth}});}
 if(path==='/api/auth/logout')return route.fulfill({status:503,json:{error:{code:'AUTH_SERVICE_UNAVAILABLE',message:'Unavailable'}}});
 if(path==='/api/health')return route.fulfill({json:{data:{status:'ok'}}});
 return route.fulfill({json:{data:{items:[],pagination:{total:0,limit:20,offset:0}}}});});
 try{await page.goto('/');await expect(page.getByRole('button',{name:'Log out',exact:true})).toBeVisible();
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await seen;
 await page.getByRole('button',{name:'Log out',exact:true}).click();
 await expect(page.getByRole('button',{name:'Retry sign-out',exact:true})).toBeEnabled({timeout:1500});
 release();await expect(page.getByRole('button',{name:'Retry sign-out',exact:true})).toBeVisible();
 await expect(page.getByText('Private owner identity · Instructor',{exact:true})).toHaveCount(0);
 }finally{release();}
});
