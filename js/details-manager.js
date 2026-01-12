// details-manager.js
app.goToDetails = function(type, id){
    this.lastEntityPage = type;
    location.hash = `#details/${type}/${id}`;
};

app.getItemById = function(type, id){
    const list = this.data[type] || [];
    return list.find(x=> Number(x.id) === Number(id));
};

app.statusBadge = function(status){
    if(!status) return `<span class="badge muted">—</span>`;
    const cls = status==="Completed" || status==="Paid" ? "success"
                : status==="Pending" ? "warning"
                : status==="Overdue" || status==="Cancelled" ? "danger"
                : "muted";
    return `<span class="badge ${cls}">${status}</span>`;
};

app.renderDetails = function(type, id){
    const item = this.getItemById(type, id);
    if(!item){
        document.getElementById("detailsTitle").textContent = "Not found";
        document.getElementById("detailsBody").innerHTML = "<p>Item not found.</p>";
        document.getElementById("detailsMedia").innerHTML = "";
        document.getElementById("detailsActions").innerHTML = "";
        document.getElementById("detailsBreadcrumb").textContent = `details/${type}/${id}`;
        document.getElementById("detailsBadge").innerHTML = "";
        return;
    }

    document.getElementById("detailsBreadcrumb").textContent = `details/${type}/${id}`;
    document.getElementById("detailsTitle").textContent = `${type.slice(0,-1)} #${id}`;

    // media (product image)
    const media = document.getElementById("detailsMedia");
    if(type === "products"){
        media.innerHTML = `<img src="${item.image}" alt="product">`;
    } else {
        media.innerHTML = `<div style="padding:18px; text-align:center; color: var(--muted);">
            <i class="fa-regular fa-file-lines" style="font-size:42px;"></i>
            <div style="margin-top:8px; font-weight:900;">${type.toUpperCase()}</div>
        </div>`;
    }

    // badge
    const badgeEl = document.getElementById("detailsBadge");
    badgeEl.innerHTML = type==="orders" ? this.statusBadge(item.status)
                    : type==="invoices" ? this.statusBadge(item.status)
                    : type==="products" ? `<span class="badge muted">${item.category}</span>`
                    : `<span class="badge muted">ID ${item.id}</span>`;

    // key/values
    const body = document.getElementById("detailsBody");
    body.innerHTML = "";
    Object.entries(item).forEach(([k,v])=>{
        if(k === "image") return; // already displayed
        const row = document.createElement("div");
        row.className = "kv";
        row.innerHTML = `<b>${k}</b><span>${v}</span>`;
        body.appendChild(row);
    });

    // actions
    const actions = document.getElementById("detailsActions");
    actions.innerHTML = `
        <button class="btn-secondary" onclick="app.openModal('edit','${type}', ${id})"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="btn-secondary" style="background:#ef4444" onclick="app.deleteItem('${type}', ${id})"><i class="fa-solid fa-trash"></i> Delete</button>
    `;

    if(type === "invoices"){
        const b = document.createElement("button");
        b.className = "btn-secondary";
        b.style.background = "#64748b";
        b.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Export PDF`;
        b.onclick = ()=> this.exportInvoicePDF(id);
        actions.appendChild(b);
    }
};