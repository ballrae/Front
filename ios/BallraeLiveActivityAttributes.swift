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
        public var detail: String
    }

    public var title: String

    public init(title: String) {
        self.title = title
    }
}