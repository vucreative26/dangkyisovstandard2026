// Sử dụng config từ file config-secure.js

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const btnLogin = document.getElementById('btnLogin');
    const errorMsg = document.getElementById('errorMsg');
    
    btnLogin.disabled = true;
    btnLogin.textContent = 'ĐANG KIỂM TRA...';
    errorMsg.style.display = 'none';
    
    // Kiểm tra số lần đăng nhập sai
    const loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    const lockoutTime = parseInt(localStorage.getItem('lockoutTime') || '0');
    const currentTime = new Date().getTime();
    
    // Kiểm tra xem tài khoản có bị khóa không
    if (lockoutTime > currentTime) {
        const remainingMinutes = Math.ceil((lockoutTime - currentTime) / 60000);
        errorMsg.textContent = `Tài khoản bị khóa. Vui lòng thử lại sau ${remainingMinutes} phút.`;
        errorMsg.style.display = 'block';
        btnLogin.disabled = false;
        btnLogin.textContent = 'ĐĂNG NHẬP';
        return;
    }
    
    // Reset lockout nếu đã hết thời gian
    if (lockoutTime > 0 && lockoutTime <= currentTime) {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');
    }
    
    try {
        // Xác thực bằng API (server-side)
        const result = await authenticateUser(username, password);
        
        if (result.success) {
            // Reset số lần đăng nhập sai
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lockoutTime');
            
            // Lưu thông tin đăng nhập vào localStorage
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminLoginTime', new Date().getTime());
            
            // Chuyển đến trang admin
            window.location.href = 'admin.html';
        } else {
            // Tăng số lần đăng nhập sai
            const newAttempts = loginAttempts + 1;
            localStorage.setItem('loginAttempts', newAttempts.toString());
            
            // Nếu vượt quá số lần cho phép, khóa tài khoản
            if (newAttempts >= APP_CONFIG.maxLoginAttempts) {
                const lockTime = currentTime + APP_CONFIG.lockoutDuration;
                localStorage.setItem('lockoutTime', lockTime.toString());
                errorMsg.textContent = `Đăng nhập sai quá ${APP_CONFIG.maxLoginAttempts} lần. Tài khoản bị khóa 15 phút.`;
            } else {
                const remainingAttempts = APP_CONFIG.maxLoginAttempts - newAttempts;
                errorMsg.textContent = `${result.message}. Còn ${remainingAttempts} lần thử.`;
            }
            
            errorMsg.style.display = 'block';
            btnLogin.disabled = false;
            btnLogin.textContent = 'ĐĂNG NHẬP';
        }
    } catch (error) {
        console.error(error);
        errorMsg.textContent = 'Lỗi hệ thống! Vui lòng thử lại.';
        errorMsg.style.display = 'block';
        btnLogin.disabled = false;
        btnLogin.textContent = 'ĐĂNG NHẬP';
    }
});

// Kiểm tra nếu đã đăng nhập
if (localStorage.getItem('adminLoggedIn') === 'true') {
    if (isSessionValid()) {
        window.location.href = 'admin.html';
    } else {
        // Session hết hạn
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminLoginTime');
    }
}
