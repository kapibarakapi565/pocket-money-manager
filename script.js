// ==========================================================================
// お小遣い予算管理表 - JavaScript
// ==========================================================================

// 定数定義
let TOTAL_BUDGET = 0;

// ユーザー管理
let currentUser = 'user1';

// ユーザー別データ
let userData = {
    user1: {
        totalBudget: 0,
        categoryBudgets: {},
        expenses: [],
        categorySpending: {}
    },
    user2: {
        totalBudget: 0,
        categoryBudgets: {},
        expenses: [],
        categorySpending: {}
    }
};

// 現在のユーザーのデータを参照する変数
let categoryBudgets = userData[currentUser].categoryBudgets;
let expenses = userData[currentUser].expenses;
let categorySpending = userData[currentUser].categorySpending;

// ==========================================================================
// 初期化
// ==========================================================================

/**
 * ページ読み込み時の初期化処理
 */
document.addEventListener('DOMContentLoaded', function() {
    // 今日の日付を設定
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('expenseDate').value = dateString;
    
    // 初期ユーザーデータの読み込み
    loadCurrentUserData();
    
    // アプリタイトルを現在の月で更新
    updateAppTitle();
    
    // ユーザーボタンのUIを更新
    updateUserButtons();
    
    // カテゴリー支出を初期化
    initializeCategorySpending();
    
    // 総予算を更新
    updateTotalBudget();
    
    // 初期表示更新
    updateDisplay();
    
    // エンターキーでの追加機能
    document.getElementById('expenseAmount').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addExpense();
        }
    });
    
    // カテゴリー追加のエンターキー対応
    document.getElementById('newCategoryBudget').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addCategory();
        }
    });
});

// ==========================================================================
// 支出管理機能
// ==========================================================================

/**
 * 支出を追加する
 */
function addExpense() {
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const amount = parseInt(document.getElementById('expenseAmount').value);
    
    // バリデーション
    if (!validateExpenseInput(date, description, amount)) {
        return;
    }
    
    // 支出オブジェクトを作成
    const expense = createExpenseObject(date, category, description, amount);
    
    // データを更新
    expenses.push(expense);
    categorySpending[category] += amount;
    
    // 表示を更新
    updateDisplay();
    clearInputs();
    
    // 成功メッセージ（オプション）
    showMessage('支出を追加しました', 'success');
}

/**
 * 支出を削除する
 * @param {number} id - 削除する支出のID
 */
function deleteExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) {
        showMessage('削除する支出が見つかりません', 'error');
        return;
    }
    
    // 確認ダイアログ
    if (!confirm(`「${expense.description}」を削除しますか？`)) {
        return;
    }
    
    // データから削除
    categorySpending[expense.category] -= expense.amount;
    expenses = expenses.filter(e => e.id !== id);
    
    // 表示を更新
    updateDisplay();
    showMessage('支出を削除しました', 'success');
}

// ==========================================================================
// バリデーション
// ==========================================================================

/**
 * 支出入力のバリデーション
 * @param {string} date - 日付
 * @param {string} description - 内容
 * @param {number} amount - 金額
 * @returns {boolean} - バリデーション結果
 */
function validateExpenseInput(date, description, amount) {
    if (!date) {
        showMessage('日付を入力してください', 'error');
        return false;
    }
    
    if (!description || description.trim() === '') {
        showMessage('内容を入力してください', 'error');
        return false;
    }
    
    if (!amount || amount <= 0) {
        showMessage('正しい金額を入力してください', 'error');
        return false;
    }
    
    if (amount > 100000) {
        showMessage('金額が大きすぎます（10万円以下で入力してください）', 'error');
        return false;
    }
    
    return true;
}

// ==========================================================================
// データ処理
// ==========================================================================

/**
 * 支出オブジェクトを作成
 * @param {string} date - 日付
 * @param {string} category - カテゴリ
 * @param {string} description - 内容
 * @param {number} amount - 金額
 * @returns {Object} - 支出オブジェクト
 */
function createExpenseObject(date, category, description, amount) {
    return {
        id: Date.now() + Math.random(), // ユニークID生成
        date: date,
        category: category,
        description: description.trim(),
        amount: amount
    };
}

/**
 * 合計支出額を計算
 * @returns {number} - 合計支出額
 */
function calculateTotalSpent() {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * 残り予算を計算
 * @returns {number} - 残り予算
 */
function calculateRemaining() {
    return TOTAL_BUDGET - calculateTotalSpent();
}

/**
 * 使用率を計算
 * @returns {number} - 使用率（パーセント）
 */
function calculateUsageRate() {
    const totalSpent = calculateTotalSpent();
    return Math.round((totalSpent / TOTAL_BUDGET) * 100);
}

// ==========================================================================
// 表示更新
// ==========================================================================

/**
 * すべての表示を更新
 */
function updateDisplay() {
    updateSummaryCards();
    updateBudgetTable();
    updateExpenseList();
    updateRemainingDisplay();
}

/**
 * サマリーカードを更新
 */
function updateSummaryCards() {
    const totalSpent = calculateTotalSpent();
    const remaining = calculateRemaining();
    const usageRate = calculateUsageRate();
    
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('remaining').textContent = formatCurrency(remaining);
    document.getElementById('usageRate').textContent = `${usageRate}%`;
}

/**
 * 予算テーブルを更新
 */
function updateBudgetTable() {
    const tbody = document.querySelector('#budgetTable tbody');
    tbody.innerHTML = ''; // テーブルをクリア
    
    // 各カテゴリーの行を動的に生成
    Object.keys(categoryBudgets).forEach(category => {
        const budget = categoryBudgets[category];
        const spent = categorySpending[category] || 0;
        const remaining = budget - spent;
        const percentage = Math.min((spent / budget) * 100, 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category}</td>
            <td class="editable-budget" onclick="editCategoryBudget('${category}')" style="cursor: pointer; color: #667eea;">${formatCurrency(budget)}</td>
            <td class="used-amount">${formatCurrency(spent)}</td>
            <td class="remaining-budget" style="color: ${remaining < 0 ? '#f44336' : '#333'}">${formatCurrency(remaining)}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill ${spent > budget ? 'over-budget' : ''}" style="width: ${percentage}%"></div>
                </div>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteCategory('${category}')" style="font-size: 10px; padding: 3px 6px;">削除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // カテゴリー選択ドロップダウンも更新
    updateCategoryDropdown();
}

/**
 * 支出リストを更新
 */
function updateExpenseList() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';
    
    // 日付順でソート（新しい順）
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExpenses.forEach(expense => {
        const expenseItem = createExpenseElement(expense);
        expenseList.appendChild(expenseItem);
    });
}

/**
 * 支出要素を作成
 * @param {Object} expense - 支出オブジェクト
 * @returns {HTMLElement} - 支出要素
 */
function createExpenseElement(expense) {
    const expenseItem = document.createElement('div');
    expenseItem.className = 'expense-item';
    
    const categoryIcon = getCategoryIcon(expense.category);
    const formattedDate = formatDate(expense.date);
    
    expenseItem.innerHTML = `
        <div>
            <strong>${expense.description}</strong>
            <div class="expense-date">${formattedDate} - ${categoryIcon} ${expense.category}</div>
        </div>
        <div>
            <span style="margin-right: 10px;">${formatCurrency(expense.amount)}</span>
            <button class="delete-btn" onclick="deleteExpense(${expense.id})">削除</button>
        </div>
    `;
    
    return expenseItem;
}

/**
 * 残り予算表示を更新
 */
function updateRemainingDisplay() {
    const remaining = calculateRemaining();
    const remainingDisplay = document.getElementById('remainingDisplay');
    
    remainingDisplay.textContent = `残り予算: ${formatCurrency(remaining)}`;
    remainingDisplay.className = remaining < 0 ? 'remaining-amount over-budget' : 'remaining-amount';
}

// ==========================================================================
// 日付・月計算関数
// ==========================================================================

/**
 * 16日スタートの月を計算（16日〜翌月15日）
 * @returns {Object} - {month: 表示月, year: 年}
 */
function getCurrentPeriod() {
    const today = new Date();
    const currentDate = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    if (currentDate >= 16) {
        // 16日以降なら現在月
        return {
            month: currentMonth,
            year: currentYear
        };
    } else {
        // 15日以前なら前月
        if (currentMonth === 1) {
            return {
                month: 12,
                year: currentYear - 1
            };
        } else {
            return {
                month: currentMonth - 1,
                year: currentYear
            };
        }
    }
}

// ==========================================================================
// ユーティリティ関数
// ==========================================================================

/**
 * アプリタイトルを現在の月で更新（16日スタート基準）
 */
function updateAppTitle() {
    const period = getCurrentPeriod();
    const userName = currentUser === 'user1' ? '夫' : '妻';
    const title = `💰 ${period.month}月 おこづかい管理アプリ（${userName}）`;
    document.getElementById('appTitle').textContent = title;
}

/**
 * ユーザーを切り替え
 */
function switchUser(userId) {
    // 現在のデータを保存
    saveCurrentUserData();
    
    // ユーザーを切り替え
    currentUser = userId;
    
    // 新しいユーザーのデータを読み込み
    loadCurrentUserData();
    
    // UIを更新
    updateUserButtons();
    updateAppTitle();
    updateDisplay();
    
    const userName = currentUser === 'user1' ? '夫' : '妻';
    showMessage(`${userName}のデータに切り替えました`, 'success');
}

/**
 * 現在のユーザーデータを保存
 */
function saveCurrentUserData() {
    userData[currentUser].categoryBudgets = { ...categoryBudgets };
    userData[currentUser].expenses = [...expenses];
    userData[currentUser].categorySpending = { ...categorySpending };
    // totalBudgetは既にuserDataに直接保存されているので、ここでは不要
}

/**
 * 現在のユーザーデータを読み込み
 */
function loadCurrentUserData() {
    categoryBudgets = userData[currentUser].categoryBudgets;
    expenses = userData[currentUser].expenses;
    categorySpending = userData[currentUser].categorySpending;
    // 大枠予算の入力フィールドを更新
    const totalBudgetInput = document.getElementById('totalBudgetInput');
    if (totalBudgetInput) {
        totalBudgetInput.value = userData[currentUser].totalBudget || '';
    }
}

/**
 * ユーザーボタンのUIを更新
 */
function updateUserButtons() {
    document.getElementById('userBtn1').className = currentUser === 'user1' ? 'user-btn active' : 'user-btn';
    document.getElementById('userBtn2').className = currentUser === 'user2' ? 'user-btn active' : 'user-btn';
}

/**
 * 通貨形式でフォーマット
 * @param {number} amount - 金額
 * @returns {string} - フォーマットされた金額文字列
 */
function formatCurrency(amount) {
    return `¥${amount.toLocaleString()}`;
}

/**
 * 日付をフォーマット
 * @param {string} dateString - 日付文字列
 * @returns {string} - フォーマットされた日付
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

/**
 * カテゴリー選択ドロップダウンを更新
 */
function updateCategoryDropdown() {
    const select = document.getElementById('expenseCategory');
    select.innerHTML = '';
    
    Object.keys(categoryBudgets).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

/**
 * カテゴリのアイコンを取得
 * @param {string} category - カテゴリ名
 * @returns {string} - アイコン
 */
function getCategoryIcon(category) {
    const icons = {
        '食費・カフェ': '🍽️',
        '娯楽・趣味': '🎮',
        '交通費': '🚗',
        'その他': '🛍️'
    };
    return icons[category] || '📝';
}

/**
 * 入力フィールドをクリア
 */
function clearInputs() {
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
    // 日付とカテゴリはそのまま保持
}

/**
 * メッセージを表示（オプション機能）
 * @param {string} message - メッセージ
 * @param {string} type - メッセージタイプ ('success' | 'error')
 */
function showMessage(message, type) {
    // スマホでも見やすいアラート表示
    if (type === 'error') {
        alert('❌ エラー: ' + message);
    } else {
        // 成功メッセージも表示（スマホでは分かりやすく）
        alert('✅ ' + message);
    }
}

// ==========================================================================
// カテゴリー管理機能
// ==========================================================================

/**
 * カテゴリー支出を初期化
 */
function initializeCategorySpending() {
    categorySpending = {};
    Object.keys(categoryBudgets).forEach(category => {
        categorySpending[category] = 0;
    });
}

/**
 * 総予算を更新
 */
function updateTotalBudget() {
    TOTAL_BUDGET = userData[currentUser].totalBudget || 0;
    document.querySelector('.summary-card .amount').textContent = formatCurrency(TOTAL_BUDGET);
    updateBudgetAllocation();
}

/**
 * 大枠予算を設定
 */
function setTotalBudget() {
    const totalBudgetInput = document.getElementById('totalBudgetInput');
    const amount = parseInt(totalBudgetInput.value);
    
    if (!amount || amount <= 0) {
        showMessage('正しい予算額を入力してください', 'error');
        return;
    }
    
    if (amount > 10000000) {
        showMessage('予算額が大きすぎます（1000万円以下で入力してください）', 'error');
        return;
    }
    
    userData[currentUser].totalBudget = amount;
    TOTAL_BUDGET = amount;
    
    // 入力フィールドをクリア
    totalBudgetInput.value = '';
    
    // 表示を更新
    updateTotalBudget();
    updateDisplay();
    
    showMessage(`総予算を${formatCurrency(amount)}に設定しました`, 'success');
}

/**
 * 予算配分状況を更新
 */
function updateBudgetAllocation() {
    const totalBudget = userData[currentUser].totalBudget || 0;
    const allocatedBudget = Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0);
    const remainingBudget = totalBudget - allocatedBudget;
    
    const budgetSummary = document.getElementById('budgetSummary');
    budgetSummary.innerHTML = `
        総予算: ${formatCurrency(totalBudget)} | 
        配分済み: ${formatCurrency(allocatedBudget)} | 
        残り: <span style="color: ${remainingBudget < 0 ? '#f44336' : '#4CAF50'}">${formatCurrency(remainingBudget)}</span>
    `;
    
    // プログレスバーの更新
    const allocationBar = document.getElementById('budgetAllocationBar');
    const allocationPercentage = document.getElementById('allocationPercentage');
    
    if (totalBudget > 0) {
        const percentage = Math.min((allocatedBudget / totalBudget) * 100, 100);
        allocationBar.style.width = `${percentage}%`;
        allocationPercentage.textContent = `${Math.round(percentage)}%`;
        
        // 100%を超えた場合は赤色に変更
        if (percentage > 100) {
            allocationBar.style.background = 'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)';
            allocationBar.style.width = '100%';
            allocationPercentage.textContent = `${Math.round((allocatedBudget / totalBudget) * 100)}%`;
        } else {
            allocationBar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
        }
    } else {
        allocationBar.style.width = '0%';
        allocationPercentage.textContent = '0%';
    }
    
    // 予算オーバーの警告表示
    const warning = document.getElementById('categoryBudgetWarning');
    if (remainingBudget < 0) {
        warning.style.display = 'block';
        warning.textContent = `⚠️ 大枠予算を${formatCurrency(Math.abs(remainingBudget))}超えています`;
    } else {
        warning.style.display = 'none';
    }
}

/**
 * 月ごとのデータをリセット（16日スタート基準）
 */
function resetMonthlyData() {
    const period = getCurrentPeriod();
    const today = new Date();
    const currentDate = today.getDate();
    
    // 期間の説明を作成
    let periodDescription;
    if (currentDate >= 16) {
        periodDescription = `${period.month}月16日〜翌月15日`;
    } else {
        periodDescription = `${period.month}月16日〜${period.month + 1}月15日`;
    }
    
    if (!confirm(`${period.year}年${periodDescription}のデータをリセットしますか？\n\n以下のデータが削除されます：\n• すべての支出記録\n• カテゴリーの使用額\n\n※カテゴリーと予算設定は保持されます`)) {
        return;
    }
    
    // 支出データをリセット
    expenses = [];
    
    // カテゴリーごとの支出をリセット
    Object.keys(categorySpending).forEach(category => {
        categorySpending[category] = 0;
    });
    
    // 表示を更新
    updateDisplay();
    
    // タイトルも更新
    updateAppTitle();
    
    showMessage(`${period.month}月のデータをリセットしました`, 'success');
}

/**
 * すべてのデータをリセット（カテゴリーも含む）
 */
function resetAllData() {
    if (!confirm('すべてのデータをリセットしますか？\n\n以下のデータが削除されます：\n• すべての支出記録\n• すべてのカテゴリー\n• 予算設定')) {
        return;
    }
    
    // すべてのデータをリセット
    expenses = [];
    categoryBudgets = {};
    categorySpending = {};
    TOTAL_BUDGET = 0;
    
    // 表示を更新
    updateDisplay();
    
    // タイトルも更新
    updateAppTitle();
    
    showMessage('すべてのデータをリセットしました', 'success');
}

/**
 * 新しいカテゴリーを追加
 */
function addCategory() {
    const categoryName = document.getElementById('newCategoryName').value.trim();
    const categoryBudget = parseInt(document.getElementById('newCategoryBudget').value);
    
    // バリデーション
    if (!validateCategoryInput(categoryName, categoryBudget)) {
        return;
    }
    
    // カテゴリーを追加
    categoryBudgets[categoryName] = categoryBudget;
    categorySpending[categoryName] = 0;
    
    // 総予算を更新
    updateTotalBudget();
    
    // 表示を更新
    updateDisplay();
    
    // 入力フィールドをクリア
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryBudget').value = '';
    
    showMessage(`カテゴリー「${categoryName}」を追加しました`, 'success');
}

/**
 * カテゴリーを削除
 * @param {string} categoryName - 削除するカテゴリー名
 */
function deleteCategory(categoryName) {
    // カテゴリーに支出がある場合は警告
    if (categorySpending[categoryName] > 0) {
        if (!confirm(`カテゴリー「${categoryName}」には支出記録があります。削除すると関連する支出も削除されます。続行しますか？`)) {
            return;
        }
        // 関連する支出を削除
        expenses = expenses.filter(expense => expense.category !== categoryName);
    } else {
        if (!confirm(`カテゴリー「${categoryName}」を削除しますか？`)) {
            return;
        }
    }
    
    // カテゴリーを削除
    delete categoryBudgets[categoryName];
    delete categorySpending[categoryName];
    
    // 総予算を更新
    updateTotalBudget();
    
    // 表示を更新
    updateDisplay();
    
    showMessage(`カテゴリー「${categoryName}」を削除しました`, 'success');
}

/**
 * カテゴリーの予算を編集
 * @param {string} categoryName - カテゴリー名
 */
function editCategoryBudget(categoryName) {
    const currentBudget = categoryBudgets[categoryName];
    const newBudget = prompt(`「${categoryName}」の新しい予算額を入力してください：`, currentBudget);
    
    if (newBudget === null) return; // キャンセル
    
    const budget = parseInt(newBudget);
    if (isNaN(budget) || budget <= 0) {
        showMessage('正しい金額を入力してください', 'error');
        return;
    }
    
    if (budget > 1000000) {
        showMessage('予算額が大きすぎます（100万円以下で入力してください）', 'error');
        return;
    }
    
    // 大枠予算のチェック（編集時）
    const totalBudget = userData[currentUser].totalBudget || 0;
    if (totalBudget > 0) {
        const currentAllocated = Object.values(categoryBudgets).reduce((sum, b) => sum + b, 0);
        const otherCategoriesTotal = currentAllocated - currentBudget;
        const newTotal = otherCategoriesTotal + budget;
        
        if (newTotal > totalBudget) {
            const maxAllowable = totalBudget - otherCategoriesTotal;
            showMessage(`大枠予算を超えます。このカテゴリーの上限: ${formatCurrency(maxAllowable)}`, 'error');
            return;
        }
    }
    
    categoryBudgets[categoryName] = budget;
    updateTotalBudget();
    updateDisplay();
    
    showMessage(`「${categoryName}」の予算を${formatCurrency(budget)}に変更しました`, 'success');
}

/**
 * カテゴリー入力のバリデーション
 * @param {string} categoryName - カテゴリー名
 * @param {number} budget - 予算額
 * @returns {boolean} - バリデーション結果
 */
function validateCategoryInput(categoryName, budget) {
    if (!categoryName || categoryName === '') {
        showMessage('カテゴリー名を入力してください', 'error');
        return false;
    }
    
    if (categoryBudgets.hasOwnProperty(categoryName)) {
        showMessage('そのカテゴリー名は既に存在します', 'error');
        return false;
    }
    
    if (!budget || budget <= 0) {
        showMessage('正しい予算額を入力してください', 'error');
        return false;
    }
    
    if (budget > 1000000) {
        showMessage('予算額が大きすぎます（100万円以下で入力してください）', 'error');
        return false;
    }
    
    // 大枠予算のチェック
    const totalBudget = userData[currentUser].totalBudget || 0;
    if (totalBudget > 0) {
        const currentAllocated = Object.values(categoryBudgets).reduce((sum, b) => sum + b, 0);
        const newTotal = currentAllocated + budget;
        
        if (newTotal > totalBudget) {
            const remaining = totalBudget - currentAllocated;
            showMessage(`大枠予算を超えます。残り予算: ${formatCurrency(remaining)}`, 'error');
            return false;
        }
    }
    
    return true;
}

// ==========================================================================
// データ永続化（将来的な拡張用）
// ==========================================================================

/**
 * データをローカルストレージに保存
 * 注意: Claude.aiのアーティファクト環境では使用不可
 */
function saveToLocalStorage() {
    try {
        const data = {
            expenses: expenses,
            categorySpending: categorySpending
        };
        localStorage.setItem('budgetData', JSON.stringify(data));
    } catch (error) {
        console.warn('ローカルストレージへの保存に失敗しました:', error);
    }
}

/**
 * ローカルストレージからデータを読み込み
 * 注意: Claude.aiのアーティファクト環境では使用不可
 */
function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem('budgetData');
        if (data) {
            const parsed = JSON.parse(data);
            expenses = parsed.expenses || [];
            categorySpending = parsed.categorySpending || {
                '食費・カフェ': 0,
                '娯楽・趣味': 0,
                '交通費': 0,
                'その他': 0
            };
            updateDisplay();
        }
    } catch (error) {
        console.warn('ローカルストレージからの読み込みに失敗しました:', error);
    }
}