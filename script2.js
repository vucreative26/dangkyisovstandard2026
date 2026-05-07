/**
 * CẤU HÌNH HỆ THỐNG
 * Thay thế URL dưới đây bằng URL Web App mới nhất sau khi bạn "Deploy -> New Deployment" trong Apps Script
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWFN4wIJTxilTdgDXjHzsylT0YWOOtK80xPjU-XiBy79Ngpkimo_Y90a1rUBS9keAX/exec"; 

// Khai báo các thành phần giao diện
const maKhachInput = document.getElementById('maKhachHang');
const tenSpaInput = document.getElementById('tenSpa');
const additionalFields = document.getElementById('additionalFields');
const statusMsg = document.getElementById('statusMsg');
const fileInput = document.getElementById('fileUpload');
const fileCountText = document.getElementById('fileCount');

// Biến quản lý thời gian chờ để tối ưu tốc độ gõ (Debounce)
let typingTimer;
const doneTypingInterval = 600; // Đợi 0.6 giây sau khi gõ xong mới bắt đầu check

// 1. LOGIC TRA CỨU MÃ KHÁCH HÀNG
maKhachInput.addEventListener('input', function() {
    clearTimeout(typingTimer);
    const maKhach = this.value.trim().toUpperCase();

    // Reset nếu xóa trống ô nhập
    if (maKhach === "") {
        resetForm();
        return;
    }

    // Chỉ thực hiện check khi mã có độ dài hợp lệ (ví dụ từ 4 ký tự như TVV1...)
    if (maKhach.length >= 4) {
        statusMsg.innerText = "🔍 Đang kiểm tra mã...";
        statusMsg.style.color = "blue";
        
        typingTimer = setTimeout(() => {
            performCheck(maKhach);
        }, doneTypingInterval);
    } else {
        statusMsg.innerText = "Đang nhập...";
        statusMsg.style.color = "gray";
        additionalFields.style.display = "none";
    }
});

async function performCheck(maKhach) {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkMa&maKhach=${maKhach}`);
        const result = await response.json();

        if (result.success) {
            // Hiển thị thông tin và giữ nguyên giao diện
            tenSpaInput.value = result.tenSpa;
            statusMsg.innerText = "✅ Xác thực thành công: " + result.tenSpa;
            statusMsg.style.color = "green";
            additionalFields.style.display = "block";
            
            // Lưu dữ liệu vào biến toàn cục để dùng khi Submit
            window.userData = result; 
        } else {
            // Không tìm thấy mã trong Sheet1
            tenSpaInput.value = "";
            statusMsg.innerText = "❌ Không tìm thấy mã. Vui lòng đăng ký tham gia trước.";
            statusMsg.style.color = "red";
            additionalFields.style.display = "none";
            window.userData = null;
        }
    } catch (e) {
        statusMsg.innerText = "⚠️ Lỗi kết nối hệ thống!";
        statusMsg.style.color = "orange";
        console.error("Fetch error:", e);
    }
}

function resetForm() {
    tenSpaInput.value = "";
    statusMsg.innerText = "";
    additionalFields.style.display = "none";
    window.userData = null;
}

// 2. HIỂN THỊ SỐ LƯỢNG FILE KHI CHỌN
fileInput.addEventListener('change', function() {
    const count = this.files.length;
    if (fileCountText) {
        fileCountText.innerText = count > 0 ? `Đã chọn ${count} tệp` : "Chọn tệp";
    }
});

// 3. LOGIC GỬI FORM (SUBMIT)
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const files = fileInput.files;

    if (!window.userData) {
        alert("Vui lòng nhập đúng Mã Khách Hàng để hệ thống xác thực trước khi gửi!");
        return;
    }

    btn.innerText = "ĐANG TẢI HỒ SƠ (VUI LÒNG ĐỢI)...";
    btn.disabled = true;

    try {
        // Chuyển đổi các tệp sang định dạng Base64 để gửi qua Google Script
        const filePromises = Array.from(files).map(file => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({
                    name: file.name,
                    mimeType: file.type,
                    data: ev.target.result.split(',')[1]
                });
                reader.readAsDataURL(file);
            });
        });

        const fileData = await Promise.all(filePromises);

        // Thu thập dữ liệu từ các Checkbox thiết bị
        const getCheckedValues = (name) => {
            return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                        .map(cb => cb.value).join(', ');
        };

        const payload = {
            action: "submitReview",
            maKhach: maKhachInput.value.trim().toUpperCase(),
            tenSpa: tenSpaInput.value,
            team: window.userData.team,
            sale: window.userData.sale,
            tenKhach: window.userData.tenKhach,
            soGiuong: document.getElementById('soGiuong').value,
            soNhanSu: document.getElementById('soNhanSu').value,
            lieuTrinhCoBan: document.getElementById('lieuTrinhCoBan').value,
            lieuTrinhNangCao: document.getElementById('lieuTrinhNangCao').value,
            thietBiCoBan: getCheckedValues('deviceBasic'),
            thietBiNangCao: getCheckedValues('deviceAdvanced'),
            bangCap: document.getElementById('bangCap').value,
            files: fileData
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const finalResult = await response.json();
        
        if (finalResult.status === 'success') {
            alert("Chúc mừng! Hồ sơ xét duyệt của bạn đã được gửi thành công.");
            location.reload();
        } else {
            throw new Error(finalResult.message);
        }

    } catch (error) {
        alert("Có lỗi xảy ra: " + error.message);
        btn.disabled = false;
        btn.innerText = "GỬI THÔNG TIN XÉT DUYỆT";
    }
});
