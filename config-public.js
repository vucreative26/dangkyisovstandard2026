// ⚠️ FILE NÀY DÙNG CHO GITHUB PAGES (PUBLIC)
// KHÔNG CHỨA MẬT KHẨU THẬT - CHỈ DEMO

const APP_CONFIG = {
    // Cấu hình session (client-side)
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 giờ (milliseconds)
    
    // Cấu hình bảo mật (client-side)
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 phút (milliseconds)
    
    // Tài khoản DEMO (CHỈ DÙNG GITHUB PAGES)
    // ⚠️ ĐỔI MẬT KHẨU NÀY KHI DEPLOY THẬT!
    adminAccounts: {
        "phongdaotao": "Daotao123",
        "admin": "admin123",
        "phongdaotao": "Daotao123"
    }
};

// Hàm xác thực đăng nhập (LOCAL - không cần API)
async function authenticateUser(username, password) {
    // Giả lập delay như gọi API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Kiểm tra tài khoản có tồn tại không
    if (!APP_CONFIG.adminAccounts.hasOwnProperty(username)) {
        return {
            success: false,
            message: 'Tài khoản không tồn tại'
        };
    }
    
    // Kiểm tra mật khẩu
    if (APP_CONFIG.adminAccounts[username] === password) {
        return {
            success: true,
            message: 'Đăng nhập thành công',
            username: username
        };
    } else {
        return {
            success: false,
            message: 'Mật khẩu không đúng'
        };
    }
}

// Hàm xác thực mật khẩu (LOCAL)
async function verifyPassword(username, password) {
    // Giả lập delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Kiểm tra tài khoản và mật khẩu
    if (APP_CONFIG.adminAccounts.hasOwnProperty(username) && 
        APP_CONFIG.adminAccounts[username] === password) {
        return {
            success: true
        };
    } else {
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

console.log('🌐 Đang chạy ở chế độ GITHUB PAGES (PUBLIC)');
console.log('⚠️ Tài khoản demo: demo / demo123');
console.log('⚠️ Khi deploy lên hosting thật, đổi sang config-secure.js + auth-api.php');
