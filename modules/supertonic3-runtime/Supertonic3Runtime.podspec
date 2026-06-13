require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'Supertonic3Runtime'
  s.version        = package['version']
  s.summary        = 'Supertonic 3 runtime Expo module for MeerQuest.'
  s.description    = 'Provides the native iOS Supertonic 3 runtime bridge for MeerQuest.'
  s.homepage       = 'https://github.com/bom25da/meerquest'
  s.source         = { :git => 'https://github.com/bom25da/meerquest.git' }
  s.license        = { :type => 'UNLICENSED' }
  s.author         = 'MeerQuest'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'onnxruntime-objc', '1.16.0'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = "ios/**/*.{swift,h,m,mm}"
end
