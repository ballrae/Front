


import WidgetKit
import AppIntents

@available(iOS 16.1, *)
struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Configuration" }
    static var description: IntentDescription { "This is an example widget." }

    @Parameter(title: "Favorite Emoji", default: "😃")
    var favoriteEmoji: String

    // ✅ perform() 최소 정의 추가
    func perform() async throws -> some IntentResult {
        return .result()
    }
}
