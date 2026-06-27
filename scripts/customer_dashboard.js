let availableTables=[];
let selectedTable=null;
let allReservedTables=[];
const currentUser = JSON.parse(localStorage.getItem("user"));

const SLOT_DATA = {
    Breakfast: [
        "8:00 AM - 9:00 AM",
        "9:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM"
    ],
    Lunch: [
        "12:00 PM - 1:00 PM",
        "1:00 PM - 2:00 PM",
        "2:00 PM - 3:00 PM"
    ],
    Dinner: [
        "7:00 PM - 8:00 PM",
        "8:00 PM - 9:00 PM",
        "9:00 PM - 10:00 PM"
    ]
};


$(document).ready(async function () {
    
    loadTables();
    loadReservedTable();
    loadCancelledTable();
    DashboardCount();
    $("#bookDate").change(loadSlots);
    $("#mealSession").change(loadSlots);
    $("#confirmBooking").click(confirmBooking);
    $("#searchBtn").click(searchTables);
    $("#session").change(loadSearchSlots);
    $("#logoutBtn").click(logout);

});

//load the counter dynamically
async function DashboardCount() {
    try{
        const AvailableResponse = await fetch(API.tables);
        const avaiTable=await AvailableResponse.json();
        const available = avaiTable.filter(t => !t.deleted);
        $("#AvailableCount").text(available.length);


        const bookingResponse = await fetch(API.bookingDetails);
        const bookings = await bookingResponse.json();
        const myBookings = bookings.filter( booking =>
            booking.customerId === currentUser.id &&
            booking.bookingStatus === "Booked"
        );
        $("#MyReservationCount").text(myBookings.length);


        const cancelled = bookings.filter( booking =>
            booking.customerId === currentUser.id &&
            booking.bookingStatus === "Cancelled"
        );
        $("#CancelledCount").text(cancelled.length);

    }catch(error){
        console.error(error);
    }
}

//Load the details 
async function loadTables(){
    try{
        let response=await fetch(API.tables);
        let tables=await response.json();

        availableTables=tables.filter(t=> !t.deleted );

        displayAvailableTables(availableTables);

        $("#AvailableCount").text(availableTables.length);
    }catch(error){
        console.log("Error while loading ",error);
    }
}

function displayAvailableTables(tables){
    const card=document.getElementById("availableContainer");
    card.innerHTML="";

    tables.forEach(table => {
        card.innerHTML+=`
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card shadow">
                <div class="card-body">
                    <div class="row">
                        <div class="col">
                            <h4 class="card-title"> TableId: ${table.tableId}</h4>
                        </div>
                        <div class="col">
                            <p> Table No: ${table.tableNo}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <p> Capacity: ${table.capacity} </p>
                        </div>
                        <div class="col">
                            <p> Dining Area: ${table.diningArea} </p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <p> Table Type:${table.tableType} </p>
                        </div>
                        <div class="col">
                            <p> Price: ${table.price} </p>
                        </div>
                    </div>
                    <span class="badge bg-success">
                    Available for booking
                    </span>
                    <div class="mt-3 text-end">
                        <button class="btn btn-primary justify-content-end nav-bg border-0"  onclick="bookTable('${table.id}')">
                        Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
}


function bookTable(tableId){
    $("#bookDate").attr("min",new Date().toISOString().split("T")[0]);

    selectedTable = availableTables.find(
        table => table.id === tableId
    );

    $("#SelectedTable").text( `Table : ${selectedTable.tableId}`);
    const today = new Date().toISOString().split("T")[0];
    $("#bookDate").val(today);
    loadSlots();

    $("#mealSession").val("");
    $("#timeSlot").empty();
    $("#timeSlot").append(`
        <option value="">Select Slot</option>
    `);
    $("#bookingGuestCount").val("");

    const modal = new bootstrap.Modal(
        document.getElementById("bookingModal")
    );
    modal.show();

}

async function loadSlots(){
    
    const response=await fetch(API.bookingDetails);
    const bookings=await response.json();

    const session=$("#mealSession").val();
    const bookingDate=$("#bookDate").val();
    const bookedSlots = bookings.filter(booking =>
    booking.tableId === selectedTable.tableId &&
    booking.bookingDate === bookingDate &&
    booking.session === session &&
    booking.bookingStatus === "Booked"
    );


    const bookedSlotList = bookedSlots.map(booking => booking.slot);

    const slot=$("#timeSlot");
    slot.empty();
    slot.append(
        '<option value="">Select Slot</option>'
    );
    if(!session || !bookingDate){
        return;
    }

    SLOT_DATA[session].forEach(slotTime=>{
        if(!bookedSlotList.includes(slotTime)){
            slot.append(`
                <option value="${slotTime}">
                    ${slotTime}
                </option>
            `);
        }
    });

}

async function confirmBooking(){
    const bookingDate=$("#bookDate").val();
    const session=$("#mealSession").val();
    const slot=$("#timeSlot").val();
    const guestCount=$("#bookingGuestCount").val();

    if(!bookingDate|| !session || !slot || !guestCount){
        Swal.fire("Missing Details", 
            "Please fill all fields",
            "warning"
        );
        return;
    }

    if(Number(guestCount) >Number(selectedTable.capacity))
        {Swal.fire(
            "Table Capacity Exceeded",
            `Maximum ${selectedTable.capacity} guests allowed.`,
            "error"
        );
        return;
    }

    

    const bookingData = {
        customerId: currentUser.id,
        customerName: currentUser.name,
        tableId: selectedTable.tableId,
        bookingDate: bookingDate,
        session: session,
        slot: slot,
        guestCount: guestCount,
        bookingStatus: "Booked",
        bookedAt:new Date().toISOString()
    };

    await fetch(API.bookingDetails,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(bookingData)
    });

    Swal.fire({
        icon:"success",
        title:"Booking Confirmed"
    });

    await loadReservedTable();
    await loadSlots();
    await loadTables();
    DashboardCount();

}

async function loadReservedTable(){
    try{
        const response=await fetch(API.bookingDetails);
        const availableTable=await response.json();

        allReservedTables=availableTable.filter(booking=>booking.customerId===currentUser.id && booking.bookingStatus === "Booked") ;
        displayReservedTables(allReservedTables);
        
    }catch(error){
        console.error("Loading error",error);
    }

}


function displayReservedTables(bookings){

    const container = $("#MyReservations");
    container.empty();

    if(bookings.length === 0){
        container.append(`
            <div class="col-12 text-center">
                <h5>No Reservations Found</h5>
            </div>
        `);
        return;
    }

    bookings.sort((a,b)=>new Date(b.bookedAt)-new Date(a.bookedAt)).forEach(booking=>{
        container.append(`
        <div class="col-lg-4 col-md-6">
            <div class="card shadow">
                <div class="card-body">
                    <h5>Table : ${booking.tableId}</h5>
                    <div class="row">
                        <div class="col">
                            <p>Date : ${booking.bookingDate}</p>
                            <p>Session : ${booking.session}</p>
                        </div>
                        <div class="col">
                            <p>Slot : ${booking.slot}</p>
                            <p>Guests : ${booking.guestCount}</p>
                        </div>
                    </div>
                    <span class="badge bg-success">
                        ${booking.bookingStatus}
                    </span>
                        <button class="btn btn-danger btn-sm float-end " onclick="cancelBooking('${booking.id}')">
                            Cancel Booking
                        </button>
                </div>
            </div>
        </div>
        `);
    });
}

//Cancel Reservation
async function cancelBooking(id){
    const result=await Swal.fire({
        title:"Cancel booking",
        text:"Are you sure?",
        icon:"warning",
        showCancelButton:"true"
    });
    if(!result.isConfirmed){
        return;
    }

    await fetch(`${API.bookingDetails}/${id}`,{
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            bookingStatus:"Cancelled",
            cancelledAt:new Date().toISOString()
        })
    })
    Swal.fire(
        "Cancelled","booking cancelled successfully","success"
    )

    await loadReservedTable();
    await loadCancelledTable();
    DashboardCount();
}


//load cancelled Table section
async function loadCancelledTable(){
    try{
    const response=await fetch(API.bookingDetails);
    const bookings=await response.json();

    const cancelledBookings=bookings.filter(booking=>
        booking.customerId===currentUser.id && booking.bookingStatus==="Cancelled"
    );
    displayCancelledTable(cancelledBookings);

    }catch(error){
        console.log("error");
    }
}

//display Cancelled table in dashboard
function displayCancelledTable(bookings){
    const container=$("#CancelledContainer");
    container.empty();

    bookings.forEach(booking=>{
        container.append(`
            <div class="col-md-4">
                <div class="card border-danger shadow">
                    <div class="card-body">
                        <h5>${booking.tableId}</h5>
                        <div class="row">
                            <div class="col">
                                <p>${booking.session}</p>
                            </div>
                            <div class="col">
                                <p>${booking.bookingDate}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <p>${booking.slot}</p>
                            </div>
                            <div class="col">
                                <span class="badge bg-danger">
                                    Cancelled
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}

//searching function
function loadSearchSlots(){
    $("#bookingDate").attr("min", new Date().toISOString().split("T")[0]);
    const session=$("#session").val();
    const slot=$("#slot");
    slot.empty();
    slot.append(`<option value="">Select Slot </option>`);
    if(!session){
        return;
    }
    SLOT_DATA[session].forEach(time=>{
        slot.append(`<option value=${time}">
            ${time}
            </option>
        `);

    });

}

async function searchTables(){

    const bookingDate=$("#bookingDate").val();
    const session=$("#session").val();
    const slot=$("#slot").val();
    const guests=Number($("#guestCount").val());
    if(!bookingDate || !session || !slot || !guests){
        Swal.fire(
            "Missing Details",
            "Fill all search fields",
            "warning"
        );
        return;
    }

    //Get bookings
    const response=await fetch(API.bookingDetails);
    const bookings=await response.json();

    //Booked tables in that slot
    const bookedTableIds = bookings
    .filter(b=>
        b.bookingDate===bookingDate &&
        b.session===session &&
        b.slot===slot &&
        b.bookingStatus==="Booked"
    )
    .map(b=>b.tableId);

    //Available tables

    const filteredTables = availableTables.filter(table=>{
        return (
            Number(table.capacity)>=guests &&
            !bookedTableIds.includes(table.tableId)
        );
    });
    displayAvailableTables(filteredTables);
}

//logout function
async function logout(){
    const result= await Swal.fire({
        text:"Are you sure to logout?",
        icon:"question",
        showCancelButton: true,
        cancelButtonText:"Cancel",
        confirmButtonText:"Yes, Logout"
    });

    if(!result.isConfirmed){
        return;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("constUser");
    Swal.fire({
        icon:"success",
        title:"Logged out successfully",
        timer:1200,
        showConfirmButton:"false"
    }).then(()=>{
        window.location.href="../pages/login.html";
    });
}