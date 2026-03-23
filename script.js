// AI 工具导航 - 主脚本

// ===== 全局状态 =====
let allTools = [];
let filteredTools = [];
let favorites = [];
let displayedCount = 12; // 初始显示数量
let siteInfo = {};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    initData();
    setupEventListeners();
});

// ===== 数据加载 =====
async function initData() {
    showLoading();
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        siteInfo = data.siteInfo || {};
        allTools = data.tools || [];

        // 更新页面标题
        if (siteInfo.title) {
            document.title = siteInfo.title;
        }
        if (siteInfo.subtitle) {
            document.getElementById('siteSubtitle').textContent = siteInfo.subtitle;
        }

        // 更新页脚最后更新时间
        if (siteInfo.lastUpdated) {
            const updateEl = document.getElementById('lastUpdate');
            if (updateEl) {
                updateEl.textContent = '最后更新：' + siteInfo.lastUpdated;
            }
        }

        // 初始化筛选器
        populateFilters(data.categories, data.pricings);

        // 生成标签云
        generateTagsCloud();

        // 初始渲染
        filterAndRender();

        // 更新统计
        updateStats();
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('加载数据失败，请刷新页面重试');
    } finally {
        hideLoading();
    }
}

// ===== 填充筛选器 =====
function populateFilters(categories, pricings) {
    const categorySelect = document.getElementById('categoryFilter');
    const pricingSelect = document.getElementById('pricingFilter');
    const submitCategory = document.getElementById('submitCategory');
    
    // 分类筛选
    (categories || []).forEach(cat => {
        if (cat !== '全部') {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
            
            // 提交表单也用同样的分类
            if (submitCategory) {
                const submitOption = option.cloneNode(true);
                submitCategory.appendChild(submitOption);
            }
        }
    });
    
    // 价格筛选
    (pricings || []).forEach(price => {
        if (price !== '全部') {
            const option = document.createElement('option');
            option.value = price;
            option.textContent = price;
            pricingSelect.appendChild(option);
        }
    });
}

// ===== 生成标签云 =====
function generateTagsCloud() {
    const tagsCloud = document.getElementById('tagsCloud');
    const tagCount = {};
    
    // 统计标签频率
    allTools.forEach(tool => {
        (tool.tags || []).forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
    });
    
    // 排序并取前 20 个
    const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
    
    // 渲染标签
    sortedTags.forEach(([tag, count]) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.textContent = tag;
        tagEl.dataset.tag = tag;
        tagEl.addEventListener('click', () => selectTag(tag));
        tagsCloud.appendChild(tagEl);
    });
}

// ===== 选择标签 =====
function selectTag(tag) {
    // 清除其他筛选
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '全部';
    document.getElementById('pricingFilter').value = '全部';
    
    // 搜索标签
    document.getElementById('searchInput').value = tag;
    filterAndRender();
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 事件监听 =====
function setupEventListeners() {
    // 搜索
    document.getElementById('searchInput').addEventListener('input', debounce(filterAndRender, 300));
    document.getElementById('clearSearch').addEventListener('click', clearSearch);
    
    // 筛选
    document.getElementById('categoryFilter').addEventListener('change', filterAndRender);
    document.getElementById('pricingFilter').addEventListener('change', filterAndRender);
    document.getElementById('sortSelect').addEventListener('change', filterAndRender);
    
    // 主题切换
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // 收藏按钮
    document.getElementById('favoritesBtn').addEventListener('click', showFavoritesModal);
    
    // 加载更多
    document.getElementById('loadMoreBtn').addEventListener('click', loadMore);
    
    // 重置筛选
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // 弹窗关闭
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('favoritesModalClose').addEventListener('click', closeFavoritesModal);
    document.getElementById('submitModalClose').addEventListener('click', closeSubmitModal);
    
    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // 提交工具链接
    document.getElementById('submitToolLink').addEventListener('click', (e) => {
        e.preventDefault();
        showSubmitModal();
    });
    
    // 提交表单
    document.getElementById('submitForm').addEventListener('submit', handleSubmit);
    
    // 加载主题
    loadTheme();
}

// ===== 筛选和渲染 =====
function filterAndRender() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const category = document.getElementById('categoryFilter').value;
    const pricing = document.getElementById('pricingFilter').value;
    const sortBy = document.getElementById('sortSelect').value;
    
    // 清除/显示清除按钮
    const clearBtn = document.getElementById('clearSearch');
    clearBtn.style.display = searchTerm ? 'block' : 'none';
    
    // 筛选
    filteredTools = allTools.filter(tool => {
        // 分类筛选
        if (category !== '全部' && tool.category !== category) return false;
        
        // 价格筛选
        if (pricing !== '全部' && tool.pricing !== pricing) return false;
        
        // 搜索筛选
        if (searchTerm) {
            const searchFields = [
                tool.name,
                tool.description,
                ...(tool.tags || [])
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) return false;
        }
        
        return true;
    });
    
    // 排序
    sortTools(sortBy);
    
    // 重置显示数量
    displayedCount = 12;
    
    // 渲染
    renderTools();
    updateStats();
    updateLoadMore();
}

// ===== 排序 =====
function sortTools(sortBy) {
    filteredTools.sort((a, b) => {
        switch (sortBy) {
            case 'favorites':
                return (b.favorites || 0) - (a.favorites || 0);
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'name':
                return (a.name || '').localeCompare(b.name || '', 'zh-CN');
            case 'newest':
                return (b.id || 0) - (a.id || 0);
            default:
                return 0;
        }
    });
}

// ===== 渲染工具 =====
function renderTools() {
    const grid = document.getElementById('toolsGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredTools.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // 只渲染当前显示数量的工具
    const toolsToShow = filteredTools.slice(0, displayedCount);
    
    grid.innerHTML = toolsToShow.map(tool => createToolCard(tool)).join('');
    
    // 绑定卡片事件
    grid.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.tool-favorite-btn') && !e.target.closest('.tool-link')) {
                const toolId = parseInt(card.dataset.id);
                showToolModal(toolId);
            }
        });
    });
    
    // 绑定收藏按钮事件
    grid.querySelectorAll('.tool-favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const toolId = parseInt(btn.dataset.id);
            toggleFavorite(toolId);
        });
    });
}

// ===== 创建工具卡片 =====
function createToolCard(tool) {
    const isFavorited = favorites.includes(tool.id);
    
    return `
        <div class="tool-card ${isFavorited ? 'favorited' : ''}" data-id="${tool.id}">
            <div class="tool-card-header">
                <div style="display: flex; align-items: flex-start;">
                    <span class="tool-logo">${tool.logo || '🚀'}</span>
                    <div class="tool-info">
                        <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
                        <span class="tool-category">${escapeHtml(tool.category)}</span>
                    </div>
                </div>
                <button class="tool-favorite-btn ${isFavorited ? 'active' : ''}" data-id="${tool.id}" title="收藏">
                    ${isFavorited ? '⭐' : '☆'}
                </button>
            </div>
            <p class="tool-description">${escapeHtml(tool.description)}</p>
            <div class="tool-tags">
                ${(tool.tags || []).slice(0, 4).map(tag => `<span class="tool-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="tool-footer">
                <div class="tool-rating">
                    <span class="star-icon">★</span>
                    <span>${tool.rating || 'N/A'}</span>
                    <span style="color: var(--text-secondary); margin-left: 8px;">⭐ ${formatNumber(tool.favorites || 0)}</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="tool-pricing ${tool.pricing}">${tool.pricing}</span>
                    <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="tool-link" onclick="event.stopPropagation()">
                        访问 →
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ===== 加载更多 =====
function loadMore() {
    displayedCount += 12;
    renderTools();
    updateLoadMore();
}

// ===== 更新加载更多按钮 =====
function updateLoadMore() {
    const container = document.getElementById('loadMoreContainer');
    if (filteredTools.length > displayedCount) {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// ===== 更新统计 =====
function updateStats() {
    document.getElementById('totalTools').textContent = allTools.length;
    document.getElementById('favoritedTools').textContent = favorites.length;
    document.getElementById('displayedTools').textContent = Math.min(filteredTools.length, displayedCount);
}

// ===== 收藏功能 =====
function loadFavorites() {
    try {
        const stored = localStorage.getItem('ai-tools-favorites');
        favorites = stored ? JSON.parse(stored) : [];
    } catch (e) {
        favorites = [];
    }
}

function saveFavorites() {
    localStorage.setItem('ai-tools-favorites', JSON.stringify(favorites));
    updateStats();
}

function toggleFavorite(toolId) {
    const index = favorites.indexOf(toolId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(toolId);
    }
    saveFavorites();
    
    // 重新渲染当前视图
    renderTools();
    
    // 如果收藏弹窗打开，也更新它
    if (document.getElementById('favoritesModal').classList.contains('active')) {
        renderFavoritesList();
    }
}

// ===== 显示工具详情弹窗 =====
function showToolModal(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    const modalBody = document.getElementById('modalBody');
    const isFavorited = favorites.includes(tool.id);
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <span class="modal-logo">${tool.logo || '🚀'}</span>
            <div class="modal-title">
                <h2>${escapeHtml(tool.name)}</h2>
                <div class="modal-meta">
                    <span class="tool-category">${escapeHtml(tool.category)}</span>
                    <span class="tool-pricing ${tool.pricing}">${tool.pricing}</span>
                    <span class="tool-rating">
                        <span class="star-icon">★</span>
                        ${tool.rating || 'N/A'}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>📝 简介</h3>
            <p>${escapeHtml(tool.description)}</p>
        </div>
        
        <div class="modal-section">
            <h3>✨ 核心功能</h3>
            <div class="modal-features">
                ${(tool.features || ['功能丰富']).map(f => `<span class="modal-feature">${escapeHtml(f)}</span>`).join('')}
            </div>
        </div>
        
        <div class="modal-section">
            <h3>🏷️ 标签</h3>
            <div class="tool-tags">
                ${(tool.tags || []).map(tag => `<span class="tool-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
        </div>
        
        <div class="modal-actions">
            <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="tool-link" style="flex: 1; text-align: center;">
                🌐 访问官网
            </a>
            <button class="submit-btn" onclick="toggleFavorite(${tool.id}); showToolModal(${tool.id});" style="flex: 1;">
                ${isFavorited ? '⭐ 已收藏' : '☆ 加入收藏'}
            </button>
        </div>
    `;
    
    document.getElementById('toolModal').classList.add('active');
}

// ===== 显示收藏列表弹窗 =====
function showFavoritesModal() {
    renderFavoritesList();
    document.getElementById('favoritesModal').classList.add('active');
}

function renderFavoritesList() {
    const list = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <span style="font-size: 3rem;">📭</span>
                <p style="margin-top: 16px;">还没有收藏任何工具</p>
                <p>点击工具卡片上的 ☆ 按钮来收藏</p>
            </div>
        `;
        return;
    }
    
    const favoritedTools = allTools.filter(t => favorites.includes(t.id));
    
    list.innerHTML = favoritedTools.map(tool => `
        <div class="favorite-item">
            <span class="favorite-item-logo">${tool.logo || '🚀'}</span>
            <div class="favorite-item-info">
                <div class="favorite-item-name">${escapeHtml(tool.name)}</div>
                <div class="favorite-item-category">${escapeHtml(tool.category)}</div>
            </div>
            <button class="remove-favorite" onclick="toggleFavorite(${tool.id}); renderFavoritesList();">
                移除
            </button>
        </div>
    `).join('');
}

function closeFavoritesModal() {
    document.getElementById('favoritesModal').classList.remove('active');
}

// ===== 显示提交工具弹窗 =====
function showSubmitModal() {
    document.getElementById('submitModal').classList.add('active');
}

function closeSubmitModal() {
    document.getElementById('submitModal').classList.remove('active');
    document.getElementById('submitForm').reset();
}

// ===== 处理提交 =====
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('submitName').value,
        url: document.getElementById('submitUrl').value,
        description: document.getElementById('submitDesc').value,
        category: document.getElementById('submitCategory').value,
        pricing: document.getElementById('submitPricing').value
    };
    
    // 这里应该调用 GitHub API 创建 Issue
    // 由于是静态页面，我们生成一个 mailto 链接或提示用户
    alert(`感谢提交！\n\n工具名称：${formData.name}\n官网：${formData.url}\n\n由于这是静态页面，请前往 GitHub 仓库提交 Issue:\nhttps://github.com/earyantLe/ai-tools-directory/issues`);
    
    closeSubmitModal();
    
    // 打开 GitHub Issues 页面
    window.open('https://github.com/earyantLe/ai-tools-directory/issues', '_blank');
}

// ===== 主题切换 =====
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    
    if (body.dataset.theme === 'dark') {
        body.removeAttribute('data-theme');
        btn.textContent = '🌙';
        localStorage.setItem('ai-tools-theme', 'light');
    } else {
        body.dataset.theme = 'dark';
        btn.textContent = '☀️';
        localStorage.setItem('ai-tools-theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('ai-tools-theme');
    if (savedTheme === 'dark') {
        document.body.dataset.theme = 'dark';
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

// ===== 清除搜索 =====
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    filterAndRender();
}

// ===== 重置筛选 =====
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '全部';
    document.getElementById('pricingFilter').value = '全部';
    document.getElementById('sortSelect').value = 'favorites';
    document.getElementById('clearSearch').style.display = 'none';
    filterAndRender();
}

// ===== 关闭弹窗 =====
function closeModal() {
    document.getElementById('toolModal').classList.remove('active');
}

// ===== 工具函数 =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function showError(message) {
    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-secondary);">
            <span style="font-size: 4rem;">😕</span>
            <h3 style="margin: 20px 0;">${escapeHtml(message)}</h3>
            <button class="reset-btn" onclick="location.reload()">刷新页面</button>
        </div>
    `;
}

// ===== 加载动画 =====
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.add('active');
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('active');
}

// ===== 键盘快捷键 =====
document.addEventListener('keydown', (e) => {
    // ESC 关闭弹窗
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});
