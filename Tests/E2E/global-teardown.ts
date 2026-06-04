import {execSync} from "node:child_process";

const {REUSE_EXISTING_SUT} = process.env;

/**
 * This is run after all tests have finished.
 * Because we use docker containers, we only have to shut them down.
 */
export default async function globalTeardown() {
    if (REUSE_EXISTING_SUT !== '1') {
        execSync("docker compose -f ./system_under_test/docker-compose.yaml down", {
            stdio: "inherit",
            cwd: ".",
        });

        /**
         * We do not remove all named volumes so we can retain local composer cache.
         * Just remove the neos db data volume.
         */
        execSync('docker volume rm neos_ui_e2e_db_neos_data', {
            stdio: "inherit",
            cwd: ".",
        });
    }
}
