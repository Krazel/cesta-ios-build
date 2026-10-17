import test from 'node:test';import assert from 'node:assert/strict';
import {DAY,newHistory,promptDue} from '../src/promptPolicy.ts';
const now=30*DAY;
const eligible=()=>({...newHistory(DAY),usedDays:4,completedShops:2});
test('No first-use or early support/review prompts',()=>{assert.equal(promptDue(newHistory(now),now,false,true,true),null);assert.equal(promptDue({...eligible(),firstUse:now-6*DAY},now,false,true,true),null);assert.equal(promptDue({...eligible(),usedDays:2},now,false,true,true),null);});
test('Review follows repeated successful use, never selected stars or ad incentives',()=>{assert.equal(promptDue(eligible(),now,false,true,true),'review');assert.equal(promptDue({...eligible(),lastReview:now-119*DAY,lastSupport:now-2*DAY},now,false,true,true),null);});
test('Support respects14-day cooldown, explicit never and verified subscription',()=>{const h={...eligible(),completedShops:0};assert.equal(promptDue(h,now,false,false,true),'support');assert.equal(promptDue({...h,lastSupport:now-13*DAY},now,false,false,true),null);assert.equal(promptDue({...h,lastSupport:now-14*DAY},now,false,false,true),'support');assert.equal(promptDue({...h,supportNever:true},now,false,false,true),null);assert.equal(promptDue(h,now,true,false,true),null);assert.equal(promptDue(h,now,false,false,false),null);});
test('Do not stack rating/support dialogs or prompt after clock rollback',()=>{assert.equal(promptDue({...eligible(),lastAny:now-1000},now,false,true,true),null);assert.equal(promptDue({...eligible(),firstUse:now+DAY},now,false,true,true),null);});
