#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedDataBridge, NSObject)
RCT_EXTERN_METHOD(saveMessage:(NSString *)message)
RCT_EXTERN_METHOD(startLiveActivity:(NSString *)message)
RCT_EXTERN_METHOD(updateLiveActivity:(NSString *)detail)
RCT_EXTERN_METHOD(endLiveActivity)
RCT_EXTERN_METHOD(startGameLiveActivity:(NSString *)gameId
                  homeTeamName:(NSString *)homeTeamName
                  awayTeamName:(NSString *)awayTeamName
                  homeScore:(NSNumber *)homeScore
                  awayScore:(NSNumber *)awayScore
                  inning:(NSString *)inning
                  half:(NSString *)half
                  homePlayer:(NSString *)homePlayer
                  awayPlayer:(NSString *)awayPlayer
                  gameMessage:(NSString *)gameMessage
                  isLive:(BOOL)isLive)
RCT_EXTERN_METHOD(updateGameLiveActivity:(NSNumber *)homeScore
                  awayScore:(NSNumber *)awayScore
                  inning:(NSString *)inning
                  half:(NSString *)half
                  homePlayer:(NSString *)homePlayer
                  awayPlayer:(NSString *)awayPlayer
                  gameMessage:(NSString *)gameMessage
                  isLive:(BOOL)isLive)
@end