// table-manager.js
app.renderTable = function(type){
    const body = document.getElementById(`${type}TableBody`);
    const pagination = document.getElementById(`${type}Pagination`);
    if(!body) return;

    const data = this.getDataForType(type);
    const start = (this.currentPage[type]-1) * this.itemsPerPage;
    const pageData = data.slice(start, start + this.itemsPerPage);

    body.innerHTML = "";

    pageData.forEach(item=>{
        const row = body.insertRow();

        if(type === "users"){
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.username || ""}</td>
                <td class="action-btns">
                    <button class="btn-icon btn-view" onclick="app.goToDetails('users', ${item.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon btn-edit" onclick="app.openModal('edit','users', ${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('users', ${item.id})"><i class="fas fa-trash"></i></button>
                </td>`;
        }

        if(type === "products"){
            row.innerHTML = `
                <td>${item.id}</td>
                <td><img class="thumb" src="${item.image}" alt="img"></td>
                <td title="${item.title}">${item.title}</td>
                <td>$${Number(item.price).toFixed(2)}</td>
                <td>${item.category}</td>
                <td class="action-btns">
                    <button class="btn-icon btn-view" onclick="app.goToDetails('products', ${item.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon btn-edit" onclick="app.openModal('edit','products', ${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('products', ${item.id})"><i class="fas fa-trash"></i></button>
                </td>`;
        }

        if(type === "orders"){
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.userName}</td>
                <td>${item.products}</td>
                <td>$${Number(item.total).toFixed(2)}</td>
                <td>${item.status}</td>
                <td>${item.date}</td>
                <td class="action-btns">
                    <button class="btn-icon btn-view" onclick="app.goToDetails('orders', ${item.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon btn-edit" onclick="app.openModal('edit','orders', ${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('orders', ${item.id})"><i class="fas fa-trash"></i></button>
                </td>`;
        }

        if(type === "customers"){
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.phone || ""}</td>
                <td class="action-btns">
                    <button class="btn-icon btn-view" onclick="app.goToDetails('customers', ${item.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon btn-edit" onclick="app.openModal('edit','customers', ${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('customers', ${item.id})"><i class="fas fa-trash"></i></button>
                </td>`;
        }

        if(type === "invoices"){
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.customerName}</td>
                <td>$${Number(item.amount).toFixed(2)}</td>
                <td>${item.date}</td>
                <td>${item.status}</td>
                <td class="action-btns">
                    <button class="btn-icon btn-view" onclick="app.goToDetails('invoices', ${item.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon btn-edit" onclick="app.openModal('edit','invoices', ${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('invoices', ${item.id})"><i class="fas fa-trash"></i></button>
                    <button class="btn-icon btn-pdf" onclick="app.exportInvoicePDF(${item.id})"><i class="fas fa-file-pdf"></i></button>
                </td>`;
        }
    });

    this.renderPagination(type, data.length, pagination);
};

app.renderPagination = function(type, totalItems, container){
    if(!container) return;
    container.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));

    const prev = document.createElement("button");
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prev.disabled = this.currentPage[type] === 1;
    prev.onclick = ()=> { this.currentPage[type]--; this.renderTable(type); };
    container.appendChild(prev);

    for(let i=1;i<=totalPages;i++){
        if(i===1 || i===totalPages || (i>=this.currentPage[type]-1 && i<=this.currentPage[type]+1)){
            const b = document.createElement("button");
            b.textContent = i;
            b.className = i===this.currentPage[type] ? "active" : "";
            b.onclick = ()=> { this.currentPage[type]=i; this.renderTable(type); };
            container.appendChild(b);
        } else if(i===this.currentPage[type]-2 || i===this.currentPage[type]+2){
            const span = document.createElement("span");
            span.textContent = "...";
            span.style.padding = "8px 12px";
            container.appendChild(span);
        }
    }

    const next = document.createElement("button");
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled = this.currentPage[type] === totalPages;
    next.onclick = ()=> { this.currentPage[type]++; this.renderTable(type); };
    container.appendChild(next);
};

app.searchTable = function(type, query){
    const q = (query || "").toString().trim().toLowerCase();
    if(!q){ this.filteredData[type] = null; }
    else{
        const base = this.data[type] || [];
        this.filteredData[type] = base.filter(item =>
            Object.values(item).some(v => String(v).toLowerCase().includes(q))
        );
    }
    this.currentPage[type] = 1;
    this.renderTable(type);
};

app.sortTable = function(type, colIndex){
    const data = this.getDataForType(type);
    const key = this.tableColumns[type]?.[colIndex];
    if(!key) return;

    if(!this.sortOrder[type]) this.sortOrder[type] = {};
    const dir = this.sortOrder[type][key] === "asc" ? "desc" : "asc";
    this.sortOrder[type][key] = dir;

    data.sort((a,b)=>{
        const A = a[key]; const B = b[key];
        if(typeof A === "number" && typeof B === "number") return dir==="asc" ? A-B : B-A;
        return dir==="asc"
            ? String(A||"").localeCompare(String(B||""), undefined, { sensitivity:"base" })
            : String(B||"").localeCompare(String(A||""), undefined, { sensitivity:"base" });
    });

    // If filtered, keep sorting in filtered array; else in original
    if(this.filteredData[type]) this.filteredData[type] = data;
    else this.data[type] = data;

    this.renderTable(type);
};