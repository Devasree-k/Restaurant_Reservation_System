$(document).ready(function(){

    const API="http://localhost:3000";

    $("#login").submit(async function(e){
        e.preventDefault();

        isValid=true;
        $("#email, #password").removeClass("is-valid is-invalid");


        let email=$("#email").val().trim();
        let password=$("#password").val().trim();

        if(email===""){
            $("#email").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#email").addClass("is-valid");
        }

        if(password===""){
            $("#password").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#password").addClass("is-valid");
        }

        if(!isValid){
            return;
        }

        try{

            //check admin login

            let adminResponse=await fetch(`${API}/admin?email=${email}&password=${password}`);
            let admindata =await adminResponse.json();

            if(admindata.length>0){
                localStorage.setItem("userRole","admin");
                localStorage.setItem("user",JSON.stringify(admindata[0]));
                
                await Swal.fire({
                    icon: "success",
                    title: "Admin Login Successful",
                    timer: 1500,
                    showConfirmButton: false
                });
                window.location.href="../pages/admin_dashboard.html";
                return
            }

            //check customer login
            let customerResponse=await fetch(`${API}/customers?email=${email}&password=${password}`);
            let customerData=await customerResponse.json();

            if (customerData.length > 0) {
                localStorage.setItem("userRole", "customer");
                localStorage.setItem("user", JSON.stringify(customerData[0]));

                await Swal.fire({
                    icon:"success",
                    title:"Customer Login Successful",
                    timer:1500,
                    showConfirmButton: false
                });

                window.location.href = "../pages/customer_dashboard.html";
                return
            }

            // Invalid Login
            $("#email, #password").removeClass("is-valid");
            $("#email, #password").addClass("is-invalid");

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: "Invalid Email or Password"
            });
        }
        catch(error){
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "JSON Server is not running"
            });
        }

    })
})