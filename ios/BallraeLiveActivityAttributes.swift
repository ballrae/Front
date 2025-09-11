//
//  BallraeAttributes.swift
//  Ballrae
//
//  Created by 안지희 on 5/1/25.
//


import Foundation
import ActivityKit

public struct BallraeAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var homeTeam: String
        public var awayTeam: String
        public var homeScore: Int
        public var awayScore: Int
        public var inning: String
        public var half: String
        public var homePlayer: String
        public var awayPlayer: String
        public var gameMessage: String
        public var isLive: Bool
    }

    public var gameId: String
    public var homeTeamName: String
    public var awayTeamName: String

    public init(gameId: String, homeTeamName: String, awayTeamName: String) {
        self.gameId = gameId
        self.homeTeamName = homeTeamName
        self.awayTeamName = awayTeamName
    }
}