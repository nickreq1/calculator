const COMPLIANCE_RATE_MONTHLY_PERCENT = 0.0208;
const APPROVAL_RATE_PERCENT = 1.1;
const DOCUMENTATION_FEE = 3850;
const SEARCH_FEE = 165;
const VALUATION_ASSESSMENT_FEE = 110;

const amountInput = document.getElementById('amount');
const amountLabel = document.getElementById('amountLabel');
const termMonthsInput = document.getElementById('termMonths');
const interestRateInput = document.getElementById('interestRate');
const repaymentModeInput = document.getElementById('repaymentMode');

const repaymentsDisplay = document.getElementById('repaymentsDisplay');
const upfrontFeesTotalDisplay = document.getElementById('upfrontFeesTotal');
const totalComplianceOverTermDisplay = document.getElementById('totalComplianceOverTerm');
const totalInterestOverTermDisplay = document.getElementById('totalInterestOverTerm');
const totalCostOverTermDisplay = document.getElementById('totalCostOverTerm');
const retainedInterestAmountDisplay = document.getElementById('retainedInterestAmount');
const netAdvancedAmountDisplay = document.getElementById('netAdvancedAmount');
const valuationFeeTextDisplay = document.getElementById('valuationFeeText');
const retainedInterestLabel = document.getElementById('interestRetainedLabel');
const netAdvancedLabel = document.getElementById('netAdvancedLabel');
const errorMessageDisplay = document.getElementById('errorMessage');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat('en-AU', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

function hideInterestRetainedFields() {
  retainedInterestLabel.classList.add('hidden');
  retainedInterestAmountDisplay.classList.add('hidden');
  netAdvancedLabel.classList.add('hidden');
  netAdvancedAmountDisplay.classList.add('hidden');
}

function showInterestRetainedFields() {
  retainedInterestLabel.classList.remove('hidden');
  retainedInterestAmountDisplay.classList.remove('hidden');
  netAdvancedLabel.classList.remove('hidden');
  netAdvancedAmountDisplay.classList.remove('hidden');
}

function hideAmountField() {
  amountLabel.classList.add('hidden');
  amountInput.classList.add('hidden');
}

function showAmountField() {
  amountLabel.classList.remove('hidden');
  amountInput.classList.remove('hidden');
}

function calculate() {
  const amount = Number(amountInput.value);
  const termMonths = Number(termMonthsInput.value);
  const interestRate = Number(interestRateInput.value);
  const repaymentMode = repaymentModeInput.value;

  if (amount <= 0 || termMonths <= 0 || interestRate < 0) {
    errorMessageDisplay.textContent = 'Please enter valid values: amount > 0, term (months) > 0, and interest rate ≥ 0.';
    repaymentsDisplay.textContent = '-';
    upfrontFeesTotalDisplay.textContent = '-';
    totalComplianceOverTermDisplay.textContent = '-';
    totalInterestOverTermDisplay.textContent = '-';
    totalCostOverTermDisplay.textContent = '-';
    hideInterestRetainedFields();
    showAmountField();
    return;
  }

  errorMessageDisplay.textContent = '';

  const monthlyInterestPayment = amount * (interestRate / 100) / 12;
  const monthlyComplianceFee = amount * (COMPLIANCE_RATE_MONTHLY_PERCENT / 100);
  const approvalFee = amount * (APPROVAL_RATE_PERCENT / 100);
  const upfrontFeesTotal = approvalFee + DOCUMENTATION_FEE + SEARCH_FEE + VALUATION_ASSESSMENT_FEE;
  const totalComplianceOverTerm = monthlyComplianceFee * termMonths;
  let totalInterestOverTerm = 0;

  if (repaymentMode === 'interestOnly') {
    showAmountField();
    const monthlyRepayment = monthlyInterestPayment + monthlyComplianceFee;
    totalInterestOverTerm = monthlyInterestPayment * termMonths;

    repaymentsDisplay.textContent =
      `${formatCurrency(monthlyRepayment)} per month ` +
      `(Interest ${formatCurrency(monthlyInterestPayment)} + Compliance ${formatCurrency(monthlyComplianceFee)})`;
    hideInterestRetainedFields();
  } else {
    showAmountField();
    // Simple interest (Option A): principal × annual rate × time in years.
    totalInterestOverTerm = amount * (interestRate / 100) * (termMonths / 12);
    const netAdvancedAmount = amount - totalInterestOverTerm;

    repaymentsDisplay.textContent = '';
    showInterestRetainedFields();
    retainedInterestAmountDisplay.textContent = formatCurrency(totalInterestOverTerm);
    netAdvancedAmountDisplay.textContent = formatCurrency(netAdvancedAmount);
  }

  const totalCostOverTerm = totalInterestOverTerm + totalComplianceOverTerm + upfrontFeesTotal;

  upfrontFeesTotalDisplay.textContent =
    `${formatCurrency(upfrontFeesTotal)} (Approval ${formatCurrency(approvalFee)} + Documentation ${formatCurrency(DOCUMENTATION_FEE)} + Search ${formatCurrency(SEARCH_FEE)} + Valuation Assessment ${formatCurrency(VALUATION_ASSESSMENT_FEE)})`;

  totalComplianceOverTermDisplay.textContent =
    `${formatCurrency(totalComplianceOverTerm)} (${formatCurrency(monthlyComplianceFee)} per month at ${formatPercent(COMPLIANCE_RATE_MONTHLY_PERCENT)})`;

  totalInterestOverTermDisplay.textContent = formatCurrency(totalInterestOverTerm);
  totalCostOverTermDisplay.textContent = formatCurrency(totalCostOverTerm);
}

[amountInput, termMonthsInput, interestRateInput].forEach((el) => {
  el.addEventListener('input', calculate);
  el.addEventListener('change', calculate);
});

// select/dropdown should only use 'change'
repaymentModeInput.addEventListener('change', calculate);

valuationFeeTextDisplay.textContent =
  `As charged by our Panel Valuer, plus an assessment fee of ${formatCurrency(VALUATION_ASSESSMENT_FEE)}.`;

calculate();
