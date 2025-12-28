// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  // Package exports in `jose` are incorrect, so we need to force the browser version
  if (moduleName === "jose") {
    const ctx = {
      ...context,
      unstable_conditionNames: ["browser"],
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // wevm/ox uses ESM-style imports in its source .ts files, which Metro struggles with.
  // We force it to use the compiled CJS version.
  if (moduleName === "ox" || moduleName.startsWith("ox/")) {
    const oxSubpath = moduleName === "ox" ? "index.js" : moduleName.replace("ox/", "");
    const targetBase = `ox/_cjs/${oxSubpath}`;

    // Try resolving as a file first (.js) then as a directory (/index.js)
    try {
      return context.resolveRequest(context, targetBase.endsWith(".js") ? targetBase : `${targetBase}.js`, platform);
    } catch {
      try {
        return context.resolveRequest(context, `${targetBase}/index.js`, platform);
      } catch {
        // Fallback to original
      }
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.unstable_enablePackageExports = true;
config.resolver.resolveRequest = resolveRequestWithPackageExports;

module.exports = config;
