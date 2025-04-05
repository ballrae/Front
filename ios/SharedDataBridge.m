//
//  SharedDataBridge.m
//  Ballrae
//
//  Created by 안지희 on 4/5/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedDataBridge, NSObject)
RCT_EXTERN_METHOD(saveMessage:(NSString *)message)
@end
