const docs = [
  {id:1,file:"HD_000128.pdf",type:"Hóa đơn VAT",number:"00000128",vendor:"Công ty TNHH An Phát",tax:"0315478921",date:"04/07/2026",amount:18755000,status:"APPROVED",confidence:96},
  {id:2,file:"PGH_HN2048.jpg",type:"Phiếu giao hàng",number:"GH-2048",vendor:"Công ty CP Minh Long",tax:"0106248379",date:"04/07/2026",amount:8420000,status:"WAITING_REVIEW",confidence:84},
  {id:3,file:"invoice_8732.png",type:"Hóa đơn VAT",number:"00008732",vendor:"Văn phòng phẩm Hồng Hà",tax:"0100364756",date:"03/07/2026",amount:3256800,status:"NEED_CORRECTION",confidence:68},
  {id:4,file:"PNK_0726.pdf",type:"Phiếu nhập kho",number:"NK-0726",vendor:"Công ty TNHH Đông Nam",tax:"0309982764",date:"03/07/2026",amount:45200000,status:"APPROVED",confidence:93},
  {id:5,file:"HD_FPT_3291.pdf",type:"Hóa đơn VAT",number:"00003291",vendor:"FPT Telecom",tax:"0101778163",date:"02/07/2026",amount:1298000,status:"APPROVED",confidence:98},
  {id:6,file:"delivery_018.jpg",type:"Phiếu giao hàng",number:"GH-018",vendor:"Giao Hàng Nhanh",tax:"0311907295",date:"02/07/2026",amount:2250000,status:"PROCESSING",confidence:0},
  {id:7,file:"HD_7749.pdf",type:"Hóa đơn VAT",number:"00007749",vendor:"Điện máy Thành Công",tax:"0104551832",date:"01/07/2026",amount:36500000,status:"APPROVED",confidence:91},
  {id:8,file:"PXK_1107.png",type:"Phiếu xuất kho",number:"XK-1107",vendor:"Kho trung tâm Hà Nội",tax:"",date:"01/07/2026",amount:12900000,status:"WAITING_REVIEW",confidence:79}
];
const state={view:"dashboard",files:[]};
const content=document.querySelector("#content");
const money=n=>new Intl.NumberFormat("vi-VN").format(n)+" ₫";
const statusMap={APPROVED:["Đã duyệt",""],WAITING_REVIEW:["Chờ kiểm tra","review"],NEED_CORRECTION:["Cần chỉnh sửa","correction"],PROCESSING:["Đang xử lý","processing"],REJECTED:["Đã từ chối","correction"]};

function dashboard(){
  return `<div class="page"><div class="page-head"><div><h1>Chào buổi sáng, An 👋</h1><p>Đây là tình hình xử lý chứng từ của bạn hôm nay.</p></div><span class="date-chip">◷ 01/07/2026 — 04/07/2026</span></div>
  <div class="stats">
    <article class="stat-card"><span class="stat-icon">▤</span><div><label>TỔNG CHỨNG TỪ</label><strong>${docs.length}</strong><span class="trend">↑ 12.5%</span></div></article>
    <article class="stat-card"><span class="stat-icon">◷</span><div><label>CHỜ KIỂM TRA</label><strong>${docs.filter(d=>d.status==="WAITING_REVIEW").length}</strong><span class="trend">Cần xử lý</span></div></article>
    <article class="stat-card"><span class="stat-icon">✓</span><div><label>ĐÃ DUYỆT</label><strong>${docs.filter(d=>d.status==="APPROVED").length}</strong><span class="trend">↑ 8.2%</span></div></article>
    <article class="stat-card"><span class="stat-icon">!</span><div><label>CẦN CHỈNH SỬA</label><strong>${docs.filter(d=>d.status==="NEED_CORRECTION").length}</strong><span class="trend">Kiểm tra ngay</span></div></article>
  </div>
  <div class="grid-main"><article class="card"><div class="card-head"><h2>Lượng chứng từ xử lý</h2><button class="link-btn" data-view="reports">Xem báo cáo →</button></div><div class="chart-wrap"><div class="legend"><span><i></i> Đã duyệt</span><span><i></i> Cần kiểm tra</span></div><div class="chart">${[48,64,43,78,55,88,67,76,90,61,84,72].map((h,i)=>`<div class="bar-set"><b class="bar" style="height:${h}%"></b><b class="bar alt" style="height:${Math.max(15,h-35)}%"></b></div>`).join("")}</div><div class="chart-labels"><span>01/07</span><span>02/07</span><span>03/07</span><span>04/07</span></div></div></article>
  <article class="card"><div class="card-head"><h2>Hoạt động gần đây</h2><button class="link-btn">Xem tất cả</button></div><div class="activity">
    <div class="activity-row"><span class="activity-dot">✓</span><div><p><b>HD_000128.pdf</b> đã được duyệt</p><small>2 phút trước · bởi An Nguyễn</small></div></div>
    <div class="activity-row"><span class="activity-dot">⇧</span><div><p><b>PGH_HN2048.jpg</b> vừa tải lên</p><small>18 phút trước · bởi Minh Trần</small></div></div>
    <div class="activity-row"><span class="activity-dot">!</span><div><p><b>invoice_8732.png</b> cần chỉnh sửa</p><small>35 phút trước · OCR 68%</small></div></div>
    <div class="activity-row"><span class="activity-dot">⇩</span><div><p>Báo cáo tháng 6 đã xuất Excel</p><small>1 giờ trước · bởi An Nguyễn</small></div></div>
  </div></article></div>
  <article class="card table-card" style="margin-top:18px"><div class="card-head"><h2>Chứng từ gần đây</h2><button class="link-btn" data-view="documents">Xem tất cả →</button></div>${docTable(docs.slice(0,5))}</article></div>`;
}
function docTable(items){
  return `<table><thead><tr><th>Chứng từ</th><th>Số chứng từ</th><th>Nhà cung cấp</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>${items.map(d=>{let s=statusMap[d.status]||[d.status,""];return `<tr data-id="${d.id}"><td><div class="doc-name"><span class="file-icon">${d.file.endsWith(".pdf")?"PDF":"IMG"}</span><span><strong>${d.file}</strong><small>${d.type} · OCR ${d.confidence||"..."}%</small></span></div></td><td>${d.number}</td><td>${d.vendor}</td><td>${d.date}</td><td><strong>${money(d.amount)}</strong></td><td><span class="status ${s[1]}">${s[0]}</span></td><td><button class="more">•••</button></td></tr>`}).join("")}</tbody></table>`;
}
function documents(){
  return `<div class="page"><div class="page-head"><div><h1>Chứng từ</h1><p>Quản lý, kiểm tra và theo dõi toàn bộ chứng từ.</p></div><button class="primary-btn" data-action="open-upload">＋ Tải chứng từ</button></div>
  <div class="toolbar"><label class="local-search">⌕<input id="docSearch" placeholder="Tìm trong chứng từ..."></label><select class="filter-btn" id="statusFilter"><option value="">Tất cả trạng thái</option><option value="WAITING_REVIEW">Chờ kiểm tra</option><option value="APPROVED">Đã duyệt</option><option value="NEED_CORRECTION">Cần chỉnh sửa</option></select><select class="filter-btn"><option>Tất cả loại</option><option>Hóa đơn VAT</option><option>Phiếu giao hàng</option></select><button class="ghost-btn" id="exportCsv">⇩ Xuất Excel</button></div>
  <article class="card table-card" id="documentTable">${docTable(docs)}</article></div>`;
}
function review(d){
  return `<div class="page"><div class="page-head"><div><button class="link-btn" data-view="documents">← Quay lại danh sách</button><h1 style="margin-top:10px">Kiểm tra chứng từ</h1><p>${d.file} · Tải lên hôm nay lúc 09:42</p></div><span class="status ${statusMap[d.status]?.[1]||""}">${statusMap[d.status]?.[0]||d.status}</span></div>
  <div class="review-layout"><section class="preview-pane"><div class="pane-head"><h2>Bản gốc</h2><div><button class="ghost-btn">−</button> <button class="ghost-btn">100%</button> <button class="ghost-btn">＋</button></div></div><div class="doc-preview"><div class="paper"><div class="paper-top"><b>CÔNG TY TNHH AN PHÁT</b><h2>HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h2><p>Ngày 04 tháng 07 năm 2026</p><p>Số: ${d.number}</p></div><div class="paper-section"><span><b>Đơn vị bán hàng:</b> ${d.vendor}</span><span><b>Mã số thuế:</b> ${d.tax}</span><span><b>Địa chỉ:</b> Quận Cầu Giấy, Hà Nội</span><span><b>Hình thức TT:</b> Chuyển khoản</span></div><table><thead><tr><th>STT</th><th>Tên hàng hóa, dịch vụ</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody><tr><td>1</td><td>Giấy in Double A A4</td><td>Thùng</td><td>10</td><td>1.250.000</td><td>12.500.000</td></tr><tr><td>2</td><td>Mực in HP LaserJet</td><td>Hộp</td><td>5</td><td>910.000</td><td>4.550.000</td></tr></tbody></table><div class="paper-total"><p><span>Cộng tiền hàng:</span><b>17.050.000</b></p><p><span>Tiền thuế GTGT:</span><b>1.705.000</b></p><p><span>Tổng thanh toán:</span><b>18.755.000</b></p></div></div></div></section>
  <section class="form-pane"><div class="pane-head"><h2>Dữ liệu trích xuất</h2><button class="ghost-btn">Lưu nháp</button></div><div class="form-body"><div class="confidence-banner"><span>✦</span><span>Độ tin cậy OCR tổng thể</span><strong>${d.confidence}%</strong></div><div class="form-grid">
  ${field("Loại chứng từ",d.type,"select")}${field("Số hóa đơn",d.number)}${field("Ngày hóa đơn",d.date)}${field("Ký hiệu","1C26TAP")}${field("Tên người bán",d.vendor,"text","full")}${field("Mã số thuế",d.tax)}${field("Địa chỉ","Quận Cầu Giấy, Hà Nội")}${field("Tổng trước thuế","17.050.000")}${field("Tiền thuế VAT","1.705.000")}${field("Tổng thanh toán","18.755.000","text","warn")}
  </div><div class="section-title"><b>Hàng hóa, dịch vụ</b><button class="link-btn" id="addLine">＋ Thêm dòng</button></div><table class="line-table"><thead><tr><th>Tên hàng hóa</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th><th></th></tr></thead><tbody id="lineItems"><tr><td><input value="Giấy in Double A A4"></td><td><input value="10"></td><td><input value="1.250.000"></td><td><input value="12.500.000"></td><td><button class="more remove-line">×</button></td></tr><tr><td><input value="Mực in HP LaserJet"></td><td><input value="5"></td><td><input value="910.000"></td><td><input value="4.550.000"></td><td><button class="more remove-line">×</button></td></tr></tbody></table>
  <div class="review-actions"><button class="ghost-btn" id="rejectDoc">Từ chối</button><button class="primary-btn" id="approveDoc">✓ Duyệt chứng từ</button></div></div></section></div></div>`;
}
function field(label,value,type="text",cls=""){return `<label class="field ${cls}"><span>${label}</span>${type==="select"?`<select><option>${value}</option><option>Phiếu giao hàng</option></select>`:`<input value="${value}">`}</label>`}
function placeholder(view){let data={vendors:["Nhà cung cấp","Danh mục đối tác sẽ được đồng bộ từ dữ liệu hóa đơn.","♙"],team:["Thành viên","Quản lý người dùng và phân quyền Company Admin, Accountant, Warehouse Staff, Viewer.","♧"],reports:["Báo cáo","Theo dõi sản lượng OCR, độ chính xác và xuất báo cáo tổng hợp.","▥"]}[view];return `<div class="page empty-page"><div><span class="big-icon">${data[2]}</span><h2>${data[0]}</h2><p>${data[1]}</p><button class="primary-btn" data-view="documents">Xem chứng từ</button></div></div>`}
function render(){
  content.innerHTML=state.view==="dashboard"?dashboard():state.view==="documents"?documents():state.view==="review"?review(state.activeDoc):placeholder(state.view);
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===state.view));
  bindDynamic();
}
function bindDynamic(){
  document.querySelectorAll("[data-view]").forEach(el=>el.onclick=e=>{e.preventDefault();state.view=el.dataset.view;render()});
  document.querySelectorAll("[data-action='open-upload']").forEach(el=>el.onclick=openUpload);
  document.querySelectorAll("tbody tr[data-id]").forEach(tr=>tr.onclick=e=>{if(e.target.closest(".more"))return;state.activeDoc=docs.find(d=>d.id==tr.dataset.id);state.view="review";render()});
  const search=document.querySelector("#docSearch"),filter=document.querySelector("#statusFilter");
  const apply=()=>{let q=(search?.value||"").toLowerCase(),s=filter?.value||"";let rows=docs.filter(d=>(!s||d.status===s)&&Object.values(d).join(" ").toLowerCase().includes(q));document.querySelector("#documentTable").innerHTML=docTable(rows);bindDynamic()};
  if(search)search.oninput=apply;if(filter)filter.onchange=apply;
  document.querySelector("#exportCsv")?.addEventListener("click",exportCsv);
  document.querySelector("#approveDoc")?.addEventListener("click",()=>{state.activeDoc.status="APPROVED";showToast("Đã duyệt chứng từ","Dữ liệu đã được lưu vào hệ thống.");state.view="documents";render()});
  document.querySelector("#rejectDoc")?.addEventListener("click",()=>{state.activeDoc.status="REJECTED";showToast("Đã từ chối chứng từ","Chứng từ không được đưa vào báo cáo.");state.view="documents";render()});
  document.querySelector("#addLine")?.addEventListener("click",()=>{document.querySelector("#lineItems").insertAdjacentHTML("beforeend",`<tr><td><input placeholder="Tên hàng hóa"></td><td><input value="1"></td><td><input value="0"></td><td><input value="0"></td><td><button class="more remove-line">×</button></td></tr>`);bindLines()});bindLines();
}
function bindLines(){document.querySelectorAll(".remove-line").forEach(b=>b.onclick=()=>b.closest("tr").remove())}
function openUpload(){document.querySelector("#uploadModal").classList.add("show");document.querySelector("#uploadModal").setAttribute("aria-hidden","false")}
function closeUpload(){document.querySelector("#uploadModal").classList.remove("show");state.files=[];drawQueue()}
function drawQueue(){document.querySelector("#uploadQueue").innerHTML=state.files.map((f,i)=>`<div class="queue-item"><span class="file-icon">${f.name.toLowerCase().endsWith(".pdf")?"PDF":"IMG"}</span><div><strong>${f.name}</strong><small>${(f.size/1024/1024).toFixed(2)} MB · Sẵn sàng xử lý</small></div><button data-remove="${i}">×</button></div>`).join("");document.querySelector("#processFiles").disabled=!state.files.length;document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{state.files.splice(+b.dataset.remove,1);drawQueue()})}
function addFiles(files){const valid=[...files].filter(f=>/\.(jpe?g|png|pdf)$/i.test(f.name)&&f.size<=20*1024*1024);state.files.push(...valid);drawQueue();if(valid.length!==files.length)showToast("Có file không hợp lệ","Chỉ hỗ trợ JPG, PNG, PDF tối đa 20 MB.")}
function showToast(title,text){document.querySelector("#toastTitle").textContent=title;document.querySelector("#toastText").textContent=text;let t=document.querySelector("#toast");t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3200)}
function exportCsv(){let rows=[["Số chứng từ","Loại","Nhà cung cấp","Mã số thuế","Ngày","Tổng tiền","Trạng thái"],...docs.map(d=>[d.number,d.type,d.vendor,d.tax,d.date,d.amount,statusMap[d.status]?.[0]||d.status])];let csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="ScanBiz_chung_tu_04-07-2026.csv";a.click();showToast("Đã xuất báo cáo","File CSV tương thích Excel đã được tạo.")}
document.querySelectorAll(".close-modal").forEach(b=>b.onclick=closeUpload);
document.querySelector("#chooseFile").onclick=()=>document.querySelector("#fileInput").click();
document.querySelector("#fileInput").onchange=e=>addFiles(e.target.files);
const dz=document.querySelector("#dropzone");["dragenter","dragover"].forEach(x=>dz.addEventListener(x,e=>{e.preventDefault();dz.classList.add("drag")}));["dragleave","drop"].forEach(x=>dz.addEventListener(x,e=>{e.preventDefault();dz.classList.remove("drag")}));dz.addEventListener("drop",e=>addFiles(e.dataTransfer.files));
document.querySelector("#processFiles").onclick=()=>{const names=state.files.map(f=>f.name);names.forEach((name,i)=>docs.unshift({id:Date.now()+i,file:name,type:"Hóa đơn VAT",number:"Đang đọc...",vendor:"Đang nhận dạng...",tax:"",date:"04/07/2026",amount:0,status:"PROCESSING",confidence:0}));closeUpload();state.view="documents";render();showToast("Đã nhận chứng từ",`${names.length} file đang được xử lý OCR.`);document.querySelector("#navCount").textContent=docs.length};
document.querySelector("#mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.querySelector("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){state.view="documents";render();let q=e.target.value;setTimeout(()=>{let s=document.querySelector("#docSearch");s.value=q;s.dispatchEvent(new Event("input"))})}});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.querySelector("#globalSearch").focus()}if(e.key==="Escape")closeUpload()});
render();
