import { expect, test } from "@playwright/test";

// Primary flow: search proteins by name and see a result card. The UniProt
// API is mocked at the network boundary so the test never depends on a real,
// third-party service being reachable or unchanged.
test("searching for a protein shows a result card", async ({ page }) => {
  await page.route("https://rest.uniprot.org/uniprotkb/search*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: [
          {
            primaryAccession: "P01308",
            uniProtkbId: "INS_HUMAN",
            proteinDescription: { recommendedName: { fullName: { value: "Insulin" } } },
            organism: { scientificName: "Homo sapiens" },
            genes: [{ geneName: { value: "INS" } }],
            comments: [
              { commentType: "FUNCTION", texts: [{ value: "Regulates glucose metabolism." }] },
            ],
          },
        ],
      }),
    });
  });

  await page.goto("/search");

  await page.getByLabel("Search proteins").fill("insulin");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Insulin" })).toBeVisible();
  await expect(page.getByText("Homo sapiens")).toBeVisible();
});
