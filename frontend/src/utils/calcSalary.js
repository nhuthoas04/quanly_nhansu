/**
 * Tính toán bảng lương theo quy định HRM
 */

/**
 * Tính BHXH (Bảo hiểm xã hội)
 * @param {number} baseSalary - Lương cơ bản
 * @returns {number} BHXH = 8% lương cơ bản
 */
export const calculateBHXH = (baseSalary) => {
  return Math.round(baseSalary * 0.08);
};

/**
 * Tính BHYT (Bảo hiểm y tế)
 * @param {number} baseSalary - Lương cơ bản
 * @returns {number} BHYT = 1.5% lương cơ bản
 */
export const calculateBHYT = (baseSalary) => {
  return Math.round(baseSalary * 0.015);
};

/**
 * Tính tổng thu nhập
 * @param {object} data - Dữ liệu lương
 * @returns {number} Tổng thu nhập = lương cơ bản + các phụ cấp + thưởng
 */
export const calculateTotalIncome = (data) => {
  const baseSalary = parseFloat(data.baseSalary) || 0;
  const pcAnTrua = parseFloat(data.pcAnTrua) || 0;
  const pcDiLai = parseFloat(data.pcDiLai) || 0;
  const pcDienThoai = parseFloat(data.pcDienThoai) || 0;
  const bonus = parseFloat(data.bonus) || 0;

  return baseSalary + pcAnTrua + pcDiLai + pcDienThoai + bonus;
};

/**
 * Tính thu nhập chịu thuế
 * @param {number} totalIncome - Tổng thu nhập
 * @param {number} bhxh - BHXH
 * @param {number} bhyt - BHYT
 * @returns {number} Thu nhập chịu thuế = tổng thu nhập - BHXH - BHYT
 */
export const calculateTaxableIncome = (totalIncome, bhxh, bhyt) => {
  return totalIncome - bhxh - bhyt;
};

/**
 * Kiểm tra có phải chịu thuế TNCN không
 * @param {number} taxableIncome - Thu nhập chịu thuế
 * @returns {boolean} true nếu thu nhập chịu thuế >= 11.000.000
 */
export const shouldPayTax = (taxableIncome) => {
  return taxableIncome >= 11000000;
};

/**
 * Tính tổng khấu trừ
 * @param {number} bhxh - BHXH
 * @param {number} bhyt - BHYT
 * @param {number} tax - Thuế TNCN
 * @returns {number} Tổng khấu trừ = BHXH + BHYT + thuế TNCN
 */
export const calculateTotalDeduction = (bhxh, bhyt, tax) => {
  return bhxh + bhyt + tax;
};

/**
 * Tính lương thực nhận
 * @param {number} totalIncome - Tổng thu nhập
 * @param {number} totalDeduction - Tổng khấu trừ
 * @returns {number} Lương thực nhận = tổng thu nhập - tổng khấu trừ
 */
export const calculateNetSalary = (totalIncome, totalDeduction) => {
  return totalIncome - totalDeduction;
};

/**
 * Tính toán đầy đủ bảng lương
 * @param {object} formData - Dữ liệu form
 * @returns {object} Kết quả tính toán đầy đủ
 */
export const calculateFullSalary = (formData) => {
  const baseSalary = parseFloat(formData.baseSalary) || 0;
  
  // Bước 1: Tính BHXH và BHYT
  const bhxh = calculateBHXH(baseSalary);
  const bhyt = calculateBHYT(baseSalary);
  
  // Bước 2: Tính tổng thu nhập
  const totalIncome = calculateTotalIncome(formData);
  
  // Bước 3: Tính thu nhập chịu thuế
  const taxableIncome = calculateTaxableIncome(totalIncome, bhxh, bhyt);
  
  // Bước 4: Kiểm tra có phải chịu thuế không
  const mustPayTax = shouldPayTax(taxableIncome);
  
  // Bước 5: Lấy thuế TNCN (nhập thủ công hoặc = 0)
  const tax = parseFloat(formData.tax) || 0;
  
  // Bước 6: Tính tổng khấu trừ
  const totalDeduction = calculateTotalDeduction(bhxh, bhyt, tax);
  
  // Bước 7: Tính lương thực nhận
  const netSalary = calculateNetSalary(totalIncome, totalDeduction);
  
  return {
    bhxh,
    bhyt,
    totalIncome,
    taxableIncome,
    mustPayTax,
    tax,
    totalDeduction,
    netSalary
  };
};
