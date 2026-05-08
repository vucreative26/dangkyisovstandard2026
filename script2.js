const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQI0P_GBnsQFr8dtjSsWoAt59YS9tanlF6aXIIZa2fnbuuRz4xke_9WPwseo_mBm6Z/exec";
const maKhachInput = document.getElementById('maKhachHang');
const additionalFields = document.getElementById('additionalFields');
const statusMsg = document.getElementById('statusMsg');
const fileUpload = document.getElementById('fileUpload');
const fileCount = document.getElementById('fileCount');

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
maKhachInput.addEventListener('blur', async function() {
    const maKhach = this.value.trim().toUpperCase();
    if (maKhach.length < 3) {
        statusMsg.textContent = '';
        statusMsg.style.color = '';
        additionalFields.style.display = 'none';
        return;
    }
    
    statusMsg.textContent = 'Đang kiểm tra...';
    statusMsg.style.color = '#007bff';
    
    try {
        const res = await fetch(`${SCRIPT_URL}?action=checkBeforeReview&maKhach=${maKhach}`);
        const result = await res.json();
        
        if (!result.hasDangKy) {
            // Mã chưa có trên Sheet1
            statusMsg.textContent = 'Mã thành viên chưa có trên hệ thống, vui lòng đăng ký tham gia';
            statusMsg.style.color = '#dc3545';
            additionalFields.style.display = 'none';
            document.getElementById('tenSpa').value = '';
        } else if (result.hasXetDuyet) {
            // Mã có trên Sheet1 và đã có trên Sheet2
            statusMsg.textContent = 'Mã thành viên đã tồn tại, vui lòng liên hệ Admin để cập nhật thông tin';
            statusMsg.style.color = '#dc3545';
            additionalFields.style.display = 'none';
            document.getElementById('tenSpa').value = result.info.tenSpa;
        } else {
            // Mã có trên Sheet1 nhưng chưa có trên Sheet2 - hợp lệ
            statusMsg.textContent = 'Mã thành viên hợp lệ';
            statusMsg.style.color = '#28a745';
            document.getElementById('tenSpa').value = result.info.tenSpa;
            window.parentData = result.info; // Lưu để gửi kèm
            additionalFields.style.display = 'block';
        }
    } catch (e) {
        console.error(e);
        statusMsg.textContent = 'Lỗi kiểm tra mã thành viên';
        statusMsg.style.color = '#dc3545';
        additionalFields.style.display = 'none';
    }
});

// Xử lý gửi form xét duyệt
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    const files = fileUpload.files;
    
    btn.innerText = "ĐANG GỬI...";
    btn.disabled = true;

    try {
        const getVal = (id) => document.getElementById(id).value;
        const getChecked = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(c => c.value).join(", ");

        // Xử lý upload file nếu có
        let fileData = [];
        if (files.length > 0) {
            const filePromises = Array.from(files).map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve({
                        name: file.name,
                        mimeType: file.type,
                        data: ev.target.result.split(',')[1]
                    });
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            fileData = await Promise.all(filePromises);
        }

        const payload = {
            action: "submitReview",
            maKhach: maKhachInput.value.trim().toUpperCase(),
            tenSpa: getVal('tenSpa'),
            tenKhach: window.parentData.tenKhach,
            team: window.parentData.team,
            sale: window.parentData.sale,
            soGiuong: getVal('soGiuong'),
            soNhanSu: getVal('soNhanSu'),
            lieuTrinhCoBan: getVal('lieuTrinhCoBan'), 
            lieuTrinhNangCao: getVal('lieuTrinhNangCao'),
            thietBiCoBan: getChecked('deviceBasic'),
            thietBiNangCao: getChecked('deviceAdvanced'),
            bangCap: getVal('bangCap'),
            files: fileData
        };

        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            alert("Gửi xét duyệt thành công!");
            location.reload();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (e) { 
        alert("Lỗi gửi dữ liệu: " + e.message); 
    } finally {
        btn.innerText = "GỬI THÔNG TIN XÉT DUYỆT";
        btn.disabled = false;
    }
});
