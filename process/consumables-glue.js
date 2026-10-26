/* Move carton glued/unglued entry to registration form; calc is read-only */
(function(){
  function ready(fn){
    if(document.getElementById("items-body")) fn();
    else setTimeout(function(){ ready(fn); }, 50);
  }
  ready(function(){
    // Patch table header in form
    var formTable = document.querySelector("#form-view table thead tr") || document.querySelector("#items-body") && document.querySelector("#items-body").closest("table") && document.querySelector("#items-body").closest("table").querySelector("thead tr");
    if(formTable && formTable.innerHTML.indexOf("چسب")<0){
      formTable.innerHTML = '<th>ردیف</th><th>شرح کالا</th><th>موجودی</th><th>چسب\u200cخورده</th><th>چسب\u200cنخورده</th><th>واحد</th><th>توضیح</th>';
    }
    // Hint under form
    var hint = document.querySelector("#form-view .hint");
    if(hint) hint.innerHTML = 'برای <b>کارتن پروفیل</b> ستون\u200cهای چسب\u200cخورده و چسب\u200cنخورده را همین\u200cجا وارد کن. محاسبات فقط نتیجه را نشان می\u200cدهد.';

    // Override renderFormRows if exists
    if(typeof renderFormRows === "function" || typeof window.renderFormRows === "function"){
      var _origRender = window.renderFormRows || renderFormRows;
      window.renderFormRows = function(map){
        map = map || {};
        var tb = document.getElementById("items-body");
        if(!tb || typeof CATALOG==="undefined") return _origRender(map);
        tb.innerHTML = "";
        CATALOG.forEach(function(it, i){
          var s = map[it.name] || {};
          var isCarton = it.group === "carton";
          var gluedVal = s.glued!=null && s.glued!=="" ? s.glued : "";
          var ungluedVal = s.unglued!=null && s.unglued!=="" ? s.unglued : "";
          var glueCells = isCarton
            ? '<td><input type="number" min="0" step="any" class="c-glued-form" data-name="'+esc(it.name)+'" value="'+gluedVal+'" placeholder="0"></td>'+
              '<td><input type="number" min="0" step="any" class="c-unglued-form" data-name="'+esc(it.name)+'" value="'+ungluedVal+'" placeholder="0"></td>'
            : '<td style="color:#6b5f50;text-align:center">—</td><td style="color:#6b5f50;text-align:center">—</td>';
          var tr = document.createElement("tr");
          tr.innerHTML =
            '<td class="row-num">'+(i+1)+'</td>'+
            '<td class="name-cell">'+esc(it.name)+'</td>'+
            '<td><input type="number" min="0" step="any" class="c-qty" data-name="'+esc(it.name)+'" value="'+(s.qty!=null&&s.qty!==""?s.qty:"")+'" placeholder="0"></td>'+
            glueCells+
            '<td>'+esc(it.unit)+'</td>'+
            '<td><input type="text" class="c-note" data-name="'+esc(it.name)+'" value="'+esc(s.text||"")+'" placeholder="—"></td>';
          tb.appendChild(tr);
        });
      };
    }

    // Override collectForm
    if(typeof collectForm === "function" || typeof window.collectForm === "function"){
      window.collectForm = function(){
        var rows = [];
        CATALOG.forEach(function(it, i){
          var inp = document.querySelectorAll(".c-qty")[i];
          var noteInp = document.querySelectorAll(".c-note")[i];
          var qtyRaw = inp ? inp.value : "";
          var text = noteInp ? noteInp.value.trim() : "";
          var extra = {};
          if(it.group === "carton"){
            var g2 = Array.from(document.querySelectorAll(".c-glued-form")).find(function(el){ return el.getAttribute("data-name")===it.name; });
            var ug2 = Array.from(document.querySelectorAll(".c-unglued-form")).find(function(el){ return el.getAttribute("data-name")===it.name; });
            if(g2 && g2.value!=="") extra.glued = Number(g2.value);
            if(ug2 && ug2.value!=="") extra.unglued = Number(ug2.value);
          }
          if(text) extra.text = text;
          rows.push({
            item_name: it.name,
            quantity: qtyRaw==="" ? null : Number(qtyRaw),
            unit: it.unit,
            note: Object.keys(extra).length ? JSON.stringify(extra) : null,
            sort_order: i
          });
        });
        return rows;
      };
    }

    // After calcs render: make carton glued columns read-only
    var _origCalcs = window.renderCalcs || (typeof renderCalcs==="function" ? renderCalcs : null);
    if(_origCalcs){
      window.renderCalcs = function(){
        _origCalcs.apply(this, arguments);
        // convert any remaining glued inputs to text
        document.querySelectorAll("#tb-carton input.c-glued, #tb-carton input.c-unglued").forEach(function(inp){
          var td = inp.parentNode;
          var v = inp.value;
          td.textContent = v;
        });
        var btn = document.getElementById("save-carton-extra");
        if(btn) btn.style.display = "none";
        var ch = document.querySelector("#calc-view .hint");
        // find carton hint near tb-carton
        var cartonSection = document.getElementById("tb-carton");
        if(cartonSection){
          var sec = cartonSection.closest(".section") || cartonSection.parentNode.parentNode;
          var h = sec && sec.querySelector(".hint");
          if(h) h.textContent = "مقادیر چسب از ثبت موجودی خوانده می\u200cشود. پروفیل = چسب\u200cخورده × ضریب | روز چسب = چسب\u200cنخورده ÷ ۹۰۰";
        }
      };
    }

    // re-render form with new columns if already visible
    try{
      if(typeof stockMap !== "undefined" && document.getElementById("items-body")){
        window.renderFormRows(stockMap);
      }
    }catch(e){}
  });
})();
