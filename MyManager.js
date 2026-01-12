
    const app = {
      data: { users: [], products: [], orders: [], customers: [], invoices: [] },
      filteredData: {},
      currentPage: { users: 1, products: 1, orders: 1, customers: 1, invoices: 1 },
      itemsPerPage: 10,
      sortOrder: {},
      charts: {},
      currentModal: { type: "", action: "", id: null },
      currentLang: "fr",
      lastEntityPage: "dashboard",

      pageCache: {},

      tableColumns: {
        users: ["id","name","email","username"],
        products: ["id","image","title","price","category"],
        orders: ["id","userName","products","total","status","date"],
        customers: ["id","name","email","phone"],
        invoices: ["id","customerName","amount","date","status"]
      },

      translations: {
        fr: {
          "login.title":"Connexion MyManager",
          "login.username":"Nom d'utilisateur",
          "login.password":"Mot de passe",
          "login.submit":"Se connecter",
          "menu.dashboard":"Tableau de bord",
          "menu.users":"Utilisateurs",
          "menu.products":"Produits",
          "menu.orders":"Commandes",
          "menu.customers":"Clients",
          "menu.invoices":"Factures",
          "logout":"Déconnexion",
          "global.search":"Recherche…",

          "stats.users":"Utilisateurs totaux",
          "stats.products":"Produits totaux",
          "stats.orders":"Commandes totales",
          "stats.pending":"Commandes en attente",
          "stats.overdue":"Factures en retard",
          "stats.revenue":"Revenu total",

          "charts.orderTrend":"Tendance des commandes",
          "charts.orderStatus":"Statut des commandes",
          "charts.monthlyRevenue":"Revenu mensuel",
          "charts.categoryDistribution":"Répartition des catégories",
          "charts.scatter":"Corrélation (Total vs Produits)",

          "dash.filter.user":"Utilisateur",
          "dash.filter.status":"Statut",
          "dash.filter.period":"Période",
          "dash.recentOrders":"Commandes récentes",
          "dash.topProducts":"Top produits",

          "details.back":"Retour",

          "search.users":"Rechercher des utilisateurs…",
          "search.products":"Rechercher des produits…",
          "search.orders":"Rechercher des commandes…",
          "search.customers":"Rechercher des clients…",
          "search.invoices":"Rechercher des factures…",
        },

        en: {
          "login.title":"MyManager Login",
          "login.username":"Username",
          "login.password":"Password",
          "login.submit":"Login",
          "menu.dashboard":"Dashboard",
          "menu.users":"Users",
          "menu.products":"Products",
          "menu.orders":"Orders",
          "menu.customers":"Customers",
          "menu.invoices":"Invoices",
          "logout":"Logout",
          "global.search":"Search…",

          "stats.users":"Total Users",
          "stats.products":"Total Products",
          "stats.orders":"Total Orders",
          "stats.pending":"Pending Orders",
          "stats.overdue":"Overdue Invoices",
          "stats.revenue":"Total Revenue",

          "charts.orderTrend":"Orders Trend",
          "charts.orderStatus":"Order Status",
          "charts.monthlyRevenue":"Monthly Revenue",
          "charts.categoryDistribution":"Category Distribution",
          "charts.scatter":"Correlation (Total vs Items)",

          "dash.filter.user":"User",
          "dash.filter.status":"Status",
          "dash.filter.period":"Period",
          "dash.recentOrders":"Recent Orders",
          "dash.topProducts":"Top Products",

          "details.back":"Back",

          "search.users":"Search users…",
          "search.products":"Search products…",
          "search.orders":"Search orders…",
          "search.customers":"Search customers…",
          "search.invoices":"Search invoices…",
        },

        ar: {
          "login.title":"تسجيل الدخول - MyManager",
          "login.username":"اسم المستخدم",
          "login.password":"كلمة المرور",
          "login.submit":"دخول",
          "menu.dashboard":"لوحة التحكم",
          "menu.users":"المستخدمون",
          "menu.products":"المنتجات",
          "menu.orders":"الطلبات",
          "menu.customers":"العملاء",
          "menu.invoices":"الفواتير",
          "logout":"تسجيل الخروج",
          "global.search":"بحث…",

          "stats.users":"إجمالي المستخدمين",
          "stats.products":"إجمالي المنتجات",
          "stats.orders":"إجمالي الطلبات",
          "stats.pending":"طلبات قيد الانتظار",
          "stats.overdue":"فواتير متأخرة",
          "stats.revenue":"إجمالي الإيرادات",

          "charts.orderTrend":"اتجاه الطلبات",
          "charts.orderStatus":"حالة الطلبات",
          "charts.monthlyRevenue":"الإيراد الشهري",
          "charts.categoryDistribution":"توزيع الفئات",
          "charts.scatter":"علاقة (المجموع × العناصر)",

          "dash.filter.user":"المستخدم",
          "dash.filter.status":"الحالة",
          "dash.filter.period":"الفترة",
          "dash.recentOrders":"أحدث الطلبات",
          "dash.topProducts":"أفضل المنتجات",

          "details.back":"رجوع",

          "search.users":"ابحث عن مستخدمين…",
          "search.products":"ابحث عن منتجات…",
          "search.orders":"ابحث عن طلبات…",
          "search.customers":"ابحث عن عملاء…",
          "search.invoices":"ابحث عن فواتير…",
        }
      },

      async init(){
        this.setupEventListeners();
        await this.loadData();
        this.applyTranslations();
        await this.routeFromHash();
      },

      setupEventListeners(){
        document.getElementById("loginForm").addEventListener("submit", (e)=>{
          e.preventDefault(); this.handleLogin();
        });

        document.getElementById("logoutBtn").addEventListener("click", ()=> this.handleLogout());

        document.getElementById("langBtn").addEventListener("click", (e)=>{
          e.stopPropagation();
          document.getElementById("langDropdown").classList.toggle("active");
        });

        document.querySelectorAll(".lang-dropdown a").forEach(a=>{
          a.addEventListener("click",(e)=>{
            e.preventDefault();
            this.changeLang(a.dataset.lang);
          });
        });

        document.addEventListener("click",(e)=>{
          if(!e.target.closest(".lang-selector")) document.getElementById("langDropdown").classList.remove("active");
        });

        document.querySelectorAll(".nav-link").forEach(link=>{
          link.addEventListener("click",(e)=>{
            e.preventDefault();
            const page = link.dataset.page;
            location.hash = `#${page}`;
          });
        });

        window.addEventListener("hashchange", ()=> this.routeFromHash());

        document.getElementById("modal").addEventListener("click",(e)=>{
          if(e.target.id === "modal") this.closeModal();
        });

        document.getElementById("globalSearch").addEventListener("input",(e)=>{
          const q = e.target.value.trim().toLowerCase();
          const hash = location.hash.replace("#","");
          const entity = ["users","products","orders","customers","invoices"].includes(hash) ? hash : null;
          if(entity){
            this.searchTable(entity, q);
          }
        });
      },
 // Verification de login et password
      handleLogin(){
        const u = document.getElementById("username").value;
        const p = document.getElementById("password").value;
        if(u==="admin" && p==="admin"){
          document.getElementById("loginPage").style.display="none";
          document.getElementById("appContainer").classList.add("active");
          this.applyTranslations();
          this.routeFromHash();
        } else alert("Invalid credentials! Use admin/admin");
      },

      handleLogout(){
        document.getElementById("appContainer").classList.remove("active");
        document.getElementById("loginPage").style.display="flex";
        document.getElementById("username").value="admin";
        document.getElementById("password").value="admin";
        location.hash = "#dashboard";
      },

      changeLang(lang){
        this.currentLang = lang;
        document.getElementById("currentLang").textContent = lang.toUpperCase();
        document.getElementById("langDropdown").classList.remove("active");

        // RTL for Arabic
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

        this.applyTranslations();
        this.routeFromHash();
      },

      applyTranslations(){
        const dict = this.translations[this.currentLang] || {};
        document.querySelectorAll("[data-i18n]").forEach(el=>{
          const k = el.getAttribute("data-i18n");
          if(dict[k]) el.textContent = dict[k];
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
          const k = el.getAttribute("data-i18n-placeholder");
          if(dict[k]) el.setAttribute("placeholder", dict[k]);
        });
      },

      async loadPage(page){
        const root = document.getElementById("pageRoot");
        if(!root) return;

        try{
          if(!this.pageCache[page]){
            const res = await fetch(`pages/${page}.html`, { cache: "no-store" });
            if(!res.ok) throw new Error(`Cannot load pages/${page}.html`);
            this.pageCache[page] = await res.text();
          }
          root.innerHTML = this.pageCache[page];

          // Ensure the loaded page is visible
          const pageEl = root.querySelector(`#${page}`) || root.querySelector(".page");
          if(pageEl) pageEl.classList.add("active");

          this.applyTranslations();
          this.bindPageControls(page);
        }catch(err){
          console.error(err);
          root.innerHTML = `<div class="page active"><div class="table-container"><div style="padding:16px;">Page "${page}" introuvable.</div></div></div>`;
        }
      },

      bindPageControls(page){
        const setInput = (id, fn)=>{
          const el = document.getElementById(id);
          if(el) el.oninput = fn;
        };
        const setChange = (id, fn)=>{
          const el = document.getElementById(id);
          if(el) el.onchange = fn;
        };

        if(page === "dashboard"){
          setChange("dashUserFilter", ()=> this.loadDashboard());
          setChange("dashStatusFilter", ()=> this.loadDashboard());
          setChange("dashPeriodFilter", ()=> this.loadDashboard());
        }

        if(page === "users"){
          setInput("userSearch", (e)=> this.searchTable("users", e.target.value));
        }

        if(page === "products"){
          setInput("productSearch", (e)=> this.searchTable("products", e.target.value));
          setChange("productCategoryFilter", ()=> this.applyProductCategoryFilter());
        }

        if(page === "orders"){
          setInput("orderSearch", (e)=> this.searchTable("orders", e.target.value));
          setChange("orderStatusFilter", ()=> this.applyOrderStatusFilter());
        }

        if(page === "customers"){
          setInput("customerSearch", (e)=> this.searchTable("customers", e.target.value));
        }

        if(page === "invoices"){
          setInput("invoiceSearch", (e)=> this.searchTable("invoices", e.target.value));
          setChange("invoiceStatusFilter", ()=> this.applyInvoiceStatusFilter());
        }

        if(page === "details"){
          const back = document.getElementById("detailsBackBtn");
          if(back){
            back.onclick = ()=> { location.hash = `#${this.lastEntityPage}`; };
          }
        }
      },

      async routeFromHash(){
        const hash = (location.hash || "#dashboard").slice(1);

        // details
        if(hash.startsWith("details/")){
          const [, type, id] = hash.split("/");
          this.lastEntityPage = type || this.lastEntityPage;
          await this.loadPage("details");
          this.showPage("details");
          this.renderDetails(type, id);
          return;
        }

        const page = ["dashboard","users","products","orders","customers","invoices"].includes(hash) ? hash : "dashboard";
        await this.loadPage(page);
        this.showPage(page);

        if(page === "dashboard"){
          this.buildDashboardFilters();
          this.loadDashboard();
          return;
        }

        // Entity pages
        this.filteredData[page] = [...this.data[page]];
        this.currentPage[page] = 1;

        const searchMap = {
          users: "userSearch",
          products: "productSearch",
          orders: "orderSearch",
          customers: "customerSearch",
          invoices: "invoiceSearch",
        };
        if(searchMap[page]){
          const inp = document.getElementById(searchMap[page]);
          if(inp) inp.value = "";
        }

        if(page === "products") this.buildEntityFilters();
        this.renderTable(page);
      },

      showPage(page){
        document.querySelectorAll("#pageRoot .page").forEach(p=>p.classList.remove("active"));
        document.querySelectorAll(".nav-link").forEach(l=>l.classList.remove("active"));

        const pageEl = document.getElementById(page);
        if(pageEl) pageEl.classList.add("active");

        if(page !== "details"){
          const link = document.querySelector(`[data-page="${page}"]`);
          if(link) link.classList.add("active");
        }

        const titles = {
          dashboard: (this.currentLang==="fr") ? "Tableau de bord" : (this.currentLang==="ar" ? "لوحة التحكم" : "Dashboard"),
          users: (this.currentLang==="fr") ? "Utilisateurs" : (this.currentLang==="ar" ? "المستخدمون" : "Users"),
          products: (this.currentLang==="fr") ? "Produits" : (this.currentLang==="ar" ? "المنتجات" : "Products"),
          orders: (this.currentLang==="fr") ? "Commandes" : (this.currentLang==="ar" ? "الطلبات" : "Orders"),
          customers: (this.currentLang==="fr") ? "Clients" : (this.currentLang==="ar" ? "العملاء" : "Customers"),
          invoices: (this.currentLang==="fr") ? "Factures" : (this.currentLang==="ar" ? "الفواتير" : "Invoices"),
          details: (this.currentLang==="fr") ? "Détails" : (this.currentLang==="ar" ? "تفاصيل" : "Details"),
        };
        document.getElementById("pageTitle").textContent = titles[page] || page;
      },

      async loadData(){
        try{
          const [users, products] = await Promise.all([
            fetch("https://jsonplaceholder.typicode.com/users").then(r=>r.json()),
            fetch("https://fakestoreapi.com/products").then(r=>r.json())
          ]);

          this.data.users = users;
          // ensure product image exists
          this.data.products = products.map(p=>({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            category: p.category,
            image: p.image || this.makePlaceholderImage(p.category || "P"),
          }));

          this.data.customers = users.slice(0, 8).map(u=>({ ...u, phone: "555-" + Math.floor(Math.random()*9000 + 1000) }));

          this.data.orders = Array.from({length: 30}, (_, i)=>({
            id: i+1,
            userId: Math.floor(Math.random()*10)+1,
            userName: users[Math.floor(Math.random()*users.length)].name,
            products: Math.floor(Math.random()*5)+1,
            total: Number((Math.random()*500+50).toFixed(2)),
            status: ["Pending","Completed","Cancelled"][Math.floor(Math.random()*3)],
            date: new Date(2024, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1).toISOString().split("T")[0]
          }));

          this.data.invoices = Array.from({length: 22}, (_, i)=>({
            id: i+1,
            customerId: Math.floor(Math.random()*8)+1,
            customerName: this.data.customers[Math.floor(Math.random()*8)].name,
            amount: Number((Math.random()*1000+100).toFixed(2)),
            date: new Date(2024, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1).toISOString().split("T")[0],
            status: ["Paid","Pending","Overdue"][Math.floor(Math.random()*3)]
          }));

        } catch(err){
          console.error(err);
          this.generateMockData();
        }
      },

      makePlaceholderImage(label){
        const t = (label || "P").toString().slice(0,1).toUpperCase();
        const svg =
          `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#e2e8f0"/>
                <stop offset="1" stop-color="#f8fafc"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
            <circle cx="120" cy="120" r="70" fill="#ffffff" stroke="#e5e7eb" stroke-width="2"/>
            <text x="120" y="132" text-anchor="middle" font-family="Arial" font-size="56" fill="#0f172a">${t}</text>
          </svg>`;
        return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
      },

      generateMockData(){
        this.data.users = Array.from({length: 40}, (_, i)=>({
          id: i+1, name: `User ${i+1}`, email: `user${i+1}@example.com`, username: `user${i+1}`
        }));

        const cats = ["Electronics","Clothing","Books","Home"];
        this.data.products = Array.from({length: 35}, (_, i)=>({
          id: i+1,
          title: `Product ${i+1}`,
          price: Number((Math.random()*100+10).toFixed(2)),
          category: cats[Math.floor(Math.random()*cats.length)],
          image: this.makePlaceholderImage(cats[Math.floor(Math.random()*cats.length)])
        }));

        this.data.orders = Array.from({length: 30}, (_, i)=>({
          id: i+1,
          userId: Math.floor(Math.random()*40)+1,
          userName: `User ${Math.floor(Math.random()*40)+1}`,
          products: Math.floor(Math.random()*5)+1,
          total: Number((Math.random()*500+50).toFixed(2)),
          status: ["Pending","Completed","Cancelled"][Math.floor(Math.random()*3)],
          date: new Date(2024, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1).toISOString().split("T")[0]
        }));

        this.data.customers = Array.from({length: 20}, (_, i)=>({
          id: i+1,
          name: `Customer ${i+1}`,
          email: `customer${i+1}@example.com`,
          phone: `555-${Math.floor(Math.random()*9000+1000)}`
        }));

        this.data.invoices = Array.from({length: 22}, (_, i)=>({
          id: i+1,
          customerId: Math.floor(Math.random()*20)+1,
          customerName: `Customer ${Math.floor(Math.random()*20)+1}`,
          amount: Number((Math.random()*1000+100).toFixed(2)),
          date: new Date(2024, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1).toISOString().split("T")[0],
          status: ["Paid","Pending","Overdue"][Math.floor(Math.random()*3)]
        }));
      },

      /* -------------------- Filters setup -------------------- */
      buildDashboardFilters(){
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
      },

      buildEntityFilters(){
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
      },

      applyProductCategoryFilter(){
        const v = document.getElementById("productCategoryFilter").value;
        if(v === "all"){ this.filteredData.products = null; }
        else { this.filteredData.products = this.data.products.filter(p=>p.category === v); }
        this.currentPage.products = 1;
        this.renderTable("products");
      },

      applyOrderStatusFilter(){
        const v = document.getElementById("orderStatusFilter").value;
        if(v === "all"){ this.filteredData.orders = null; }
        else { this.filteredData.orders = this.data.orders.filter(o=>o.status === v); }
        this.currentPage.orders = 1;
        this.renderTable("orders");
      },

      applyInvoiceStatusFilter(){
        const v = document.getElementById("invoiceStatusFilter").value;
        if(v === "all"){ this.filteredData.invoices = null; }
        else { this.filteredData.invoices = this.data.invoices.filter(i=>i.status === v); }
        this.currentPage.invoices = 1;
        this.renderTable("invoices");
      },

      /* -------------------- Dashboard -------------------- */
      loadDashboard(){
        this.updateStats();
        this.createCharts();
        this.renderDashboardWidgets();
      },

      getFilteredOrdersForDashboard(){
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
      },

      updateStats(){
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
      },

      computeMonthLabelsAndBuckets(orders){
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
      },

      createCharts(){
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
      },

      renderDashboardWidgets(){
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
      },

      /* -------------------- Tables -------------------- */
      getDataForType(type){
        return this.filteredData[type] || this.data[type] || [];
      },

      renderTable(type){
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
      },

      renderPagination(type, totalItems, container){
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
      },

      searchTable(type, query){
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
      },

      sortTable(type, colIndex){
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
      },

      /* -------------------- Details Page -------------------- */
      goToDetails(type, id){
        this.lastEntityPage = type;
        location.hash = `#details/${type}/${id}`;
      },

      getItemById(type, id){
        const list = this.data[type] || [];
        return list.find(x=> Number(x.id) === Number(id));
      },

      statusBadge(status){
        if(!status) return `<span class="badge muted">—</span>`;
        const cls = status==="Completed" || status==="Paid" ? "success"
                  : status==="Pending" ? "warning"
                  : status==="Overdue" || status==="Cancelled" ? "danger"
                  : "muted";
        return `<span class="badge ${cls}">${status}</span>`;
      },

      renderDetails(type, id){
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
      },

      /* -------------------- CRUD (Modal Add/Edit) -------------------- */
      openModal(action, type, id=null){
        this.currentModal = { action, type, id };
        const modal = document.getElementById("modal");
        const title = document.getElementById("modalTitle");
        const body = document.getElementById("modalBody");

        if(action==="add"){
          title.textContent = `Add ${type.slice(0,-1)}`;
          body.innerHTML = this.getFormHTML(type, null);
        }
        if(action==="edit" && id){
          const item = this.getItemById(type, id);
          title.textContent = `Edit ${type.slice(0,-1)} #${id}`;
          body.innerHTML = this.getFormHTML(type, item);
        }

        modal.classList.add("active");
      },

      closeModal(){
        document.getElementById("modal").classList.remove("active");
        this.currentModal = { type:"", action:"", id:null };
      },

      getFormHTML(type, item){
        // minimal fields per entity (you can extend later)
        if(type==="users"){
          return `
            <form onsubmit="event.preventDefault(); app.saveItem('users')">
              <input type="hidden" id="modalId" value="${item?.id || ""}">
              <div class="form-row">
                <div class="form-field">
                  <label>Name</label>
                  <input id="modalName" value="${item?.name || ""}" required>
                </div>
                <div class="form-field">
                  <label>Username</label>
                  <input id="modalUsername" value="${item?.username || ""}" required>
                </div>
              </div>
              <div class="form-field">
                <label>Email</label>
                <input id="modalEmail" type="email" value="${item?.email || ""}" required>
              </div>
              <div class="form-actions">
                <button class="btn-secondary" type="button" onclick="app.closeModal()">Cancel</button>
                <button class="btn-secondary" type="submit" style="background: var(--primary)">Save</button>
              </div>
            </form>`;
        }

        if(type==="products"){
          const img = item?.image || this.makePlaceholderImage(item?.category || "P");
          return `
            <form onsubmit="event.preventDefault(); app.saveItem('products')">
              <input type="hidden" id="modalId" value="${item?.id || ""}">
              <div class="form-field">
                <label>Title</label>
                <input id="modalTitleInput" value="${item?.title || ""}" required>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Price</label>
                  <input id="modalPrice" type="number" step="0.01" value="${item?.price ?? ""}" required>
                </div>
                <div class="form-field">
                  <label>Category</label>
                  <input id="modalCategory" value="${item?.category || ""}" required>
                </div>
              </div>
              <div class="form-field">
                <label>Image URL</label>
                <input id="modalImage" value="${item?.image || ""}" placeholder="https://...">
              </div>
              <div style="display:flex; gap:10px; align-items:center;">
                <img class="thumb" src="${img}" id="modalImagePreview" alt="preview">
                <div style="color: var(--muted); font-size: 12px;">
                  Preview auto. If empty, placeholder will be used.
                </div>
              </div>

              <div class="form-actions">
                <button class="btn-secondary" type="button" onclick="app.closeModal()">Cancel</button>
                <button class="btn-secondary" type="submit" style="background: var(--primary)">Save</button>
              </div>
            </form>`;
        }

        if(type==="orders"){
          return `
            <form onsubmit="event.preventDefault(); app.saveItem('orders')">
              <input type="hidden" id="modalId" value="${item?.id || ""}">
              <div class="form-row">
                <div class="form-field">
                  <label>User</label>
                  <input id="modalOrderUser" value="${item?.userName || ""}" required>
                </div>
                <div class="form-field">
                  <label>Status</label>
                  <select id="modalOrderStatus">
                    ${["Pending","Completed","Cancelled"].map(s=>`<option ${item?.status===s?"selected":""}>${s}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label># Products</label>
                  <input id="modalOrderProducts" type="number" value="${item?.products ?? 1}" min="1" required>
                </div>
                <div class="form-field">
                  <label>Total</label>
                  <input id="modalOrderTotal" type="number" step="0.01" value="${item?.total ?? 0}" required>
                </div>
              </div>
              <div class="form-field">
                <label>Date</label>
                <input id="modalOrderDate" type="date" value="${item?.date || ""}" required>
              </div>
              <div class="form-actions">
                <button class="btn-secondary" type="button" onclick="app.closeModal()">Cancel</button>
                <button class="btn-secondary" type="submit" style="background: var(--primary)">Save</button>
              </div>
            </form>`;
        }

        if(type==="customers"){
          return `
            <form onsubmit="event.preventDefault(); app.saveItem('customers')">
              <input type="hidden" id="modalId" value="${item?.id || ""}">
              <div class="form-row">
                <div class="form-field">
                  <label>Name</label>
                  <input id="modalCustName" value="${item?.name || ""}" required>
                </div>
                <div class="form-field">
                  <label>Phone</label>
                  <input id="modalCustPhone" value="${item?.phone || ""}" required>
                </div>
              </div>
              <div class="form-field">
                <label>Email</label>
                <input id="modalCustEmail" type="email" value="${item?.email || ""}" required>
              </div>
              <div class="form-actions">
                <button class="btn-secondary" type="button" onclick="app.closeModal()">Cancel</button>
                <button class="btn-secondary" type="submit" style="background: var(--primary)">Save</button>
              </div>
            </form>`;
        }

        if(type==="invoices"){
          return `
            <form onsubmit="event.preventDefault(); app.saveItem('invoices')">
              <input type="hidden" id="modalId" value="${item?.id || ""}">
              <div class="form-row">
                <div class="form-field">
                  <label>Customer</label>
                  <input id="modalInvCustomer" value="${item?.customerName || ""}" required>
                </div>
                <div class="form-field">
                  <label>Status</label>
                  <select id="modalInvStatus">
                    ${["Paid","Pending","Overdue"].map(s=>`<option ${item?.status===s?"selected":""}>${s}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Amount</label>
                  <input id="modalInvAmount" type="number" step="0.01" value="${item?.amount ?? 0}" required>
                </div>
                <div class="form-field">
                  <label>Date</label>
                  <input id="modalInvDate" type="date" value="${item?.date || ""}" required>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-secondary" type="button" onclick="app.closeModal()">Cancel</button>
                <button class="btn-secondary" type="submit" style="background: var(--primary)">Save</button>
              </div>
            </form>`;
        }

        return "<p>Form not available</p>";
      },

      saveItem(type){
        const { action, id } = this.currentModal;

        if(action==="add"){
          const newId = (Math.max(0, ...this.data[type].map(x=>Number(x.id))) + 1);

          if(type==="users"){
            this.data.users.push({
              id: newId,
              name: document.getElementById("modalName").value,
              email: document.getElementById("modalEmail").value,
              username: document.getElementById("modalUsername").value
            });
          }

          if(type==="products"){
            const imageUrl = (document.getElementById("modalImage").value || "").trim();
            const cat = document.getElementById("modalCategory").value.trim() || "Product";
            this.data.products.push({
              id: newId,
              title: document.getElementById("modalTitleInput").value,
              price: Number(document.getElementById("modalPrice").value),
              category: cat,
              image: imageUrl || this.makePlaceholderImage(cat)
            });
            // update categories list
            this.buildEntityFilters();
          }

          if(type==="orders"){
            this.data.orders.push({
              id: newId,
              userId: 1,
              userName: document.getElementById("modalOrderUser").value,
              products: Number(document.getElementById("modalOrderProducts").value),
              total: Number(document.getElementById("modalOrderTotal").value),
              status: document.getElementById("modalOrderStatus").value,
              date: document.getElementById("modalOrderDate").value
            });
          }

          if(type==="customers"){
            this.data.customers.push({
              id: newId,
              name: document.getElementById("modalCustName").value,
              email: document.getElementById("modalCustEmail").value,
              phone: document.getElementById("modalCustPhone").value
            });
          }

          if(type==="invoices"){
            this.data.invoices.push({
              id: newId,
              customerId: 1,
              customerName: document.getElementById("modalInvCustomer").value,
              amount: Number(document.getElementById("modalInvAmount").value),
              date: document.getElementById("modalInvDate").value,
              status: document.getElementById("modalInvStatus").value
            });
          }
        }

        if(action==="edit" && id){
          const idx = this.data[type].findIndex(x=> Number(x.id) === Number(id));
          if(idx !== -1){
            if(type==="users"){
              this.data.users[idx].name = document.getElementById("modalName").value;
              this.data.users[idx].email = document.getElementById("modalEmail").value;
              this.data.users[idx].username = document.getElementById("modalUsername").value;
            }

            if(type==="products"){
              const imageUrl = (document.getElementById("modalImage").value || "").trim();
              const cat = document.getElementById("modalCategory").value.trim() || "Product";
              this.data.products[idx].title = document.getElementById("modalTitleInput").value;
              this.data.products[idx].price = Number(document.getElementById("modalPrice").value);
              this.data.products[idx].category = cat;
              this.data.products[idx].image = imageUrl || this.makePlaceholderImage(cat);
              this.buildEntityFilters();
            }

            if(type==="orders"){
              this.data.orders[idx].userName = document.getElementById("modalOrderUser").value;
              this.data.orders[idx].status = document.getElementById("modalOrderStatus").value;
              this.data.orders[idx].products = Number(document.getElementById("modalOrderProducts").value);
              this.data.orders[idx].total = Number(document.getElementById("modalOrderTotal").value);
              this.data.orders[idx].date = document.getElementById("modalOrderDate").value;
            }

            if(type==="customers"){
              this.data.customers[idx].name = document.getElementById("modalCustName").value;
              this.data.customers[idx].email = document.getElementById("modalCustEmail").value;
              this.data.customers[idx].phone = document.getElementById("modalCustPhone").value;
            }

            if(type==="invoices"){
              this.data.invoices[idx].customerName = document.getElementById("modalInvCustomer").value;
              this.data.invoices[idx].amount = Number(document.getElementById("modalInvAmount").value);
              this.data.invoices[idx].date = document.getElementById("modalInvDate").value;
              this.data.invoices[idx].status = document.getElementById("modalInvStatus").value;
            }
          }
        }

        this.closeModal();
        this.renderTable(type);
        this.loadDashboard();

        // if we are on details page, refresh it
        const h = location.hash.slice(1);
        if(h.startsWith(`details/${type}/`)){
          this.renderDetails(type, id || (Math.max(...this.data[type].map(x=>x.id))));
        }
      },

      deleteItem(type, id){
        if(!confirm("Are you sure you want to delete this item?")) return;

        const idx = this.data[type].findIndex(x=> Number(x.id) === Number(id));
        if(idx !== -1){
          this.data[type].splice(idx, 1);
          this.filteredData[type] = null;
          this.renderTable(type);
          this.loadDashboard();

          // if deleting item opened in details
          const h = location.hash.slice(1);
          if(h === `details/${type}/${id}`){
            location.hash = `#${this.lastEntityPage || "dashboard"}`;
          }
        }
      },

      /* -------------------- Exports -------------------- */
      exportCSV(type){
        const data = this.getDataForType(type);
        if(!data.length) return;

        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(","),
          ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
        ].join("\n");

        const blob = new Blob([csv], { type:"text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },

      exportInvoicePDF(invoiceId){
        const inv = this.getItemById("invoices", invoiceId);
        if(!inv){ alert("Invoice not found"); return; }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica","bold");
        doc.setFontSize(18);
        doc.text("MyManager Invoice", 14, 18);

        doc.setFont("helvetica","normal");
        doc.setFontSize(12);

        const lines = [
          ["Invoice ID", String(inv.id)],
          ["Customer", inv.customerName],
          ["Amount", `$${Number(inv.amount).toFixed(2)}`],
          ["Date", inv.date],
          ["Status", inv.status],
        ];

        let y = 32;
        lines.forEach(([k,v])=>{
          doc.setFont("helvetica","bold");
          doc.text(k + ":", 14, y);
          doc.setFont("helvetica","normal");
          doc.text(String(v), 55, y);
          y += 10;
        });

        doc.setDrawColor(220);
        doc.line(14, y+4, 196, y+4);

        doc.setFont("helvetica","normal");
        doc.setFontSize(10);
        doc.text("Generated by MyManager Backoffice (VanillaJS)", 14, y+14);

        doc.save(`invoice_${inv.id}.pdf`);
      }
    };

    window.addEventListener("DOMContentLoaded", ()=> app.init());
    window.app = app;
