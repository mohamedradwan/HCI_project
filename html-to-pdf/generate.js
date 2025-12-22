const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();

  // Load local HTML file
  await page.goto(
    "file://" + path.resolve(__dirname, "report.html"),
    { waitUntil: "networkidle0" }
  );

  // Generate PDF
  await page.pdf({
    path: "report.pdf",
    format: "A4",
    printBackground: true,
    margin: {
      top: "0mm",
      bottom: "0mm",
      left: "0mm",
      right: "0mm"
    }
  });

  await browser.close();
})();
