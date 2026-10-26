/* 5S three-stage compare view — overrides openModal/renderModalBody */
(function(){
  var css = `.compare-head{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:8px;margin:10px 0 6px;font-size:.78rem;color:#a89a86;font-weight:700}
.compare-row{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:8px;align-items:start}
@media(max-width:720px){.compare-head,.compare-row{grid-template-columns:1fr}.compare-head{display:none}.col-label{display:block!important;font-size:.72rem;color:#f5a623;margin-bottom:4px;font-weight:700}}
.col-label{display:none}
.stage-col{background:#0f0d0a;border:1px solid #3d3428;border-radius:10px;padding:8px;min-height:48px}
.stage-col .sc{font-size:1.1rem;font-weight:800;color:#fcd34d}
.stage-col .nt{font-size:.82rem;color:#e8dfd0;margin-top:4px;white-space:pre-wrap}
.stage-col .empty{color:#6b5f50;font-size:.8rem}
.stage-reg{border-color:#5a4030}.stage-sol{border-color:#3d8f5a}.stage-kaz{border-color:#3b6ea5}
.summary-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
@media(max-width:600px){.summary-3{grid-template-columns:1fr}}
.sum-card{background:#14110c;border:1px solid #3d3428;border-radius:12px;padding:12px;text-align:center}
.sum-card .t{font-size:.75rem;color:#a89a86;margin-bottom:4px}
.sum-card .v{font-size:1.25rem;font-weight:800;color:#f5a623}
.sum-card.sol{border-color:#3d8f5a}.sum-card.kaz{border-color:#3b6ea5}
.img-lb{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:16px}
.img-lb[hidden]{display:none!important}
.img-lb img{max-width:100%;max-height:85vh;border-radius:12px;border:1px solid #4a4030}
.img-lb button{position:absolute;top:16px;left:16px;background:#f5a623;color:#1a1208;border:none;border-radius:8px;padding:8px 14px;font-weight:800;cursor:pointer;font-family:inherit}`;
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

window.getItem=function getItem(secList, si, ii){
  if(!secList||!secList[si]||!secList[si].items||!secList[si].items[ii]) return null;
  return secList[si].items[ii];
};
window.sectionsFrom=function sectionsFrom(r){
  const w=(r.details&&r.details.workflow)||{};
  if(activeMode==="kazemi" && w.soltani_review && w.soltani_review.sections) return w.soltani_review.sections;
  if(r.sections && r.sections.length) return r.sections;
  return [];
};
window.baseSections=function baseSections(r){
  if(r.sections && r.sections.length) return r.sections;
  const d=r.details||{};
  if(d.sections && d.sections.length) return d.sections;
  return [];
};
window.photoBtn=function photoBtn(it){
  if(!it||!it.fileData) return '<span class="empty">—</span>';
  const isImg=it.fileType&&String(it.fileType).indexOf("image/")===0;
  if(isImg) return '<button type="button" class="btn-act btn-view lb-open" data-src="'+String(it.fileData).replace(/"/g,"&quot;")+'" data-name="'+esc(it.fileName||"عکس")+'"><img class="thumb" src="'+it.fileData+'" alt=""> مشاهده</button>';
  return '<a class="btn-act btn-view" href="'+it.fileData+'" download="'+esc(it.fileName||"file")+'">دانلود</a>';
};
window.stageCell=function stageCell(it, cls){
  if(!it) return '<div class="stage-col '+cls+'"><span class="empty">ثبت نشده</span></div>';
  const sc=it.score!=null?it.score:"—";
  const nt=it.note?('<div class="nt">'+esc(it.note)+'</div>'):'';
  return '<div class="stage-col '+cls+'"><div class="col-label"></div><div class="sc">نمره: '+sc+'</div>'+nt+photoBtn(it)+'</div>';
};

window.openModal=function openModal(r, mode){
  activeRow=r; activeMode=mode||"view";
  document.getElementById("modal").hidden=false;
  document.getElementById("modal-msg").textContent="";
  const st=statusOf(r);
  const title=document.getElementById("modal-title");
  const hint=document.getElementById("modal-hint");
  const save=document.getElementById("modal-save");
  save.hidden = !(mode==="soltani"||mode==="kazemi");
  if(mode==="soltani"){
    title.textContent="بررسی اولیه — گزارش #"+(r.reportNo||"-");
    hint.innerHTML="نمره و کامنت <b>ثبت اولیه</b> را می‌بینید. برای هر آیتم امتیاز/کامنت/عکس خود را وارد و ثبت کنید.";
    save.textContent="ثبت بررسی مهدی سلطانی";
  } else if(mode==="kazemi"){
    title.textContent="تأیید نهایی — گزارش #"+(r.reportNo||"-");
    hint.innerHTML="ثبت اولیه و بررسی سلطانی را مقایسه کنید، در صورت نیاز اصلاح کنید و <b>ثبت نهایی</b> بزنید.";
    save.textContent="ثبت نهایی مسعود کاظمی";
  } else {
    title.textContent="گزارش #"+(r.reportNo||"-")+" — مقایسه سه مرحله";
    hint.innerHTML="ستون‌ها: <b>ثبت اولیه</b> · <b>بررسی سلطانی</b> · <b>تأیید کاظمی</b> — نمره، کامنت و عکس هر مرحله";
  }
  renderModalBody(r, mode);
};

window.renderModalBody=function renderModalBody(r, mode){
  const body=document.getElementById("modal-body");
  const w=(r.details&&r.details.workflow)||{};
  const regSecs=baseSections(r);
  const solSecs=(w.soltani_review&&w.soltani_review.sections)||null;
  const kazSecs=(w.kazemi_review&&w.kazemi_review.sections)||null;
  const regTotal=r.total;
  const solTotal=w.soltani_review&&w.soltani_review.total!=null?w.soltani_review.total:null;
  const kazTotal=w.kazemi_review&&w.kazemi_review.total!=null?w.kazemi_review.total:null;

  let html='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px">';
  html+='<div class="item-box"><div class="orig">تاریخ</div><b>'+esc(r.date)+'</b></div>';
  html+='<div class="item-box"><div class="orig">ایستگاه</div><b>'+esc(r.workstation)+'</b></div>';
  html+='<div class="item-box"><div class="orig">اپراتور</div><b>'+esc(r.operator)+'</b></div>';
  html+='<div class="item-box"><div class="orig">وضعیت</div><b>'+statusLabel(statusOf(r)).t+'</b></div>';
  html+='</div>';

  html+='<div class="summary-3">';
  html+='<div class="sum-card"><div class="t">ثبت اولیه</div><div class="v">'+(regTotal!=null?regTotal:"—")+(r.max?" / "+r.max:"")+'</div></div>';
  html+='<div class="sum-card sol"><div class="t">بررسی سلطانی</div><div class="v">'+(solTotal!=null?solTotal:"—")+'</div><div class="t">'+esc((w.soltani_review&&w.soltani_review.by)||"")+'</div></div>';
  html+='<div class="sum-card kaz"><div class="t">تأیید کاظمی</div><div class="v">'+(kazTotal!=null?kazTotal:"—")+'</div><div class="t">'+esc((w.kazemi_review&&w.kazemi_review.by)||"")+'</div></div>';
  html+='</div>';

  const editable=(mode==="soltani"||mode==="kazemi");
  const baseForEdit=mode==="kazemi"&&solSecs?solSecs:regSecs;

  if(!editable){
    if(!regSecs.length){
      html+='<p style="color:#a89a86">جزئیات آیتم‌ها موجود نیست.</p>';
    }
    regSecs.forEach(function(sec,si){
      html+='<div class="sec-title">'+esc(sec.title||sec.name||("بخش "+(si+1)))+'</div>';
      html+='<div class="compare-head"><div>آیتم</div><div>ثبت اولیه</div><div>بررسی سلطانی</div><div>تأیید کاظمی</div></div>';
      (sec.items||[]).forEach(function(it,ii){
        const q=it.question||it.label||"";
        const solIt=getItem(solSecs,si,ii);
        const kazIt=getItem(kazSecs,si,ii);
        html+='<div class="item-box">';
        html+='<div class="q" style="margin-bottom:8px">'+(ii+1)+'- '+esc(q)+'</div>';
        html+='<div class="compare-row">';
        html+='<div style="font-size:.8rem;color:#a89a86;padding-top:6px">مقایسه نمره و کامنت</div>';
        html+=stageCell(it,"stage-reg").replace('<div class="col-label"></div>','<div class="col-label">ثبت اولیه</div>');
        html+=stageCell(solIt,"stage-sol").replace('<div class="col-label"></div>','<div class="col-label">بررسی سلطانی</div>');
        html+=stageCell(kazIt,"stage-kaz").replace('<div class="col-label"></div>','<div class="col-label">تأیید کاظمی</div>');
        html+='</div></div>';
      });
    });
  } else {
    baseForEdit.forEach(function(sec,si){
      html+='<div class="sec-title">'+esc(sec.title||sec.name||("بخش "+(si+1)))+'</div>';
      (sec.items||[]).forEach(function(it,ii){
        const q=it.question||it.label||"";
        const regIt=getItem(regSecs,si,ii)||it;
        const solIt=getItem(solSecs,si,ii);
        const baseScore=it.score!=null?it.score:0;
        const baseNote=it.note||"";
        html+='<div class="item-box" data-si="'+si+'" data-ii="'+ii+'">';
        html+='<div class="q">'+(ii+1)+'- '+esc(q)+'</div>';
        html+='<div class="compare-row" style="margin-bottom:10px">';
        html+='<div></div>';
        html+=stageCell(regIt,"stage-reg").replace('<div class="col-label"></div>','<div class="col-label">ثبت اولیه</div>');
        html+=stageCell(solIt,"stage-sol").replace('<div class="col-label"></div>','<div class="col-label">بررسی سلطانی</div>');
        html+='<div class="stage-col stage-kaz"><div class="col-label">شما</div><span class="empty">در حال ورود…</span></div>';
        html+='</div>';
        html+='<div class="item-grid">';
        html+='<div><label>امتیاز شما (0-5)</label><input type="number" min="0" max="5" class="rv-score" value="'+baseScore+'"></div>';
        html+='<div><label>کامنت شما</label><input type="text" class="rv-note" value="'+esc(baseNote)+'"></div>';
        html+='</div>';
        html+='<div style="margin-top:8px"><label>عکس شما (اختیاری)</label><input type="file" accept="image/*" class="rv-file"><div class="rv-preview"></div></div>';
        html+='</div>';
      });
    });
    if(!baseForEdit.length) html+='<p style="color:#a89a86">جزئیات آیتم‌ها موجود نیست.</p>';
  }

  html+='<div id="img-lb" class="img-lb" hidden><button type="button" id="lb-x">بستن</button><img id="lb-img" alt=""></div>';
  body.innerHTML=html;

  body.querySelectorAll(".lb-open").forEach(function(btn){
    btn.onclick=function(){
      document.getElementById("lb-img").src=btn.getAttribute("data-src");
      document.getElementById("img-lb").hidden=false;
    };
  });
  const lbx=document.getElementById("lb-x");
  const lb=document.getElementById("img-lb");
  if(lbx) lbx.onclick=function(){lb.hidden=true;document.getElementById("lb-img").src="";};
  if(lb) lb.onclick=function(e){if(e.target===lb){lb.hidden=true;document.getElementById("lb-img").src="";}};

  if(editable){
    body.querySelectorAll(".rv-file").forEach(function(inp){
      inp.onchange=function(){
        const file=inp.files&&inp.files[0];
        const box=inp.closest(".item-box");
        const prev=box.querySelector(".rv-preview");
        box._file=null; prev.innerHTML="";
        if(!file) return;
        if(file.size>MAX_FILE){alert("حجم عکس بیشتر از ۱٫۵ مگابایت است");inp.value="";return;}
        const reader=new FileReader();
        reader.onload=function(){
          box._file={name:file.name,type:file.type,dataUrl:reader.result};
          prev.innerHTML='<img class="thumb" src="'+reader.result+'" alt=""> '+esc(file.name);
        };
        reader.readAsDataURL(file);
      };
    });
  }
};

})();
