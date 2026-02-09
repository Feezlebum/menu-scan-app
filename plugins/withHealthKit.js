const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

/**
 * Config plugin to add HealthKit capability for react-native-health
 */
function withHealthKit(config) {
  // Add HealthKit entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.healthkit'] = true;
    config.modResults['com.apple.developer.healthkit.background-delivery'] = false;
    return config;
  });

  // Ensure the Info.plist has the required usage descriptions
  config = withInfoPlist(config, (config) => {
    if (!config.modResults.NSHealthShareUsageDescription) {
      config.modResults.NSHealthShareUsageDescription = 
        'MenuScan uses Apple Health to log your scanned meals and track nutrition.';
    }
    if (!config.modResults.NSHealthUpdateUsageDescription) {
      config.modResults.NSHealthUpdateUsageDescription = 
        'MenuScan logs your scanned meals to Apple Health so you can track your nutrition.';
    }
    
    // Add HealthKit to UIRequiredDeviceCapabilities (optional, but good practice)
    const capabilities = config.modResults.UIRequiredDeviceCapabilities || [];
    if (!capabilities.includes('healthkit')) {
      capabilities.push('healthkit');
    }
    config.modResults.UIRequiredDeviceCapabilities = capabilities;
    
    return config;
  });

  return config;
}

module.exports = withHealthKit;
