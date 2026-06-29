let allCustomers=[];
let allTables=[];
let allReservations=[];
let filteredCustomers=[];
let filteredReservations = [];
let editingId=null;

const rows_per_page=5;
let customerPage = 1;
let tablePage = 1;
let reservationPage = 1;
let trashPage = 1;

$(document).ready(async function(){
    checkAdmin();
    initializeSidebar();
    DashboardCount();
    loadCustomers();
    loadTableDetails();
    await updateCompletedBookings();
    await loadReservations();

    $("#SaveTableDetails").click(saveTable);
    $("#logoutBtn").click(logout);

    $("#customerSearch").on("keyup",
        filterCustomers );

    $("#bookingSearch").on("keyup", filterReservations);
    $("#bookingStatusFilter").on("change", filterReservations);
    $("#sessionFilter").on("change", filterReservations);
    $("#bookingDateFilter").on("change", filterReservations);
    $("#bookingSort").on("change", filterReservations);

    
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
            if(sectionName === "dashboard"){
                // Dashboard view
                document.getElementById("dashboard").classList.remove("d-none");
                document.getElementById("bookings").classList.remove("d-none");
                document.getElementById("tables").classList.remove("d-none");
            }
            else{
                // Show only selected section
                document.getElementById(sectionName).classList.remove("d-none");
            }
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

        const reservationResponse = await fetch(API.bookingDetails);
        const reservations=await reservationResponse.json();
        document.getElementById("ReserveCount").textContent= reservations.length;

    }catch(error){
        console.error(error);
    }
}

//Load customer details
async function loadCustomers(){
    try{
        const response=await fetch(API.customers);
        allCustomers=await response.json();
        filteredCustomers=[...allCustomers];
        showCustomerPage(1);
    }catch(error){
        console.error("Customer details load error ");
    }
}

//for cutomer page
function showCustomerPage(page){
    customerPage = page;
    const data = paginate(filteredCustomers,page);
    DisplayCustomers(data);
    createPagination(
        filteredCustomers,
        page,
        "customerPagination",
        "showCustomerPage"
    );
}

//format date to dd-mm-yyyy format 

function formatDate(date) {
    return date.split("-").reverse().join("-");
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
        <td>${formatDate(customer.dob)}</td>
        <td>${customer.address}</td>
        </tr>
        `;
    });
}

//filter for customer management section
function filterCustomers(){
    const keyword=$("#customerSearch").val().toLowerCase().trim();
    filteredCustomers=allCustomers.filter(customer=>
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.includes(keyword) ||
        customer.email.toLowerCase().includes(keyword)
    )
    showCustomerPage(1);
}

//save tables details
async function saveTable() {
    const status=document.querySelector('input[name="status"]:checked');

    const tableData={
        tableId: document.getElementById("tableId").value,
        // tableNo: document.getElementById("tableNo").value,
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
        showTablePage(1);
        // displayTables(allTables.filter(t=>!t.deleted));
        displayTrash(allTables.filter(t=>t.deleted));
    }catch(error){
        console.error("Table loading error",error);
    }
}

//showtable function
function showTablePage(page){
    tablePage = page;
    const activeTables = allTables.filter(t=>!t.deleted);
    const pageData = paginate(activeTables,page);
    displayTables(pageData);
    createPagination(
        activeTables,
        page,
        "TablesPagination",
        "showTablePage"
    );
}


//display the tables 
function displayTables(tables) {
    const tbody = document.getElementById("TablesDetailBody");
    tbody.innerHTML = "";

    tables.forEach(table => {

        tbody.innerHTML += `
            <tr>
                <td>${table.tableId}</td>
                <!--<td>${table.tableNo}</td>-->
                <td>${table.capacity}</td>
                <td>${table.tableType}</td>
                <td>${table.diningArea}</td>
                <td>₹${table.price}</td>
                <!--<td>${table.status}</td>-->
                <td>
                    <button class="btn btn-warning btn-sm rounded-5 me-1"  onclick="editTable('${table.tableId}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm rounded-5" onclick="deleteTable('${table.tableId}')">
                        <i class="bi bi-trash-fill"></i>
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
        <!--<td>${table.tableNo}</td>-->
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
    // document.getElementById("tableNo").value = table.tableNo;
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

//loadReservations 
async function loadReservations(){
    try{
        const bookingResponse = await fetch(API.bookingDetails);
        const bookings = await bookingResponse.json();

        const customerResponse = await fetch(API.customers);
        const customers = await customerResponse.json();

        allReservations = bookings.map(booking=>{
            const customer = customers.find(
                c=>c.id===booking.customerId
            );

            return{...booking,
                customerName: customer ?
                    customer.name :
                    "Unknown",
                customerPhone: customer ?
                    customer.phone :
                    ""
            };
        });
        // displayReservations(allReservations);
        allReservations.sort((a,b)=>new Date(b.bookedAt)-new Date(a.bookedAt));
        filteredReservations=[...allReservations];
        showReservationPage(1);
    }

    catch(error){
        console.log(error);
    }
}

//Display Reservations
function displayReservations(bookings){
    const tbody = $("#ReservationTableBody");
    tbody.empty();
    bookings.forEach(booking=>{
        let badge = "";
        if(booking.bookingStatus==="Booked"){
            badge =
            `<span class="badge bg-success">
                Booked
            </span>`;
        }
        else if(booking.bookingStatus==="Cancelled"){
            badge =
            `<span class="badge bg-danger">
                Cancelled
            </span>`;
        }
        else{
            badge =
            `<span class="badge bg-secondary">
                Completed
            </span>`;
        }
        tbody.append(`

            <tr>
                <td>${booking.customerName}</td>
                <td>${booking.customerPhone}</td>
                <td>${booking.tableId}</td>
                <td>${formatDate(booking.bookingDate)}</td>
                <td>${booking.session}</td>
                <td>${booking.slot}</td>
                <td>${booking.guestCount}</td>
                <td>${badge}</td>
            </tr>
        `);
    });

}

//pagination function
function paginate(data, currentPage) {
    const start = (currentPage - 1) * rows_per_page;
    const end = start + rows_per_page;
    return data.slice(start, end);
}

//common pagination button
function createPagination(data, currentPage, containerId, callback) {
    const totalPages = Math.ceil(data.length / rows_per_page);
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if(totalPages <= 0) return;

    // Previous
    container.innerHTML += `
        <button
            class="btn btn-outline-primary btn-sm mx-1"
            ${currentPage==1?"disabled":""}
            onclick="${callback}(${currentPage-1})">
            Previous
        </button>
    `;

    for(let i=1;i<=totalPages;i++){
        container.innerHTML += `
            <button
                class="btn ${i==currentPage?'btn-primary':'btn-outline-primary'} btn-sm mx-1"
                onclick="${callback}(${i})">
                ${i}
            </button>
        `;
    }
    container.innerHTML += `
        <button
            class="btn btn-outline-primary btn-sm mx-1"
            ${currentPage==totalPages?"disabled":""}
            onclick="${callback}(${currentPage+1})">
            Next
        </button>
    `;
}

//searching and sorting functionality
function filterReservations() {
    let data = [...allReservations];
    // Search
    const keyword = $("#bookingSearch").val().toLowerCase();
    if(keyword){
        data = data.filter(r =>
            r.customerName.toLowerCase().includes(keyword) ||
            r.customerPhone.includes(keyword) ||
            r.tableId.toLowerCase().includes(keyword)
        );
    }

    // Status Filter
    const status = $("#bookingStatusFilter").val();
    if(status){
        data = data.filter(r => r.bookingStatus === status);
    }

    // Session Filter
    const session = $("#sessionFilter").val();
    if(session){
        data = data.filter(r => r.session === session);
    }

    // Date Filter
    const date = $("#bookingDateFilter").val()
    if(date){
        data = data.filter(r => r.bookingDate === date);
    }

    // Sorting
    switch($("#bookingSort").val()){
        case "customerAZ":
            data.sort((a,b)=>a.customerName.localeCompare(b.customerName));
            break;
        case "customerZA":
            data.sort((a,b)=>b.customerName.localeCompare(a.customerName));
            break;
        case "guestLow":
            data.sort((a,b)=>a.guestCount-b.guestCount);
            break;
        case "guestHigh":
            data.sort((a,b)=>b.guestCount-a.guestCount);
            break;
        case "newest":
            data.sort((a,b)=>new Date(b.bookedAt)-new Date(a.bookedAt));
            break;
        case "oldest":
            data.sort((a,b)=>new Date(a.bookedAt)-new Date(b.bookedAt));
            break;
    }

    filteredReservations=data;
    showReservationPage(1);
}

function showReservationPage(page){
    reservationPage = page;
    const pageData = paginate(filteredReservations, page);
    displayReservations(pageData);
    createPagination(
        filteredReservations,
        page,
        "ReservationPagination",
        "showReservationPage"
    );
}


//logout 
async function logout() {

    const result = await Swal.fire({
        title: "Logout?",
        text: "Are you sure you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) {
        return;
    }

    // Remove login information
    localStorage.removeItem("userRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userId");

    Swal.fire({
        icon: "success",
        title: "Logged out successfully",
        timer: 1200,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "../pages/index.html"; 
    });
}


//After booked time end auto change status to completed
async function updateCompletedBookings(){
    const response=await fetch(API.bookingDetails);
    const bookings=await response.json();
    const now=new Date();

    for(const booking of  bookings){
        if(booking.bookingStatus !== "Booked")
            continue;

        const endTime=booking.slot.split("-")[1].trim();
        const bookingEnd=new Date(`${booking.bookingDate} ${endTime}`);
        if(now>=bookingEnd){
            await fetch(`${API.bookingDetails}/${booking.id}`,{
                method:"PATCH",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({bookingStatus:"Completed"})
            });
        }
    }
}