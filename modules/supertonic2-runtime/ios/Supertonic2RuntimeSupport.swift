import CryptoKit
import Foundation
#if canImport(OnnxRuntimeBindings)
import OnnxRuntimeBindings
#elseif canImport(onnxruntime_objc)
import onnxruntime_objc
#endif

struct Supertonic2ManifestFile {
  let path: String
  let bytes: Int
  let sha256: String
}

final class Supertonic2RuntimeService {
  private var env: ORTEnv?
  private var textToSpeech: TextToSpeech?
  private var rootURL: URL?

  func status(rootUri: String, manifest: [String: Any]) throws -> [String: Any] {
    let root = try fileURL(from: rootUri)
    let revision = manifest["revision"] ?? ""
    let files = try manifestFiles(from: manifest)

    for file in files {
      let url = root.appendingPathComponent(file.path)

      guard FileManager.default.fileExists(atPath: url.path) else {
        return ["state": "missing", "reason": "file-missing", "revision": revision]
      }

      let attributes = try FileManager.default.attributesOfItem(atPath: url.path)
      if let size = attributes[.size] as? NSNumber, size.intValue != file.bytes {
        return ["state": "invalid", "reason": "size-mismatch", "revision": revision]
      }

      if try sha256(url: url) != file.sha256 {
        return ["state": "invalid", "reason": "sha256-mismatch", "revision": revision]
      }
    }

    return ["state": "ready", "revision": revision, "rootUri": root.absoluteString]
  }

  func prepare(rootUri: String) throws {
    let root = try fileURL(from: rootUri)
    let onnxDir = root.appendingPathComponent("onnx", isDirectory: true).path
    let runtimeEnv = try ORTEnv(loggingLevel: .warning)
    env = runtimeEnv
    textToSpeech = try loadTextToSpeech(onnxDir, false, runtimeEnv)
    rootURL = root
  }

  func synthesize(text: String, options: [String: Any]) throws -> [String: Any] {
    guard let rootURL, let textToSpeech else {
      throw Supertonic2RuntimeError("Supertonic 2 runtime is not prepared.")
    }

    let lang = options["lang"] as? String ?? "ko"
    let voice = options["voice"] as? String ?? "F1"
    let speed = numericOption(options["speed"], defaultValue: 1.05)
    let steps = intOption(options["steps"], defaultValue: 4)
    let voiceURL = rootURL.appendingPathComponent("voice_styles/\(voice).json")
    let style = try loadVoiceStyle([voiceURL.path], verbose: false)
    let result = try textToSpeech.call(
      text,
      lang,
      style,
      steps,
      speed: Float(speed),
      silenceDuration: 0.3
    )
    let outputURL = FileManager.default.temporaryDirectory
      .appendingPathComponent("supertonic2-\(UUID().uuidString).wav")

    try writeWavFile(outputURL.path, result.wav, textToSpeech.sampleRate)
    return ["uri": outputURL.absoluteString, "durationSeconds": Double(result.duration)]
  }
}

func fileURL(from uri: String) throws -> URL {
  guard let url = URL(string: uri), url.isFileURL else {
    throw Supertonic2RuntimeError("Expected a file URL for Supertonic 2 model root.")
  }

  return url
}

func manifestFiles(from manifest: [String: Any]) throws -> [Supertonic2ManifestFile] {
  guard let files = manifest["files"] as? [[String: Any]] else {
    throw Supertonic2RuntimeError("Supertonic 2 manifest is missing files.")
  }

  return try files.map { item in
    guard
      let path = item["path"] as? String,
      let sha256 = item["sha256"] as? String
    else {
      throw Supertonic2RuntimeError("Supertonic 2 manifest file entry is malformed.")
    }

    return Supertonic2ManifestFile(
      path: path,
      bytes: try manifestByteCount(from: item["bytes"]),
      sha256: sha256
    )
  }
}

func sha256(url: URL) throws -> String {
  let handle = try FileHandle(forReadingFrom: url)
  defer { try? handle.close() }

  var hasher = SHA256()
  while true {
    let data = handle.readData(ofLength: 1024 * 1024)
    if data.isEmpty {
      break
    }

    hasher.update(data: data)
  }

  return hasher.finalize().map { String(format: "%02x", $0) }.joined()
}

private func manifestByteCount(from value: Any?) throws -> Int {
  if let bytes = value as? Int {
    return bytes
  }

  if let bytes = value as? NSNumber {
    return bytes.intValue
  }

  throw Supertonic2RuntimeError("Supertonic 2 manifest file byte count is malformed.")
}

private func numericOption(_ value: Any?, defaultValue: Double) -> Double {
  if let value = value as? Double {
    return value
  }

  if let value = value as? NSNumber {
    return value.doubleValue
  }

  return defaultValue
}

private func intOption(_ value: Any?, defaultValue: Int) -> Int {
  if let value = value as? Int {
    return value
  }

  if let value = value as? NSNumber {
    return value.intValue
  }

  return defaultValue
}
