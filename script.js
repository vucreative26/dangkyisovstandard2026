const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZaJ3dKmgDrUfBLkw8uiYDh8h1XR-Y6U0NBIQPqxSz8X1CsZTutEZcfWFh2gRIJHCZ/exec";

const maInput = document.getElementById('maKhachHang');
const submitBtn = document.getElementById('submitBtn');
const fileUpload = document.getElementById('fileUpload');
const fileCount = document.getElementById('fileCount');
const maStatusMsg = document.getElementById('maStatusMsg');

// Hiển thị số lượng file đã chọn
fileUpload.addEventListener('change', function() {
    const numFiles = this.files.length;
    if (numFiles > 0) {
        fileCount.textContent = `Đã chọn ${numFiles} file`;
        fileCount.style.color = '#28a745';
    } else {
        fileCount.textContent = 'Click để chọn ít nhất 1 file';
        fileCount.style.color = '#666';
    }
});

// Kiểm tra mã thành viên khi nhập xong
maInput.addEventListener('blur', async function() {
    const maKhach = this.value.trim().toUpperCase();
    if (maKhach.length < 3) {
        maStatusMsg.textContent = '';
        maStatusMsg.style.color = '';
        return;
    }
    
    maStatusMsg.textContent = 'Đang kiểm tra...';
    maStatusMsg.style.color = '#007bff';
    
    try {
        const res = await fetch(`${SCRIPT_URL}?action=checkBeforeRegister&maKhach=${maKhach}`);
        const result = await res.json();
        
        if (result.exists) {
            maStatusMsg.textContent = 'Mã thành viên đã tồn tại, vui lòng liên hệ Admin để cập nhật thông tin';
            maStatusMsg.style.color = '#dc3545';
            submitBtn.disabled = true;
        } else {
            maStatusMsg.textContent = 'Mã thành viên hợp lệ';
            maStatusMsg.style.color = '#28a745';
            submitBtn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        maStatusMsg.textContent = 'Lỗi kiểm tra mã thành viên';
        maStatusMsg.style.color = '#dc3545';
    }
});

// XỬ LÝ GỬI FORM & UPLOAD HÌNH
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const files = fileUpload.files;
    if (files.length === 0) {
        alert("Vui lòng chọn ít nhất 1 file.");
        return;
    }

    submitBtn.innerText = "ĐANG TẢI LÊN HÌNH ẢNH...";
    submitBtn.disabled = true;

    try {
        const filePromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({
                    name: file.name,
                    mimeType: file.type,
                    data: ev.target.result.split(',')[1] // Lấy phần Base64
                });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const fileData = await Promise.all(filePromises);

        const payload = {
            action: "submitRegistration",
            team: document.getElementById('teamPhuTrach').value,
            sale: document.getElementById('salePhuTrach').value,
            tenSpa: document.getElementById('tenSpa').value,
            tenKhach: document.getElementById('tenKhachHang').value,
            maKhach: maInput.value.trim().toUpperCase(),
            soSao: document.getElementById('soSaoMongMuon').value,
            files: fileData // Gửi mảng hình ảnh dưới dạng Base64
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Đăng ký thành công và đã tạo thư mục hình ảnh!");
            location.reload();
        } else {
            alert("Lỗi server: " + result.message);
        }
    } catch (error) {
        alert("Lỗi: " + error.message);
    } finally {
        submitBtn.innerText = "GỬI THÔNG TIN ĐĂNG KÝ";
        submitBtn.disabled = false;
    }
});
