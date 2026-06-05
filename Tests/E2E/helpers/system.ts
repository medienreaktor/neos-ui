import {execSync} from "node:child_process";
import {dirname} from "node:path";
import type {Page} from "@playwright/test";

export function createUser(name: string, password: string, roles: string[]) {
    execSync(
        `docker compose -f ./system_under_test/docker-compose.yaml exec neos bash -c "./flow user:create ${name} ${password} Test${name} User${name} --roles ${roles.join(",")}"`,
        {stdio: "ignore", cwd: dirname(".")},
    );
}

export function removeAllUsers() {
    execSync(`docker compose -f ./system_under_test/docker-compose.yaml exec neos bash -c "./flow user:delete --assume-yes '*'"`, {
        stdio: "ignore",
        cwd: dirname("."),
    });
}

export async function logout(page: Page) {
    await page.context().request.post("/neos/logout");
}
