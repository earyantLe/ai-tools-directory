// AI 工具聚合网站交互脚本

let toolsData = [];
let categories = [];
let pricings = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupFilters();
    setupSearch();
});

// 加载数据
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        toolsData = data.tools;
        categories = data.categories;
        pricings = data.pricing;
        
        populateFilters();
        renderTools(toolsData);
    } catch (error) {
        console.error('加载数据失败:', error);
        document.getElementById('toolsGrid').innerHTML = 
            '<p style="color: white; text-align: center;">加载数据失败，请刷新页面重试</p>';
    }
}

// 填充筛选器选项
function populateFilters() {
    const categorySelect = document.getElementById('categoryFilter');
    const pricingSelect = document.getElementById('pricingFilter');
    
    categories.forEach(cat => {
        if (cat !== '全部') {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        }
    });
    
    pricings.forEach(price => {
        if (price !== '全部') {
            const option = document.createElement('option');
            option.value = price;
            option.textContent = price;
            pricingSelect.appendChild(option);
        }
    });
}

// 设置筛选器事件
function setupFilters() {
    document.getElementById('categoryFilter').addEventListener('change', filterTools);
    document.getElementById('pricingFilter').addEventListener('change', filterTools);
}

// 设置搜索事件
function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', filterTools);
}

// 筛选工具
function filterTools() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const pricing = document.getElementById('pricingFilter').value;
    
    let filtered = toolsData;
    
    // 分类筛选
    if (category !== '全部') {
        filtered = filtered.filter(tool => tool.category === category);
    }
    
    // 价格筛选
    if (pricing !== '全部') {
        filtered = filtered.filter(tool => tool.pricing === pricing);
    }
    
    // 搜索筛选
    if (searchTerm) {
        filtered = filtered.filter(tool => 
            tool.name.toLowerCase().includes(searchTerm) ||
            tool.description.toLowerCase().includes(searchTerm) ||
            tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    renderTools(filtered);
}

// 渲染工具卡片
function renderTools(tools) {
    const grid = document.getElementById('toolsGrid');
    const countEl = document.getElementById('toolCount');
    
    countEl.textContent = tools.length;
    
    if (tools.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
                <h2>😕 没有找到匹配的工具</h2>
                <p>试试调整筛选条件或搜索关键词</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = tools.map(tool => `
        <div class="tool-card">
            <div class="tool-header">
                <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
                <span class="tool-category">${escapeHtml(tool.category)}</span>
            </div>
            <p class="tool-description">${escapeHtml(tool.description)}</p>
            <div class="tool-tags">
                ${tool.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="tool-footer">
                <span class="tool-pricing ${escapeHtml(tool.pricing)}">${escapeHtml(tool.pricing)}</span>
                <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="tool-link">
                    访问网站 →
                </a>
            </div>
        </div>
    `).join('');
}

// HTML 转义防止 XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
