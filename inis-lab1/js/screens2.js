(function(){
var seg=document.getElementById('seg');
if(seg){seg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b){return;}seg.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});});}
var chips=document.getElementById('chips');
if(chips){chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b){return;}chips.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});});}
var q=document.getElementById('q');
if(q){q.addEventListener('input',function(){var v=q.value.trim().toLowerCase();document.querySelectorAll('.kcard').forEach(function(c){var t=(c.querySelector('.kc').getAttribute('aria-label')||'').toLowerCase();c.hidden=v!==''&&t.indexOf(v)<0;});});}
document.querySelectorAll('.starb,#fav').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true');});});
})();
