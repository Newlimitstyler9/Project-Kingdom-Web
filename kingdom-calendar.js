// Shared River Reckoning calendar: four five-day months, two visible years of age per year.
(function(root){'use strict';
const MONTHS=['Bloom','Highsun','Harvest','Frost'],DAYS_PER_MONTH=5,DAYS_PER_YEAR=20,START_YEAR=274;
function date(absoluteDay){const index=Math.max(0,(absoluteDay|0)-1);return {year:START_YEAR+Math.floor(index/DAYS_PER_YEAR),month:MONTHS[Math.floor(index%DAYS_PER_YEAR/DAYS_PER_MONTH)],monthIndex:Math.floor(index%DAYS_PER_YEAR/DAYS_PER_MONTH),day:index%DAYS_PER_MONTH+1,yearDay:index%DAYS_PER_YEAR+1}}
function seasonFor(day){return ['Spring','Summer','Autumn','Winter'][date(day).monthIndex]}
function birthdayFor(id){let hash=2166136261;for(const char of String(id)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)>>>0}return hash%DAYS_PER_YEAR+1}
function isBirthday(absoluteDay,birthday){return absoluteDay>1&&date(absoluteDay).yearDay===birthday}
function formatDate(day){const d=date(day);return d.month+' '+d.day+', RR '+d.year}
function formatTime(hour,minute=0){const h=((hour%24)+24)%24,m=Math.max(0,Math.min(59,minute|0));return (h%12||12)+':'+String(m).padStart(2,'0')+(h<12?' AM':' PM')}
function format(day,hour,minute=0){return formatDate(day)+' · '+formatTime(hour,minute)}
root.KingdomCalendar={MONTHS,DAYS_PER_MONTH,DAYS_PER_YEAR,START_YEAR,date,seasonFor,birthdayFor,isBirthday,formatDate,formatTime,format};
})(typeof window!=='undefined'?window:globalThis);
