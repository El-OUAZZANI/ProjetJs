// crud-manager.js
app.openModal = function(action, type, id=null){
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
};

app.getFormHTML = function(type, item){
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
};

app.saveItem = function(type){
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
};

app.deleteItem = function(type, id){
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
};