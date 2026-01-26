document.getElementById("register-btn").addEventListener("click", () => {
    window.location.href = "../register/register.html";
});

document.getElementById('login-btn').addEventListener('click', async function() {
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: email, 
                password: password 
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("Login successful!");
        } else {
            alert("Error: " + data.error);
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Server error. Check console.");
    }
});