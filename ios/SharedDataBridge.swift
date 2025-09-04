import Foundation
import WidgetKit
import ActivityKit
import UIKit

@objc(SharedDataBridge)
class SharedDataBridge: NSObject {
  private let suiteName = "group.com.jihee.ballrae"
  private var messageTimer: Timer?
  private var currentMessageIndex = 0
  
  // 메시지 리스트 정의
  private let messages = [
    "🔥 불꽃처럼 뜨겁게!",
    "📌 오늘 할 일 완료!",
    "💪 지희 최고!",
    "📝 기록 완료!",
    "🌟 위젯 테스트 성공!",
    "🎉 오늘도 수고했어!"
  ]

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
    print("🚀 LiveActivity 시작: \(message)")
    
    if #available(iOS 16.1, *) {
      // 기존 LiveActivity 모두 강제 정리
      let existingActivities = Activity<BallraeAttributes>.activities
      print("🧹 기존 LiveActivity \(existingActivities.count)개 강제 정리 중...")
      
      if !existingActivities.isEmpty {
        Task {
          for activity in existingActivities {
            await activity.end(using: .init(detail: "강제 정리됨"))
            print("🧹 LiveActivity 강제 정리됨: \(activity.id)")
          }
          
          // 잠시 대기 후 새로운 LiveActivity 시작
          try? await Task.sleep(nanoseconds: 1_000_000_000) // 1초 대기
          
          DispatchQueue.main.async {
            self.createNewLiveActivity(message: message)
          }
        }
      } else {
        // 기존 것이 없으면 바로 시작
        createNewLiveActivity(message: message)
      }
    } else {
      print("❌ LiveActivity는 iOS 16.1+ 에서만 지원됩니다")
    }
  }
  
  private func createNewLiveActivity(message: String) {
    print("🆕 새로운 LiveActivity 생성 중...")
    
    let attributes = BallraeAttributes(title: message)
    let content = BallraeAttributes.ContentState(detail: "경기 진행 중...")

    do {
      let activity = try Activity<BallraeAttributes>.request(
        attributes: attributes,
        contentState: content
      )
      print("✅ LiveActivity 시작 성공! ID: \(activity.id)")
      
      // 백그라운드에서 메시지 순차 업데이트 시작
      startBackgroundMessageUpdates(activity: activity)
      
    } catch {
      print("❌ LiveActivity 시작 실패: \(error)")
      print("❌ 에러 상세: \(error.localizedDescription)")
    }
  }
  
  private func startBackgroundMessageUpdates(activity: Activity<BallraeAttributes>) {
    print("🔄 백그라운드 메시지 업데이트 시작")
    
    // 기존 타이머 정리
    messageTimer?.invalidate()
    currentMessageIndex = 0
    
    // 2초마다 메시지 업데이트
    messageTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] timer in
      guard let self = self else {
        timer.invalidate()
        return
      }
      
      // 메시지 인덱스 확인
      if self.currentMessageIndex < self.messages.count {
        let message = self.messages[self.currentMessageIndex]
        print("🔄 메시지 업데이트: \(message)")
        
        Task {
          await activity.update(using: .init(detail: message))
        }
        
        self.currentMessageIndex += 1
      } else {
        // 모든 메시지 완료 후 종료
        print("🏁 모든 메시지 완료, LiveActivity 종료")
        timer.invalidate()
        
        Task {
          await activity.end(using: .init(detail: "테스트 완료"))
        }
      }
    }
    
    // 타이머를 백그라운드에서도 실행되도록 설정
    RunLoop.current.add(messageTimer!, forMode: .common)
  }

  @objc
  func updateLiveActivity(_ detail: String) {
    print("🔄 LiveActivity 업데이트: \(detail)")
    
    if #available(iOS 16.1, *) {
      Task {
        if let activity = Activity<BallraeAttributes>.activities.first {
          await activity.update(using: .init(detail: detail))
          print("✅ LiveActivity 업데이트 성공")
        } else {
          print("❌ 업데이트할 LiveActivity가 없습니다")
        }
      }
    }
  }
  
  @objc
  func endLiveActivity() {
    print("🏁 LiveActivity 종료")
    
    // 타이머 정리
    messageTimer?.invalidate()
    messageTimer = nil
    
    if #available(iOS 16.1, *) {
      Task {
        if let activity = Activity<BallraeAttributes>.activities.first {
          await activity.end(using: .init(detail: "경기 종료"))
          print("✅ LiveActivity 종료 성공")
        } else {
          print("❌ 종료할 LiveActivity가 없습니다")
        }
      }
    }
  }
}
