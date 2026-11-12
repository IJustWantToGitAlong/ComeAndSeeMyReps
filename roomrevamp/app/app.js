(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const budget = $("budget"), budgetOut = $("budgetOut");
  let selectedStyle = "Warm minimal";
  let items = [
    {name:"Sofa",price:1100,query:"living room sofa"},
    {name:"Coffee table",price:250,query:"coffee table"},
    {name:"Area rug",price:300,query:"area rug"},
    {name:"Lighting",price:180,query:"floor lamp"},
    {name:"Accent chair",price:400,query:"accent chair"},
    {name:"Wall art & decor",price:150,query:"wall art home decor"}
  ];
  const STORAGE_KEY = "roomrevamp-planner-v1";
  function restorePlannerState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      if (typeof saved.budget === "number") budget.value = String(Math.min(Number(budget.max), Math.max(Number(budget.min), saved.budget)));
      if (typeof saved.selectedStyle === "string" && document.querySelector('[data-style="' + CSS.escape(saved.selectedStyle) + '"]')) selectedStyle = saved.selectedStyle;
      if (Array.isArray(saved.items)) items = saved.items.slice(0, 100).map(item => ({
        name: String(item.name || "Item").slice(0, 100),
        price: Math.max(0, Math.min(1000000, Number(item.price) || 0)),
        query: String(item.query || "").slice(0, 160)
      }));
      if (typeof saved.roomType === "string" && [...$("roomType").options].some(option => option.value === saved.roomType)) $("roomType").value = saved.roomType;
      if (typeof saved.roomSize === "string" && [...$("roomSize").options].some(option => option.value === saved.roomSize)) $("roomSize").value = saved.roomSize;
    } catch { /* Ignore unavailable or invalid local storage. */ }
  }
  function persistPlannerState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        budget: Number(budget.value), selectedStyle, items,
        roomType: $("roomType").value, roomSize: $("roomSize").value
      }));
    } catch { /* The planner remains usable when storage is unavailable. */ }
  }
  restorePlannerState();
  const money = n => "$" + Math.round(n).toLocaleString("en-US");
  function syncBudgetDisplay() {
    const amount = Number(budget.value);
    budgetOut.textContent = money(amount);
    budgetOut.value = budgetOut.textContent;
    budgetOut.setAttribute("aria-label", "Your total budget " + budgetOut.textContent);
    updateTotals();
  }
  budget.addEventListener("input", syncBudgetDisplay);
  budget.addEventListener("change", syncBudgetDisplay);
  function updateTotals() {
    const total = items.reduce((sum,item) => sum + Math.max(0,Number(item.price)||0),0);
    const limit = Number(budget.value);
    $("total").textContent = money(total);
    $("remaining").textContent = money(limit-total);
    $("remaining").style.color = total > limit ? "#a24d3e" : "";
    $("remainingLabel").textContent = total > limit ? "Over budget" : "Remaining budget";\n    persistPlannerState();
  }
  function renderItems() {
    const host = $("shoppingList"); host.replaceChildren();
    items.forEach((item,index) => {
      const row = document.createElement("div"); row.className="shop-item";
      const name=document.createElement("input"); name.value=item.name; name.setAttribute("aria-label","Item name"); name.addEventListener("input",()=>{item.name=name.value;remove.setAttribute("aria-label","Remove "+item.name);link.setAttribute("aria-label","Search retailer listings for "+item.name);if(!item.query)link.href="https://www.amazon.com/s?k="+encodeURIComponent(item.name+" furniture");persistPlannerState();});
      const price=document.createElement("input"); price.type="number"; price.min="0"; price.step="10"; price.value=item.price; price.className="price-input"; price.setAttribute("aria-label","Estimated price for "+item.name); price.addEventListener("input",()=>{item.price=Math.max(0,Number(price.value)||0);updateTotals();});
      const remove=document.createElement("button"); remove.type="button"; remove.className="remove-item"; remove.textContent="×"; remove.setAttribute("aria-label","Remove "+item.name); remove.addEventListener("click",()=>{items.splice(index,1);renderItems();});
      const link=document.createElement("a"); link.href="https://www.amazon.com/s?k="+encodeURIComponent(item.query||item.name+" furniture"); link.target="_blank"; link.rel="noopener noreferrer"; link.textContent="Find"; link.className="find-link"; link.setAttribute("aria-label","Search retailer listings for "+item.name);
      row.append(name,price,remove,link);host.append(row);
    }); updateTotals();
  }
  $("addItem").addEventListener("click",()=>{items.push({name:"New item",price:100,query:""});renderItems();});
  $("styles").addEventListener("click",event=>{const button=event.target.closest("button[data-style]");if(!button)return;selectedStyle=button.dataset.style;document.querySelectorAll(".style").forEach(el=>el.classList.toggle("active",el===button));persistPlannerState();});
  $("roomType").addEventListener("change",persistPlannerState);\n  $("roomSize").addEventListener("change",persistPlannerState);\n  document.querySelectorAll(".style").forEach(el=>el.classList.toggle("active",el.dataset.style===selectedStyle));\n  let photoObjectUrl = null;\n  $("roomPhoto").addEventListener("change",event=>{const file=event.target.files&&event.target.files[0];if(!file)return;if(!file.type.startsWith("image/")){alert("Please choose an image file.");return;}if(photoObjectUrl)URL.revokeObjectURL(photoObjectUrl);photoObjectUrl=URL.createObjectURL(file);$("previewImage").src=photoObjectUrl;$("photoPreview").hidden=false;$("roomPhoto").closest(".upload").hidden=true;});
  $("removePhoto").addEventListener("click",()=>{if(photoObjectUrl){URL.revokeObjectURL(photoObjectUrl);photoObjectUrl=null;}$("previewImage").removeAttribute("src");$("photoPreview").hidden=true;$("roomPhoto").value="";$("roomPhoto").closest(".upload").hidden=false;});
  function buildBrief() {
    const total=items.reduce((sum,item)=>sum+Math.max(0,Number(item.price)||0),0);
    const list=items.map(item=>"- "+item.name+": "+money(item.price)).join("\n");
    const over=total>Number(budget.value);
    return [
      "ROOMREVAMP — DESIGN BRIEF","==========================",
      "Room: "+$("roomType").value,
      "Size: "+$("roomSize").value,
      "Style direction: "+selectedStyle,
      "Total furniture budget: "+money(Number(budget.value)),
      "Shopping shortlist:",list||"- No items added",
      "Estimated shortlist total: "+money(total),
      (over?"Amount over budget: ":"Budget remaining: ")+money(Math.abs(Number(budget.value)-total)),
      "",
      "DESIGN DIRECTION",
      "Create a "+selectedStyle.toLowerCase()+" "+$("roomType").value.toLowerCase()+" for a "+$("roomSize").value.toLowerCase()+" space. Keep circulation paths clear, preserve doors and windows, respect the room's existing architecture, and prioritize appropriately scaled furniture. Use the shopping shortlist as a planning guide.",
      "",
      "PRODUCT ACCURACY NOTE",
      "The prices above are user-editable planning estimates. Retailer search links and product matches have not yet been verified. Do not represent generated furniture as an exact purchasable SKU unless its product ID, dimensions, current price, and source listing have been checked.",
      "",
      "NEXT BUILD TARGET",
      "Add an AI room-rendering workflow and a permission-compliant, verified retailer product catalog. Keep the core app free to use."
    ].join("\n");
  }
  $("generate").addEventListener("click",()=>{$("brief").textContent=buildBrief();$("brief").scrollIntoView({behavior:"smooth",block:"nearest"});});
  $("copyBrief").addEventListener("click",async()=>{const text=$("brief").textContent;if(!text||text==="Your room plan will appear here."){$("brief").textContent=buildBrief();}try{await navigator.clipboard.writeText($("brief").textContent);$("copyBrief").textContent="Copied!";setTimeout(()=>$("copyBrief").textContent="Copy brief",1600);}catch{$("brief").textContent=buildBrief();}});
  $("downloadBrief").addEventListener("click",()=>{const content=$("brief").textContent==="Your room plan will appear here."?buildBrief():$("brief").textContent;const blob=new Blob([content],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="roomrevamp-design-brief.txt";a.click();URL.revokeObjectURL(url);});
  syncBudgetDisplay();renderItems();
})();