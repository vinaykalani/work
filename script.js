// Conversion constants
const SQFT_TO_SQM = 0.092903;
const SQYD_TO_SQM = 0.836127;
const SQM_TO_SQFT = 1 / SQFT_TO_SQM;
const SQM_TO_SQYD = 1 / SQYD_TO_SQM;

const plotSqft = document.getElementById('plot-sqft');
const plotSqyd = document.getElementById('plot-sqyd');
const plotSqm = document.getElementById('plot-sqm');
const deductionArea = document.getElementById('deduction-area');
const roadWidth = document.getElementById('road-width');

const balancePlot = document.getElementById('balance-plot');
const basicFsi = document.getElementById('basic-fsi');
const premiumFsi = document.getElementById('premium-fsi');
const tdrArea = document.getElementById('tdr-area');
const totalFsi = document.getElementById('total-fsi');
const ancillaryFsi = document.getElementById('ancillary-fsi');
const totalBua = document.getElementById('total-bua');

const usableReduction = document.getElementById('usable-reduction');
const tenantUsableArea = document.getElementById('tenant-usable-area');
const tenantIncrement = document.getElementById('tenant-increment');
const saleMultiplier = document.getElementById('sale-multiplier');
const sellingRate = document.getElementById('selling-rate');
const expenseMultiplier = document.getElementById('expense-multiplier');
const expenseRate = document.getElementById('expense-rate');

const buaSqft = document.getElementById('bua-sqft');
const totalUsableArea = document.getElementById('total-usable-area');
const tenantIncreasedArea = document.getElementById('tenant-increased-area');
const usableAreaSelling = document.getElementById('usable-area-selling');
const saleableAreaSelling = document.getElementById('saleable-area-selling');
const totalReturns = document.getElementById('total-returns');
const totalSaleableArea = document.getElementById('total-saleable-area');
const totalExpense = document.getElementById('total-expense');
const profit = document.getElementById('profit');

let isSyncing = false;

function round(val) {
    return Math.round(val * 100) / 100;
}

function syncPlotInputs(source) {
    if (isSyncing) return;
    isSyncing = true;
    let sqft = parseFloat(plotSqft.value) || 0;
    let sqyd = parseFloat(plotSqyd.value) || 0;
    let sqm = parseFloat(plotSqm.value) || 0;
    if (source === 'sqft') {
        sqyd = sqft * SQFT_TO_SQM / SQYD_TO_SQM;
        sqm = sqft * SQFT_TO_SQM;
        plotSqyd.value = sqyd ? round(sqyd) : '';
        plotSqm.value = sqm ? round(sqm) : '';
    } else if (source === 'sqyd') {
        sqft = sqyd * SQYD_TO_SQM / SQFT_TO_SQM;
        sqm = sqyd * SQYD_TO_SQM;
        plotSqft.value = sqft ? round(sqft) : '';
        plotSqm.value = sqm ? round(sqm) : '';
    } else if (source === 'sqm') {
        sqft = sqm * SQM_TO_SQFT;
        sqyd = sqm * SQM_TO_SQYD;
        plotSqft.value = sqft ? round(sqft) : '';
        plotSqyd.value = sqyd ? round(sqyd) : '';
    }
    isSyncing = false;
    calculateAll();
}

plotSqft.addEventListener('input', () => syncPlotInputs('sqft'));
plotSqyd.addEventListener('input', () => syncPlotInputs('sqyd'));
plotSqm.addEventListener('input', () => syncPlotInputs('sqm'));

deductionArea.addEventListener('input', calculateAll);
roadWidth.addEventListener('input', calculateAll);

[
    plotSqft, plotSqyd, plotSqm,
    deductionArea, roadWidth,
    usableReduction, tenantUsableArea, tenantIncrement,
    saleMultiplier, sellingRate, expenseMultiplier, expenseRate
].forEach(el => el && el.addEventListener('input', calculateAll));

function getPlotSizeSqm() {
    return parseFloat(plotSqm.value) || 0;
}
function getDeductionSqm() {
    return parseFloat(deductionArea.value) || 0;
}
function getRoadWidth() {
    return parseFloat(roadWidth.value) || 0;
}

function getUsableReduction() {
    return Math.max(0, Math.min(100, parseFloat(usableReduction.value) || 0));
}
function getTenantUsableArea() {
    return Math.max(0, parseFloat(tenantUsableArea.value) || 0);
}
function getTenantIncrement() {
    return Math.max(0, parseFloat(tenantIncrement.value) || 0);
}
function getSaleMultiplier() {
    return parseFloat(saleMultiplier.value) || 1.45;
}
function getSellingRate() {
    return Math.max(0, parseFloat(sellingRate.value) || 0);
}
function getExpenseMultiplier() {
    return parseFloat(expenseMultiplier.value) || 1.45;
}
function getExpenseRate() {
    return Math.max(0, parseFloat(expenseRate.value) || 0);
}

function getPremiumFsiFactor(width) {
    if (width < 9) return 0;
    if (width >= 9) return 0.5;
}

function getTdrFactor(width) {
    if (width < 9) return 0;
    if (width >= 9 && width < 12) return 0.4;
    if (width >= 12 && width < 15) return 0.65;
    if (width >= 15 && width < 24) return 0.9;
    if (width >= 24 && width < 30) return 1.15;
    if (width >= 30) return 1.4;
    return 0;
}

function formatCurrency(val) {
    if (isNaN(val)) return '—';
    return val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function formatNumber(val, unit) {
    if (isNaN(val)) return '—';
    return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}

function calculateAll() {
    // Validation
    let plotSqmVal = getPlotSizeSqm();
    let deductionVal = getDeductionSqm();
    let roadWidthVal = getRoadWidth();
    let usableRed = getUsableReduction();
    let tenantUsable = getTenantUsableArea();
    let tenantInc = getTenantIncrement();
    let saleMult = getSaleMultiplier();
    let sellRate = getSellingRate();
    let expenseMult = getExpenseMultiplier();
    let expenseRt = getExpenseRate();

    if (plotSqmVal < 0) plotSqm.value = '';
    if (deductionVal < 0) deductionArea.value = '';
    if (roadWidthVal < 0) roadWidth.value = '';
    if (usableRed < 0) usableReduction.value = '';
    if (tenantUsable < 0) tenantUsableArea.value = '';
    if (tenantInc < 0) tenantIncrement.value = '';
    if (sellRate < 0) sellingRate.value = '';
    if (expenseRt < 0) expenseRate.value = '';

    plotSqmVal = getPlotSizeSqm();
    deductionVal = getDeductionSqm();
    roadWidthVal = getRoadWidth();
    usableRed = getUsableReduction();
    tenantUsable = getTenantUsableArea();
    tenantInc = getTenantIncrement();
    saleMult = getSaleMultiplier();
    sellRate = getSellingRate();
    expenseMult = getExpenseMultiplier();
    expenseRt = getExpenseRate();

    // 3. Balance Plot Size
    let balance = plotSqmVal - deductionVal;
    if (balance < 0) balance = 0;
    balancePlot.textContent = round(balance);

    // 5. Basic FSI Area
    let basic = 1.1 * balance;
    basicFsi.textContent = round(basic);

    // 6. Premium FSI Area
    let premiumFactor = getPremiumFsiFactor(roadWidthVal);
    let premium = premiumFactor * plotSqmVal;
    premiumFsi.textContent = (premiumFactor === 0) ? 'N/A' : round(premium);

    // 7. TDR Area
    let tdrFactor = getTdrFactor(roadWidthVal);
    let tdr = tdrFactor * plotSqmVal;
    tdrArea.textContent = (tdrFactor === 0) ? 'N/A' : round(tdr);

    // 8. Total Entitlement of FSI
    let totalEntitlement = basic + (premiumFactor === 0 ? 0 : premium) + (tdrFactor === 0 ? 0 : tdr);
    totalFsi.textContent = round(totalEntitlement);

    // 9. Ancillary FSI Area
    let ancillary = 0.6 * totalEntitlement;
    ancillaryFsi.textContent = round(ancillary);

    // 10. Total Built-Up Area
    let bua = totalEntitlement + ancillary;
    totalBua.textContent = round(bua);

    // 14. BUA (sq ft)
    let bua_ft = bua * 10.7639;
    buaSqft.textContent = round(bua_ft);

    // 15. Total Usable Area (sq ft)
    let totalUsable = bua_ft * (1 - usableRed / 100);
    totalUsableArea.textContent = round(totalUsable);

    // 16. Existing Increased Tenant Area
    let tenantIncreased = tenantUsable * (1 + tenantInc / 100);
    tenantIncreasedArea.textContent = round(tenantIncreased);

    // 17. Usable Area for Selling
    let usableSelling = totalUsable - tenantIncreased;
    if (usableSelling < 0) usableSelling = 0;
    usableAreaSelling.textContent = round(usableSelling);

    // 18. Saleable Area for Selling
    let saleableSelling = usableSelling * saleMult;
    saleableAreaSelling.textContent = round(saleableSelling);

    // 20. Total Returns
    let totalRet = saleableSelling * sellRate;
    totalReturns.textContent = isNaN(totalRet) ? '—' : formatCurrency(totalRet);

    // 21. Total Saleable Area
    let totalSaleable = totalUsable * expenseMult;
    totalSaleableArea.textContent = round(totalSaleable);

    // 23. Total Expense
    let totalExp = totalSaleable * expenseRt;
    totalExpense.textContent = isNaN(totalExp) ? '—' : formatCurrency(totalExp);

    // 24. Profit
    let profitVal = totalRet - totalExp;
    profit.textContent = (isNaN(profitVal) || !isFinite(profitVal)) ? '—' : formatCurrency(profitVal);
}

// Initial calculation
calculateAll();
