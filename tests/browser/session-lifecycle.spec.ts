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

test('logout retry drains the old bootstrap then reconciles without restoring its authenticated identity', async ({ page }) => {
 const auth = { authenticated: true, user: { id: 'owner-a', role: 'OWNER', displayName: 'Private owner identity' }, csrfToken: 'obsolete', expiresAt: new Date(Date.now() + 3600000).toISOString() };
 let calls = 0, posts = 0, releaseOld!: () => void, oldSeen!: () => void, freshSeen!: () => void, releaseFresh!: () => void, postSeen!: () => void, releasePost!: () => void;
 const old = new Promise<void>(r => releaseOld = r), seen = new Promise<void>(r => oldSeen = r);
 const fresh = new Promise<void>(r => releaseFresh = r), checked = new Promise<void>(r => freshSeen = r);
 const post = new Promise<void>(r => releasePost = r), posted = new Promise<void>(r => postSeen = r);
 await page.route('**/api/**', async route => {
  const path = new URL(route.request().url()).pathname;
  if (path === '/api/auth/session') {
   calls++;
   if (calls === 2) { oldSeen(); await old; return route.fulfill({ json: { data: { ...auth, csrfToken: 'stale-body' } } }); }
   if (calls === 3) { freshSeen(); await fresh; return route.fulfill({ json: { data: { ...auth, csrfToken: 'current-cookie-token' } } }); }
   return route.fulfill({ json: { data: posts === 2 ? { authenticated: false, user: null, csrfToken: 'guest', expiresAt: null } : auth } });
  }
  if (path === '/api/auth/logout') {
   posts++;
   if (posts === 1) return route.fulfill({ status: 503, json: { error: { code: 'AUTH_SERVICE_UNAVAILABLE' } } });
   expect(route.request().headers()['x-csrf-token']).toBe('current-cookie-token');
   postSeen(); await post;
   return route.fulfill({ status: 204 });
  }
  if (path === '/api/health') return route.fulfill({ json: { data: { status: 'ok' } } });
  return route.fulfill({ json: { data: { items: [], pagination: { total: 0, limit: 20, offset: 0 } } } });
 });
 try {
  await page.goto('/'); await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await seen;
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry sign-out', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Retry sign-out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry sign-out', exact: true })).toBeDisabled();
  expect(posts).toBe(1); expect(calls).toBe(2);
  releaseOld(); await checked;
  expect(posts).toBe(1); await expect(page.locator('.workspace')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Signing out', exact: true })).toBeVisible();
  releaseFresh();
  await posted;
  await expect(page.locator('.workspace')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Signing out', exact: true })).toBeVisible();
  releasePost();
  await expect(page.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
  expect(posts).toBe(2);
 } finally { releaseOld(); releaseFresh(); releasePost(); }
});

test('failed retry reconciliation sends no logout POST and requires another deliberate retry', async ({ page }) => {
 let posts = 0, failCheck = false;
 const auth = { authenticated: true, user: { id: 'owner-a', role: 'OWNER', displayName: 'Private owner identity' }, csrfToken: 'token', expiresAt: new Date(Date.now() + 3600000).toISOString() };
 await page.route('**/api/**', route => {
  const path = new URL(route.request().url()).pathname;
  if (path === '/api/auth/session') return failCheck
   ? route.fulfill({ status: 503, json: { error: { code: 'AUTH_SERVICE_UNAVAILABLE', message: 'Internal details must not be rendered' } } })
   : route.fulfill({ json: { data: posts === 2 ? { authenticated: false, user: null, csrfToken: 'guest', expiresAt: null } : auth } });
  if (path === '/api/auth/logout') { posts++; return posts === 1 ? route.fulfill({ status: 503, json: { error: { code: 'AUTH_SERVICE_UNAVAILABLE' } } }) : route.fulfill({ status: 204 }); }
  if (path === '/api/health') return route.fulfill({ json: { data: { status: 'ok' } } });
  return route.fulfill({ json: { data: { items: [], pagination: { total: 0, limit: 20, offset: 0 } } } });
 });
 await page.goto('/'); await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Log out', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Retry sign-out', exact: true })).toBeEnabled();
 failCheck = true;
 await page.getByRole('button', { name: 'Retry sign-out', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Retry sign-out', exact: true })).toBeEnabled();
 expect(posts).toBe(1);
 await expect(page.locator('.workspace')).toHaveCount(0);
 await expect(page.getByText('Internal details must not be rendered', { exact: true })).toHaveCount(0);
 failCheck = false;
 await page.getByRole('button', { name: 'Retry sign-out', exact: true }).click();
 await expect(page.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
 expect(posts).toBe(2);
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
