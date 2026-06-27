$(document).ready(function(){
    const today=new Date().toISOString().split("T")[0];
    $("#dob").attr("max",today);

    const API="http://localhost:3000/customers";
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
                alert("Email already exists");
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

                window.location.href="../pages/index.html";
                // alert("Registration successfull");

                Swal.fire({
        icon:"success",
        title:"Registration Successful"
    });
                
        }catch(error){
            console.log(error);
            alert("Something went wrong.Try again")
        }
    });
});