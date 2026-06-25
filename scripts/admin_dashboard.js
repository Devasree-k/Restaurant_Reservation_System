let allCustomers=[];

$(document).ready(async function(){

    checkAdmin();
    initializeSidebar();
    DashboardCount();
    loadCustomers();
    loadTableDetails();

    $("#SaveTableDetails").click(saveTable);

    
});

//Check admin login
function checkAdmin(){
    const role=localStorage.getItem("userRole");
    if(role!=="admin"){
        window.location.href="../pages/login.html";
    }
}

//Activate the Sidebar Sections
function initializeSidebar(){
    const menus=document.querySelectorAll(".menu-item");
    const sections=document.querySelectorAll("section");

    menus.forEach(item=>{
        item.addEventListener("click",()=>{
            menus.forEach(menu=>menu.classList.remove("active"));
            item.classList.add("active");
            sections.forEach(section=>section .classList.add("d-none"));
            const sectionName=item.dataset.section;
            document.getElementById(`${sectionName}`).classList.remove("d-none");
        });
    })
}

//Display the Dashboard sections count dynamically
async function DashboardCount() {
    try{
        const customerResponse = await fetch(API.customers);
        const customers=await customerResponse.json();
        document.getElementById("CustomerCount").textContent=customers.length;

        const tableResponse = await fetch(API.tables);
        const tables = await tableResponse.json();
        document.getElementById("tableCount").textContent =tables.length;

    }catch(error){
        console.error(error);
    }
}

//Load customer details
async function loadCustomers(){
    try{
        const response=await fetch(API.customers);
        allCustomers=await response.json();
        DisplayCustomers(allCustomers);
    }catch(error){
        console.error("Customer details load error ");
    }
}

//Display cutomer details in table
function DisplayCustomers(customers){
    const customersTable=document.getElementById("customerTableBody");
    
    customersTable.innerHTML= "";
    customers.forEach(customer=>{
        customersTable.innerHTML+=`
        <tr>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.email}</td>
        <td>${customer.dob}</td>
        <td>${customer.address}</td>
        </tr>
        `;
    });
}

//save tables details
async function saveTable() {
    const status=document.querySelector('input[name="status"]:checked');

    const tableData={
        tableId: document.getElementById("tableId").value,
        tableNo: document.getElementById("tableNo").value,
        capacity: document.getElementById("capacity").value,
        tableType: document.getElementById("tableType").value,
        diningType: document.getElementById("diningType").value,
        price: document.getElementById("price").value,
        status: status?status.value:""

    };

    try{
        const response=await fetch(API.tables,{
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(tableData)
        });
        if(response.ok){
            Swal.fire({
                icon:"success",
                title:"Table added"
            });
            loadTableDetails();

            bootstrap.Modal.getInstance(
                document.getElementById("AddTableModal")
            ).hide();
        }
    }catch(error){
        console.error("Error saving table:", error);
    }
    
}


async function loadTableDetails() {
    try{
        const response=await fetch(API.tables);
        const tables=await response.json();
        displayTables(tables);
    }catch(error){
        console.error("Table loading error",error);
    }
}

function displayTables(tables) {
    const tbody = document.getElementById("TablesDetailBody");
    tbody.innerHTML = "";

    tables.forEach(table => {

        tbody.innerHTML += `
            <tr>
                <td>${table.tableId}</td>
                <td>${table.tableNo}</td>
                <td>${table.capacity}</td>
                <td>${table.tableType}</td>
                <td>${table.diningType}</td>
                <td>₹${table.price}</td>
                <td>${table.status}</td>
                <td>
                    <button class="btn btn-warning btn-sm">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}



