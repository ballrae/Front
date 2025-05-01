#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedDataBridge, NSObject)
RCT_EXTERN_METHOD(saveMessage:(NSString *)message)
RCT_EXTERN_METHOD(startLiveActivity:(NSString *)message)
RCT_EXTERN_METHOD(updateLiveActivity:(NSString *)detail)
RCT_EXTERN_METHOD(endLiveActivity)
@end
