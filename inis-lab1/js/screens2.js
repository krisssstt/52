(() => {
  const seg=document.getElementById('seg');
  seg?.addEventListener('click',event=>{const button=event.target.closest('button'); if(!button)return; seg.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b===button);b.setAttribute('aria-selected',String(b===button));});});
  const chips=document.getElementById('chips');
  chips?.addEventListener('click',event=>{const button=event.target.closest('button');if(button)chips.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===button));});
  const key='inis.favorite-questions.v1'; let favorites=new Set();
  try { const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))favorites=new Set(saved.filter(x=>typeof x==='string')); } catch {}
  const favoriteView=new URLSearchParams(location.search).get('view')==='favorites';
  const query=document.getElementById('q'),empty=document.getElementById('empty-questions');
  const filter=()=>{
    let visible=0; const text=(query?.value||'').trim().toLowerCase();
    document.querySelectorAll('.kcard').forEach(card=>{
      const matches=card.querySelector('.kc').getAttribute('aria-label').toLowerCase().includes(text);
      card.hidden=!matches||(favoriteView&&!favorites.has(card.dataset.question));
      if(!card.hidden)visible++;
    });
    if(empty){empty.hidden=visible!==0;empty.textContent=favoriteView?'В избранном пока нет подходящих вопросов. Добавьте их с помощью звёздочки в базе знаний.':'Вопросы не найдены.';}
  };
  if(favoriteView){const title=document.querySelector('.app-header h1');if(title)title.textContent='Избранное';}
  query?.addEventListener('input',filter);
  document.getElementById('sf')?.addEventListener('submit',e=>e.preventDefault());
  document.querySelectorAll('.starb,#fav').forEach(button=>{
    const id=button.dataset.question||button.closest('.kcard')?.dataset.question;
    button.setAttribute('aria-pressed',String(favorites.has(id)));
    button.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      if(favorites.has(id))favorites.delete(id);else favorites.add(id);
      button.setAttribute('aria-pressed',String(favorites.has(id)));
      try{localStorage.setItem(key,JSON.stringify([...favorites]));}catch{}
      filter();
    });
  });
  filter();
})();
