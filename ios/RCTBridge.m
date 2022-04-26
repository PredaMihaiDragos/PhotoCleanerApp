#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ImageModule, NSObject)
RCT_EXTERN_METHOD(processImages: (RCTResponseSenderBlock *)successCallback)
RCT_EXTERN_METHOD(deleteImages:(NSString*)imageIds)
@end
