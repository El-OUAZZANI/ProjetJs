// filters.js
app.buildDashboardFilters = function(){
    const sel = document.getElementById("dashUserFilter");
    sel.innerHTML = "";
    const optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = "All";
    sel.appendChild(optAll);

    this.data.users.forEach(u=>{
        const o = document.createElement("option");
        o.value = String(u.id);
        o.textContent = u.name;
        sel.appendChild(o);
    });
};

app.buildEntityFilters = function(){
    // product categories
    const catSel = document.getElementById("productCategoryFilter");
    if(!catSel) return;

    // reset (avoid duplicates when navigating)
    catSel.innerHTML = '<option value="all">All categories</option>';

    const cats = Array.from(new Set(this.data.products.map(p=>p.category))).sort();
    cats.forEach(c=>{
        const o = document.createElement("option");
        o.value = c;
        o.textContent = c;
        catSel.appendChild(o);
    });
};

app.applyProductCategoryFilter = function(){
    const v = document.getElementById("productCategoryFilter").value;
    if(v === "all"){ this.filteredData.products = null; }
    else { this.filteredData.products = this.data.products.filter(p=>p.category === v); }
    this.currentPage.products = 1;
    this.renderTable("products");
};

app.applyOrderStatusFilter = function(){
    const v = document.getElementById("orderStatusFilter").value;
    if(v === "all"){ this.filteredData.orders = null; }
    else { this.filteredData.orders = this.data.orders.filter(o=>o.status === v); }
    this.currentPage.orders = 1;
    this.renderTable("orders");
};

app.applyInvoiceStatusFilter = function(){
    const v = document.getElementById("invoiceStatusFilter").value;
    if(v === "all"){ this.filteredData.invoices = null; }
    else { this.filteredData.invoices = this.data.invoices.filter(i=>i.status === v); }
    this.currentPage.invoices = 1;
    this.renderTable("invoices");
};