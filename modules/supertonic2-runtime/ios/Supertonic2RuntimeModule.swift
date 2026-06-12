import ExpoModulesCore

public class Supertonic2RuntimeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Supertonic2Runtime")

    AsyncFunction("getModelStatus") { (rootUri: String, manifest: [String: Any]) -> [String: Any] in
      return ["state": "missing", "reason": "native-status-not-implemented"]
    }

    AsyncFunction("prepareTts") { (rootUri: String) in
      throw Supertonic2RuntimeError("Supertonic 2 runtime preparation is not implemented yet.")
    }

    AsyncFunction("synthesizeToFile") { (text: String, options: [String: Any]) -> [String: Any] in
      throw Supertonic2RuntimeError("Supertonic 2 synthesis is not implemented yet.")
    }
  }
}

struct Supertonic2RuntimeError: Error, CustomStringConvertible {
  let description: String

  init(_ description: String) {
    self.description = description
  }
}
