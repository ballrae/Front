//
//  BallraeWidgetExtensionBundle.swift
//  BallraeWidgetExtension
//
//  Created by 안지희 on 4/5/25.
//

import WidgetKit
import SwiftUI

@main
struct BallraeWidgetExtensionBundle: WidgetBundle {
    var body: some Widget {
        BallraeWidgetExtension()
       //BallraeWidgetExtensionControl()
        BallraeLiveActivity()
        BallraeLockWidget()          // ✅ 너가 방금 작성한 잠금화면 위젯
    }
}
