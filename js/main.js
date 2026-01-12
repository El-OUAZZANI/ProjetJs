// main.js
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

    closeModal(){
        document.getElementById("modal").classList.remove("active");
        this.currentModal = { type:"", action:"", id:null };
    },

    getDataForType(type){
        return this.filteredData[type] || this.data[type] || [];
    }
};

// Exposer l'objet app globalement
window.app = app;
window.addEventListener("DOMContentLoaded", ()=> app.init());