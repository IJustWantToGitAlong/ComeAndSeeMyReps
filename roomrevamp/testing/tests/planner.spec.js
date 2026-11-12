const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("loads the planner and all primary sections", async ({ page }) => {
  await expect(page).toHaveTitle(/RoomRevamp/);
  await expect(page.getByRole("heading", { name: /Your room/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bring your room" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Set the scene" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Set your budget" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build your shopping list" })).toBeVisible();
});

test("budget slider updates the displayed amount and remaining budget", async ({ page }) => {
  const slider = page.locator("#budget");
  await slider.fill("5000");
  await expect(page.locator("#budgetOut")).toHaveText("$5,000");
  await expect(page.locator("#remaining")).toHaveText("$2,620");
  await slider.fill("1000");
  await expect(page.locator("#budgetOut")).toHaveText("$1,000");
  await expect(page.locator("#remainingLabel")).toHaveText("Over budget");
});

test("style selection changes the active style", async ({ page }) => {
  const coastal = page.getByRole("button", { name: "Coastal" });
  await coastal.click();
  await expect(coastal).toHaveClass(/active/);
  await page.getByRole("button", { name: "Create my design brief" }).click();
  await expect(page.locator("#brief")).toContainText("Style direction: Coastal");
});

test("shopping list can add, edit, remove, and calculate totals", async ({ page }) => {
  const before = await page.locator(".shop-item").count();
  await page.getByRole("button", { name: "＋ Add an item" }).click();
  await expect(page.locator(".shop-item")).toHaveCount(before + 1);
  const last = page.locator(".shop-item").last();
  await last.locator('input[aria-label="Item name"]').fill("Floor mirror");
  await last.locator('input[type="number"]').fill("225");
  await expect(page.locator("#total")).toHaveText("$2,605");
  await expect(last.getByRole("link", { name: "Search retailer listings for Floor mirror" })).toHaveAttribute("href", /k=Floor%20mirror%20furniture/);
  await last.getByRole("button", { name: "Remove Floor mirror" }).click();
  await expect(page.locator(".shop-item")).toHaveCount(before);
});

test("room details and budget flow into the generated brief", async ({ page }) => {
  await page.locator("#roomType").selectOption("Bedroom");
  await page.locator("#roomSize").selectOption("Large · 300–500 sq ft");
  await page.locator("#budget").fill("4500");
  await page.getByRole("button", { name: "Create my design brief" }).click();
  const brief = page.locator("#brief");
  await expect(brief).toContainText("Room: Bedroom");
  await expect(brief).toContainText("Large · 300–500 sq ft");
  await expect(brief).toContainText("Total furniture budget: $4,500");
});

test("photo upload shows preview and remove restores upload control", async ({ page }) => {
  await page.locator("#roomPhoto").setInputFiles({
    name: "test-room.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="teal"/></svg>')
  });
  await expect(page.locator("#photoPreview")).toBeVisible();
  await expect(page.locator("#previewImage")).toHaveAttribute("src", /^blob:/);
  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(page.locator("#photoPreview")).toBeHidden();
  await expect(page.locator("#roomPhoto")).toHaveValue("");
});

test("brief copy and download actions are wired", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Create my design brief" }).click();
  await page.getByRole("button", { name: "Copy brief" }).click();
  await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .txt" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("roomrevamp-design-brief.txt");
});

test("layout does not create horizontal page overflow on mobile", async ({ page, isMobile }) => {
  if (!isMobile) test.skip();
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  await expect(page.getByRole("button", { name: "Create my design brief" })).toBeVisible();
});