document.getElementById("start-btn").addEventListener("click", async function() {
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!email || !password) {
        alert("Будь ласка, заповніть email та пароль.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Паролі не співпадають!");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/register', {
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
            alert("Реєстрація успішна! Тепер увійдіть.");
            window.location.href = "../login/login.html";
        } else {
            alert("Помилка: " + data.error);
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Сервер не відповідає. Перевірте, чи запущено Python і чи правильна IP-адреса.");
    }
});