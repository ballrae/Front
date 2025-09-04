import WidgetKit
import SwiftUI

#if canImport(ActivityKit)
import ActivityKit

struct BallraeLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BallraeAttributes.self) { context in
            VStack(spacing: 8) {
                Text("⚾ 야구 경기")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                
                Text(context.state.detail)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                
                Text("실시간 진행 중...")
                    .font(.system(size: 12))
                    .foregroundColor(.yellow)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(16)
            .background(Color.red) // 빨간색으로 변경하여 더 눈에 띄게
            .cornerRadius(12)
            .onAppear {
                print("🎯 LiveActivity UI 렌더링됨!")
                print("🎯 제목: \(context.attributes.title)")
                print("🎯 상세: \(context.state.detail)")
                print("🎯 배경색: 빨간색")
            }
            .onChange(of: context.state.detail) { newValue in
                print("🔄 LiveActivity 내용 변경: \(newValue)")
            }
        } dynamicIsland: { context in
            // 📱 다이나믹 아일랜드용 UI
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("⚾")
                        .font(.title2)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.detail)
                        .font(.caption)
                        .foregroundColor(.white)
                }
            } compactLeading: {
                Text("⚾")
                    .font(.title3)
            } compactTrailing: {
                Text("LIVE")
                    .font(.caption2)
                    .foregroundColor(.red)
            } minimal: {
                Text("⚾")
                    .font(.title2)
            }
        }
    }
}
#endif


