const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQI0P_GBnsQFr8dtjSsWoAt59YS9tanlF6aXIIZa2fnbuuRz4xke_9WPwseo_mBm6Z/exec";

// Kiểm tra đăng nhập
if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Hiển thị tên user
document.getElementById('userName').textContent = localStorage.getItem('adminUsername') || 'Admin';

// Biến toàn cục
let allData = { sheet1: [], sheet2: [], sheet3: [] };
let currentReviewData = null;
let manualScores = {
    top: null,
    csvc: null,
    thietbi: null,
    chuyenmon: null,
    thanhtich: null
};

// Load dữ liệu ban đầu
loadAllData();

// Menu navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        this.classList.add('active');
        
        const page = this.dataset.page;
        loadPage(page);
    });
});

// Logout
document.getElementById('btnLogout').addEventListener('click', function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'login.html';
    }
});

// Load tất cả dữ liệu từ Google Sheets
async function loadAllData() {
    try {
        console.log('Đang load dữ liệu từ Google Sheets...');
        const response = await fetch(`${SCRIPT_URL}?action=getAllData`);
        const result = await response.json();
        console.log('Dữ liệu nhận được:', result);
        
        allData = result;
        
        // Debug: Kiểm tra dữ liệu
        console.log('Sheet1 (Đăng ký):', allData.sheet1.length, 'bản ghi');
        console.log('Sheet2 (Xét duyệt):', allData.sheet2.length, 'bản ghi');
        console.log('Sheet3 (Đã duyệt):', allData.sheet3.length, 'bản ghi');
        
        loadPage('dashboard');
    } catch (error) {
        console.error('Lỗi load dữ liệu:', error);
        alert('Không thể tải dữ liệu từ Google Sheets. Vui lòng kiểm tra kết nối!');
    }
}

// Load trang theo menu
function loadPage(page) {
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    
    switch(page) {
        case 'dashboard':
            pageTitle.textContent = 'Dashboard';
            contentArea.innerHTML = renderDashboard();
            break;
        case 'duyet-ho-so':
            pageTitle.textContent = 'Duyệt hồ sơ';
            contentArea.innerHTML = renderDuyetHoSo();
            break;
        case 'khach-hang':
            pageTitle.textContent = 'Quản lý khách hàng';
            contentArea.innerHTML = renderKhachHang();
            initKhachHangFilters();
            break;
        case 'cai-dat':
            pageTitle.textContent = 'Cài đặt';
            contentArea.innerHTML = renderCaiDat();
            loadSettings();
            break;
    }
}

// DASHBOARD
function renderDashboard() {
    const totalSpa = allData.sheet1.length;
    const total5Sao = allData.sheet1.filter(r => r[6] === '5 Sao').length;
    const total4Sao = allData.sheet1.filter(r => r[6] === '4 Sao').length;
    const total3Sao = allData.sheet1.filter(r => r[6] === '3 Sao').length;
    const totalDatTieuChuan = allData.sheet1.filter(r => r[6] === 'Đạt tiêu chuẩn').length;
    
    const completeBoth = allData.sheet2.length;
    const onlySheet1 = totalSpa - completeBoth;
    
    // Thống kê theo team
    const teamStats = {};
    allData.sheet1.forEach(row => {
        const team = row[1];
        teamStats[team] = (teamStats[team] || 0) + 1;
    });
    
    const topTeams = Object.entries(teamStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon red">🏢</div>
                <div class="stat-info">
                    <h3>${totalSpa}</h3>
                    <p>Tổng số Spa đăng ký</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">⭐</div>
                <div class="stat-info">
                    <h3>${total5Sao}</h3>
                    <p>Đăng ký 5 sao</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">✅</div>
                <div class="stat-info">
                    <h3>${completeBoth}</h3>
                    <p>Hoàn thành xét duyệt</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue">📋</div>
                <div class="stat-info">
                    <h3>${onlySheet1}</h3>
                    <p>Chờ xét duyệt</p>
                </div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-card">
                <h3>📊 Phân bố theo số sao</h3>
                <div style="padding: 20px 0;">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: #555;">⭐⭐⭐⭐⭐ 5 Sao</span>
                            <strong style="color: #c61225;">${total5Sao}</strong>
                        </div>
                        <div style="background: #ebebeb; height: 12px; border-radius: 10px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #c61225, #ff4757); height: 100%; width: ${totalSpa > 0 ? (total5Sao/totalSpa*100) : 0}%; border-radius: 10px; transition: width 0.5s;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: #555;">⭐⭐⭐⭐ 4 Sao</span>
                            <strong style="color: #3498db;">${total4Sao}</strong>
                        </div>
                        <div style="background: #ebebeb; height: 12px; border-radius: 10px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #3498db, #5dade2); height: 100%; width: ${totalSpa > 0 ? (total4Sao/totalSpa*100) : 0}%; border-radius: 10px; transition: width 0.5s;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: #555;">⭐⭐⭐ 3 Sao</span>
                            <strong style="color: #27ae60;">${total3Sao}</strong>
                        </div>
                        <div style="background: #ebebeb; height: 12px; border-radius: 10px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #27ae60, #58d68d); height: 100%; width: ${totalSpa > 0 ? (total3Sao/totalSpa*100) : 0}%; border-radius: 10px; transition: width 0.5s;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: #555;">✓ Đạt tiêu chuẩn</span>
                            <strong style="color: #95a5a6;">${totalDatTieuChuan}</strong>
                        </div>
                        <div style="background: #ebebeb; height: 12px; border-radius: 10px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #95a5a6, #bdc3c7); height: 100%; width: ${totalSpa > 0 ? (totalDatTieuChuan/totalSpa*100) : 0}%; border-radius: 10px; transition: width 0.5s;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>🏆 Top Team có nhiều khách nhất</h3>
                <div style="padding: 20px 0;">
                    ${topTeams.map((team, index) => `
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #555;">${index + 1}. ${team[0]}</span>
                                <strong style="color: #c61225;">${team[1]} khách</strong>
                            </div>
                            <div style="background: #ebebeb; height: 12px; border-radius: 10px; overflow: hidden;">
                                <div style="background: linear-gradient(90deg, #9b59b6, #bb6bd9); height: 100%; width: ${totalSpa > 0 ? (team[1]/totalSpa*100) : 0}%; border-radius: 10px; transition: width 0.5s;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// DUYỆT HỒ SƠ
function renderDuyetHoSo() {
    console.log('=== DEBUG DUYỆT HỒ SƠ ===');
    console.log('Tổng Sheet1:', allData.sheet1.length);
    console.log('Tổng Sheet2:', allData.sheet2.length);
    console.log('Tổng Sheet3 (Đã duyệt):', allData.sheet3.length);
    
    // In ra tất cả mã thành viên trong Sheet1
    console.log('Mã thành viên trong Sheet1:');
    allData.sheet1.forEach((row, idx) => {
        console.log(`  [${idx}] Mã: "${row[5]}" - Spa: ${row[3]}`);
    });
    
    // In ra tất cả mã thành viên trong Sheet2
    console.log('Mã thành viên trong Sheet2:');
    allData.sheet2.forEach((row, idx) => {
        console.log(`  [${idx}] Mã: "${row[5]}" - Spa: ${row[3]}`);
    });
    
    // In ra tất cả mã thành viên trong Sheet3 (Đã duyệt)
    console.log('Mã thành viên trong Sheet3 (Đã duyệt):');
    allData.sheet3.forEach((row, idx) => {
        console.log(`  [${idx}] Mã: "${row[5]}" - Spa: ${row[3]}`);
    });
    
    // CHỈ HIỂN THỊ những khách đã hoàn thành CẢ 2 BƯỚC (có trong cả Sheet1 VÀ Sheet2)
    const readyForReview = allData.sheet2.filter(row2 => {
        const maKhach2 = row2[5] ? row2[5].toString().trim().toUpperCase() : '';
        
        if (!maKhach2) {
            console.log('⚠️ Bỏ qua dòng không có mã thành viên trong Sheet2');
            return false;
        }
        
        // Kiểm tra xem mã này có trong Sheet1 không
        const existsInSheet1 = allData.sheet1.some(row1 => {
            const maKhach1 = row1[5] ? row1[5].toString().trim().toUpperCase() : '';
            return maKhach1 === maKhach2;
        });
        
        console.log(`Mã "${maKhach2}": Có trong Sheet1? ${existsInSheet1} → ${existsInSheet1 ? 'ĐỦ ĐIỀU KIỆN' : 'CHƯA ĐỦ'}`);
        
        return existsInSheet1; // Chỉ lấy những mã có trong cả 2 sheet
    });
    
    console.log('Danh sách đủ điều kiện xét duyệt:', readyForReview.length);
    
    if (readyForReview.length === 0) {
        return `
            <div class="table-container">
                <div class="table-header">
                    <h3>📋 Danh sách chờ xét duyệt (0)</h3>
                </div>
                <div style="padding: 40px; text-align: center; color: #999;">
                    <div style="font-size: 60px; margin-bottom: 20px;">📭</div>
                    <h3 style="color: #666; margin-bottom: 10px;">Chưa có hồ sơ đủ điều kiện xét duyệt</h3>
                    <p style="font-size: 14px;">Khách hàng cần hoàn thành cả 2 bước:</p>
                    <p style="font-size: 13px; color: #999; margin-top: 10px;">
                        1️⃣ Đăng ký tham gia (Sheet1)<br>
                        2️⃣ Đăng ký xét duyệt (Sheet2)
                    </p>
                    <p style="font-size: 12px; margin-top: 15px; color: #999;">
                        Sheet1: ${allData.sheet1.length} bản ghi | Sheet2: ${allData.sheet2.length} bản ghi
                    </p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="table-container">
            <div class="table-header">
                <h3>📋 Danh sách chờ xét duyệt (${readyForReview.length})</h3>
                <div style="font-size: 13px; color: #666; margin-top: 5px;">
                    Khách hàng đã hoàn thành đầy đủ 2 bước đăng ký
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>Sale</th>
                        <th>Tên khách hàng</th>
                        <th>Tên Spa</th>
                        <th>Mã thành viên</th>
                        <th>Số giường</th>
                        <th>Số nhân sự</th>
                        <th>Ngày đăng ký</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${readyForReview.map(row => {
                        const maKhach = row[5];
                        // Kiểm tra xem mã này đã được duyệt chưa (có trong Sheet3)
                        const isDuyet = allData.sheet3.some(row3 => {
                            const maKhach3 = row3[5] ? row3[5].toString().trim().toUpperCase() : '';
                            return maKhach3 === maKhach.toString().trim().toUpperCase();
                        });
                        
                        const rowStyle = isDuyet ? 'style="background: #d4edda; color: #155724;"' : '';
                        const buttonHtml = isDuyet 
                            ? '<button class="btn btn-success btn-sm" disabled style="cursor: not-allowed; opacity: 0.6;">✓ Đã duyệt</button>'
                            : `<button class="btn btn-primary btn-sm" onclick="openXetDuyetModal('${maKhach}')">Xét duyệt</button>`;
                        
                        return `
                        <tr ${rowStyle}>
                            <td>${row[1] || '-'}</td>
                            <td>${row[2] || '-'}</td>
                            <td>${row[4] || '-'}</td>
                            <td>${row[3] || '-'}</td>
                            <td><strong>${maKhach || '-'}</strong></td>
                            <td>${row[6] || '-'}</td>
                            <td>${row[7] || '-'}</td>
                            <td>${formatDate(row[0])}</td>
                            <td>
                                ${buttonHtml}
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Mở modal xét duyệt
async function openXetDuyetModal(maKhach) {
    console.log('=== OPEN MODAL XÉT DUYỆT ===');
    console.log('Mã khách:', maKhach);
    
    // Reset điểm thủ công
    manualScores = {
        top: null,
        csvc: null,
        thietbi: null,
        chuyenmon: null,
        thanhtich: null
    };
    
    // Lấy dữ liệu từ Sheet1 (đăng ký tham gia)
    const dataSheet1 = allData.sheet1.find(row => row[5] === maKhach);
    console.log('Data Sheet1:', dataSheet1);
    
    // Lấy dữ liệu từ Sheet2 (thông tin chi tiết)
    const dataSheet2 = allData.sheet2.find(row => row[5] === maKhach);
    console.log('Data Sheet2:', dataSheet2);
    
    if (!dataSheet1) {
        alert('Không tìm thấy thông tin trong Sheet1!');
        return;
    }
    
    if (!dataSheet2) {
        alert('Không tìm thấy thông tin chi tiết trong Sheet2! Khách hàng chưa hoàn thành bước 2.');
        return;
    }
    
    currentReviewData = {
        maKhach: dataSheet1[5],
        tenSpa: dataSheet1[3],
        tenKhach: dataSheet1[4],
        team: dataSheet1[1],
        sale: dataSheet1[2],
        soSaoMongMuon: dataSheet1[6]
    };
    
    console.log('Current review data:', currentReviewData);
    
    // Tính điểm đề xuất (logic tạm thời, sẽ cập nhật sau)
    let suggestedStar = 3;
    if (dataSheet1[6] === '5 Sao') suggestedStar = 5;
    else if (dataSheet1[6] === '4 Sao') suggestedStar = 4;
    else if (dataSheet1[6] === '3 Sao') suggestedStar = 3;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <form id="formXetDuyet">
            <div class="form-row">
                <div class="form-group">
                    <label>Mã thành viên</label>
                    <input type="text" value="${dataSheet1[5] || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Tên Spa</label>
                    <input type="text" value="${dataSheet1[3] || ''}" readonly>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Tên khách hàng</label>
                    <input type="text" value="${dataSheet1[4] || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Số sao mong muốn</label>
                    <input type="text" value="${dataSheet1[6] || ''}" readonly>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        Số lượng giường
                        <span class="info-icon" onclick="showCriteriaPopup('csvc')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                    </label>
                    <input type="text" value="${dataSheet2[6] || 'Chưa có thông tin'}" readonly style="background: #f8f8f8;">
                </div>
                <div class="form-group">
                    <label>
                        Số lượng nhân sự
                        <span class="info-icon" onclick="showCriteriaPopup('csvc')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                    </label>
                    <input type="text" value="${dataSheet2[7] || 'Chưa có thông tin'}" readonly style="background: #f8f8f8;">
                </div>
            </div>
            
            <div class="form-group">
                <label>
                    Liệu trình cơ bản
                    <span class="info-icon" onclick="showCriteriaPopup('chuyenmon')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                </label>
                <textarea rows="3" readonly style="background: #f8f8f8;">${dataSheet2[8] || 'Chưa có thông tin'}</textarea>
            </div>
            
            <div class="form-group">
                <label>
                    Liệu trình nâng cao
                    <span class="info-icon" onclick="showCriteriaPopup('chuyenmon')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                </label>
                <textarea rows="3" readonly style="background: #f8f8f8;">${dataSheet2[9] || 'Chưa có thông tin'}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        Thiết bị cơ bản
                        <span class="info-icon" onclick="showCriteriaPopup('thietbi')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                    </label>
                    <textarea rows="2" readonly style="background: #f8f8f8;">${dataSheet2[10] || 'Chưa có thông tin'}</textarea>
                </div>
                <div class="form-group">
                    <label>
                        Thiết bị nâng cao
                        <span class="info-icon" onclick="showCriteriaPopup('thietbi')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                    </label>
                    <textarea rows="2" readonly style="background: #f8f8f8;">${dataSheet2[11] || 'Chưa có thông tin'}</textarea>
                </div>
            </div>
            
            <div class="form-group">
                <label>
                    Bằng cấp chuyên môn
                    <span class="info-icon" onclick="showCriteriaPopup('thanhtich')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                </label>
                <textarea rows="3" readonly style="background: #f8f8f8;">${dataSheet2[12] || 'Chưa có thông tin'}</textarea>
            </div>
            
            <div class="form-group">
                <label>Link thư mục lưu trữ</label>
                <a href="#" class="link-folder" target="_blank">📁 Xem thư mục hồ sơ của ${dataSheet1[3]}</a>
            </div>
            
            <hr style="margin: 25px 0; border: none; border-top: 2px dashed #ddd;">
            
            <h3 style="color: var(--primary-red); margin-bottom: 20px; text-align: center;">
                📊 ĐÁNH GIÁ XÉT DUYỆT
            </h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label>
                        🏆 Xếp hạng TOP (quyết định 80% kết quả)
                        <span class="info-icon" onclick="showCriteriaPopup('top')" title="Xem tiêu chí chấm điểm">ℹ️</span>
                    </label>
                    <select id="topRanking" required onchange="calculateStar()">
                        <option value="">-- Chọn xếp hạng --</option>
                        <option value="3">TOP 3 (5 điểm)</option>
                        <option value="10">TOP 10 (5 điểm)</option>
                        <option value="30">TOP 30 (4 điểm)</option>
                        <option value="50">TOP 50 (3 điểm)</option>
                        <option value="50+">Dưới TOP 50 (0 điểm)</option>
                    </select>
                    <small style="color: #666; font-size: 12px; margin-top: 5px; display: block;">
                        Xếp hạng này sẽ ảnh hưởng 80% đến kết quả cuối cùng
                    </small>
                </div>
                <div class="form-group">
                    <label>⭐ Số sao xét duyệt</label>
                    <div id="suggestedStarText" style="padding: 10px; background: #f8f8f8; border-radius: 8px; margin-bottom: 10px; min-height: 60px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 13px;">
                        Chọn xếp hạng TOP để xem đề xuất
                    </div>
                    <select id="soSaoXetDuyet" required>
                        <option value="">-- Chọn số sao --</option>
                        <option value="Đạt tiêu chuẩn">Đạt tiêu chuẩn</option>
                        <option value="3 Sao">3 Sao ⭐⭐⭐</option>
                        <option value="4 Sao">4 Sao ⭐⭐⭐⭐</option>
                        <option value="5 Sao">5 Sao ⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label>📝 Ghi chú đánh giá (tùy chọn)</label>
                <textarea id="ghiChu" rows="3" placeholder="Nhập ghi chú về đánh giá của bạn..."></textarea>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button type="submit" class="btn btn-success" style="padding: 12px 40px; font-size: 16px;">
                    💾 LƯU KẾT QUẢ XÉT DUYỆT
                </button>
            </div>
        </form>
    `;
    
    console.log('Modal HTML đã render');
    
    document.getElementById('formXetDuyet').addEventListener('submit', submitXetDuyet);
    document.getElementById('modalXetDuyet').classList.add('show');
}

// Hàm tính toán số sao dựa trên công thức chi tiết
function calculateStar() {
    const topRanking = document.getElementById('topRanking').value;
    const suggestedStarText = document.getElementById('suggestedStarText');
    const soSaoSelect = document.getElementById('soSaoXetDuyet');
    
    if (!topRanking) return;
    
    // Lấy dữ liệu từ Sheet2
    const dataSheet2 = allData.sheet2.find(row => row[5] === currentReviewData.maKhach);
    if (!dataSheet2) return;
    
    let totalScore = 0;
    
    // ===== 1. DOANH SỐ (TOP) - Điểm cao nhất =====
    let doanhSoScore = 0;
    
    // Kiểm tra có điểm thủ công không
    if (manualScores.top !== null) {
        doanhSoScore = manualScores.top;
    } else {
        switch(topRanking) {
            case '3': // TOP 3
                doanhSoScore = 5;
                break;
            case '10': // TOP 10
                doanhSoScore = 5;
                break;
            case '30': // TOP 30
                doanhSoScore = 4;
                break;
            case '50': // TOP 50
                doanhSoScore = 3;
                break;
            case '50+': // Dưới TOP 50
                doanhSoScore = 0;
                break;
            default:
                doanhSoScore = 0;
        }
    }
    totalScore += doanhSoScore;
    
    // ===== 2. CƠ SỞ VẬT CHẤT =====
    const soGiuong = parseInt(dataSheet2[6]) || 0;
    const soNhanSu = parseInt(dataSheet2[7]) || 0;
    let csvcScore = 0;
    
    // Kiểm tra có điểm thủ công không
    if (manualScores.csvc !== null) {
        csvcScore = manualScores.csvc;
    } else {
        if (soGiuong >= 8 && soNhanSu >= 7) {
            csvcScore = 3;
        } else if (soGiuong >= 6 && soNhanSu >= 5) {
            csvcScore = 2;
        } else if (soGiuong >= 4 && soNhanSu >= 3) {
            csvcScore = 1;
        }
        // Dưới 2-3 giường, 2 nhân sự = 0 điểm
    }
    totalScore += csvcScore;
    
    // ===== 3. THIẾT BỊ MÁY MÓC =====
    let thietBiScore = 0;
    
    // Kiểm tra có điểm thủ công không
    if (manualScores.thietbi !== null) {
        thietBiScore = manualScores.thietbi;
    } else {
        // Thiết bị cơ bản (cần 5/6)
        const thietBiCoBan = (dataSheet2[10] || '').toLowerCase();
        const coBanList = ['tiệt trùng', 'dr. pen', 'điện di', 'meso', 'ánh sáng', 'xông hơi'];
        let coBanCount = 0;
        coBanList.forEach(item => {
            if (thietBiCoBan.includes(item)) coBanCount++;
        });
        if (coBanCount >= 5) thietBiScore += 1;
        
        // Thiết bị nâng cao (cần 2/4)
        const thietBiNangCao = (dataSheet2[11] || '').toLowerCase();
        const nangCaoList = ['laser', 'rf', 'hifu', 'soi da'];
        let nangCaoCount = 0;
        nangCaoList.forEach(item => {
            if (thietBiNangCao.includes(item)) nangCaoCount++;
        });
        if (nangCaoCount >= 2) thietBiScore += 1;
    }
    
    totalScore += thietBiScore;
    
    // ===== 4. CHUYÊN MÔN =====
    let chuyenMonScore = 0;
    
    // Kiểm tra có điểm thủ công không
    if (manualScores.chuyenmon !== null) {
        chuyenMonScore = manualScores.chuyenmon;
    } else {
        // Liệu trình cơ bản (trên 4 cái)
        const lieuTrinhCoBan = (dataSheet2[8] || '').split('\n').filter(x => x.trim()).length;
        if (lieuTrinhCoBan > 4) chuyenMonScore += 1;
        
        // Liệu trình nâng cao (8 cái trở lên)
        const lieuTrinhNangCao = (dataSheet2[9] || '').split('\n').filter(x => x.trim()).length;
        if (lieuTrinhNangCao >= 8) chuyenMonScore += 1;
        
        // Auto +2 điểm (ưu ái từ công ty)
        chuyenMonScore += 2;
    }
    
    totalScore += chuyenMonScore;
    
    // ===== 5. THÀNH TÍCH (Bằng cấp) =====
    let thanhTichScore = 0;
    
    // Kiểm tra có điểm thủ công không
    if (manualScores.thanhtich !== null) {
        thanhTichScore = manualScores.thanhtich;
    } else {
        const bangCap = (dataSheet2[12] || '').toLowerCase();
        
        // Đếm số chứng nhận (giả sử mỗi dòng là 1 chứng nhận)
        const soChungNhan = (dataSheet2[12] || '').split('\n').filter(x => x.trim()).length;
        if (soChungNhan >= 4) thanhTichScore = 1;
    }
    
    totalScore += thanhTichScore;
    
    // ===== QUY ĐỔI RA SỐ SAO =====
    let suggestedStar = 'Đạt tiêu chuẩn';
    let suggestedStarNum = 0;
    
    if (totalScore >= 15) {
        suggestedStar = '5 Sao';
        suggestedStarNum = 5;
    } else if (totalScore >= 13) {
        suggestedStar = '4 Sao';
        suggestedStarNum = 4;
    } else if (totalScore >= 11) {
        suggestedStar = '3 Sao';
        suggestedStarNum = 3;
    } else if (totalScore >= 9) {
        suggestedStar = 'Đạt tiêu chuẩn';
        suggestedStarNum = 0;
    } else {
        suggestedStar = 'Chưa đạt';
        suggestedStarNum = 0;
    }
    
    // Hiển thị kết quả
    const manualIndicator = (manualScores.top !== null || manualScores.csvc !== null || 
                            manualScores.thietbi !== null || manualScores.chuyenmon !== null || 
                            manualScores.thanhtich !== null) 
        ? '<div style="font-size: 11px; color: #f39c12; margin-top: 5px;">⚠️ Có điểm thủ công</div>' 
        : '';
    
    suggestedStarText.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: var(--primary-red); margin-bottom: 8px;">
                ${suggestedStarNum > 0 ? suggestedStarNum + ' ⭐' : '❌ Chưa đạt'}
            </div>
            <div style="font-size: 13px; color: #666; font-weight: 600; margin-bottom: 8px;">
                Tổng điểm: ${totalScore}/15
            </div>
            <div style="font-size: 11px; color: #999; line-height: 1.6;">
                TOP: ${doanhSoScore}${manualScores.top !== null ? '✏️' : ''} | 
                CSVC: ${csvcScore}${manualScores.csvc !== null ? '✏️' : ''} | 
                Thiết bị: ${thietBiScore}${manualScores.thietbi !== null ? '✏️' : ''}<br>
                Chuyên môn: ${chuyenMonScore}${manualScores.chuyenmon !== null ? '✏️' : ''} | 
                Thành tích: ${thanhTichScore}${manualScores.thanhtich !== null ? '✏️' : ''}
            </div>
            ${manualIndicator}
        </div>
    `;
    
    // Tự động chọn số sao đề xuất
    soSaoSelect.value = suggestedStar;
    
    console.log('=== TÍNH ĐIỂM TỰ ĐỘNG ===');
    console.log('Doanh số (TOP):', doanhSoScore);
    console.log('Cơ sở vật chất:', csvcScore, `(${soGiuong} giường, ${soNhanSu} nhân sự)`);
    console.log('Thiết bị:', thietBiScore, `(Cơ bản: ${coBanCount}/6, Nâng cao: ${nangCaoCount}/4)`);
    console.log('Chuyên môn:', chuyenMonScore, `(LT cơ bản: ${lieuTrinhCoBan}, LT nâng cao: ${lieuTrinhNangCao})`);
    console.log('Thành tích:', thanhTichScore, `(${soChungNhan} chứng nhận)`);
    console.log('TỔNG ĐIỂM:', totalScore);
    console.log('ĐỀ XUẤT:', suggestedStar);
}

// Submit xét duyệt
async function submitXetDuyet(e) {
    e.preventDefault();
    
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };
    
    // Lấy dữ liệu từ Sheet2
    const dataSheet2 = allData.sheet2.find(row => row[5] === currentReviewData.maKhach);
    
    if (!dataSheet2) {
        alert('Không tìm thấy thông tin chi tiết!');
        return;
    }
    
    const payload = {
        action: "adminSubmitReview",
        maKhach: currentReviewData.maKhach,
        tenSpa: currentReviewData.tenSpa,
        tenKhach: currentReviewData.tenKhach,
        team: currentReviewData.team,
        sale: currentReviewData.sale,
        soGiuong: dataSheet2[6] || '',
        soNhanSu: dataSheet2[7] || '',
        lieuTrinhCoBan: dataSheet2[8] || '',
        lieuTrinhNangCao: dataSheet2[9] || '',
        thietBiCoBan: dataSheet2[10] || '',
        thietBiNangCao: dataSheet2[11] || '',
        bangCap: dataSheet2[12] || '',
        soSaoXetDuyet: getVal('soSaoXetDuyet')
    };
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            alert('Xét duyệt thành công!');
            closeModal();
            loadAllData();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        alert('Lỗi kết nối: ' + error.message);
    }
}

// KHÁCH HÀNG
function renderKhachHang() {
    return `
        <div class="filters">
            <div class="filter-group">
                <label>Lọc theo Team</label>
                <select id="filterTeam">
                    <option value="">Tất cả Team</option>
                    <option value="Miền Tây">Miền Tây</option>
                    <option value="Miền Đông">Miền Đông</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Lọc theo số sao</label>
                <select id="filterSao">
                    <option value="">Tất cả</option>
                    <option value="5 Sao">5 Sao</option>
                    <option value="4 Sao">4 Sao</option>
                    <option value="3 Sao">3 Sao</option>
                    <option value="Đạt tiêu chuẩn">Đạt tiêu chuẩn</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Lọc theo tình trạng</label>
                <select id="filterTinhTrang">
                    <option value="">Tất cả</option>
                    <option value="day-du">Đã đăng ký đủ 2 bước</option>
                    <option value="thieu-tham-gia">Thiếu đăng ký tham gia</option>
                    <option value="thieu-xet-duyet">Thiếu đăng ký xét duyệt</option>
                </select>
            </div>
            <div class="filter-group">
                <label>&nbsp;</label>
                <button class="btn btn-success" onclick="exportExcel()">📥 Export Excel</button>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h3>👥 Danh sách khách hàng</h3>
            </div>
            <table id="tableKhachHang">
                <thead>
                    <tr>
                        <th>Mã KH</th>
                        <th>Tên Spa</th>
                        <th>Tên Chủ</th>
                        <th>Team</th>
                        <th>Sale</th>
                        <th>Số sao</th>
                        <th>Tình trạng</th>
                        <th>Ngày tham gia</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody id="tbodyKhachHang">
                    ${renderKhachHangRows(getAllUniqueCustomers())}
                </tbody>
            </table>
        </div>
    `;
}

function getCustomerStatus(maKhach) {
    // Kiểm tra xem mã khách có trong Sheet1 và Sheet2 không
    const inSheet1 = allData.sheet1.some(row => row[5] === maKhach);
    const inSheet2 = allData.sheet2.some(row => row[5] === maKhach);
    
    if (inSheet1 && inSheet2) {
        return {
            type: 'day-du',
            label: 'Đủ 2 bước',
            badge: '<span style="background: #28a745; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">✓ Đủ 2 bước</span>'
        };
    } else if (inSheet1 && !inSheet2) {
        return {
            type: 'thieu-xet-duyet',
            label: 'Thiếu xét duyệt',
            badge: '<span style="background: #ffc107; color: #333; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">⚠ Thiếu xét duyệt</span>'
        };
    } else if (!inSheet1 && inSheet2) {
        return {
            type: 'thieu-tham-gia',
            label: 'Thiếu tham gia',
            badge: '<span style="background: #dc3545; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">✗ Thiếu tham gia</span>'
        };
    }
    
    return {
        type: 'unknown',
        label: 'Không xác định',
        badge: '<span style="background: #6c757d; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">? Không rõ</span>'
    };
}

function getAllUniqueCustomers() {
    // Tạo map để lưu tất cả khách hàng duy nhất
    const customerMap = new Map();
    
    // Thêm tất cả khách hàng từ Sheet1
    allData.sheet1.forEach(row => {
        const maKhach = row[5];
        if (!customerMap.has(maKhach)) {
            customerMap.set(maKhach, row);
        }
    });
    
    // Thêm khách hàng từ Sheet2 nếu chưa có trong map
    allData.sheet2.forEach(row => {
        const maKhach = row[5];
        if (!customerMap.has(maKhach)) {
            // Tạo row giả với cấu trúc giống Sheet1
            // Sheet2: A:Ngày, B:Team, C:Sale, D:Tên Spa, E:Tên khách, F:Mã thành viên
            const fakeRow = [
                row[0],  // Ngày
                row[1],  // Team
                row[2],  // Sale
                row[3],  // Tên Spa
                row[4],  // Tên khách
                row[5],  // Mã thành viên
                'Chưa xét duyệt',  // Số sao (placeholder)
                ''       // Giấy phép (placeholder)
            ];
            customerMap.set(maKhach, fakeRow);
        }
    });
    
    return Array.from(customerMap.values());
}

function renderKhachHangRows(data) {
    return data.map(row => {
        const maKhach = row[5];
        const status = getCustomerStatus(maKhach);
        
        return `
        <tr>
            <td><strong>${maKhach}</strong></td>
            <td>${row[3]}</td>
            <td>${row[4]}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td>${row[6]}</td>
            <td>${status.badge}</td>
            <td>${formatDate(row[0])}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editKhachHang('${maKhach}')">✏️ Sửa</button>
            </td>
        </tr>
    `;
    }).join('');
}

function initKhachHangFilters() {
    document.getElementById('filterTeam').addEventListener('change', applyFilters);
    document.getElementById('filterSao').addEventListener('change', applyFilters);
    document.getElementById('filterTinhTrang').addEventListener('change', applyFilters);
}

function applyFilters() {
    const team = document.getElementById('filterTeam').value;
    const sao = document.getElementById('filterSao').value;
    const tinhTrang = document.getElementById('filterTinhTrang').value;
    
    let filtered = getAllUniqueCustomers();
    
    // Lọc theo team
    if (team) {
        filtered = filtered.filter(r => r[1] === team);
    }
    
    // Lọc theo số sao
    if (sao) {
        filtered = filtered.filter(r => r[6] === sao);
    }
    
    // Lọc theo tình trạng
    if (tinhTrang) {
        filtered = filtered.filter(row => {
            const maKhach = row[5];
            const status = getCustomerStatus(maKhach);
            return status.type === tinhTrang;
        });
    }
    
    document.getElementById('tbodyKhachHang').innerHTML = renderKhachHangRows(filtered);
}

function exportExcel() {
    alert('Chức năng export Excel đang được phát triển!');
}

function editKhachHang(maKhach) {
    // Hiển thị popup yêu cầu mật khẩu
    const passwordPopup = `
        <div class="criteria-popup-overlay" id="passwordPopupOverlay">
            <div class="criteria-popup" onclick="event.stopPropagation()" style="max-width: 450px;">
                <div class="criteria-popup-header">
                    <h3>🔒 XÁC NHẬN MẬT KHẨU</h3>
                    <button class="close-btn" onclick="closePasswordPopup()">✕</button>
                </div>
                <div class="criteria-popup-body">
                    <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
                        Để chỉnh sửa thông tin khách hàng, vui lòng nhập mật khẩu xác nhận:
                    </p>
                    <div class="form-group">
                        <label>Mật khẩu Admin</label>
                        <input type="password" id="confirmPassword" placeholder="Nhập mật khẩu" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;"
                               onkeypress="if(event.key === 'Enter') verifyPasswordAndEdit('${maKhach}')">
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="verifyPasswordAndEdit('${maKhach}')" style="padding: 12px 30px;">
                            ✓ Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', passwordPopup);
    
    // Focus vào input password
    setTimeout(() => {
        document.getElementById('confirmPassword').focus();
    }, 100);
}

// Đóng popup mật khẩu
function closePasswordPopup() {
    const popup = document.getElementById('passwordPopupOverlay');
    if (popup) {
        popup.remove();
    }
}

// Xác thực mật khẩu và mở form sửa
async function verifyPasswordAndEdit(maKhach) {
    const password = document.getElementById('confirmPassword').value;
    
    if (!password) {
        alert('Vui lòng nhập mật khẩu!');
        return;
    }
    
    // Xác thực bằng API (server-side) thay vì local
    const username = localStorage.getItem('adminUsername');
    const result = await verifyPassword(username, password);
    
    if (result.success) {
        closePasswordPopup();
        openEditModal(maKhach);
    } else {
        alert('Mật khẩu không đúng!');
        document.getElementById('confirmPassword').value = '';
        document.getElementById('confirmPassword').focus();
    }
}

// Mở modal chỉnh sửa thông tin khách hàng
function openEditModal(maKhach) {
    // Tìm thông tin khách hàng từ Sheet1
    const customer = allData.sheet1.find(row => row[5] === maKhach);
    
    if (!customer) {
        alert('Không tìm thấy thông tin khách hàng!');
        return;
    }
    
    const modalHTML = `
        <div class="modal show" id="modalEditKhachHang">
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>✏️ CHỈNH SỬA THÔNG TIN KHÁCH HÀNG</h3>
                    <button class="btn-close" onclick="closeEditModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="formEditKhachHang">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Mã thành viên</label>
                                <input type="text" id="edit_maKhach" value="${customer[5] || ''}" readonly style="background: #f0f0f0; cursor: not-allowed;">
                                <small style="color: #999; font-size: 11px;">Mã thành viên không thể thay đổi</small>
                            </div>
                            <div class="form-group">
                                <label>Tên Spa</label>
                                <input type="text" id="edit_tenSpa" value="${customer[3] || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Tên khách hàng</label>
                                <input type="text" id="edit_tenKhach" value="${customer[4] || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Số sao mong muốn</label>
                                <select id="edit_soSao" required>
                                    <option value="Đạt tiêu chuẩn" ${customer[6] === 'Đạt tiêu chuẩn' ? 'selected' : ''}>Đạt tiêu chuẩn</option>
                                    <option value="3 Sao" ${customer[6] === '3 Sao' ? 'selected' : ''}>3 Sao</option>
                                    <option value="4 Sao" ${customer[6] === '4 Sao' ? 'selected' : ''}>4 Sao</option>
                                    <option value="5 Sao" ${customer[6] === '5 Sao' ? 'selected' : ''}>5 Sao</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Team phụ trách</label>
                                <select id="edit_team" required>
                                    <option value="Miền Tây" ${customer[1] === 'Miền Tây' ? 'selected' : ''}>Miền Tây</option>
                                    <option value="Miền Đông" ${customer[1] === 'Miền Đông' ? 'selected' : ''}>Miền Đông</option>
                                    <option value="Hồ Chí Minh" ${customer[1] === 'Hồ Chí Minh' ? 'selected' : ''}>Hồ Chí Minh</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Sale phụ trách</label>
                                <input type="text" id="edit_sale" value="${customer[2] || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Ghi chú</label>
                            <textarea id="edit_ghiChu" rows="3" placeholder="Nhập ghi chú về thay đổi (tùy chọn)"></textarea>
                        </div>
                        
                        <div style="text-align: center; margin-top: 25px; display: flex; gap: 15px; justify-content: center;">
                            <button type="button" class="btn btn-danger" onclick="closeEditModal()" style="padding: 12px 30px;">
                                ✕ Hủy
                            </button>
                            <button type="submit" class="btn btn-success" style="padding: 12px 30px;">
                                💾 Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Xử lý submit form
    document.getElementById('formEditKhachHang').addEventListener('submit', submitEditKhachHang);
}

// Đóng modal chỉnh sửa
function closeEditModal() {
    const modal = document.getElementById('modalEditKhachHang');
    if (modal) {
        modal.remove();
    }
}

// Submit form chỉnh sửa
async function submitEditKhachHang(e) {
    e.preventDefault();
    
    const maKhach = document.getElementById('edit_maKhach').value;
    const tenSpa = document.getElementById('edit_tenSpa').value;
    const tenKhach = document.getElementById('edit_tenKhach').value;
    const soSao = document.getElementById('edit_soSao').value;
    const team = document.getElementById('edit_team').value;
    const sale = document.getElementById('edit_sale').value;
    const ghiChu = document.getElementById('edit_ghiChu').value;
    
    if (!confirm('Bạn có chắc muốn lưu thay đổi?')) {
        return;
    }
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateCustomer',
                maKhach: maKhach,
                tenSpa: tenSpa,
                tenKhach: tenKhach,
                soSao: soSao,
                team: team,
                sale: sale,
                ghiChu: ghiChu,
                updatedBy: localStorage.getItem('adminUsername'),
                updatedAt: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Cập nhật thông tin thành công!');
            closeEditModal();
            loadAllData(); // Reload dữ liệu
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        alert('Lỗi kết nối! Vui lòng thử lại.');
    }
}

// CÀI ĐẶT
function renderCaiDat() {
    return `
        <div class="settings-section">
            <h3>👥 Quản lý Sale & Team</h3>
            <p>Thêm/Xóa tên các bạn Sale vào danh sách (mỗi tên một dòng)</p>
            <textarea id="settingSales" rows="8" placeholder="Như Nguyệt&#10;Thuý Vi&#10;Thuý Điểm&#10;..."></textarea>
            <button class="btn btn-primary" onclick="saveSales()" style="margin-top: 15px;">💾 Lưu danh sách Sale</button>
        </div>
        
        <div class="settings-section">
            <h3>⭐ Tiêu chí xét duyệt</h3>
            <p>Cập nhật các yêu cầu tối thiểu cho từng cấp độ sao</p>
            <textarea id="settingCriteria" rows="10" placeholder="3 Sao: Tối thiểu 3 giường, 5 nhân viên&#10;4 Sao: Tối thiểu 5 giường, 8 nhân viên, có máy Laser&#10;5 Sao: Tối thiểu 8 giường, 12 nhân viên, đầy đủ thiết bị nâng cao&#10;..."></textarea>
            <button class="btn btn-primary" onclick="saveCriteria()" style="margin-top: 15px;">💾 Lưu tiêu chí</button>
        </div>
        
        <div class="settings-section">
            <h3>📧 Thông báo Email</h3>
            <p>Cấu hình nội dung email tự động gửi cho khách khi hồ sơ được duyệt</p>
            <textarea id="settingEmail" rows="8" placeholder="Kính gửi [Tên Spa],&#10;&#10;Chúc mừng! Hồ sơ của bạn đã được duyệt với kết quả [Số sao].&#10;&#10;Trân trọng,&#10;ISOV Team"></textarea>
            <button class="btn btn-primary" onclick="saveEmail()" style="margin-top: 15px;">💾 Lưu cấu hình Email</button>
        </div>
    `;
}

async function loadSettings() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSettings`);
        const result = await response.json();
        
        if (result.sales) document.getElementById('settingSales').value = result.sales;
        if (result.criteria) document.getElementById('settingCriteria').value = result.criteria;
        if (result.email) document.getElementById('settingEmail').value = result.email;
    } catch (error) {
        console.error('Lỗi load settings:', error);
    }
}

async function saveSales() {
    const sales = document.getElementById('settingSales').value;
    await saveSettings('sales', sales);
}

async function saveCriteria() {
    const criteria = document.getElementById('settingCriteria').value;
    await saveSettings('criteria', criteria);
}

async function saveEmail() {
    const email = document.getElementById('settingEmail').value;
    await saveSettings('email', email);
}

async function saveSettings(type, value) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveSettings',
                type: type,
                value: value
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert('Lưu thành công!');
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Hiển thị popup tiêu chí chấm điểm
function showCriteriaPopup(type) {
    let title = '';
    let content = '';
    let maxScore = 0;
    
    switch(type) {
        case 'top':
            title = '🏆 TIÊU CHÍ CHẤM ĐIỂM: DOANH SỐ (TOP RANKING)';
            maxScore = 5;
            content = `
                <div style="margin-bottom: 20px;">
                    <p style="font-weight: 600; color: #c61225; margin-bottom: 15px;">
                        Đây là tiêu chí quan trọng nhất, quyết định 80% kết quả cuối cùng
                    </p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f8f8;">
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Xếp hạng</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">TOP 3</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #27ae60;">5 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">TOP 10</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #27ae60;">5 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">TOP 30</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #3498db;">4 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">TOP 50</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #f39c12;">3 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">Dưới TOP 50</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #e74c3c;">0 điểm</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            break;
            
        case 'csvc':
            title = '🏢 TIÊU CHÍ CHẤM ĐIỂM: CƠ SỞ VẬT CHẤT';
            maxScore = 3;
            content = `
                <div style="margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f8f8;">
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Số giường</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Số nhân sự</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">≥ 8 giường</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">≥ 7 nhân sự</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #27ae60;">3 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">6-7 giường</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">5-6 nhân sự</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #3498db;">2 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">4-5 giường</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">3-4 nhân sú</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #f39c12;">1 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">< 4 giường</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">< 3 nhân sự</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #e74c3c;">0 điểm</td>
                            </tr>
                        </tbody>
                    </table>
                    <p style="margin-top: 15px; font-size: 13px; color: #666;">
                        <strong>Lưu ý:</strong> Yêu cầu tối thiểu là 2-3 giường, 2 nhân sự (không tính điểm)
                    </p>
                </div>
            `;
            break;
            
        case 'thietbi':
            title = '🔧 TIÊU CHÍ CHẤM ĐIỂM: THIẾT BỊ MÁY MÓC';
            maxScore = 2;
            content = `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #c61225; margin-bottom: 10px;">Thiết bị cơ bản (6 loại)</h4>
                    <p style="margin-bottom: 10px;"><strong>+1 điểm</strong> nếu có <strong>≥5/6</strong> loại:</p>
                    <ul style="margin-left: 20px; margin-bottom: 20px; line-height: 1.8;">
                        <li>✓ Tủ tiệt trùng</li>
                        <li>✓ Máy Dr. Pen</li>
                        <li>✓ Máy điện di</li>
                        <li>✓ Máy Meso</li>
                        <li>✓ Máy ánh sáng sinh học</li>
                        <li>✓ Máy xông hơi hút mụn</li>
                    </ul>
                    
                    <h4 style="color: #c61225; margin-bottom: 10px;">Thiết bị nâng cao (4 loại)</h4>
                    <p style="margin-bottom: 10px;"><strong>+1 điểm</strong> nếu có <strong>≥2/4</strong> loại:</p>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li>✓ Máy Laser</li>
                        <li>✓ Máy RF</li>
                        <li>✓ Máy Hifu</li>
                        <li>✓ Máy soi da/phân tích da</li>
                    </ul>
                    
                    <p style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 8px; font-size: 13px;">
                        <strong>Tổng điểm tối đa:</strong> 2 điểm (1 điểm cơ bản + 1 điểm nâng cao)
                    </p>
                </div>
            `;
            break;
            
        case 'chuyenmon':
            title = '📚 TIÊU CHÍ CHẤM ĐIỂM: CHUYÊN MÔN';
            maxScore = 4;
            content = `
                <div style="margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f8f8;">
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Tiêu chí</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Điều kiện</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">Liệu trình cơ bản</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">> 4 liệu trình</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #27ae60;">+1 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">Liệu trình nâng cao</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">≥ 8 liệu trình</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #27ae60;">+1 điểm</td>
                            </tr>
                            <tr style="background: #fff3cd;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Ưu ái công ty</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">Tự động (quy trình chuẩn)</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #c61225;">+2 điểm</td>
                            </tr>
                        </tbody>
                    </table>
                    <p style="margin-top: 15px; font-size: 13px; color: #666;">
                        <strong>Lưu ý đặc biệt:</strong> Công ty tự động cộng +2 điểm cho tất cả khách hàng do khi đăng ký sẽ nhận được quy trình chăm sóc khách hàng chuẩn.
                    </p>
                </div>
            `;
            break;
            
        case 'thanhtich':
            title = '🏆 TIÊU CHÍ CHẤM ĐIỂM: THÀNH TÍCH';
            maxScore = 1;
            content = `
                <div style="margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f8f8;">
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Số chứng nhận/bằng cấp</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">≥ 4 chứng nhận</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #27ae60;">+1 điểm</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">< 4 chứng nhận</td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; color: #e74c3c;">0 điểm</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            break;
    }
    
    // Tạo HTML cho popup
    const popupHTML = `
        <div class="criteria-popup-overlay" id="criteriaPopupOverlay" onclick="closeCriteriaPopup()">
            <div class="criteria-popup" onclick="event.stopPropagation()">
                <div class="criteria-popup-header">
                    <h3>${title}</h3>
                    <button class="close-btn" onclick="closeCriteriaPopup()">✕</button>
                </div>
                <div class="criteria-popup-body">
                    ${content}
                    <hr style="margin: 25px 0; border: none; border-top: 2px dashed #ddd;">
                    <h4 style="color: #c61225; margin-bottom: 15px;">✏️ Chấm điểm thủ công (tùy chọn)</h4>
                    <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
                        Nếu bạn muốn ghi đè điểm tự động, hãy chọn điểm thủ công bên dưới:
                    </p>
                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px;">
                        <label style="font-weight: 600; min-width: 100px;">Chọn điểm:</label>
                        <select id="manualScore_${type}" style="flex: 1; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                            <option value="">Tự động (theo tiêu chí)</option>
                            ${Array.from({length: maxScore + 1}, (_, i) => `<option value="${i}">${i} điểm</option>`).join('')}
                        </select>
                    </div>
                    <div style="text-align: center;">
                        <button class="btn btn-primary" onclick="saveManualScore('${type}', ${maxScore})" style="padding: 12px 30px;">
                            💾 Lưu điểm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm popup vào body
    const existingPopup = document.getElementById('criteriaPopupOverlay');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Set giá trị hiện tại nếu có
    if (manualScores[type] !== null) {
        document.getElementById(`manualScore_${type}`).value = manualScores[type];
    }
}

// Đóng popup tiêu chí
function closeCriteriaPopup() {
    const popup = document.getElementById('criteriaPopupOverlay');
    if (popup) {
        popup.remove();
    }
}

// Lưu điểm thủ công
function saveManualScore(type, maxScore) {
    const selectElement = document.getElementById(`manualScore_${type}`);
    const value = selectElement.value;
    
    if (value === '') {
        manualScores[type] = null;
        alert('Đã chuyển về chế độ tự động tính điểm');
    } else {
        const score = parseInt(value);
        if (score >= 0 && score <= maxScore) {
            manualScores[type] = score;
            alert(`Đã lưu điểm thủ công: ${score}/${maxScore} điểm`);
        } else {
            alert('Điểm không hợp lệ!');
            return;
        }
    }
    
    closeCriteriaPopup();
    
    // Tính lại điểm nếu đang trong modal xét duyệt
    if (document.getElementById('topRanking')) {
        calculateStar();
    }
}

// HELPER FUNCTIONS
function closeModal() {
    document.getElementById('modalXetDuyet').classList.remove('show');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

// Expose functions to global scope
window.openXetDuyetModal = openXetDuyetModal;
window.closeModal = closeModal;
window.exportExcel = exportExcel;
window.editKhachHang = editKhachHang;
window.saveSales = saveSales;
window.saveCriteria = saveCriteria;
window.saveEmail = saveEmail;
window.calculateStar = calculateStar;
window.showCriteriaPopup = showCriteriaPopup;
window.closeCriteriaPopup = closeCriteriaPopup;
window.saveManualScore = saveManualScore;
window.closePasswordPopup = closePasswordPopup;
window.verifyPasswordAndEdit = verifyPasswordAndEdit;
window.closeEditModal = closeEditModal;
