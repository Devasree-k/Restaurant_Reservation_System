let availableTables=[];

$(document).ready(async function () {
    
    loadTables();

});

//Load the details 
async function loadTables(){
    try{
        let response=await fetch(API.tables);
        let tables=await response.json();

        availableTables=tables.filter(t=> !t.deleted );

        displayAvailableTables(availableTables);

        $("#AvailableCount").textContent=availableTables.length;
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
                    <div class="mt-3">
                        <button class="btn btn-primary" onclick="bookTable('${table.id}')">
                        Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        `;
    });
}

async function bookTable(){

}
