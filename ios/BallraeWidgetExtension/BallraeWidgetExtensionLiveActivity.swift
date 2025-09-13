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
                    .padding(.top, 16)
                
                // 스코어 섹션
                HStack(spacing: 50) {
                    // 원정팀 (왼쪽)
                    VStack(spacing: 4) {
                        // 팀 심볼
                        Image("\(context.state.awayTeam.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 40, height: 40)
                        
                        // 선수명
                        Text(context.state.awayPlayer)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                    }
                    
                    // 스코어
                    HStack(spacing: 70) {
                        Text("\(context.state.awayScore)")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                        
                        Text("\(context.state.homeScore)")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                    }
                    
                    // 홈팀 (오른쪽)
                    VStack(spacing: 4) {
                        // 팀 심볼
                        Image("\(context.state.homeTeam.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 40, height: 40)
                        
                        // 선수명
                        Text(context.state.homePlayer)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                
                // 게임 메시지
                if !context.state.gameMessage.isEmpty {
                    Text(context.state.gameMessage)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 20)
                }
            }
            .frame(maxWidth: .infinity)
            .background(Color(red: 0.78, green: 0.88, blue: 0.74))
            .cornerRadius(16)
        } dynamicIsland: { context in
            // 다이나믹 아일랜드 UI
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    VStack(spacing: 3) {
                        Image("\(context.state.awayTeam.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 24, height: 24)
                      
                        
                        Text(context.state.awayPlayer)
                            .font(.system(size: 8, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(red: 0.78, green: 0.88, blue: 0.74))
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(spacing: 3) {
                        Image("\(context.state.homeTeam.lowercased())_simbol")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 24, height: 24)
                        
                        
                        Text(context.state.homePlayer)
                            .font(.system(size: 8, weight: .medium))
                            .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(red: 0.78, green: 0.88, blue: 0.74))
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 4) {
                        Text("\(context.state.inning)회 \(context.state.half)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(
                                Capsule()
                                    .fill(Color(red: 0.25, green: 0.54, blue: 0.13))
                            )
                        
                        HStack(spacing: 80) {
                            Text("\(context.state.awayScore)")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                            
                            Text("\(context.state.homeScore)")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                        }
                        
                        if !context.state.gameMessage.isEmpty {
                            Text(context.state.gameMessage.components(separatedBy: "\n").first ?? "")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                                .multilineTextAlignment(.center)
                                .lineLimit(1)
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color(red: 0.78, green: 0.88, blue: 0.74))
                }
            } compactLeading: {
                HStack(spacing: 2) {
                    Image("\(context.state.awayTeam.lowercased())_simbol")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 18, height: 18)
                       
                    Text("\(context.state.awayScore)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                }
            } compactTrailing: {
                HStack(spacing: 2) {
                    Text("\(context.state.homeScore)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(red: 0.25, green: 0.54, blue: 0.13))
                    Image("\(context.state.homeTeam.lowercased())_simbol")
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