$(document).ready(function(){
    const API="http://localhost:3000/customers";

    const today=new Date().toISOString().split("T")[0];
    $("#dob").attr("max",today);

    // Load saved data
    let savedData = JSON.parse(localStorage.getItem("signupData"));
    if(savedData){
        $("#name").val(savedData.name || "");
        $("#dob").val(savedData.dob || "");
        $("#email").val(savedData.email || "");
        $("#phone").val(savedData.phone || "");
        $("#address").val(savedData.address || "");
    }

    // Save data while typing
    $(".form-control").on("input change", function(){
        let formData = {
            name: $("#name").val(),
            dob: $("#dob").val(),
            email: $("#email").val(),
            phone: $("#phone").val(),
            address: $("#address").val()
        };
        localStorage.setItem("signupData", JSON.stringify(formData));
    });


    // Live Validation
    $("#name").on("input", function(){
        let value = $(this).val().trim();
        let pattern = /^[A-Za-z ]+$/;
        $(this).toggleClass("is-valid", value.length >= 3 && pattern.test(value));
        $(this).toggleClass("is-invalid", !(value.length >= 3 && pattern.test(value)));
    });

    $("#dob").on("change", function(){
        $(this).toggleClass("is-valid", $(this).val() !== "");
        $(this).toggleClass("is-invalid", $(this).val() === "");
    });

    $("#email").on("input", function(){
        let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        $(this).toggleClass("is-valid", pattern.test($(this).val()));
        $(this).toggleClass("is-invalid", !pattern.test($(this).val()));
    });

    $("#phone").on("input", function(){
        let pattern = /^[6-9][0-9]{9}$/;
        $(this).toggleClass("is-valid", pattern.test($(this).val()));
        $(this).toggleClass("is-invalid", !pattern.test($(this).val()));
    });

    $("#password").on("input", function(){
        let pattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!&*]).{8,}$/;
        $(this).toggleClass("is-valid", pattern.test($(this).val()));
        $(this).toggleClass("is-invalid", !pattern.test($(this).val()));

        $("#confirmPassword").trigger("input");
    });

    $("#confirmPassword").on("input", function(){
        let match = $(this).val() === $("#password").val();
        $(this).toggleClass("is-valid", match);
        $(this).toggleClass("is-invalid", !match);
    });

    $("#address").on("input", function(){
        let valid = $(this).val().trim().length >= 12;
        $(this).toggleClass("is-valid", valid);
        $(this).toggleClass("is-invalid", !valid);
    });

    //on submit 
    $("#Signup").submit(async function(e){
        e.preventDefault();
        let isValid=true;

        
        $(".form-control").removeClass("is-valid is-invalid");
        let name=$("#name").val().trim();
        let dob=$("#dob").val();
        let email=$("#email").val().trim();
        let phone=$("#phone").val().trim();
        let password=$("#password").val().trim();
        let confirmPassword=$("#confirmPassword").val().trim();
        let address=$("#address").val().trim();

        let namePtn= /^[A-Za-z ]+$/;
        if(name===""||name.length<3||!namePtn.test(name)){
            $("#name").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#name").addClass("is-valid");
        }

        if(dob===""){
            $("#dob").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#dob").addClass("is-valid");
        }
        
        let emailPtn=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(email===""||!emailPtn.test(email)){
            $("#email").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#email").addClass("is-valid");
        }

        let phonePtn= /^[6-9][0-9]{9}$/;
        if(phone===""||!phonePtn.test(phone)){
            $("#phone").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#phone").addClass("is-valid");
        }

        let passwordPtn= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!&*]).{8,}$/;
        if(password===""||!passwordPtn.test(password)){
            $("#password").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#password").addClass("is-valid");
        }

        if(confirmPassword===""||password!==confirmPassword){
            $("#confirmPassword").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#confirmPassword").addClass("is-valid");
        }

        if(address.length<12){
            $("#address").addClass("is-invalid");
            isValid=false;
        }
        else{
            $("#address").addClass("is-valid");

        }

        if(!isValid){
            return;
        }

        try{

            let response=await fetch(API);
            let customers=await response.json();

            let existingUser=customers.find(user=>user.email===email);

            if(existingUser){
                Swal.fire({
                    icon:"warning",
                    title:"Email Already Exists",
                    text:"Please use another email."
                });
                $("#email").addClass("is-invalid");
                return;
            }

            let customer={
                name,
                dob,
                email,
                phone,
                password,
                address

            };

            await fetch(API,
                {
                    method:"POST",
                    headers:{"Content-type":"application/json"},
                    body: JSON.stringify(customer)
                });

                localStorage.removeItem("signupData");
                await Swal.fire({
                    icon:"success",
                    title:"Registration Successful!",
                    text:"Welcome to FoodHub",
                    confirmButtonText:"OK"
                });

                window.location.href="../pages/index.html";

                
                
        }catch(error){
            console.log(error);
            alert("Something went wrong.Try again")
        }
    });
});