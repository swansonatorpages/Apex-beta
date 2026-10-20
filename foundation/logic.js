(function(root){
const START='2026-10-19';
const day=d=>new Date(d+'T12:00:00Z');
const add=(d,n)=>{const t=day(d);t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
const diff=(a,b)=>Math.round((day(a)-day(b))/86400000);
const week=d=>add(d,-day(d).getUTCDay());
const range=(a,b)=>Array.from({length:Math.max(0,diff(b,a)+1)},(_,i)=>add(a,i));
const blank=()=>({version:1,start:START,records:{},weeks:{},phase2:null,strictBed:false,bedReviewDone:false,week3Reviewed:false,achievement90:false,activity:{}});
const rec=(s,d)=>s.records[d]||{};
function bedCount(s,w){let buffers=0,passes=0,count=0;range(w,add(w,5)).forEach(d=>{const b=rec(s,d).bed;if(b==='on')count++;if(b==='buffer'&&++buffers<=2)count++;if(b==='excused'&&++passes<=1)count++});return {count,buffers,passes}}
function assess(s,w){const from=s.start>w?s.start:w;const days=range(from,add(w,5));const target=Math.max(1,days.length-1);const lights=days.filter(d=>!!rec(s,d).light).length;const wr=s.weeks[w]||{};const credit=wr.lightRecovery?1:0;const windowDays=range(from,add(w,6));const resets=windowDays.filter(d=>rec(s,d).contentReset);const holds=windowDays.flatMap(d=>(rec(s,d).holds||[]).map(h=>({...h,date:d})));const holdOK=holds.length===0||(holds.length===1&&holds[0].recovered&&holds[0].date<=add(w,5));const confirmed=days.every(d=>rec(s,d).integrity);const bedActive=!!s.phase2&&w>=s.phase2;const bed=bedCount(s,w);const bedTarget=(s.strictFrom&&w>=s.strictFrom)?6:5;const ready=lights+credit>=target&&resets.length===0&&holdOK&&confirmed&&(!bedActive||bed.count>=bedTarget);return {days,target,lights,credit,holds,resets,confirmed,bedActive,bed,bedTarget,ready}}
function update(s,today){if(!s.phase2){for(let w=week(s.start);w<week(today);w=add(w,7)){if(assess(s,w).ready){s.phase2=add(w,7);break}}}if(streak(s,today)>=90)s.achievement90=true;return s}
function streak(s,today){let n=0;let d=rec(s,today).integrity?today:add(today,-1);for(;d>=s.start;d=add(d,-1)){const r=rec(s,d);if(!r.integrity||r.contentReset)break;n++}return n}
function validate(s){if(!s||s.version!==1||s.start!==START||!s.records||!s.weeks||!s.activity)throw Error('This is not an Apex Foundation beta backup.');if(s.phase2!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(s.phase2))throw Error('Invalid phase date.');for(const [d,r] of Object.entries(s.records)){if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!r||typeof r!=='object'||(r.light&&!['outdoor','desk'].includes(r.light))||(r.bed&&!['on','buffer','excused','miss'].includes(r.bed))||(r.holds&&!Array.isArray(r.holds)))throw Error('Invalid daily record.')}return s}
const api={START,add,diff,week,range,blank,rec,assess,update,streak,validate,bedCount};root.Apex=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
