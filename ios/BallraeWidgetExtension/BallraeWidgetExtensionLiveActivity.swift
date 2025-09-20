import ActivityKit
import WidgetKit
import SwiftUI

struct BallraeLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BallraeAttributes.self) { context in
            // 잠금화면 UI
            VStack(spacing: 0) {
                // 이닝 표시 (상단)
                Text("\(context.state.inning)회 \(context.state.half)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(
                        Capsule()
                            .fill(Color(red: 0.25, green: 0.54, blue: 0.13))
                    )
                    .padding(.top, 8)
                
                // 스코어 섹션
                HStack(spacing: 50) {
                    // 원정팀 (왼쪽)
                    VStack(spacing: 4) {
                        // 팀 심볼
                        let awayTeamId = getTeamId(from: context.state.awayTeam)
                        Image("\(awayTeamId.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 40, height: 40)
                        
                        // 선수명
                        Text(context.state.awayPlayer)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            .lineLimit(nil) // 줄 수 제한 없음
                            .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    }
                    
                    // 스코어
                    HStack(spacing: 50) {
                        Text("\(context.state.awayScore)")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            .lineLimit(nil) // 줄 수 제한 없음
                            .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                        
                        Text("\(context.state.homeScore)")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            .lineLimit(nil) // 줄 수 제한 없음
                            .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    }
                    
                    // 홈팀 (오른쪽)
                    VStack(spacing: 4) {
                        // 팀 심볼
                        let homeTeamId = getTeamId(from: context.state.homeTeam)
                        Image("\(homeTeamId.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 40, height: 40)
                        
                        // 선수명
                        Text(context.state.homePlayer)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            .lineLimit(nil) // 줄 수 제한 없음
                            .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                
                // 게임 메시지
                let teamNameMap: [String: String] = [
                    "DS": "두산 베어스",
                    "LT": "롯데 자이언츠", 
                    "SS": "삼성 라이온즈",
                    "HE": "키움 히어로즈",
                    "HH": "한화 이글스",
                    "KA": "KIA 타이거즈",
                    "KT": "KT 위즈",
                    "LG": "LG 트윈스",
                    "NC": "NC 다이노스",
                    "SL": "SSG 랜더스"
                ]
                
                let awayTeamName = teamNameMap[context.state.awayTeam] ?? context.state.awayTeam
                let homeTeamName = teamNameMap[context.state.homeTeam] ?? context.state.homeTeam
                
                let gameMessage = context.state.gameMessage.isEmpty ? 
                    "\(awayTeamName) vs \(homeTeamName)의 치열한 경기!" : 
                    context.state.gameMessage
                
                Text(gameMessage)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                    .multilineTextAlignment(.center)
                    .lineLimit(nil) // 줄 수 제한 없음
                    .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    .padding(.horizontal, 20)
                    .padding(.top, 12)
                    .padding(.bottom, 12)
            }
            .frame(maxWidth: .infinity)
            .background(Color(red: 0.89, green: 0.96, blue: 0.87)) // #E4F5DD
            .cornerRadius(16)
        } dynamicIsland: { context in
            // 다이나믹 아일랜드 UI
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    VStack(spacing: 6) {
                        let awayTeamId = getTeamId(from: context.state.awayTeam)
                        Image("\(awayTeamId.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 36, height: 36)
                      
                        
                        Text(context.state.awayPlayer)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            .lineLimit(nil) // 줄 수 제한 없음
                            .multilineTextAlignment(.center)
                            .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 8)
                    .padding(.trailing, -8)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(spacing: 6) {
                        let homeTeamId = getTeamId(from: context.state.homeTeam)
                        Image("\(homeTeamId.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 36, height: 36)
                        
                        
                        Text(context.state.homePlayer)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            .lineLimit(nil) // 줄 수 제한 없음
                            .multilineTextAlignment(.center)
                            .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 8)
                    .padding(.leading, -8)
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 8) {
                        Text("\(context.state.inning)회 \(context.state.half)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(
                                Capsule()
                                    .fill(Color(red: 0.25, green: 0.54, blue: 0.13))
                            )
                        
                        HStack(spacing: 60) {
                            Text("\(context.state.awayScore)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                                .lineLimit(nil) // 줄 수 제한 없음
                                .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                            
                            Text("\(context.state.homeScore)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                                .lineLimit(nil) // 줄 수 제한 없음
                                .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                        }
                        
                        let teamNameMap: [String: String] = [
                            "DS": "두산 베어스",
                            "LT": "롯데 자이언츠", 
                            "SS": "삼성 라이온즈",
                            "HE": "키움 히어로즈",
                            "HH": "한화 이글스",
                            "KA": "KIA 타이거즈",
                            "KT": "KT 위즈",
                            "LG": "LG 트윈스",
                            "NC": "NC 다이노스",
                            "SL": "SSG 랜더스"
                        ]
                        
                        let awayTeamName = teamNameMap[context.state.awayTeam] ?? context.state.awayTeam
                        let homeTeamName = teamNameMap[context.state.homeTeam] ?? context.state.homeTeam
                        
                        let gameMessage = context.state.gameMessage.isEmpty ? 
                            "\(awayTeamName) vs \(homeTeamName)의 치열한 경기!" : 
                            context.state.gameMessage
                        
                        Text(gameMessage)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            .multilineTextAlignment(.center)
                            .lineLimit(nil) // 줄 수 제한 없음
                            .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .padding(.leading, -8)
                    .padding(.trailing, -8)
                }
            } compactLeading: {
                HStack(spacing: 4) {
                    let awayTeamId = getTeamId(from: context.state.awayTeam)
                    Image("\(awayTeamId.lowercased())_simbol")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 18, height: 18)
                       
                    Text("\(context.state.awayScore)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                        .lineLimit(nil) // 줄 수 제한 없음
                        .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                }
            } compactTrailing: {
                HStack(spacing: 4) {
                    Text("\(context.state.homeScore)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                        .lineLimit(nil) // 줄 수 제한 없음
                        .fixedSize(horizontal: false, vertical: true) // 세로로 확장 가능
                    let homeTeamId = getTeamId(from: context.state.homeTeam)
                    Image("\(homeTeamId.lowercased())_simbol")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 18, height: 18)
                      
                }
            } minimal: {
                Text("⚾")
                    .font(.system(size: 16))
            }
        }
    }
}

// 팀 이름을 팀 ID로 변환하는 함수
func getTeamId(from teamName: String) -> String {
    let teamNameMap: [String: String] = [
        "두산 베어스": "DS",
        "롯데 자이언츠": "LT", 
        "삼성 라이온즈": "SS",
        "키움 히어로즈": "HE",
        "한화 이글스": "HH",
        "KIA 타이거즈": "KA",
        "KT 위즈": "KT",
        "LG 트윈스": "LG",
        "NC 다이노스": "NC",
        "SSG 랜더스": "SL"
    ]
    
    return teamNameMap[teamName] ?? teamName
}