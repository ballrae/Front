//
//  SharedDataBridge.swift
//  Ballrae
//
//  Created by 안지희 on 4/5/25.
//

import Foundation
import WidgetKit

@objc(SharedDataBridge)
class SharedDataBridge: NSObject {
  private let suiteName = "group.com.jihee.ballrae" // App Group ID 정확히!
  @objc
  func saveMessage(_ message: String) {
    if let shared = UserDefaults(suiteName: suiteName) {
      shared.set(message, forKey: "homeMessage")
      
      // ✅ 홈 위젯 전체 새로고침
      WidgetCenter.shared.reloadAllTimelines()

      // ✅ 잠금화면 위젯만 명시적으로 리프레시
      WidgetCenter.shared.reloadTimelines(ofKind: "BallraeLockWidget")
      
      print("✅ 저장됨 및 위젯 새로고침: \(message)")
    } else {
      print("❌ App Group UserDefaults 초기화 실패")
    }
  }
}
