import ExpoModulesCore

public class Supertonic3RuntimeModule: Module {
  private let service = Supertonic3RuntimeService()

  public func definition() -> ModuleDefinition {
    Name("Supertonic3Runtime")

    AsyncFunction("getModelStatus") { (rootUri: String, manifest: [String: Any]) -> [String: Any] in
      return try service.status(rootUri: rootUri, manifest: manifest)
    }

    AsyncFunction("prepareTts") { (rootUri: String) in
      try service.prepare(rootUri: rootUri)
    }

    AsyncFunction("synthesizeToFile") { (text: String, options: [String: Any]) -> [String: Any] in
      return try service.synthesize(text: text, options: options)
    }
  }
}

struct Supertonic3RuntimeError: Error, CustomStringConvertible {
  let description: String

  init(_ description: String) {
    self.description = description
  }
}
