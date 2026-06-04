import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosDialogs, NeosDimensionSwitcher} from "../helpers/pages";

const {When, Then} = createBdd();

When("I open the dimension switcher", async ({page}) => {
    const dimensionSwitcher = new NeosDimensionSwitcher(page);
    await dimensionSwitcher.toggle().click();
});

When(
    "I select {string} in the {string} dimension",
    async ({page}, optionLabel: string, dimensionLabel: string) => {
        const dimensionSwitcher = new NeosDimensionSwitcher(page);
        await dimensionSwitcher.selectorHeader(dimensionLabel).click();
        await dimensionSwitcher.option(optionLabel).click();
    },
);

When(
    "I select {string} in the single dimension switcher",
    async ({page}, optionLabel: string) => {
        const dimensionSwitcher = new NeosDimensionSwitcher(page);
        await dimensionSwitcher.singleHeader().click();
        await dimensionSwitcher.option(optionLabel).click();
    },
);

When("I apply the dimension change", async ({page}) => {
    const dimensionSwitcher = new NeosDimensionSwitcher(page);
    await dimensionSwitcher.applyButton().click();
});

When("I create an empty variant for the dimension change", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.nodeVariantCreateEmpty().click();
});

Then(
    "the {string} dimension should be set to {string}",
    async ({page}, dimensionLabel: string, optionLabel: string) => {
        const dimensionSwitcher = new NeosDimensionSwitcher(page);
        await expect(dimensionSwitcher.selectorHeader(dimensionLabel)).toContainText(optionLabel);
    },
);
