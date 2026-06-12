const { withDangerousMod } = require('@expo/config-plugins');

const ONNX_RUNTIME_SPM_URL = 'https://github.com/microsoft/onnxruntime-swift-package-manager.git';
const ONNX_RUNTIME_PRODUCT = 'onnxruntime';

function withSupertonic2IosRuntime(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      return modConfig;
    },
  ]);
}

module.exports = withSupertonic2IosRuntime;
module.exports.ONNX_RUNTIME_SPM_URL = ONNX_RUNTIME_SPM_URL;
module.exports.ONNX_RUNTIME_PRODUCT = ONNX_RUNTIME_PRODUCT;
