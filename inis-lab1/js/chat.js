(function(){
var f=document.getElementById('cf'),i=document.getElementById('msg'),more=document.getElementById('more'),inner=document.getElementById('chatIn'),chat=document.getElementById('chat');
function t(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
f.addEventListener('submit',function(e){e.preventDefault();var v=i.value.trim();if(!v){return;}var w=document.createElement('div');w.className='m-out';var b=document.createElement('div');b.className='bub-d';b.textContent=v;var tm=document.createElement('span');tm.className='time';tm.textContent=t();w.appendChild(b);w.appendChild(tm);more.appendChild(w);i.value='';inner.style.height=(528+more.offsetHeight+12)+'px';chat.scrollTop=chat.scrollHeight;});
})();
