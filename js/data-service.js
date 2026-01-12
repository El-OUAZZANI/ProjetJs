// data-service.js
app.loadData = async function(){
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
};

app.makePlaceholderImage = function(label){
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
};

app.generateMockData = function(){
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
};