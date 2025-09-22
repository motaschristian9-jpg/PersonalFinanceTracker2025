import ExcelJS from "exceljs";

export const exportToExcel = async (data, summary) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Income Report");

  // --- TITLE ROW ---
  sheet.mergeCells("A1:D1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "Income Report";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  sheet.addRow([]);

  // --- HEADER ROW ---
  const header = sheet.addRow(["Date", "Source", "Description", "Amount"]);
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4CAF50" }, // green header background
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // --- DATA ROWS ---
  data.forEach((tx) => {
    const row = sheet.addRow([
      new Date(tx.transaction_date).toLocaleDateString(),
      tx.category,
      tx.description,
      tx.amount,
    ]);

    // Amount styling
    const amountCell = row.getCell(4);
    amountCell.font = { color: { argb: "FF2E7D32" }, bold: true }; // green for income
    amountCell.numFmt = '"₱"#,##0.00';
  });

  // --- SUMMARY SECTION ---
  sheet.addRow([]);
  sheet.addRow(["", "Summary"]);
  sheet.addRow(["", "Total Income", summary.totalIncome]);
  sheet.addRow(["", "Highest Source", summary.highestSource]);
  sheet.addRow(["", "Average Monthly Income", summary.avgMonthlyIncome]);

  // Style summary numbers
  ["C", "C", "C"].forEach((col, i) => {
    const cell = sheet.getCell(`${col}${sheet.rowCount - (3 - i)}`);
    if (typeof cell.value === "number") {
      cell.numFmt = '"₱"#,##0.00';
      cell.font = { bold: true };
    }
  });

  // --- COLUMN WIDTHS ---
  sheet.columns = [{ width: 12 }, { width: 20 }, { width: 40 }, { width: 15 }];

  // --- EXPORT FILE ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Income_Report.xlsx";
  a.click();
};
