//
//  BallraeWidgetExtensionBundle.swift
//  BallraeWidgetExtension
//
//  Created by 안지희 on 4/5/25.
//

import WidgetKit
import SwiftUI


struct BallraeWidgetExtensionBundle: WidgetBundle {
    var body: some Widget {
        BallraeWidgetExtension()
       //BallraeWidgetExtensionControl()
        BallraeLiveActivity()
        BallraeLockWidget()        
    }
}
