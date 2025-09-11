import WidgetKit
import SwiftUI

// 잠금화면 위젯용 Entry
struct LockEntry: TimelineEntry {
    let date: Date
    let message: String
}

// 일반 홈 위젯용 Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let message: String
}

// AppIntent 기반 Provider (홈 위젯용)
struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent(), message: "🕒 로딩 중")
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration, message: "🔍 스냅샷 미리보기")
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []
        let message = SharedDataManager.getMessage()
        let currentDate = Date()

        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration, message: message)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}

// 잠금화면 Provider
struct LockProvider: TimelineProvider {
    func placeholder(in context: Context) -> LockEntry {
        LockEntry(date: Date(), message: "🕒 로딩 중")
    }

    func getSnapshot(in context: Context, completion: @escaping (LockEntry) -> Void) {
        let entry = LockEntry(date: Date(), message: "🔍 스냅샷")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LockEntry>) -> Void) {
        let currentDate = Date()
        let message = SharedDataManager.getMessage() // ✅ 여기 중요!
        print("🧩 잠금화면 위젯 수신 메시지: \(message)")

        let entry = LockEntry(date: currentDate, message: message)
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

//  홈 위젯 뷰
struct BallraeWidgetExtensionEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        VStack {
            Text("🔔 홈 메시지")
            Text(entry.message)
                .font(.headline)
        }
    }
}

// 잠금화면 위젯 뷰
struct LockScreenWidgetView: View {
    var entry: LockEntry

    var body: some View {
        VStack(spacing: 8) {
            // 스코어 섹션
            HStack(spacing: 16) {
                // 원정팀
                VStack(spacing: 2) {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 24, height: 24)
                        .overlay(
                            Text("A")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                        )
                    Text("2")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                }
                
                Text(":")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                
                // 홈팀
                VStack(spacing: 2) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 24, height: 24)
                        .overlay(
                            Text("H")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                        )
                    Text("0")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                }
            }
            
            // 이닝 표시
            Text("1회 초")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    Capsule()
                        .fill(Color(red: 0.25, green: 0.54, blue: 0.13))
                )
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(Color(red: 0.78, green: 0.88, blue: 0.74)) // C7E0BC
        .cornerRadius(12)
        .containerBackground(for: .widget) {
            Color.clear
        }
    }
}


// 홈 위젯
struct BallraeWidgetExtension: Widget {
    let kind: String = "BallraeWidgetExtension"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            BallraeWidgetExtensionEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
    }
}

// 잠금화면 위젯
struct BallraeLockWidget: Widget {
    let kind: String = "BallraeLockWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockProvider()) { entry in
            LockScreenWidgetView(entry: entry)
        }
        .supportedFamilies([.accessoryRectangular])
        .configurationDisplayName("잠금화면 위젯")
        .description("잠금화면에 표시되는 메시지입니다")
        .contentMarginsDisabled()
    }
}

//  AppIntent 프리뷰용
extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "😀"
        return intent
    }

    fileprivate static var starEyes: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "🤩"
        return intent
    }
}

// UserDefaults에서 메시지 불러오기
class SharedDataManager {
    static let suiteName = "group.com.jihee.ballrae"
    static let shared = UserDefaults(suiteName: suiteName)

    static func getMessage() -> String {
        return shared?.string(forKey: "homeMessage") ?? "📭 없음"
    }
}
