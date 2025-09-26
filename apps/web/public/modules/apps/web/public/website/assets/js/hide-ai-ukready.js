(function(){
  const tests=[/AI\s*built\s*in/i,/UK[\u2011\- ]?ready/i];
  const nodes=[...document.querySelectorAll('section,div,article,li')];
  for(const el of nodes){
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(tests.every(rx=>rx.test(t))){ el.remove(); }
  }
})();
