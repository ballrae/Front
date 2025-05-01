import ActivityKit
import WidgetKit
import SwiftUI


struct BallraeLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BallraeAttributes.self) { context in
            VStack {
                Text("🔔 알림")
                    .font(.headline)
                Text(context.state.detail) // 여기에 메시지가 순차적으로 뜰 예정!
                    .font(.title3)
                    .padding(.top, 4)
            }
            .padding()
        } dynamicIsland: { context in
            // 📱 다이나믹 아일랜드용 UI
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("📦")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.detail)
                }
            } compactLeading: {
                Text("🚚")
            } compactTrailing: {
                Text("🕒")
            } minimal: {
                Text("⚾️")
            }
        }
    }
}


