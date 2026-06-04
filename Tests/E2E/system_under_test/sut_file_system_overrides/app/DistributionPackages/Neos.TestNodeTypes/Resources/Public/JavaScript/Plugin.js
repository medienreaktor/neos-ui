"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../../../../../../../../packages/neos-ui-extensibility/dist/readFromConsumerApi.js
  function readFromConsumerApi(key) {
    return (...args) => {
      if (window["@Neos:HostPluginAPI"] && window["@Neos:HostPluginAPI"][`@${key}`]) {
        return window["@Neos:HostPluginAPI"][`@${key}`](...args);
      }
      throw new Error("You are trying to read from a consumer api that hasn't been initialized yet!");
    };
  }
  var init_readFromConsumerApi = __esm({
    "../../../../../../../../packages/neos-ui-extensibility/dist/readFromConsumerApi.js"() {
      "use strict";
    }
  });

  // ../../../../../../../../packages/neos-ui-extensibility/dist/shims/neosProjectPackages/neos-ui-configuration/index.js
  var require_neos_ui_configuration = __commonJS({
    "../../../../../../../../packages/neos-ui-extensibility/dist/shims/neosProjectPackages/neos-ui-configuration/index.js"(exports, module) {
      init_readFromConsumerApi();
      module.exports = readFromConsumerApi("NeosProjectPackages")().NeosUiConfiguration;
    }
  });

  // ../../../../../../../../packages/neos-ui-extensibility/dist/shims/neosProjectPackages/neos-ui-registry/index.js
  var require_neos_ui_registry = __commonJS({
    "../../../../../../../../packages/neos-ui-extensibility/dist/shims/neosProjectPackages/neos-ui-registry/index.js"(exports, module) {
      init_readFromConsumerApi();
      module.exports = readFromConsumerApi("NeosProjectPackages")().NeosUiRegistry;
    }
  });

  // src/manifest.ts
  var manifest_exports = {};
  __export(manifest_exports, {
    getPluginLegacyRegistryValue: () => getPluginLegacyRegistryValue,
    getPluginRegistryValue: () => getPluginRegistryValue,
    globalConfigurationAccess: () => globalConfigurationAccess,
    globalFrontendConfigurationAccess: () => globalFrontendConfigurationAccess,
    globalGlobalRegistryAccess: () => globalGlobalRegistryAccess,
    legacyConfigurationAccess: () => legacyConfigurationAccess,
    legacyFrontendConfigurationAccess: () => legacyFrontendConfigurationAccess,
    legacyGlobalRegistryAccess: () => legacyGlobalRegistryAccess,
    manifestInvocations: () => manifestInvocations
  });

  // ../../../../../../../../packages/neos-ui-extensibility/plugin-api.js
  init_readFromConsumerApi();
  var manifest = readFromConsumerApi("manifest");
  var plugin_api_default = manifest;
  var { SynchronousRegistry, SynchronousMetaRegistry } = readFromConsumerApi("NeosProjectPackages")().NeosUiRegistry;

  // src/manifest.ts
  var import_neos_ui_configuration = __toESM(require_neos_ui_configuration());
  var import_neos_ui_registry = __toESM(require_neos_ui_registry());
  var manifestInvocations = 0;
  var globalFrontendConfigurationAccess = (0, import_neos_ui_configuration.getFrontendConfigurationForPackage)("@neos-project/neos-ui-test-plugin");
  var legacyFrontendConfigurationAccess;
  var globalConfigurationAccess = `loadingDepth type ${typeof (0, import_neos_ui_configuration.getConfiguration)((configuration) => configuration.nodeTree.loadingDepth)}`;
  var legacyConfigurationAccess;
  var globalGlobalRegistryAccess = `global registry type ${typeof (0, import_neos_ui_registry.getGlobalRegistry)()} name ${(0, import_neos_ui_registry.getGlobalRegistry)().constructor.name}`;
  var legacyGlobalRegistryAccess;
  function getPluginRegistryValue() {
    return (0, import_neos_ui_registry.getRegistryById)("@neos-project/neos-ui-test-plugin-registry").get("someKey");
  }
  function getPluginLegacyRegistryValue() {
    return (0, import_neos_ui_registry.getRegistryById)("@neos-project/neos-ui-test-plugin-legacy-registry").get("someKey");
  }
  plugin_api_default("@neos-project/neos-ui-test-plugin", {}, (globalRegistry, { frontendConfiguration, configuration }) => {
    manifestInvocations++;
    legacyGlobalRegistryAccess = `global registry type ${typeof globalRegistry} name ${globalRegistry.constructor.name}`;
    legacyFrontendConfigurationAccess = frontendConfiguration["@neos-project/neos-ui-test-plugin"];
    legacyConfigurationAccess = `loadingDepth type ${typeof configuration.nodeTree.loadingDepth}`;
    const myCustomRegistry = new import_neos_ui_registry.SynchronousRegistry("My registry");
    globalRegistry.set("@neos-project/neos-ui-test-plugin-registry", myCustomRegistry);
    myCustomRegistry.set("someKey", "some value from my registry");
    const legacyMyCustomRegistry = new SynchronousRegistry("My legacy registry");
    globalRegistry.set("@neos-project/neos-ui-test-plugin-legacy-registry", legacyMyCustomRegistry);
    legacyMyCustomRegistry.set("someKey", "some value from my legacy registry");
  });

  // src/index.ts
  window.neosUiTestPlugin = manifest_exports;
})();
