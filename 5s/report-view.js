(function(){
  var css = "a.back,.view-back{display:inline-flex!important;align-items:center;gap:8px;background:linear-gradient(135deg,#f5a623,#e8910f)!important;color:#1a1208!important;font-weight:800!important;font-size:.95rem!important;padding:11px 18px!important;border-radius:12px!important;border:none!important;text-decoration:none!important;box-shadow:0 8px 22px rgba(245,166,35,.35)!important;cursor:pointer}"
    + "a.back:hover,.view-back:hover{filter:brightness(1.08);transform:translateY(-1px)}"
    + ".readonly{padding:10px 12px;border-radius:10px;border:1px solid #4a4030;background:#16120e;color:#f5f0e8;font-size:.92rem;min-height:42px}"
    + ".file-thumb-btn{display:inline-flex;align-items:center;gap:10px;background:#2a2214;border:1px solid #5a4030;border-radius:10px;padding:6px 12px 6px 6px;cursor:pointer;color:#f5c56a;font-family:inherit;font-size:.85rem}"
    + ".file-thumb{width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #4a4030;background:#fff}"
    + ".file-open-btn{display:inline-block;background:#2a2214;border:1px solid #5a4030;border-radius:10px;padding:8px 14px;color:#f5a623;text-decoration:none;font-size:.85rem}"
    + ".img-lightbox{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:16px}"
    + ".img-lightbox[hidden]{display:none!important}"
    + ".img-lightbox-inner{max-width:min(960px,100%);max-height:90vh;text-align:center;position:relative}"
    + ".img-lightbox-inner img{max-width:100%;max-height:80vh;border-radius:12px;border:1px solid #4a4030}"
    + ".img-lightbox-close{position:absolute;top:-8px;left:0;background:#f5a623;color:#1a1208;border:none;border-radius:8px;padding:8px 14px;font-family:inherit;font-weight:700;cursor:pointer}"
    + ".img-lightbox-inner p{color:#cbbfaa;margin-top:10px;font-size:.9rem}";
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  function esc(s){return String(s==null?"":s).replace(/&/g,"&").replace(/</g,"<").replace(/>/g,">").replace(/\"/g,""")}
  window.renderDetail=function(idx){
    var r=window.auditsCache?window.auditsCache[idx]:null;
    var box=document.getElementById("detail-content");
    if(!r){box.innerHTML="<p>یافت نشد</p>";return}
    var num=r.reportNo||"-";
    var h='<div class="home-title" style="text-align:right;margin-bottom:14px"><h2>گزارش شماره '+num+'</h2><p>نمایش کامل مانند فرم ارزیابی</p></div>';
    h+='<div class="meta">';
    h+='<div><label>تاریخ ارزیابی</label><div class="readonly">'+esc(r.date||"-")+'</div></div>';
    h+='<div><label>ایستگاه کاری</label><div class="readonly">'+esc(r.workstation||"-")+'</div></div>';
    h+='<div><label>ارزیاب</label><div class="readonly">'+esc(r.auditor||"-")+'</div></div>';
    h+='</div>';
    h+='<div class="people-box"><h3>نفرات حاضر در ارزیابی</h3><div class="people-grid">';
    h+='<div><label>اپراتور</label><div class="readonly">'+esc(r.operator||"-")+'</div></div>';
    var assts=r.assistants||[];
    for(var i=0;i<3;i++){h+='<div><label>کمک‌اپراتور '+(i+1)+'</label><div class="readonly">'+esc(assts[i]||"-")+'</div></div>'}
    h+='</div></div>';
    (r.sections||[]).forEach(function(sec){
      var secScore=0,secMax=0;
      (sec.items||[]).forEach(function(it){secScore+=Number(it.score)||0;secMax+=5});
      h+='<section class="s-block"><div class="s-head"><div><h2>'+esc(sec.title||"")+'</h2></div><div class="s-score">'+secScore+' / '+secMax+'</div></div>';
      (sec.items||[]).forEach(function(it,ii){
        var done=!!it.done;
        h+='<div class="item">';
        h+='<div class="q">'+(ii+1)+'- '+esc(it.question||"")+'</div>';
        h+='<label class="check"><input type="checkbox" disabled '+(done?"checked":"")+'> انجام شد</label>';
        h+='<input type="number" disabled value="'+(it.score!=null?it.score:0)+'">';
        h+='<div class="note-field"><input type="text" disabled value="'+esc(it.note||"")+'" placeholder="—"></div>';
        if(it.fileData||it.fileName){
          var isImg=it.fileType&&String(it.fileType).indexOf("image/")===0&&it.fileData;
          h+='<div class="attach-field">';
          if(isImg){
            h+='<button type="button" class="file-thumb-btn" data-src="'+String(it.fileData).replace(/"/g,""")+'" data-name="'+esc(it.fileName||"عکس")+'">';
            h+='<img class="file-thumb" src="'+it.fileData+'" alt=""><span>مشاهده عکس</span></button>';
          } else if(it.fileData){
            h+='<a class="file-open-btn" href="'+it.fileData+'" download="'+esc(it.fileName||"file")+'">دانلود: '+esc(it.fileName||"فایل")+'</a>';
          } else {
            h+='<span style="color:#a89a86;font-size:.85rem">'+esc(it.fileName)+'</span>';
          }
          h+='</div>';
        }
        h+='</div>';
      });
      h+='</section>';
    });
    h+='<div class="summary"><div>جمع امتیاز: <strong>'+(r.total!=null?r.total:0)+'</strong> از <span>'+(r.max!=null?r.max:0)+'</span></div></div>';
    h+='<div id="img-lightbox" class="img-lightbox" hidden><div class="img-lightbox-inner"><button type="button" class="img-lightbox-close" id="lb-close">بستن</button><img id="lb-img" alt=""><p id="lb-name"></p></div></div>';
    box.innerHTML=h;
    box.querySelectorAll(".file-thumb-btn").forEach(function(btn){
      btn.onclick=function(){
        var lb=document.getElementById("img-lightbox");
        document.getElementById("lb-img").src=btn.getAttribute("data-src");
        document.getElementById("lb-name").textContent=btn.getAttribute("data-name")||"";
        lb.hidden=false;
      };
    });
    var lb=document.getElementById("img-lightbox");
    var lbClose=document.getElementById("lb-close");
    if(lbClose) lbClose.onclick=function(){lb.hidden=true;document.getElementById("lb-img").src=""};
    if(lb) lb.onclick=function(e){if(e.target===lb){lb.hidden=true;document.getElementById("lb-img").src=""}};
  };
})();
