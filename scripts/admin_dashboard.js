let allCustomers=[];
let allTables=[];
let editingId=null;

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
        diningArea: document.getElementById("diningArea").value,
        price: document.getElementById("price").value,
        status: status?status.value:""

    };

    if(editingId){
        const response=await fetch(`${API.tables}/${editingId}`,{
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({...tableData, id:editingId})
        });
        if(response.ok){
            Swal.fire({
                icon:"success",
                title:"Table updated"
            });
            editingId=null;
            loadTableDetails();
            bootstrap.Modal.getInstance(
                document.getElementById("AddTableModal")
            ).hide();
            return;
        }
    }

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

//fetch and load all the table details
async function loadTableDetails() {
    try{
        const response=await fetch(API.tables);
        allTables=await response.json();
        displayTables(allTables.filter(t=>!t.deleted));
        displayTrash(allTables.filter(t=>t.deleted));
    }catch(error){
        console.error("Table loading error",error);
    }
}


//display the tables 
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
                <td>${table.diningArea}</td>
                <td>₹${table.price}</td>
                <!--<td>${table.status}</td>-->
                <td>
                    <button class="btn btn-warning btn-sm"  onclick="editTable('${table.tableId}')">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTable('${table.tableId}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

//Soft delete function
async function deleteTable(tableId) {
    const table=allTables.find(table=>table.tableId===tableId);
    if(!table){
        return;
    }

    if(table.status==="Booked"){
        Swal.fire("The table is currently booked");
        return;
    }

    const result = await Swal.fire({
        title: "Delete Table?",
        text: "The table details will be moved to trash",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Delete"
    });
    if (!result.isConfirmed) return;

    table.deleted=true;
    try{

        await fetch(`${API.tables}/${table.id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({...table,deleted: true})
            }
        );

        await loadTableDetails();
        await DashboardCount();

        alert("table moved to trash");
    }
    catch(error){
        console.error( "Delete Error",  error);
    }
}

//display the deleted items in trash
function displayTrash(tables){
    const tbody=document.getElementById("TrashTableBody");
    tbody.innerHTML="";

    tables.forEach(table=>{
        tbody.innerHTML+=`
        <tr>
        <td>${table.tableId}</td>
        <td>${table.tableNo}</td>
        <td>${table.capacity}</td>
        <td>${table.tableType}</td>
        <td>${table.diningArea}</td>
        <td>₹${table.price}</td>
        <td>
        <button class="btn btn-primary" onclick="restoreTable('${table.id}')">
        Restore
        </button>
        </tr>
        `;
    })
}

//restore function
async function restoreTable(id) {
    const table=allTables.find(t=>t.id===id);
    table.deleted=false;
    await fetch(`${API.tables}/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(table)
    });
    loadTableDetails();
}

//edit table function
function editTable(tableId){

    const table = allTables.find(t => t.tableId === tableId);
    editingId=table.id;
    if(!table) return;
    document.getElementById("tableId").value = table.tableId;
    document.getElementById("tableNo").value = table.tableNo;
    document.getElementById("capacity").value = table.capacity;
    document.getElementById("tableType").value = table.tableType;
    document.getElementById("diningArea").value = table.diningArea;
    document.getElementById("price").value = table.price;

    if(table.status === "Available"){
        document.querySelector('input[name="status"][value="Available"]').checked = true;
    }else{
        document.querySelector('input[name="status"][value="Not Available"]').checked = true;
    }

    new bootstrap.Modal(document.getElementById("AddTableModal")).show();
}


