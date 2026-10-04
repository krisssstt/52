(function(){
var chips=document.getElementById('chips'),inp=document.getElementById('newSkill'),form=document.getElementById('pf'),save=form.querySelector('.save');
function add(){var v=inp.value.trim();if(!v)return;var li=document.createElement('li');li.className='chip2';var s=document.createElement('span');s.textContent=v;var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Удалить навык '+v);var im=document.createElement('img');im.src='../images/icons/ic-x.svg';im.alt='';im.width=7.8;im.height=7.8;b.appendChild(im);li.appendChild(s);li.appendChild(b);chips.appendChild(li);inp.value='';inp.focus();}
document.getElementById('addSkill').addEventListener('click',add);
inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();add();}});
chips.addEventListener('click',function(e){var b=e.target.closest('button');if(b){b.parentNode.remove();}});
form.addEventListener('submit',function(e){e.preventDefault();save.textContent='Сохранено';setTimeout(function(){save.textContent='Сохранить';},1500);});
})();
