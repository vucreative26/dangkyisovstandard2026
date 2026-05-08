<?php
// ⚠️ FILE NÀY CHỨA THÔNG TIN BẢO MẬT
// Đặt file này ở ngoài thư mục public nếu có thể

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Xử lý preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Cấu hình
$CONFIG = [
    'adminAccounts' => [
        'admin' => 'MatKhauManh@2026',  // ← ĐỔI MẬT KHẨU NÀY
        'admin2' => 'Admin2@2026',
        'phongdaotao' => 'daotao123',
    ],
    'sessionTimeout' => 8 * 60 * 60, // 8 giờ (giây)
    'maxLoginAttempts' => 5,
    'lockoutDuration' => 15 * 60, // 15 phút (giây)
];

// Lấy action từ request
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Xử lý các action
switch ($action) {
    case 'login':
        handleLogin($CONFIG);
        break;
        
    case 'verifyPassword':
        handleVerifyPassword($CONFIG);
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
}

// Hàm xử lý đăng nhập
function handleLogin($config) {
    $username = $_POST['username'] ?? $_GET['username'] ?? '';
    $password = $_POST['password'] ?? $_GET['password'] ?? '';
    
    // Kiểm tra tài khoản có tồn tại không
    if (!isset($config['adminAccounts'][$username])) {
        echo json_encode([
            'success' => false,
            'message' => 'Tài khoản không tồn tại'
        ]);
        return;
    }
    
    // Kiểm tra mật khẩu
    if ($config['adminAccounts'][$username] === $password) {
        echo json_encode([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'username' => $username
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Mật khẩu không đúng'
        ]);
    }
}

// Hàm xác thực mật khẩu
function handleVerifyPassword($config) {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    // Kiểm tra tài khoản và mật khẩu
    if (isset($config['adminAccounts'][$username]) && 
        $config['adminAccounts'][$username] === $password) {
        echo json_encode([
            'success' => true
        ]);
    } else {
        echo json_encode([
            'success' => false
        ]);
    }
}
?>
