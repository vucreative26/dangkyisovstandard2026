// 1. CẤU HÌNH HỆ THỐNG - Dán URL Web App mới nhất của bạn vào đây
const SCRIPT_URL = "URL_WEB_APP_MOI_CUA_BAN"; 

// 2. KHAI BÁO BIẾN CƠ BẢN
const maKhachInput = document.getElementById('maKhachHang');
const tenSpaInput = document.getElementById('tenSpa');
const additionalFields = document.getElementById('additionalFields');
const statusMsg = document.getElementById('statusMsg');
const fileInput = document.getElementById('fileUpload');
const fileCount = document.getElementById('fileCount');

// 3. LOGIC TỰ ĐỘNG TRA CỨU MÃ KHÁCH HÀNG (AUTO-CHECK)
maKhachInput.addEventListener('input', async function() {
    const maKhach = this.value.trim().toUpperCase();
    
    // Nếu xóa hết ký tự thì reset form về trạng thái ban đầu
    if (maKhach === "") {
        resetFormStatus();
        return;
    }

    // Chỉ bắt đầu tìm khi nhập từ 4 ký tự (Tránh gọi API quá nhiều lần khi đang gõ)
    if (maKhach.length < 4) {
        statusMsg.innerText = "Đang nhập...";
        statusMsg.style.color = "gray";
        return;
    }

    statusMsg.innerText = "🔍 Đang kiểm tra mã...";
    statusMsg.style.color = "blue";

    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkMa&maKhach=${maKhach}`);
        const result = await response.json();

        if (result.success) {
            // Hiển thị thông tin tìm được
            tenSpaInput.value = result.tenSpa;
            statusMsg.innerText = "✓ Đã xác thực Spa: " + result.tenSpa;
            statusMsg.style.color = "green";
            
            // Hiện các ô nhập liệu bổ sung
            additionalFields.style.display = "block";
            
            // Lưu dữ liệu tạm để dùng khi Submit
            window.userData = result; 
        } else {
            tenSpaInput.value = "";
            statusMsg.innerText = "✗ Không tìm thấy mã khách hàng này.";
            statusMsg.style.color = "red";
            additionalFields.style.display = "none";
        }
    } catch (e) {
        statusMsg.innerText = "⚠️ Lỗi kết nối máy chủ!";
        statusMsg.style.color = "orange";
    }
});

function resetFormStatus() {
    tenSpaInput.value = "";
    statusMsg.innerText = "";
    additionalFields.style.display = "none";
}

// 4. XỬ LÝ HIỂN THỊ SỐ LƯỢNG FILE KHI CHỌN
fileInput.addEventListener('change', function() {
    const count = this.files.length;
    fileCount.innerText = count > 0 ? `Đã chọn ${count} tệp` : "Chọn tệp hình ảnh/PDF";
});

// 5. LOGIC GỬI DỮ LIỆU XÉT DUYỆT (SUBMIT FORM)
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const files = fileInput.files;

    // Kiểm tra nhanh
    if (!window.userData) {
        alert("Vui lòng nhập Mã Khách Hàng hợp lệ trước!");
        return;
    }

    btn.innerText = "ĐANG TẢI DỮ LIỆU (VUI LÒNG ĐỢI)...";
    btn.disabled = true;

    try {
        // Đọc file sang Base64
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

        // Lấy danh sách checkbox đã chọn
        const getChecked = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                                         .map(cb => cb.value).join(', ');

        const payload = {
            action: "submitReview",
            maKhach: maKhachInput.value.trim().toUpperCase(),
            tenSpa: tenSpaInput.value,
            team: window.userData.team || "",
            sale: window.userData.sale || "",
            tenKhach: window.userData.tenKhach || "",
            soGiuong: document.getElementById('soGiuong').value,
            soNhanSu: document.getElementById('soNhanSu').value,
            lieuTrinhCoBan: document.getElementById('lieuTrinhCoBan').value,
            lieuTrinhNangCao: document.getElementById('lieuTrinhNangCao').value,
            thietBiCoBan: getChecked('deviceBasic'),
            thietBiNangCao: getChecked('deviceAdvanced'),
            bangCap: document.getElementById('bangCap').value,
            files: fileData
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const finalResult = await response.json();
        
        if (finalResult.status === 'success') {
            alert("Gửi hồ sơ xét duyệt thành công! Cảm ơn bạn.");
            location.reload();
        } else {
            throw new Error(finalResult.message);
        }

    } catch (error) {
        alert("Lỗi: " + error.message);
        btn.disabled = false;
        btn.innerText = "GỬI THÔNG TIN XÉT DUYỆT";
    }
});
