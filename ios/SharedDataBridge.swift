import Foundation
import WidgetKit
import ActivityKit

@objc(SharedDataBridge)
class SharedDataBridge: NSObject {
  private let suiteName = "group.com.jihee.ballrae"
  
  // 팀 이름을 팀 코드로 변환하는 함수
  private func getTeamCode(from teamName: String) -> String {
    switch teamName {
    case "한화": return "HH"
    case "롯데": return "LT"
    case "KIA": return "KA"
    case "KT": return "KT"
    case "LG": return "LG"
    case "NC": return "NC"
    case "SSG": return "SL"
    case "삼성": return "SS"
    case "두산": return "DS"
    case "키움": return "HE"
    default: return teamName.uppercased()
    }
  }

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
    let attributes = BallraeAttributes(
      gameId: "TEST_MESSAGE",
      homeTeamName: "롯데",
      awayTeamName: "한화"
    )
    let content = BallraeAttributes.ContentState(
      homeTeam: "LT",
      awayTeam: "HH",
      homeScore: 7,
      awayScore: 5,
      inning: "7",
      half: "초",
      homePlayer: "최민석",
      awayPlayer: "임정호",
      gameMessage: "해결사는 역시 박준순!\n답답했던 공격의 물꼬를 트는 결정적인 적시타!",
      isLive: true
    )

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
  func startGameLiveActivity(
    _ gameId: String,
    homeTeamName: String,
    awayTeamName: String,
    homeScore: NSNumber,
    awayScore: NSNumber,
    inning: String,
    half: String,
    homePlayer: String,
    awayPlayer: String,
    gameMessage: String,
    isLive: Bool
  ) {
    let attributes = BallraeAttributes(
      gameId: gameId,
      homeTeamName: homeTeamName,
      awayTeamName: awayTeamName
    )
    let content = BallraeAttributes.ContentState(
      homeTeam: getTeamCode(from: homeTeamName),
      awayTeam: getTeamCode(from: awayTeamName),
      homeScore: homeScore.intValue,
      awayScore: awayScore.intValue,
      inning: inning,
      half: half,
      homePlayer: homePlayer,
      awayPlayer: awayPlayer,
      gameMessage: gameMessage,
      isLive: isLive
    )

    do {
      let activity = try Activity<BallraeAttributes>.request(
        attributes: attributes,
        contentState: content
      )
      print("✅ Game Live Activity 등록 성공! ID: \(activity.id)")
    } catch {
      print("❌ Game Live Activity 시작 실패: \(error)")
    }
  }


  @objc
  func updateLiveActivity(_ detail: String) {
    Task {
      if let activity = Activity<BallraeAttributes>.activities.first {
        let content = BallraeAttributes.ContentState(
          homeTeam: activity.attributes.homeTeamName,
          awayTeam: activity.attributes.awayTeamName,
          homeScore: 0,
          awayScore: 0,
          inning: "1",
          half: "초",
          homePlayer: "홈팀",
          awayPlayer: "원정팀",
          gameMessage: detail,
          isLive: true
        )
        await activity.update(using: content)
      }
    }
  }
  
  @objc
  func updateGameLiveActivity(
    homeScore: NSNumber,
    awayScore: NSNumber,
    inning: String,
    half: String,
    homePlayer: String,
    awayPlayer: String,
    gameMessage: String,
    isLive: Bool
  ) {
    Task {
      if let activity = Activity<BallraeAttributes>.activities.first {
        let content = BallraeAttributes.ContentState(
          homeTeam: getTeamCode(from: activity.attributes.homeTeamName),
          awayTeam: getTeamCode(from: activity.attributes.awayTeamName),
          homeScore: homeScore.intValue,
          awayScore: awayScore.intValue,
          inning: inning,
          half: half,
          homePlayer: homePlayer,
          awayPlayer: awayPlayer,
          gameMessage: gameMessage,
          isLive: isLive
        )
        await activity.update(using: content)
      }
    }
  }
  @objc
  func endLiveActivity() {
    Task {
      if let activity = Activity<BallraeAttributes>.activities.first {
        let content = BallraeAttributes.ContentState(
          homeTeam: activity.attributes.homeTeamName,
          awayTeam: activity.attributes.awayTeamName,
          homeScore: 0,
          awayScore: 0,
          inning: "9",
          half: "말",
          homePlayer: "홈팀",
          awayPlayer: "원정팀",
          gameMessage: "경기 종료",
          isLive: false
        )
        await activity.end(using: content)
      }
    }
  }
}
