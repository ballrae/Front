import Foundation
import WidgetKit
import ActivityKit

@objc(SharedDataBridge)
class SharedDataBridge: NSObject {
  private let suiteName = "group.com.jihee.ballrae"

  @objc
  func saveMessage(_ message: String) {
    if let shared = UserDefaults(suiteName: suiteName) {
      shared.set(message, forKey: "homeMessage")
      WidgetCenter.shared.reloadAllTimelines()
      WidgetCenter.shared.reloadTimelines(ofKind: "BallraeLockWidget")
    }
  }
  
  @objc
  func startLiveActivity(_ message: String) {
    let attributes = BallraeAttributes(title: message)
    let content = BallraeAttributes.ContentState(detail: "진행 중...")

    do {
      let activity = try Activity<BallraeAttributes>.request(
        attributes: attributes,
        contentState: content
      )
      print("✅ Live Activity 등록 성공! ID: \(activity.id)")
    } catch {
      print("❌ Live Activity 시작 실패: \(error)")
    }
  }


  @objc
  func updateLiveActivity(_ detail: String) {
    Task {
      if let activity = Activity<BallraeAttributes>.activities.first {
        await activity.update(using: .init(detail: detail))
      }
    }
  }
  @objc
  func endLiveActivity() {
    Task {
      if let activity = Activity<BallraeAttributes>.activities.first {
        await activity.end(using: .init(detail: "완료됨"))
      }
    }
  }
}
