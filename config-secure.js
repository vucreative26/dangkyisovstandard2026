// ✅ FILE NÀY AN TOÀN - KHÔNG CHỨA MẬT KHẨU
// Chỉ chứa cấu hình công khai

const APP_CONFIG = {
    // URL API xác thực (PHP backend)
    authApiUrl: "auth-api.php", // Hoặc đường dẫn đầy đủ: https://domain.com/api/auth-api.php
    
    // URL Google Apps Script
    scriptUrl: "https://script.google.com/macros/s/AKfycbzZaJ3dKmgDrUfBLkw8uiYDh8h1XR-Y6U0NBIQPqxSz8X1CsZTutEZcfWFh2gRIJHCZ/exec",
    
    // Cấu hình session (client-side)
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 giờ (milliseconds)
    
    // Cấu hình bảo mật (client-side)
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 phút (milliseconds)
};

// Hàm xác thực đăng nhập (gọi API)
async function authenticateUser(username, password) {
    try {
        const response = await fetch(APP_CONFIG.authApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Lỗi xác thực:', error);
        return {
            success: false,
            message: 'Lỗi kết nối server'
        };
    }
}

// Hàm xác thực mật khẩu (gọi API)
async function verifyPassword(username, password) {
    try {
        const response = await fetch(APP_CONFIG.authApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'verifyPassword',
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Lỗi xác thực:', error);
        return {
            success: false
        };
    }
}

// Hàm kiểm tra session còn hiệu lực không
function isSessionValid() {
    const loginTime = localStorage.getItem('adminLoginTime');
    if (!loginTime) return false;
    
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - parseInt(loginTime);
    
    return elapsedTime < APP_CONFIG.sessionTimeout;
}

// Hàm làm mới session
function refreshSession() {
    localStorage.setItem('adminLoginTime', new Date().getTime().toString());
}

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        authenticateUser,
        verifyPassword,
        isSessionValid,
        refreshSession
    };
}
