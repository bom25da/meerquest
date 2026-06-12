const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

const ONNX_RUNTIME_SPM_URL = 'https://github.com/microsoft/onnxruntime-swift-package-manager.git';
const ONNX_RUNTIME_PRODUCT = 'onnxruntime';
const ONNX_RUNTIME_MIN_VERSION = '1.16.0';
const ONNX_RUNTIME_PACKAGE_REFERENCE_ID = '5A2D0F760F974E4E94D00001';
const ONNX_RUNTIME_PRODUCT_DEPENDENCY_ID = '5A2D0F760F974E4E94D00002';
const PACKAGE_REFERENCE_COMMENT = 'onnxruntime package';
const PRODUCT_DEPENDENCY_COMMENT = ONNX_RUNTIME_PRODUCT;

function addOnnxRuntimeSwiftPackage(pbxproj, options = {}) {
  const ensureSwiftPackageSections = options.ensureSwiftPackageSections === true;
  const targetName = options.targetName === undefined ? 'MeerQuest' : options.targetName;
  let updated = pbxproj;
  let packageReferenceId = findObjectId(updated, (object) =>
    object.includes('isa = XCRemoteSwiftPackageReference;') &&
    object.includes(`repositoryURL = "${ONNX_RUNTIME_SPM_URL}";`),
  );

  if (!packageReferenceId) {
    packageReferenceId = ONNX_RUNTIME_PACKAGE_REFERENCE_ID;
    updated = insertPackageReferenceObject(updated, packageReferenceId, ensureSwiftPackageSections);
  }

  let productDependencyId = findObjectId(updated, (object) =>
    object.includes('isa = XCSwiftPackageProductDependency;') &&
    object.includes(`productName = ${ONNX_RUNTIME_PRODUCT};`),
  );

  if (!productDependencyId) {
    productDependencyId = ONNX_RUNTIME_PRODUCT_DEPENDENCY_ID;
    updated = insertProductDependencyObject(
      updated,
      packageReferenceId,
      productDependencyId,
      ensureSwiftPackageSections,
    );
  }

  updated = addPackageReferenceToProject(updated, packageReferenceId);
  if (targetName) {
    updated = addProductDependencyToTarget(updated, productDependencyId, targetName);
  }

  return updated;
}

function findObjectId(pbxproj, predicate) {
  const objectRegex = /^(\s*)([A-F0-9]{24,32}) (?:\/\* [^*]+ \*\/ )?= \{\n([\s\S]*?)^\1\};/gm;
  let match;

  while ((match = objectRegex.exec(pbxproj)) !== null) {
    const object = match[0];
    if (predicate(object)) {
      return match[2];
    }
  }

  return null;
}

function insertPackageReferenceObject(pbxproj, packageReferenceId, ensureSection) {
  const objectBlock = [
    `\t\t${packageReferenceId} /* ${PACKAGE_REFERENCE_COMMENT} */ = {`,
    '\t\t\tisa = XCRemoteSwiftPackageReference;',
    `\t\t\trepositoryURL = "${ONNX_RUNTIME_SPM_URL}";`,
    '\t\t\trequirement = {',
    '\t\t\t\tkind = upToNextMajorVersion;',
    `\t\t\t\tminimumVersion = ${ONNX_RUNTIME_MIN_VERSION};`,
    '\t\t\t};',
    '\t\t};',
  ].join('\n');

  return insertObjectBlock(pbxproj, 'XCRemoteSwiftPackageReference', objectBlock, ensureSection);
}

function insertProductDependencyObject(
  pbxproj,
  packageReferenceId,
  productDependencyId,
  ensureSection,
) {
  const objectBlock = [
    `\t\t${productDependencyId} /* ${PRODUCT_DEPENDENCY_COMMENT} */ = {`,
    '\t\t\tisa = XCSwiftPackageProductDependency;',
    `\t\t\tpackage = ${packageReferenceId} /* ${PACKAGE_REFERENCE_COMMENT} */;`,
    `\t\t\tproductName = ${ONNX_RUNTIME_PRODUCT};`,
    '\t\t};',
  ].join('\n');

  if (ensureSection || pbxproj.includes('/* End XCSwiftPackageProductDependency section */')) {
    return insertObjectBlock(
      pbxproj,
      'XCSwiftPackageProductDependency',
      objectBlock,
      ensureSection,
    );
  }

  return insertObjectBlock(pbxproj, 'XCRemoteSwiftPackageReference', objectBlock, false);
}

function insertObjectBlock(pbxproj, sectionName, objectBlock, ensureSection) {
  const endMarker = `/* End ${sectionName} section */`;
  if (pbxproj.includes(endMarker)) {
    return pbxproj.replace(endMarker, `${objectBlock}\n${endMarker}`);
  }

  if (ensureSection) {
    const sectionBlock = [
      `/* Begin ${sectionName} section */`,
      objectBlock,
      `/* End ${sectionName} section */`,
    ].join('\n');

    return insertObjectBlockBeforeBuildConfigurations(pbxproj, sectionBlock);
  }

  return insertObjectBlockBeforeBuildConfigurations(pbxproj, objectBlock);
}

function insertObjectBlockBeforeBuildConfigurations(pbxproj, objectBlock) {
  const buildConfigurationMarker = '/* Begin XCBuildConfiguration section */';
  if (pbxproj.includes(buildConfigurationMarker)) {
    return pbxproj.replace(buildConfigurationMarker, `${objectBlock}\n${buildConfigurationMarker}`);
  }

  return `${pbxproj.trimEnd()}\n${objectBlock}\n`;
}

function addPackageReferenceToProject(pbxproj, packageReferenceId) {
  const entry = `${packageReferenceId} /* ${PACKAGE_REFERENCE_COMMENT} */`;

  if (pbxproj.includes('packageReferences = (')) {
    return addEntryToList(pbxproj, 'packageReferences', entry, packageReferenceId);
  }

  const projectRegex =
    /(\/\* Begin PBXProject section \*\/\n[\s\S]*?isa = PBXProject;[\s\S]*?)(\n\s*productRefGroup = )/;

  return pbxproj.replace(
    projectRegex,
    `$1\n\t\t\tpackageReferences = (\n\t\t\t\t${entry},\n\t\t\t);$2`,
  );
}

function addProductDependencyToTarget(pbxproj, productDependencyId, targetName) {
  const entry = `${productDependencyId} /* ${PRODUCT_DEPENDENCY_COMMENT} */`;
  const nativeTargetSectionRegex =
    /(\/\* Begin PBXNativeTarget section \*\/\n)([\s\S]*?)(\/\* End PBXNativeTarget section \*\/)/;
  const targetNamePattern = new RegExp(
    `(name = ${escapeRegExp(targetName)};|productName = ${escapeRegExp(targetName)};)`,
  );

  return pbxproj.replace(nativeTargetSectionRegex, (section, begin, body, end) => {
    let didUpdateTarget = false;
    const targetRegex = /^(\s*[A-F0-9]{24,32} \/\* [^*]+ \*\/ = \{\n[\s\S]*?^\s*\};)/gm;
    const nextBody = body.replace(targetRegex, (targetBlock) => {
      if (
        didUpdateTarget ||
        !targetBlock.includes('isa = PBXNativeTarget;') ||
        !targetNamePattern.test(targetBlock)
      ) {
        return targetBlock;
      }

      didUpdateTarget = true;
      return addProductDependencyToTargetBlock(targetBlock, entry, productDependencyId);
    });

    return `${begin}${nextBody}${end}`;
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addProductDependencyToTargetBlock(targetBlock, entry, productDependencyId) {
  if (targetBlock.includes('packageProductDependencies = (')) {
    return addEntryToList(targetBlock, 'packageProductDependencies', entry, productDependencyId);
  }

  return targetBlock.replace(
    /(\n\s*productName = )/,
    `\n\t\t\tpackageProductDependencies = (\n\t\t\t\t${entry},\n\t\t\t);$1`,
  );
}

function addEntryToList(pbxproj, listName, entry, entryId) {
  const listRegex = new RegExp(`(\\s*${listName} = \\(\\n)([\\s\\S]*?)(\\n\\s*\\);)`);

  return pbxproj.replace(listRegex, (match, start, body, end) => {
    if (body.includes(entryId)) {
      return match;
    }

    const nextBody = body.length === 0 || body.endsWith('\n') ? body : `${body}\n`;
    return `${start}${nextBody}\t\t\t\t${entry},${end}`;
  });
}

function getPbxprojPath(platformProjectRoot, projectName = 'MeerQuest') {
  const preferredPath = path.join(platformProjectRoot, `${projectName}.xcodeproj`, 'project.pbxproj');
  if (fs.existsSync(preferredPath)) {
    return preferredPath;
  }

  const xcodeProject = fs
    .readdirSync(platformProjectRoot)
    .find((entry) => entry.endsWith('.xcodeproj'));

  if (!xcodeProject) {
    throw new Error(`Unable to find an Xcode project in ${platformProjectRoot}`);
  }

  return path.join(platformProjectRoot, xcodeProject, 'project.pbxproj');
}

function withSupertonic2IosRuntime(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const pbxprojPath = getPbxprojPath(
        modConfig.modRequest.platformProjectRoot,
        modConfig.modRequest.projectName,
      );
      const pbxproj = await fs.promises.readFile(pbxprojPath, 'utf8');
      const updatedPbxproj = addOnnxRuntimeSwiftPackage(pbxproj, {
        ensureSwiftPackageSections: true,
        targetName: null,
      });

      if (updatedPbxproj !== pbxproj) {
        await fs.promises.writeFile(pbxprojPath, updatedPbxproj);
      }

      return modConfig;
    },
  ]);
}

module.exports = withSupertonic2IosRuntime;
module.exports.addOnnxRuntimeSwiftPackage = addOnnxRuntimeSwiftPackage;
module.exports.ONNX_RUNTIME_SPM_URL = ONNX_RUNTIME_SPM_URL;
module.exports.ONNX_RUNTIME_PRODUCT = ONNX_RUNTIME_PRODUCT;
module.exports.ONNX_RUNTIME_MIN_VERSION = ONNX_RUNTIME_MIN_VERSION;
