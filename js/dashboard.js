// dashboard.js
app.loadDashboard = function(){
    this.updateStats();
    this.createCharts();
    this.renderDashboardWidgets();
};

app.getFilteredOrdersForDashboard = function(){
    let orders = [...this.data.orders];

    const userFilter = document.getElementById("dashUserFilter").value;
    const statusFilter = document.getElementById("dashStatusFilter").value;
    const period = document.getElementById("dashPeriodFilter").value;

    if(userFilter !== "all"){
        orders = orders.filter(o=> String(o.userId) === String(userFilter));
    }
    if(statusFilter !== "all"){
        orders = orders.filter(o=> o.status === statusFilter);
    }
    if(period !== "all"){
        const days = Number(period);
        const maxDate = new Date(Math.max(...orders.map(o=> new Date(o.date).getTime())));
        const minDate = new Date(maxDate.getTime() - days*24*3600*1000);
        orders = orders.filter(o=> new Date(o.date) >= minDate && new Date(o.date) <= maxDate);
    }
    return orders;
};

app.updateStats = function(){
    const orders = this.getFilteredOrdersForDashboard();
    const pending = orders.filter(o=>o.status==="Pending").length;
    const revenue = orders.reduce((s,o)=> s + Number(o.total), 0);

    document.getElementById("totalUsers").textContent = this.data.users.length;
    document.getElementById("totalProducts").textContent = this.data.products.length;
    document.getElementById("totalOrders").textContent = orders.length;
    document.getElementById("pendingOrders").textContent = pending;

    const overdue = this.data.invoices.filter(i=>i.status==="Overdue").length;
    document.getElementById("overdueInvoices").textContent = overdue;

    document.getElementById("totalRevenue").textContent = "$" + revenue.toFixed(2);
};

app.computeMonthLabelsAndBuckets = function(orders){
    if(!orders.length){
        // default last 6 months labels
        const now = new Date();
        const labels = [];
        for(let i=5;i>=0;i--){
            const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
            labels.push(d.toLocaleString("en",{month:"short"}));
        }
        return { labels, buckets: labels.map(()=>[]) };
    }

    const dates = orders.map(o=> new Date(o.date));
    const max = new Date(Math.max(...dates.map(d=>d.getTime())));
    const labels = [];
    const buckets = [];

    for(let i=5;i>=0;i--){
        const d = new Date(max.getFullYear(), max.getMonth()-i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        labels.push(d.toLocaleString("en",{month:"short"}));
        buckets.push(orders.filter(o=>{
            const od = new Date(o.date);
            const ok = `${od.getFullYear()}-${String(od.getMonth()+1).padStart(2,"0")}`;
            return ok === key;
        }));
    }
    return { labels, buckets };
};

app.createCharts = function(){
    Object.values(this.charts).forEach(ch => { try{ ch.destroy(); }catch(e){} });
    this.charts = {};

    const orders = this.getFilteredOrdersForDashboard();
    const { labels, buckets } = this.computeMonthLabelsAndBuckets(orders);

    // Line: orders count trend
    const lineData = buckets.map(b=> b.length);

    // Bar: revenue by month
    const barData = buckets.map(b=> b.reduce((s,o)=> s + Number(o.total), 0));

    // Pie: status distribution
    const statusCounts = ["Pending","Completed","Cancelled"].map(st => orders.filter(o=>o.status===st).length);

    // Donut: product category distribution (global products)
    const catMap = {};
    this.data.products.forEach(p=>{ catMap[p.category] = (catMap[p.category]||0)+1; });
    const catLabels = Object.keys(catMap);
    const catValues = Object.values(catMap);

    // Scatter: total vs items
    const scatter = orders.slice(0, 40).map(o=>({ x: Number(o.total), y: Number(o.products) }));

    const ctx1 = document.getElementById("lineChart").getContext("2d");
    this.charts.lineChart = new Chart(ctx1, {
        type:"line",
        data:{ labels, datasets:[{ label:"Orders", data: lineData, borderColor:"rgb(79,70,229)", backgroundColor:"rgba(79,70,229,.12)", tension:.35, fill:true }]},
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } }
    });

    const ctx2 = document.getElementById("pieChart").getContext("2d");
    this.charts.pieChart = new Chart(ctx2, {
        type:"pie",
        data:{ labels:["Pending","Completed","Cancelled"], datasets:[{ data: statusCounts, backgroundColor:["rgb(245,158,11)","rgb(16,185,129)","rgb(239,68,68)"] }]},
        options:{ responsive:true, maintainAspectRatio:false }
    });

    const ctx3 = document.getElementById("barChart").getContext("2d");
    this.charts.barChart = new Chart(ctx3, {
        type:"bar",
        data:{ labels, datasets:[{ label:"Revenue", data: barData, backgroundColor:"rgba(6,182,212,.35)", borderColor:"rgb(6,182,212)", borderWidth:1 }]},
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } }
    });

    const ctx4 = document.getElementById("donutChart").getContext("2d");
    this.charts.donutChart = new Chart(ctx4, {
        type:"doughnut",
        data:{ labels: catLabels, datasets:[{ data: catValues }]},
        options:{ responsive:true, maintainAspectRatio:false }
    });

    const ctx5 = document.getElementById("scatterChart").getContext("2d");
    this.charts.scatterChart = new Chart(ctx5, {
        type:"scatter",
        data:{ datasets:[{ label:"Orders", data: scatter, backgroundColor:"rgb(79,70,229)" }]},
        options:{
            responsive:true, maintainAspectRatio:false,
            scales:{
                x:{ title:{ display:true, text:"Order total ($)" } },
                y:{ title:{ display:true, text:"# of items" }, ticks:{ precision:0 } }
            }
        }
    });
};

app.renderDashboardWidgets = function(){
    const orders = this.getFilteredOrdersForDashboard();
    const recent = [...orders].sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,6);

    const recentEl = document.getElementById("recentOrders");
    recentEl.innerHTML = "";
    recent.forEach(o=>{
        const badgeClass = o.status==="Completed" ? "success" : o.status==="Pending" ? "warning" : "danger";
        const div = document.createElement("div");
        div.className = "mini-row";
        div.innerHTML = `
            <div class="mini-left">
                <div class="badge muted">#${o.id}</div>
                <div class="t">
                    <b>${o.userName}</b>
                    <span>${o.date} • $${Number(o.total).toFixed(2)} • ${o.products} items</span>
                </div>
            </div>
            <div class="badge ${badgeClass}">${o.status}</div>
        `;
        div.style.cursor = "pointer";
        div.onclick = ()=> location.hash = `#details/orders/${o.id}`;
        recentEl.appendChild(div);
    });

    // Top products (simple: highest price)
    const top = [...this.data.products].sort((a,b)=> Number(b.price)-Number(a.price)).slice(0,6);
    const topEl = document.getElementById("topProducts");
    topEl.innerHTML = "";
    top.forEach(p=>{
        const div = document.createElement("div");
        div.className = "mini-row";
        div.innerHTML = `
            <div class="mini-left">
                <img src="${p.image}" alt="img">
                <div class="t">
                    <b title="${p.title}">${p.title}</b>
                    <span>${p.category}</span>
                </div>
            </div>
            <div class="badge success">$${Number(p.price).toFixed(2)}</div>
        `;
        div.style.cursor = "pointer";
        div.onclick = ()=> location.hash = `#details/products/${p.id}`;
        topEl.appendChild(div);
    });
};