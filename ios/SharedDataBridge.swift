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
  func hasActiveLiveActivity() -> Bool {
    return !Activity<BallraeAttributes>.activities.isEmpty
  }
  
  @objc
  func getActiveGameId() -> String? {
    return Activity<BallraeAttributes>.activities.first?.attributes.gameId
  }
  
  @objc
  func endAllLiveActivities() {
    Task {
      for activity in Activity<BallraeAttributes>.activities {
        await activity.end(using: activity.contentState)
      }
    }
  }
  
  @objc(startGameLiveActivity:homeTeamName:awayTeamName:homeScore:awayScore:inning:half:homePlayer:awayPlayer:gameMessage:isLive:)
  func startGameLiveActivity(
    _ gameId: String,
    _ homeTeamName: String,
    _ awayTeamName: String,
    _ homeScore: NSNumber,
    _ awayScore: NSNumber,
    _ inning: String,
    _ half: String,
    _ homePlayer: String,
    _ awayPlayer: String,
    _ gameMessage: String,
    _ isLive: Bool
  ) {
    print("🔍 팀 ID 직접 사용:")
    print("  홈팀: '\(homeTeamName)'")
    print("  원정팀: '\(awayTeamName)'")
    
    let attributes = BallraeAttributes(
      gameId: gameId,
      homeTeamName: homeTeamName,
      awayTeamName: awayTeamName
    )
    let content = BallraeAttributes.ContentState(
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
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
  
  @objc(updateGameLiveActivity:awayScore:inning:half:homePlayer:awayPlayer:gameMessage:isLive:)
  func updateGameLiveActivity(
    _ homeScore: NSNumber,
    _ awayScore: NSNumber,
    _ inning: String,
    _ half: String,
    _ homePlayer: String,
    _ awayPlayer: String,
    _ gameMessage: String,
    _ isLive: Bool
  ) {
    Task {
      if let activity = Activity<BallraeAttributes>.activities.first {
        let content = BallraeAttributes.ContentState(
          homeTeam: activity.attributes.homeTeamName,
          awayTeam: activity.attributes.awayTeamName,
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
